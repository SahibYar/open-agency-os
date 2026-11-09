# Aperture — Open Agency OS

**An open-source alternative to GoHighLevel, assembled from software that already exists.**

We are not cloning a closed product. We are integrating mature, already-available, but disconnected open-source systems into one self-hosted agency operating system.

[![License: MIT (integration)](https://img.shields.io/badge/integration_license-MIT-111111)](LICENSE)
[![Status: public build](https://img.shields.io/badge/status-public_build-111111)](https://github.com/SahibYar/open-agency-os)
[![Stars](https://img.shields.io/github/stars/SahibYar/open-agency-os?style=social)](https://github.com/SahibYar/open-agency-os/stargazers)

> **Public claim.** This repository is independent. It is not affiliated with, endorsed by, or a copy of GoHighLevel. GoHighLevel is a trademark of its owner. Aperture is the missing integration layer: Docker Compose, Caddy, n8n playbooks, and documentation that turn Twenty, Mautic, Chatwoot, Cal.com, n8n, and WordPress into one coherent stack agencies can self-host.

If you run an agency and you are tired of renting your CRM, **star this repository**. Stars are how other operators find an open path.

---

## Who this is for

- Marketing and service agencies that want CRM, nurture, inbox, booking, and sites without a $97–$497 platform bill plus usage fees.
- Operators who will run a VPS and own the database.
- Contributors who would rather wire excellent projects together than rewrite them.

Stay on a commercial all-in-one if you need white-label SaaS mode and reputation management this week. Come here if ownership and cost matter more than a single login.

## Why this exists

GoHighLevel won because it bundled contacts, pipelines, email, SMS, conversations, calendars, funnels, and agency sub-accounts into one login. The open-source world already shipped each of those jobs as a serious product. They are excellent alone and painful as a system.

**Aperture is the system.** We do not fork Twenty into a fake HighLevel skin. We publish how the pieces talk, how you deploy them, and which commercial features still have no honest open equivalent.

## The stack

| Layer | Default | What it covers | License |
| --- | --- | --- | --- |
| CRM & pipelines | [Twenty](https://github.com/twentyhq/twenty) | Contacts, companies, deals, custom objects | AGPL-3.0 |
| Marketing automation | [Mautic](https://www.mautic.org/) | Campaigns, segments, scoring, drip | GPL-3.0 |
| Conversations | [Chatwoot](https://github.com/chatwoot/chatwoot) | Shared inbox, web chat, WhatsApp, social, **SMS** | MIT |
| Booking | [Cal.com](https://github.com/calcom/cal.com) | Public booking, round-robin, webhooks | AGPL-3.0 |
| Funnels & sites | [WordPress](https://wordpress.org/) | Landing pages, forms, memberships | GPL |
| Workflow glue | [n8n](https://github.com/n8n-io/n8n) | Cross-app automation, no per-task tax | Fair-code |
| SMS & voice | Twilio, Telnyx, or any SIP | Outbound SMS, voice, carrier swap | Commercial API |
| Edge + SSO | [Caddy](https://caddyserver.com/) + [Authelia](https://www.authelia.com/) | Automatic TLS, hostnames, single sign-on | Apache-2.0 / Apache-2.0 |

The contract is **events through n8n**, not one proprietary database.

## What you get today

- **`docker-compose.yml`** with profiles: `core`, `crm`, `inbox`, `booking`, `marketing`, `pages`, `sso`. Each service is an upstream image. This repo does not reimplement those products.
- **`setup.sh`** — generates all required secrets in one command.
- **`backup.sh`** — Postgres dump + volume snapshot guidance.
- **Nine n8n workflows** covering the most-used GoHighLevel automation patterns:
  - Form → CRM (with validation + E.164 normalisation)
  - Speed to lead SMS
  - Booking to pipeline
  - Inbox context note
  - **Missed call text back** ⭐
  - **Lead follow-up sequence** (immediate + 10-min follow-up + Mautic nurture) ⭐
  - **Appointment reminder** (schedule-based, 24h before) ⭐
  - **Post-appointment review request** (2h wait → Google review SMS) ⭐
  - **Chatwoot → Twenty CRM sync** ⭐
- **Authelia SSO** — one login screen across all services (`--profile sso`)
- **Agency control panel** at `dash.{DOMAIN}` — service health, setup checklist, quick commands
- **`ops/client-add.sh`** — per-client subdomain + credential provisioning
- **Docs:** getting-started, playbooks, architecture, comparison, SSO setup, SMS inbox, email deliverability, GHL migration guide

An honest gap list. Reputation management and SaaS mode are not in this repository.

## Where each claim lives

| Claim | File |
| --- | --- |
| Compose profiles and upstream images | [docker-compose.yml](docker-compose.yml) |
| Hostnames | [Caddyfile](Caddyfile) |
| Caddyfile with Authelia SSO | [Caddyfile.sso](Caddyfile.sso) |
| Required secrets and workflow API env | [.env.example](.env.example) |
| Generate all secrets automatically | [setup.sh](setup.sh) |
| Postgres dump + volume backup | [backup.sh](backup.sh) |
| Separate Postgres databases | [ops/postgres-init/01-databases.sql](ops/postgres-init/01-databases.sql) |
| WordPress isolated DB user | [ops/mariadb-init/02-wordpress-user.sh](ops/mariadb-init/02-wordpress-user.sh) |
| Per-client subdomain provisioning | [ops/client-add.sh](ops/client-add.sh) |
| Authelia config | [authelia/configuration.yml](authelia/configuration.yml) |
| Authelia user database | [authelia/users_database.yml](authelia/users_database.yml) |
| Form webhook → validate → Twenty, Chatwoot, Mautic | [n8n/workflows/01-form-to-crm.json](n8n/workflows/01-form-to-crm.json) |
| SMS webhook → Twilio | [n8n/workflows/02-speed-to-lead.json](n8n/workflows/02-speed-to-lead.json) |
| Booking webhook → Cal.com and Twenty | [n8n/workflows/03-booking.json](n8n/workflows/03-booking.json) |
| Reply webhook → Chatwoot private note | [n8n/workflows/04-inbox-context.json](n8n/workflows/04-inbox-context.json) |
| Missed call → immediate text back | [n8n/workflows/05-missed-call-text-back.json](n8n/workflows/05-missed-call-text-back.json) |
| Lead → SMS sequence + Mautic nurture | [n8n/workflows/06-lead-follow-up-sequence.json](n8n/workflows/06-lead-follow-up-sequence.json) |
| Schedule-based appointment reminder | [n8n/workflows/07-appointment-reminder.json](n8n/workflows/07-appointment-reminder.json) |
| Post-appointment review request | [n8n/workflows/08-review-request.json](n8n/workflows/08-review-request.json) |
| Chatwoot conversation → CRM sync | [n8n/workflows/09-chatwoot-crm-sync.json](n8n/workflows/09-chatwoot-crm-sync.json) |
| What those graphs still do not do | [docs/playbooks.md](docs/playbooks.md) |

## Quick start

8 GB RAM is enough for `core` (Caddy, Postgres, Redis, n8n). Plan **16 GB** before you turn on CRM and inbox together.

```bash
git clone https://github.com/SahibYar/open-agency-os.git
cd open-agency-os
bash setup.sh           # generates all secrets into .env
# then set DOMAIN= and CADDY_EMAIL= in .env
docker compose --profile core up -d
```

Add one layer at a time:

```bash
docker compose --profile core --profile crm up -d
docker compose --profile core --profile inbox up -d
docker compose --profile core --profile booking up -d
docker compose --profile core --profile marketing up -d
docker compose --profile core --profile pages up -d
```

Enable single sign-on (optional):

```bash
cp Caddyfile.sso Caddyfile
docker compose --profile core --profile sso up -d
# Default login: admin / ChangeMe1! — change it in authelia/users_database.yml
```

Open the control panel at `https://dash.{DOMAIN}` after DNS resolves.

Import all nine workflows from [`n8n/workflows/`](n8n/workflows). Fill the API tokens in `.env`. Activate workflows one at a time after a successful manual test.

Full walkthrough: [docs/getting-started.md](docs/getting-started.md)
GHL migration: [docs/migration-from-ghl.md](docs/migration-from-ghl.md)

## Honest comparison

Every row in this table was verified by reading the actual files in this repository — not marketing claims.

### Feature parity

| Capability | GoHighLevel | Aperture | Notes |
| --- | --- | --- | --- |
| CRM & pipelines | Built in | **Twenty** | Full contacts, companies, deals, custom objects. No per-contact fee. |
| Email automation | Built in | **Mautic + Postmark/SES** | Campaigns, segments, drip, scoring. Manual SMTP setup required. |
| SMS outbound | Built in, usage billed | **Twilio / Telnyx via n8n** | Same Twilio pricing, no GHL markup. |
| SMS voice / missed call | Built in | **Twilio webhook + Workflow 05** | Twilio call-status webhook → filter → auto-reply. ✅ Working. |
| Conversations (unified inbox) | Yes | **Chatwoot** | Email + live chat + WhatsApp + social + SMS via Twilio. |
| Booking & calendars | Built in | **Cal.com** | Public booking, round-robin, team events, webhooks. |
| Funnels & landing pages | Drag-drop builder | **WordPress** | Full site + pages. Different UX — not a drag-drop funnel builder. |
| Missed call text back | Built in | ✅ **Workflow 05** | Twilio call webhook → no-answer/busy filter → immediate SMS. |
| Lead follow-up sequence | Built in | ✅ **Workflow 06** | Immediate SMS + 10-min delay + follow-up + Mautic nurture enrolment. |
| Appointment reminders | Built in | ✅ **Workflow 07** | Hourly schedule → Cal.com API → filter 23–25h window → SMS. |
| Review requests | Built in | ✅ **Workflow 08** | Appointment done → 2h wait → Google review SMS → Mautic tag. |
| Inbox → CRM sync | Built in | ✅ **Workflow 09** | Chatwoot conversation created → find or create person in Twenty. |
| Cross-app automation | Internal builder + Zapier | **Self-hosted n8n** | No per-task fee. Code nodes. 9 importable workflows included. |
| Single sign-on | One GHL login | ✅ **Authelia** (`--profile sso`) | Forward-auth gateway, TOTP, bcrypt passwords, 8h session, brute-force ban. |
| Multi-client provisioning | Sub-account snapshots | **`ops/client-add.sh`** | Per-client hostname + credential file. Manual append to Caddyfile. |
| Data ownership | Vendor cloud | **Your VPS** | Postgres dump + Docker volume snapshots via `backup.sh`. You own the data. |
| Per-contact / per-seat fee | Yes | **None** | Self-hosted. SMS billed directly by Twilio at carrier rates. |
| White-label SaaS resale | Full SaaS mode | **Not yet** | Per-client subdomains work. Snapshot control plane not built. |
| Reputation management | Birdeye integration | **Not yet** | On the roadmap. No mature open equivalent exists today. |
| Mobile app | iOS + Android native | **Not present** | Web UIs are responsive. No native mobile client. |
| AI inbox / smart replies | Built in | **Not present** | Could be wired via n8n + OpenAI. Not a built-in playbook yet. |

### Cost comparison

A typical 10-person agency, 1,000 SMS/month, 10,000 email contacts:

| Item | GoHighLevel | Aperture |
| --- | --- | --- |
| Platform license | $297/month (Pro) | $0 |
| VPS | Included | ~$40/month |
| Twilio SMS (1,000 msg) | Billed through GHL + markup | ~$7.50 direct |
| Email SMTP | Included | ~$10/month (Postmark) |
| **Total / month** | **~$297–$497** | **~$57–$70** |
| **Savings / year** | — | **$2,760–$5,124** |

> Operator cost not included. Aperture requires someone to manage Docker, DNS, and backups. Budget 2–4 hours/month once running, or hire a freelancer for the initial setup.

### Who should switch today

Switch if you:

- Pay $97–$497/month for GHL and can operate a VPS
- Need CRM + email + SMS + inbox + booking — all five are covered
- Want your contacts, deal history, and email data on your own Postgres
- Run a service agency (marketing, consulting, home services) where data ownership matters

Stay on GHL if you:

- Resell GHL sub-accounts to clients (white-label SaaS mode is not in this repo yet)
- Depend on the GHL mobile app for field operations
- Need reputation monitoring / review aggregation today
- Cannot manage a Linux server or hire someone who can

## Gaps we will not hide

1. **White-label SaaS mode.** Per-client subdomains work. A real snapshot control plane is tracked, not shipped.
2. **Reputation management.** No mature open Birdeye. Reviews are a roadmap item.
3. **Mobile app.** Not present.
4. **You are the operator.** Backups, upgrades, email deliverability, and on-call are yours.

## Docs

- [Getting started](docs/getting-started.md)
- [Playbooks](docs/playbooks.md)
- [Architecture](docs/architecture.md)
- [Single sign-on](docs/sso.md)
- [SMS inbox setup](docs/sms-inbox.md)
- [Email deliverability](docs/email-deliverability.md)
- [Migrate from GoHighLevel](docs/migration-from-ghl.md)
- [Multi-tenancy for agencies](docs/multi-tenancy.md)
- [Comparison](docs/comparison.md)
- [Roadmap](ROADMAP.md)
- [Contributing](CONTRIBUTING.md)

## How to grow this

1. Star the repo. Discovery for "open source GoHighLevel alternative" is mostly GitHub search plus stars.
2. Open an issue titled with the HighLevel feature you cannot replace yet.
3. Ship one n8n workflow JSON under `n8n/workflows/` with a short note in `docs/playbooks.md`.
4. Run `core` on a cheap VPS and file the first thing that broke.

## Legal

GoHighLevel and HighLevel are trademarks of their owner. This project does not copy their source, UI, copy, or private APIs. Upstream products keep their own licenses (AGPL, GPL, MIT, fair-code, Apache-2.0). Files we write in this repository — compose, docs, playbook JSON, Caddy config — are MIT unless a file says otherwise.

n8n's Sustainable Use License is not a classic OSI license. Read it before you resell n8n itself. Hosting the upstream image for your own agency is the intended use here.

Started in public by [Sahib Yar](https://github.com/SahibYar).
