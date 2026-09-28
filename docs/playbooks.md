# Playbooks

A playbook is an n8n workflow plus the data contract. JSON under `n8n/workflows/` is importable and **inactive**. n8n strips credentials on export; these files use `$env` instead of stored credentials. Set the variables in `.env.example` before you activate a workflow.

Nothing below searches before it creates. A second POST creates a second person.

## 1. Form to CRM

**File.** `n8n/workflows/01-form-to-crm.json`

**Trigger.** `POST /webhook/aperture-lead`

**What the graph does.** Webhook, then three HTTP nodes in order:

1. `POST $env.TWENTY_URL/rest/people` with `Authorization: Bearer $env.TWENTY_TOKEN`
2. `POST $env.CHATWOOT_URL/api/v1/accounts/$env.CHATWOOT_ACCOUNT_ID/contacts` with header `api_access_token: $env.CHATWOOT_TOKEN`
3. `POST $env.MAUTIC_URL/api/contacts/new` with `Authorization: Basic $env.MAUTIC_BASIC`

**Body the webhook expects.**

```json
{
  "email": "ada@example.com",
  "firstName": "Ada",
  "lastName": "Lovelace",
  "name": "Ada Lovelace",
  "phone": "+15551212",
  "source": "site:home"
}
```

**Not in this file yet.** Rejecting a missing email, E.164 normalization, Twenty search-by-email, Mautic segment `inbound-web`, opening a Chatwoot conversation.

## 2. Speed to lead

**File.** `n8n/workflows/02-speed-to-lead.json`

**Trigger.** `POST /webhook/aperture-sms` with `{ "to", "body" }`.

**What the graph does.** One Twilio request: `POST https://api.twilio.com/2010-04-01/Accounts/$env.TWILIO_ACCOUNT_SID/Messages.json` as form fields `To`, `From` (`$env.TWILIO_FROM`), `Body`, with `Authorization: Basic $env.TWILIO_BASIC`.

**Not in this file yet.** Quiet hours, writing a Twenty note, a 10-minute wait, or opening Chatwoot if nobody replies. Do not point this webhook at itself.

## 3. Booking to pipeline

**File.** `n8n/workflows/03-booking.json`

**Trigger.** `POST /webhook/aperture-booking`

**What the graph does.** In parallel: `POST $env.CALCOM_URL/api/v2/bookings` with `Bearer $env.CALCOM_API_KEY`, and `POST $env.TWENTY_URL/rest/opportunities` with stage `Appointment`. The Twenty call creates a body; it does not look up an existing opportunity id.

**Not in this file yet.** Matching the attendee to a person, Mautic `appointment-nurture`, a 24-hour reminder, or cancelling that reminder on `BOOKING_CANCELLED`.

## 4. Inbox note

**File.** `n8n/workflows/04-inbox-context.json`

**Trigger.** `POST /webhook/aperture-reply` with `{ "conversationId", "body" }`.

**What the graph does.** `POST $env.CHATWOOT_URL/api/v1/accounts/$env.CHATWOOT_ACCOUNT_ID/conversations/{conversationId}/messages` with `private: true`.

**Not in this file yet.** Reading the Chatwoot contact, looking them up in Twenty, or creating a lead when there is no match. If `conversationId` is not a Chatwoot id, Chatwoot returns an error and the node is set to never-error so the execution stays visible.

## Import

In n8n: Workflows → Import from file. Activate only after a manual execution against a test contact shows the status you expect. The compose file publishes port 5678 for that.

## Contributing a playbook

1. Export from n8n with credentials stripped.
2. Name the file `NN-short-slug.json`.
3. Add a section here with the trigger, the HTTP calls that actually exist, and the steps that are still missing.
4. Do not commit API keys, real client numbers, or webhook secrets.
