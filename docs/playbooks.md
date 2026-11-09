# Playbooks

A playbook is an n8n workflow plus the data contract. JSON under `n8n/workflows/` is importable and **inactive**. n8n strips credentials on export; these files use `$env` instead of stored credentials. Set the variables in `.env.example` before you activate a workflow.

**Required env vars for all playbooks:**
- `TWILIO_ACCOUNT_SID`, `TWILIO_BASIC`, `TWILIO_FROM` — SMS sending
- `BRAND_NAME`, `BOOKING_PAGE_URL` — used in SMS message text
- `TWENTY_URL`, `TWENTY_TOKEN` — CRM writes
- `CHATWOOT_INTERNAL_URL`, `CHATWOOT_ACCOUNT_ID`, `CHATWOOT_TOKEN` — inbox writes
- `MAUTIC_URL`, `MAUTIC_BASIC` — email marketing writes

---

## 1. Form to CRM

**File.** `n8n/workflows/01-form-to-crm.json`

**Trigger.** `POST /webhook/aperture-lead`

**What the graph does.** Webhook → Validate & normalise → Twenty → Chatwoot → Mautic:

1. **Validate & normalise** — rejects payloads with no `email`, normalises phone to E.164 (best-effort US 10-digit), splits composite `name` into `firstName` / `lastName`
2. `POST $env.TWENTY_URL/rest/people`
3. `POST $env.CHATWOOT_URL/api/v1/accounts/.../contacts`
4. `POST $env.MAUTIC_URL/api/contacts/new`

**Body:**
```json
{ "email": "ada@example.com", "firstName": "Ada", "lastName": "Lovelace", "phone": "5551212000", "source": "site:home" }
```

**Not yet:** search-before-create (second submit still creates a duplicate), Mautic segment enrolment.

---

## 2. Speed to lead

**File.** `n8n/workflows/02-speed-to-lead.json`

**Trigger.** `POST /webhook/aperture-sms` with `{ "to", "body" }`.

**What the graph does.** Single Twilio SMS request. Useful as a manual trigger from another system.

**Not yet:** quiet hours, write-back to CRM, 10-min wait loop.

---

## 3. Booking to pipeline

**File.** `n8n/workflows/03-booking.json`

**Trigger.** `POST /webhook/aperture-booking`

**What the graph does.** Parallel fan-out: create Cal.com booking + create Twenty opportunity at `Appointment` stage.

**Not yet:** attendee-to-person matching, Mautic nurture enrolment, reminder scheduling.

---

## 4. Inbox note

**File.** `n8n/workflows/04-inbox-context.json`

**Trigger.** `POST /webhook/aperture-reply` with `{ "conversationId", "body" }`.

**What the graph does.** Creates a private note on an existing Chatwoot conversation.

**Not yet:** Twenty lookup, lead creation when contact is unknown.

---

## 5. Missed call text back ⭐ GHL parity

**File.** `n8n/workflows/05-missed-call-text-back.json`

**Trigger.** Twilio voice webhook — configure in Twilio console under your number's Voice settings → Status Callback URL → `https://glue.{DOMAIN}/webhook/aperture-missed-call`

**What the graph does.**
1. Receives Twilio call status event (form-urlencoded POST)
2. Code node filters: only `no-answer` or `busy` **inbound** calls pass through
3. Twilio SMS → caller: "Hey! Sorry I missed your call. How can I help? Reply here or book: `{BOOKING_PAGE_URL}`"
4. Chatwoot → creates a contact record for the caller's number

**Body from Twilio (sent automatically):**
```
CallStatus=no-answer&From=+15559876543&To=+15551234567&Direction=inbound&CallSid=CA...
```

**Not yet:** quiet hours check, existing contact lookup before creating Chatwoot contact.

---

## 6. Lead follow-up sequence ⭐ GHL parity

**File.** `n8n/workflows/06-lead-follow-up-sequence.json`

**Trigger.** `POST /webhook/aperture-lead-followup`

