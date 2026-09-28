# Aperture console

The clickable agency demo. One workspace, twelve areas a GoHighLevel user already knows, each owned by an open tool:

| Area | Owner |
| --- | --- |
| Dashboard | Aperture |
| Conversations | Chatwoot |
| Calendars | Cal.com |
| Contacts, opportunities | Twenty |
| Payments | Stripe, written back through n8n |
| Marketing | Mautic |
| Automations | n8n |
| Sites, memberships | WordPress |
| Reputation | n8n review-request playbook (no fake Birdeye) |
| Reporting | Aperture, from the same records |

Actions cross the bus. Capturing a lead creates the Twenty person, the pipeline card, the Chatwoot thread, and a Mautic enrollment in one step. Booking moves the deal. Running speed-to-lead writes an SMS onto the thread.

`src/` here is that console. It expects the Aperture app shell (TanStack Router, the existing design tokens). Demo records live in the browser so a walkthrough starts from the same story every time. Reset is in the sidebar.
