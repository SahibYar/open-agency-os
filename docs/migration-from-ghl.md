# Migrating from GoHighLevel

This guide is for agencies actively using GoHighLevel who want to move to Aperture. It is honest about what transfers cleanly and what does not.

## Before you start

**Run both in parallel for 30 days.** Do not cancel GHL until every client workflow is proven in Aperture. The monthly cost of overlap is worth the safety.

**Who this migration is for:**
- Agencies with a technical person who can manage a Linux server
- 1–20 client sub-accounts (larger requires the multi-tenant work in the roadmap)
- Agencies whose GHL usage is CRM + email + SMS + booking (the core stack)

**Who should wait:**
- Agencies heavily reliant on GHL's reputation management (no Aperture equivalent yet)
- Anyone using GHL's white-label SaaS mode for resale (not built yet)
- Non-technical owners with no DevOps support

---

## Step 1 — Export your data from GoHighLevel

### Contacts

GHL → **Contacts → Export**
- Download as CSV
- You will get: name, email, phone, tags, pipeline stage, source

### Opportunities / Pipelines

GHL → **Opportunities → Export**
- Download per pipeline as CSV

### Email templates

GHL → **Marketing → Emails → Templates**
- Copy HTML manually — GHL does not export templates as files

### Workflow triggers (for reference)

GHL → **Automation → Workflows**
- Screenshot or document each workflow step-by-step
- You will rebuild these in n8n

### Notes

GHL → individual contacts — notes are not bulk-exportable. Export the contact CSV which includes the last note field for most contacts.

---

## Step 2 — Set up Aperture

Follow `docs/getting-started.md`. Bring up at minimum: `core`, `crm`, `inbox`, `booking`, `marketing`.

Minimum recommended stack for a GHL migration:
```bash
docker compose --profile core --profile crm --profile inbox --profile booking --profile marketing up -d
```

---

## Step 3 — Import contacts into Twenty (CRM)

Twenty does not yet have a CSV import UI. Use the Twenty API or n8n to bulk-import contacts.

### Via n8n bulk import workflow

Create a one-off n8n workflow:
1. **Read Binary Files** node — load your GHL contacts CSV
2. **Spreadsheet File** node — parse CSV into rows
3. **HTTP Request** node — POST each row to `http://twenty:3000/rest/people`

```json
{
  "name": { "firstName": "{{ firstName }}", "lastName": "{{ lastName }}" },
  "emails": { "primaryEmail": "{{ email }}" },
  "phones": { "primaryPhoneNumber": "{{ phone }}" }
}
```

Run once, then disable the workflow.

### Pipeline stages

Create matching stages in Twenty:
1. Twenty → **Settings → Objects → Opportunities**
2. Add stages matching your GHL pipeline names (e.g. New Lead, Contacted, Appointment Set, Closed)

---

## Step 4 — Import contacts into Mautic

Mautic → **Contacts → Import**
- Upload the same GHL contacts CSV
- Map fields: firstname, lastname, email, phone
- Add a tag `migrated-from-ghl`
- Assign to the `Inbound Nurture` segment if you want to re-engage cold contacts

---

## Step 5 — Rebuild automations in n8n

Map each GHL workflow to an Aperture n8n workflow:

| GHL workflow | Aperture equivalent |
|---|---|
| New lead → immediate SMS | `06-lead-follow-up-sequence` |
| Missed call → text back | `05-missed-call-text-back` |
| Appointment booked → reminder | `07-appointment-reminder` |
| Appointment done → review request | `08-review-request` |
| New conversation → CRM sync | `09-chatwoot-crm-sync` |
| Form submission → CRM | `01-form-to-crm` |

For each workflow, import the JSON from `n8n/workflows/`, fill in the required `.env` API tokens, and do a manual test execution before activating.

---

## Step 6 — Configure SMS inbox in Chatwoot

Follow `docs/sms-inbox.md`.

If you are porting your existing Twilio number from GHL:
1. In GHL: remove the number from your GHL account (or forward it)
2. In Twilio: update the webhook URL to point to Chatwoot
3. The number stays in Twilio — you are just changing where webhooks go

If GHL owns the number (LC Phone): purchase a new number in Twilio. Update any public-facing contact info to the new number.

---

## Step 7 — Migrate booking pages

Cal.com self-hosted runs at `book.{DOMAIN}`. To replicate your GHL calendar:

1. Cal.com → **Event Types → New Event Type**
2. Create event types matching each GHL calendar (15-min intro, 30-min discovery, etc.)
3. Connect your calendar (Google/Outlook) under **Settings → Calendars**
4. Update your website, email signatures, and funnel forms to point to the new Cal.com link
5. Enable the `07-appointment-reminder` workflow in n8n

---

## Step 8 — Move email sequences to Mautic

For each GHL email campaign:
1. Recreate the email template in Mautic → **Channels → Emails → New**
2. Mautic's drag-and-drop builder is similar to GHL's
3. Create a campaign in Mautic with the same trigger + timing as GHL
4. Assign contacts to the matching segment

---

## Step 9 — Update all lead sources

Update every form, ad integration, and landing page webhook URL:

| Source | Old URL (GHL) | New URL (Aperture) |
|---|---|---|
| WordPress forms | GHL webhook | `https://glue.{DOMAIN}/webhook/aperture-lead` |
| Facebook Lead Ads | GHL | n8n webhook (via Zapier or Meta webhook direct) |
| Typeform, Jotform | GHL | n8n webhook |
| Cal.com | GHL | Use Aperture's own Cal.com instance |

---

## What you gain vs GHL

- **No per-contact fee** — contacts are unlimited, you pay only for server + SMS/email usage
- **Data ownership** — full Postgres dump, no vendor lock-in
- **n8n power** — automations GHL cannot do (custom code, any API, complex logic)
- **Customisable** — modify any service, add new tools to the stack

## What you give up (for now)

| Feature | Status |
|---|---|
| Reputation management (review monitoring) | Not built |
| White-label sub-account resale | Not built (roadmap) |
| Mobile app | Not present |
| Unified AI inbox responses | Not present |
| One-click snapshot + restore | Not present |
| Built-in social media posting | Not present |

Track progress: [ROADMAP.md](../ROADMAP.md)