**What the graph does.**
1. Validate & normalise input (same as workflow 01)
2. **Immediate SMS**: "Hey {name}, thanks for reaching out! Book a call: {BOOKING_PAGE_URL}"
3. Create person in Twenty + contact in Mautic (parallel)
4. Enrol contact in Mautic nurture segment (`MAUTIC_NURTURE_SEGMENT_ID`)
5. **Wait 10 minutes** (n8n Wait node — execution resumes automatically)
6. **Follow-up SMS**: "Still here if you have questions…"

**Additional env vars needed:**
- `MAUTIC_NURTURE_SEGMENT_ID` — ID of the Mautic segment (see `docs/email-deliverability.md`)

**Not yet:** check if conversation already received a reply before sending follow-up.

---

## 7. Appointment reminder ⭐ GHL parity

**File.** `n8n/workflows/07-appointment-reminder.json`

**Trigger.** Schedule — runs every hour automatically once activated.

**What the graph does.**
1. `GET $env.CALCOM_URL/api/v2/bookings?status=upcoming` — fetches all upcoming bookings
2. Code node filters to bookings starting **23–25 hours from now** (24-hour window)
3. For each matching booking with a phone number: Twilio SMS reminder
   - "Hi {name}, reminder: your appointment {title} is tomorrow at {time}. Reply to reschedule: {BOOKING_PAGE_URL}"

**Not yet:** 1-hour-before reminder, email reminder via Mautic, cancellation handling.

---

## 8. Post-appointment review request ⭐ GHL parity

**File.** `n8n/workflows/08-review-request.json`

**Trigger.** `POST /webhook/aperture-booking-done`

Can be triggered by: Cal.com booking webhook (configure under Cal.com → Event Types → Webhooks), or manually from another n8n workflow after marking a deal won in Twenty.

**What the graph does.**
1. Extracts attendee name, email, phone from the webhook payload
2. **Wait 2 hours** (n8n Wait node)
3. If attendee has a phone number: Twilio SMS → "Thanks for meeting with {BRAND_NAME}! Google review: {GOOGLE_REVIEW_URL}"
4. Mautic → tags contact with `appointment-complete` and `review-requested`

**Additional env vars needed:**
- `GOOGLE_REVIEW_URL` — your Google Business Profile review link

**Not yet:** fallback email if no phone number, deduplication (don't send twice for same booking).

---

## 9. Chatwoot conversation → Twenty CRM sync

**File.** `n8n/workflows/09-chatwoot-crm-sync.json`

**Trigger.** Chatwoot webhook — configure in Chatwoot → Settings → Integrations → Webhooks:
- URL: `https://glue.{DOMAIN}/webhook/aperture-chatwoot-sync`
- Events: `Conversation Created`

**What the graph does.**
1. Receives `conversation_created` event from Chatwoot
2. Extracts sender name, email, phone
3. `GET $env.TWENTY_URL/rest/people?filter=...` — searches for existing person by email
4. **If found**: creates a note on the Twenty person: "New inbox conversation. Chatwoot ID: {id}"
5. **If not found**: creates a new person in Twenty

This keeps Twenty as the source of truth — every inbox conversation lands in the CRM.

**Not yet:** custom attribute write-back to Chatwoot (storing `twenty_id` on the contact).

---

## Import guide

1. n8n → **Workflows → Import from file**
2. Import all files from `n8n/workflows/` one by one
3. Each workflow will appear as inactive
4. Fill `.env` with the required API tokens and reload n8n (`docker compose restart n8n`)
5. Click the workflow → **Execute workflow** to run a manual test
6. Only activate after a successful manual test

**Testing tip:** Use n8n's built-in test webhook URL (shown in the webhook node) to trigger workflows with a sample payload before wiring real external systems.

---

## Contributing a playbook

1. Build and test the workflow in your n8n instance
2. Export from n8n with credentials stripped (n8n does this by default on export)
3. Name the file `NN-short-slug.json` (next number in sequence)
4. Add a section to this file: trigger, what the graph does, missing steps
5. Do not commit API keys, real phone numbers, or webhook secrets
