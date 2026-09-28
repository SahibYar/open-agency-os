# Playbooks

A playbook is an n8n workflow plus the data contract. JSON under `n8n/workflows/` is the start of that contract. Credentials are never committed.

## 1. Form to CRM to segment

**Trigger.** `POST /webhook/form-lead` from WordPress or any form.

**Body.**

```json
{
  "email": "ada@example.com",
  "firstName": "Ada",
  "lastName": "Lovelace",
  "phone": "+15551212",
  "source": "site:home",
  "message": "Need a quote"
}
```

**Steps.**

1. Reject the call if `email` is missing.
2. Normalize phone to E.164. If parsing fails, keep the raw value and set `phone_valid=false`.
3. Search Twenty by email. Create the person if absent. Store `source`.
4. Upsert the Mautic contact. Add to segment `inbound-web`.
5. If `message` is non-empty, open or append a Chatwoot conversation and set contact attribute `twenty_id`.

**File.** `n8n/workflows/01-form-to-crm.json` (skeleton). Replace the placeholder nodes with your Twenty and Mautic credentials after those profiles are up.

## 2. Speed to lead

**Trigger.** Twenty webhook, person created, `source` starts with `ads:`.

**Steps.**

1. Stop if local time is inside quiet hours (default 21:00–08:00 in `TZ`).
2. Send one SMS through Twilio: "Hi {{firstName}}, this is {{agency}}. Want a 15-min slot?"
3. Write the SMS body back to a Twenty note.
4. Wait 10 minutes. If no inbound SMS matched the number, assign a Chatwoot conversation to the default team.

Do not loop this workflow on its own note-created event.

## 3. Booking to pipeline

**Trigger.** Cal.com `BOOKING_CREATED`.

**Steps.**

1. Match attendee email to a Twenty person. Create one if needed.
2. Move the open opportunity to stage `Booked`, or create an opportunity named after the event type.
3. Enroll the Mautic contact in campaign `appointment-nurture`.
4. Schedule an SMS for 24 hours before `startTime`. Cancel that execution on `BOOKING_CANCELLED` (second workflow, same correlation id).

## 4. Inbox shows CRM context

**Trigger.** Chatwoot `conversation_created`.

**Steps.**

1. Read email and phone from the contact.
2. Lookup Twenty.
3. Private note: open deals, last Mautic email subject, tags.
4. If no match, create a Twenty lead with `source=inbox` and write `twenty_id` back to Chatwoot.

## Contributing a playbook

1. Export from n8n with credentials stripped (n8n does this by default).
2. Name the file `NN-short-slug.json`.
3. Add a section here: trigger, payload, steps, failure mode.
4. Do not include API keys, phone numbers of real clients, or webhook secrets.
