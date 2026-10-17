export interface ImageAnalysisResult {
  isBankTransferReceipt: boolean;
  bankName: string | null;
  amount: string | null;
  reason: string;
  storageUrl?: string | null;
}

function base64ToBytes(base64: string): Uint8Array {
  const clean = base64.replace(/^data:[^;]+;base64,/, "").trim();
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function downloadImageFromWaha(
  sessionName: string,
  wahaMessageId: string,
  mediaUrl?: string,
  rawPayload?: any
): Promise<{ bytes: Uint8Array; mimeType: string } | null> {
  const WAHA_BASE = (Deno.env.get("WAHA_BASE_URL") || "http://waha:3000").replace(/\/+$/, "");
  const WAHA_KEY = Deno.env.get("WAHA_API_KEY") || "";

  // 1. Try mediaUrl (rewriting localhost:3000 to internal WAHA_BASE, localhost:8000 to internal api-gw)
  if (mediaUrl) {
    try {
      let fetchUrl = mediaUrl;
      if (/^https?:\/\/(localhost|127\.0\.0\.1):3000/i.test(fetchUrl)) {
        fetchUrl = fetchUrl.replace(/^https?:\/\/(localhost|127\.0\.0\.1):3000/i, WAHA_BASE);
      } else if (/^https?:\/\/(localhost|127\.0\.0\.1):8000/i.test(fetchUrl)) {
        const internalApiGw = Deno.env.get("SUPABASE_URL") || "http://api-gw:8000";
        fetchUrl = fetchUrl.replace(/^https?:\/\/(localhost|127\.0\.0\.1):8000/i, internalApiGw);
      }
      console.log(`Downloading image from mediaUrl: ${fetchUrl}`);
      const res = await fetch(fetchUrl, {
        headers: { "X-Api-Key": WAHA_KEY, "Accept": "*/*" },
        signal: AbortSignal.timeout(10_000),
      });
      if (res.ok) {
        const bytes = new Uint8Array(await res.arrayBuffer());
        if (bytes.length > 20) {
          const mimeType = res.headers.get("content-type") || rawPayload?.payload?.media?.mimetype || "image/jpeg";
          return { bytes, mimeType };
        }
      } else {
        console.warn(`WAHA mediaUrl download returned status ${res.status}`);
      }
    } catch (err) {
      console.warn("Error fetching from mediaUrl:", (err as Error).message);
    }
  }

  // 2. Try WAHA download endpoint
  if (sessionName && wahaMessageId) {
    try {
      const downloadUrl = `${WAHA_BASE}/api/${encodeURIComponent(sessionName)}/messages/${encodeURIComponent(wahaMessageId)}/download`;
      console.log(`Downloading image from WAHA messages download: ${downloadUrl}`);
      const res = await fetch(downloadUrl, {
        headers: { "X-Api-Key": WAHA_KEY, "Accept": "*/*" },
        signal: AbortSignal.timeout(10_000),
      });
      if (res.ok) {
        const bytes = new Uint8Array(await res.arrayBuffer());
        if (bytes.length > 20) {
          const mimeType = res.headers.get("content-type") || "image/jpeg";
          return { bytes, mimeType };
        }
      } else {
        console.warn(`WAHA message download returned status ${res.status}`);
      }
    } catch (err) {
      console.warn("Error fetching from WAHA download endpoint:", (err as Error).message);
    }
  }

  // 3. Fallback: check raw payload base64 (_data.body)
  const candidateBase64 = rawPayload?.payload?._data?.body || rawPayload?._data?.body;
  if (typeof candidateBase64 === "string" && candidateBase64.length > 20) {
    try {
      const bytes = base64ToBytes(candidateBase64);
      const mimeType = rawPayload?.payload?._data?.mimetype || rawPayload?.payload?.media?.mimetype || "image/jpeg";
      console.log(`Extracted ${bytes.length} bytes from payload base64`);
      return { bytes, mimeType };
    } catch (err) {
      console.warn("Error decoding base64 from raw payload:", (err as Error).message);
    }
  }

  return null;
}

export async function uploadImageToStorage(
  supabase: any,
  bytes: Uint8Array,
  mimeType: string,
  userId?: string
): Promise<string | null> {
  try {
    const bucket = "chat-media";
    const { data: bData, error: bErr } = await supabase.storage.getBucket(bucket);
    if (bErr || !bData) {
      await supabase.storage.createBucket(bucket, {
        public: true,
        fileSizeLimit: 20 * 1024 * 1024,
      }).catch(() => {});
    }

    const ext = mimeType.includes("png") ? "png" : mimeType.includes("webp") ? "webp" : "jpg";
    const key = `inbound/${userId || "general"}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(key, bytes, { contentType: mimeType, upsert: true });

    if (uploadError) {
      console.warn("Failed to upload image to chat-media bucket:", uploadError.message);
      return null;
    }

    const publicOrigin = Deno.env.get("SUPABASE_PUBLIC_URL") || "http://localhost:8000";
    const publicUrl = `${publicOrigin.replace(/\/+$/, "")}/storage/v1/object/public/${bucket}/${key}`;
    return publicUrl;
  } catch (err) {
    console.warn("Error in uploadImageToStorage:", err);
    return null;
  }
}

/**
 * Context-based image identifier (Zero AI token consumption).
 * Determines if an incoming image is an order confirming bank transfer receipt
 * based on conversation history context (did the bot ask for the receipt/slip?),
 * lead ordering stage, and customer caption keywords.
 */
export async function analyzeImage(
  supabase: any,
  sessionName: string,
  wahaMessageId: string,
  mediaUrl?: string,
  rawPayload?: any,
  userId?: string,
  phoneNumber?: string,
  caption?: string
): Promise<ImageAnalysisResult> {
  // 1. Download and save image to Supabase Storage so staff can verify it in CRM (best-effort)
  let publicStorageUrl: string | null = null;
  try {
    const downloaded = await downloadImageFromWaha(sessionName, wahaMessageId, mediaUrl, rawPayload);
    if (downloaded) {
      publicStorageUrl = await uploadImageToStorage(supabase, downloaded.bytes, downloaded.mimeType, userId);
    }
  } catch (err) {
    console.warn("Storage upload note:", (err as Error).message);
  }

  let isReceipt = false;
  let contextReason = "";

  // 2. Context Check A: Check recent outbound messages from the bot to this customer
  if (phoneNumber && userId) {
    const { data: recentOutbound } = await supabase
      .from("conversations")
      .select("message, created_at")
      .eq("user_id", userId)
      .eq("phone_number", phoneNumber)
      .eq("direction", "outbound")
      .order("created_at", { ascending: false })
      .limit(5);

    const outboundMessages = recentOutbound || [];
    for (const ob of outboundMessages) {
      const msg = ob.message || "";
      // If we hit a previous acknowledgment message, stop looking back further
      if (isReceiptAcknowledgment(msg)) {
        break;
      }
      if (isAskingForReceipt(msg)) {
        isReceipt = true;
        contextReason = "Bot requested bank transfer receipt or provided deposit details in preceding message";
        break;
      }
    }
  }

  // 3. Context Check B: Customer caption keywords (e.g. customer typed "receipt", "slip", "payment", etc.)
  if (!isReceipt && isReceiptCaption(caption)) {
    isReceipt = true;
    contextReason = "Customer caption explicitly indicates bank receipt / payment confirmation";
  }

  if (isReceipt) {
    console.log(`[Context Identifier] Image classified as Bank Transfer Receipt: ${contextReason}`);
    return {
      isBankTransferReceipt: true,
      bankName: null,
      amount: null,
      reason: contextReason,
      storageUrl: publicStorageUrl,
    };
  }

  console.log("[Context Identifier] Image classified as Normal Image (bot did not ask for receipt)");
  return {
    isBankTransferReceipt: false,
    bankName: null,
    amount: null,
    reason: "Bot did not request a bank receipt in the current context",
    storageUrl: publicStorageUrl,
  };
}

function isAskingForReceipt(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();

  const receiptTerms = [
    // English
    "bank receipt", "payment receipt", "payment slip", "deposit slip", "bank slip",
    "send your receipt", "send the receipt", "send receipt", "upload receipt",
    "send your slip", "send the slip", "transfer slip", "bank transfer",
    "bank deposit", "account number", "account details", "commercial bank",
    "sampath bank", "bank of ceylon", "peoples bank", "hatton national",
    "hnb", "boc", "frimi", "transfer confirmation", "deposit details",
    // Sinhala
    "රිසිට්පත", "රිසිට්", "ගෙවීම් රිසිට්", "තැන්පතු පත්‍රිකාව", "බැංකු තැන්පතු",
    "ගිණුම් අංක", "ගිණුමට", "බැංකු ගිණුම්", "ස්ලිප්",
    // Tamil
    "ரசீது", "பற்றுச்சீட்டு", "கட்டண ரசீது", "வங்கி", "வைப்பு"
  ];

  return receiptTerms.some((term) => lower.includes(term));
}

function isReceiptAcknowledgment(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return (
    lower.includes("received your payment receipt") ||
    lower.includes("verify the payment shortly") ||
    lower.includes("ගෙවීම් රිසිට්පත ලැබී ඇත") ||
    lower.includes("ගෙවීම තහවුරු කරනු ඇත") ||
    lower.includes("ரசீது பெறப்பட்டது") ||
    lower.includes("கட்டணத்தைச் சரிபார்ப்பார்")
  );
}

function isReceiptCaption(caption?: string): boolean {
  if (!caption) return false;
  const lower = caption.toLowerCase();
  const receiptKeywords = [
    "receipt", "slip", "payment", "paid", "bank", "transfer", "deposit", "bill",
    "done", "transferred", "deposited", "sent", "attached",
    "ගෙවීම", "රිසිට්", "පේමන්ට්", "බැංකු", "දැම්මා", "ගෙව්වා",
    "ரசீது", "பணம்", "வங்கி", "செலுத்தினேன்"
  ];
  return receiptKeywords.some((kw) => lower.includes(kw));
}
