import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/** digits-only contact key */
function normalizeKey(raw: string): string {
  return String(raw || "").split("@")[0].replace(/\D/g, "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const summary: Record<string, unknown>[] = [];

  try {
    // 1. Users that have the inactivity follow-up configured
    const { data: settingsRows, error: sErr } = await supabase
      .from("settings")
      .select("user_id, value, updated_at")
      .eq("key", "inactivity_followup");

    if (sErr) throw sErr;

    for (const row of settingsRows || []) {
      const cfg = (row.value || {}) as { enabled?: boolean; text?: string; hours?: number; enabled_at?: string };
      if (!cfg.enabled || !cfg.text?.trim()) continue;
      const hours = Number(cfg.hours);
      if (!Number.isFinite(hours) || hours <= 0) continue;

      const userId = row.user_id as string;
      const cfgEnabledAt = cfg.enabled_at;
      const enabledAtTime = cfgEnabledAt
        ? new Date(String(cfgEnabledAt).replace(" ", "T")).getTime()
        : (row.updated_at ? new Date(String(row.updated_at).replace(" ", "T")).getTime() : 0);

      // 2. Growth plan only
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan_tier, is_paused, is_active")
        .eq("user_id", userId)
        .maybeSingle();
      if (!profile || profile.plan_tier !== "enterprise" || profile.is_paused || profile.is_active === false) continue;

      // 3. Session to send from
      const { data: session } = await supabase
        .from("user_wsender_sessions")
        .select("session_api_key")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      const sessionApiKey = session?.session_api_key;
      if (!sessionApiKey) continue;

      const cutoffTime = Date.now() - hours * 3600 * 1000;
      // look back over a bounded window so we never spam very old contacts
      const windowStart = new Date(Date.now() - (hours * 3600 * 1000 + 14 * 24 * 3600 * 1000)).toISOString();

      const { data: convs } = await supabase
        .from("conversations")
        .select("phone_number, direction, created_at, metadata")
        .eq("user_id", userId)
        .gte("created_at", windowStart)
        .order("created_at", { ascending: false }) // NEWEST FIRST
        .limit(3000);

      if (!convs?.length) continue;

      // Aggregate per contact
      const perContact = new Map<string, { phone: string; lastInbound: string | null; followupAfter: boolean }>();
      for (const c of convs) {
        const key = normalizeKey(c.phone_number);
        if (!key) continue;
        let entry = perContact.get(key);
        if (!entry) {
          entry = { phone: c.phone_number, lastInbound: null, followupAfter: false };
          perContact.set(key, entry);
        }

        // Processing newest first:
        if (c.direction === "inbound") {
          // The first inbound we see is the most recent one.
          if (!entry.lastInbound) {
            entry.lastInbound = c.created_at;
            entry.phone = c.phone_number;
          }
        } else if ((c.metadata as any)?.type === "inactivity_followup") {
          // If we see a follow-up BEFORE we've seen an inbound (since we're going backwards in time),
          // it means the follow-up was sent AFTER their last message.
          if (!entry.lastInbound) {
            entry.followupAfter = true;
          }
        }
      }

      // Pre-filter eligible contacts before checking orders/takeovers to save DB queries
      const eligibleEntries = [];
      for (const [key, entry] of perContact) {
        if (!entry.lastInbound) continue;
        if (entry.followupAfter) continue; // already followed up since their last message
        const lastInboundTime = new Date(entry.lastInbound.replace(" ", "T")).getTime();
        if (isNaN(lastInboundTime) || lastInboundTime > cutoffTime) continue; // not idle long enough
        if (lastInboundTime < enabledAtTime) continue; // ignore backlog from before the feature was enabled
        eligibleEntries.push({ key, entry });
      }

      if (!eligibleEntries.length) continue;

      // Check if any eligible contacts have placed an order
      const eligiblePhones = eligibleEntries.map(e => e.entry.phone);
      const orderKeys = new Set<string>();

      // Fetch in chunks of 100 to avoid huge URL strings
      for (let i = 0; i < eligiblePhones.length; i += 100) {
        const chunk = eligiblePhones.slice(i, i + 100);
        const { data: oData1 } = await supabase.from("orders").select("customer_phone").eq("user_id", userId).in("customer_phone", chunk);
        const { data: oData2 } = await supabase.from("orders").select("whatsapp_phone").eq("user_id", userId).in("whatsapp_phone", chunk);

        for (const o of oData1 || []) if (o.customer_phone) orderKeys.add(normalizeKey(o.customer_phone));
        for (const o of oData2 || []) if (o.whatsapp_phone) orderKeys.add(normalizeKey(o.whatsapp_phone));
      }

      for (const { key, entry } of eligibleEntries) {
        if (orderKeys.has(key)) continue; // customer already ordered — never send

        // Skip if the chat has been taken over by a human
        const { data: takeover } = await supabase
          .from("chat_takeovers")
          .select("is_taken_over")
          .eq("user_id", userId)
          .eq("phone_number", entry.phone)
          .maybeSingle();
        if (takeover?.is_taken_over) continue;

        try {
          const res = await fetch(`${supabaseUrl}/functions/v1/send-whatsapp`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${serviceKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ to: entry.phone, message: cfg.text.trim(), sessionApiKey }),
          });
          if (!res.ok) {
            console.error("follow-up send failed", entry.phone, (await res.text()).substring(0, 200));
            continue;
          }
          await supabase.from("conversations").insert({
            user_id: userId,
            phone_number: entry.phone,
            message: cfg.text.trim(),
            direction: "outbound",
            message_type: "text",
            metadata: { type: "inactivity_followup" },
          });
          summary.push({ userId, phone: entry.phone });
        } catch (e) {
          console.error("follow-up error", entry.phone, (e as Error).message);
        }
      }
    }

    return new Response(JSON.stringify({ success: true, sent: summary.length, details: summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("send-followups error:", (e as Error).message);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
