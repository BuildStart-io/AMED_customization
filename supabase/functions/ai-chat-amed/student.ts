import { SHARED_POST_PROFILE_PROMPT } from "./sharedFlow.ts";

export const STUDENT_SYSTEM_PROMPT = `
PROFESSION WORKFLOW: MEDICAL STUDENT

HARD GATE RULE:
Do NOT provide detailed product specifications, catalogs, or prices to the customer until ALL of the following 7 required fields are collected and validated:
1. Customer Name
2. University or Institution
3. Course or Programme
4. Current Year
5. City or District
6. WhatsApp Number
7. Normal Contact Number

If ANY of these fields are missing:
- Politely acknowledge any provided details.
- Ask specifically for the missing required field(s).
- Do NOT reveal product prices or catalog details yet.
- Append tag at the end:
<LEAD_DETAILS_JSON>{"customer_name":"...","profession":"Medical Student","institution":"...","course_program":"...","current_year":"...","city_district":"...","whatsapp_number":"...","normal_contact_number":"...","status":"Customer Details Pending"}</LEAD_DETAILS_JSON>

Once ALL 7 fields are collected and validated:
- Mark status as "Product Inquiry".
- Append tag at the end:
<LEAD_DETAILS_JSON>{"customer_name":"...","profession":"Medical Student","institution":"...","course_program":"...","current_year":"...","city_district":"...","whatsapp_number":"...","normal_contact_number":"...","status":"Product Inquiry"}</LEAD_DETAILS_JSON>
- Proceed to Step 3 (Product Selection).

${SHARED_POST_PROFILE_PROMPT}
`;

export function handleStudentFlow(payload?: any): string {
  const existingLead = payload?.existingLead;
  const missingFields: string[] = [];

  if (!existingLead?.customer_name) missingFields.push("Customer Name");
  if (!existingLead?.institution) missingFields.push("University or Institution");
  if (!existingLead?.course_program) missingFields.push("Course or Programme");
  if (!existingLead?.current_year) missingFields.push("Current Year");
  if (!existingLead?.city_district) missingFields.push("City or District");
  if (!existingLead?.whatsapp_number && !payload?.phoneNumber) missingFields.push("WhatsApp Number");
  if (!existingLead?.normal_contact_number) missingFields.push("Normal Contact Number");

  const isProfileComplete = missingFields.length === 0;

  return `
${STUDENT_SYSTEM_PROMPT}

MEDICAL STUDENT PROFILE VALIDATION STATUS:
- Complete: ${isProfileComplete ? "YES (All required fields validated - Proceed to Step 3)" : "NO (Gated - Collect missing fields first)"}
${!isProfileComplete ? `- Missing Required Fields to Collect: ${missingFields.join(", ")}` : ""}
`;
}
