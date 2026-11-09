# Roadmap

Public on purpose. If a box is unchecked, it is unchecked.

## Shipped

- [x] Public claim and stack decision
- [x] Compose profiles: core, crm, inbox, booking, marketing, pages, **sso**
- [x] `setup.sh` — one-command secret generation
- [x] `backup.sh` — Postgres dump + volume snapshot guidance
- [x] `CADDY_EMAIL` in `.env.example` (Let's Encrypt contact)
- [x] WordPress isolated DB user (separate from Mautic)
- [x] DNS hostname table in getting-started fixed to match Caddyfile
- [x] Agency control panel dashboard (`console/index.html` → `dash.{DOMAIN}`)
- [x] **Authelia SSO** — single login screen across all services (`--profile sso`, `Caddyfile.sso`, `docs/sso.md`)
- [x] Playbook 01 — email validation + E.164 phone normalisation
- [x] Playbook 05 — **Missed call text back** (Twilio call status webhook)
- [x] Playbook 06 — **Lead follow-up sequence** (immediate SMS + 10-min follow-up + Mautic nurture)
- [x] Playbook 07 — **Appointment reminder** (schedule-based, 24h before via Cal.com API)
- [x] Playbook 08 — **Post-appointment review request** (2h wait → Google review SMS)
- [x] Playbook 09 — **Chatwoot → Twenty CRM sync** (conversation created → find-or-create person)
- [x] `ops/client-add.sh` — per-client subdomain + credential provisioning (Model B)
- [x] `docs/sms-inbox.md` — Chatwoot + Twilio two-way SMS setup guide
- [x] `docs/email-deliverability.md` — Mautic + Postmark/SES SMTP and campaign setup
- [x] `docs/migration-from-ghl.md` — step-by-step GHL → Aperture migration guide

## Now

- [ ] Pin image versions after first external deploy report
- [ ] GitHub topics: "open-source-gohighlevel", "self-hosted-crm", "agency-os", "n8n", "chatwoot"
- [ ] Discussion thread: "What GHL feature should we replace first?"
- [ ] Twenty search-before-create in playbooks 01 and 06 (prevent duplicate persons)

## Next

- [ ] Cal.com webhook signature verification in playbook 03
- [ ] Quiet-hours check in playbooks 05 and 06 (no SMS between 9pm–9am)
- [ ] Reputation playbook: Google Business Profile review monitoring via n8n
- [ ] Mautic campaign JSON export for the standard nurture sequence (import-ready)
- [ ] Example Caddy config for second client hostname (Model B walkthrough)
- [ ] Chatwoot custom attribute write-back: store `twenty_id` on Chatwoot contact

## Later

- [ ] Tenant provisioner design doc before any SaaS-mode code (Model C)
- [ ] Optional EspoCRM compose profile (alternative to Twenty)
- [ ] Metabase or Grafana analytics profile for pipeline reporting
- [ ] Facebook Lead Ads → n8n direct webhook integration guide

## Won't do

- Copy HighLevel's interface, feature names, or snapshot format
- Bundle paid API keys or carrier contracts
- Promise feature parity on a date
