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

- Marketing and service agencies that want CRM, nurture, inbox, booking, and sites without a $97–$497 platform bill plus usage.
- Operators who will run a VPS and own the database.
- Contributors who would rather wire excellent projects together than rewrite them.

Stay on a commercial all-in-one if you need white-label SaaS mode and reputation management this week. Come here if ownership and cost matter more than a single login.

## Why this exists

GoHighLevel won because it bundled contacts, pipelines, email, SMS, conversations, calendars, funnels, and agency sub-accounts into one login. The open-source world already shipped each of those jobs as a serious product. They are excellent alone and painful as a system.

**Aperture is the system.** We do not fork Twenty into a fake HighLevel skin. We publish how the pieces talk, how you deploy them, and which commercial features still have no honest open equivalent.

Search terms we are willing to own:

- open source GoHighLevel alternative
- self-hosted agency CRM
- Twenty + Mautic + Chatwoot + n8n
- open source HighLevel stack

## The stack

| Layer | Default | What it covers | License |
| --- | --- | --- | --- |
| CRM & pipelines | [Twenty](https://github.com/twentyhq/twenty) | Contacts, companies, deals, custom objects | AGPL-3.0 |
| Marketing automation | [Mautic](https://www.mautic.org/) | Campaigns, segments, scoring, drip | GPL-3.0 |
| Conversations | [Chatwoot](https://github.com/chatwoot/chatwoot) | Shared inbox, web chat, WhatsApp, social | MIT |
| Booking | [Cal.com](https://github.com/calcom/cal.com) | Public booking, round-robin, webhooks | AGPL-3.0 |
| Funnels & sites | [WordPress](https://wordpress.org/) | Landing pages, forms, memberships | GPL |
| Workflow glue | [n8n](https://github.com/n8n-io/n8n) | Cross-app automation, no per-task tax | Fair-code |
| SMS & voice | Twilio, Telnyx, or any SIP | Outbound SMS, voice, carrier swap | Commercial API |
| Edge | [Caddy](https://caddyserver.com/) | Automatic TLS and hostnames | Apache-2.0 |

Alternates we accept, not defaults: EspoCRM or SuiteCRM instead of Twenty. Listmonk is not a substitute for Mautic when you need journeys.

The contract is **events through n8n**, not one proprietary database.

## What you get today

- [`docker-compose.yml`](docker-compose.yml) with profiles: `core`, `crm`, `inbox`, `booking`, `marketing`, `pages`. Each service is an upstream image (`twentycrm/twenty`, `chatwoot/chatwoot`, `calcom/cal.com`, `mautic/mautic`, `wordpress`, `n8nio/n8n`, `caddy`, Postgres, Redis, MariaDB). This repo does not reimplement those products.
- [`.env.example`](.env.example) and a [Caddyfile](Caddyfile) so each product has a hostname. App secrets (Twenty `APP_SECRET`, Chatwoot `SECRET_KEY_BASE`) are separate from the API tokens the workflows send.
- [Postgres init](ops/postgres-init/01-databases.sql) that creates `n8n`, `twenty`, `chatwoot`, and `calcom`. [MariaDB init](ops/mariadb-init/01-wordpress.sql) creates the WordPress database next to Mautic.
- Four **inactive** n8n workflows under [`n8n/workflows/`](n8n/workflows). You import them. They do not run until you activate them. With env set, they HTTP-call Twenty, Chatwoot, Mautic, Cal.com, and Twilio. They do **not** yet search-before-create, normalize phone numbers, honor quiet hours, or cancel a reminder. [docs/playbooks.md](docs/playbooks.md) lists both the shipped graph and the steps still missing.
- An honest gap list. Reputation management and SaaS mode are not in this repository.

There is no in-repo CRM that pretends a button wrote to Twenty. `console/` used to ship a UI sketch that printed “is in Twenty” from memory. That sketch is gone. A write happened only if the upstream returned a success status.

## Where each claim lives

| Claim | File |
| --- | --- |
| Compose profiles and upstream images | [docker-compose.yml](docker-compose.yml) |
| Hostnames | [Caddyfile](Caddyfile) |
| Required secrets and workflow API env | [.env.example](.env.example) |
| Separate Postgres databases | [ops/postgres-init/01-databases.sql](ops/postgres-init/01-databases.sql) |
| Form webhook → Twenty, Chatwoot, Mautic | [n8n/workflows/01-form-to-crm.json](n8n/workflows/01-form-to-crm.json) |
| SMS webhook → Twilio | [n8n/workflows/02-speed-to-lead.json](n8n/workflows/02-speed-to-lead.json) |
| Booking webhook → Cal.com and Twenty | [n8n/workflows/03-booking.json](n8n/workflows/03-booking.json) |
| Reply webhook → Chatwoot private note | [n8n/workflows/04-inbox-context.json](n8n/workflows/04-inbox-context.json) |
| What those graphs still do not do | [docs/playbooks.md](docs/playbooks.md) |

n8n is given `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` and the `TWENTY_*`, `CHATWOOT_*`, `MAUTIC_*`, `CALCOM_*`, and `TWILIO_*` variables so a node expression can read them. Internal defaults point at Docker DNS (`http://twenty:3000`, `http://chatwoot:3000`, `http://mautic`, `http://calcom:3000`), not at the public URL.

## Quick start

8 GB RAM is enough for `core` (Caddy, Postgres, Redis, n8n). Plan **16 GB** before you turn on CRM and inbox together.

```bash
git clone https://github.com/SahibYar/open-agency-os.git
cd open-agency-os
cp .env.example .env
# set DOMAIN, POSTGRES_PASSWORD, and the secrets marked required
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

Import workflows from [`n8n/workflows/`](n8n/workflows). Point webhooks at your public n8n URL.

Full walkthrough: [docs/getting-started.md](docs/getting-started.md).

## Honest comparison

| Capability | GoHighLevel | Aperture |
| --- | --- | --- |
| CRM & pipelines | Built in | Twenty (or EspoCRM / SuiteCRM) |
| Email automation | Built in | Mautic |
| SMS / voice | Built in, usage billed | Twilio / Telnyx via n8n |
| Conversations | Unified inbox | Chatwoot |
| Calendars | Built in | Cal.com |
| Funnels | Built in | WordPress + a block builder |
| Cross-app workflows | Internal builder + Zapier | Self-hosted n8n |
| Data ownership | Vendor cloud | Your server |
| Per-contact fee | Platform + usage | None. You pay hardware and the carrier |
| White-label resale | SaaS mode | Partial. Hostnames and branding. Control plane is a roadmap item |
| Reputation | Built in | Not yet |
| One login | Yes | Not yet. Authelia / Pocket ID is the plan |

Details: [docs/comparison.md](docs/comparison.md).

## Gaps we will not hide

1. **White-label SaaS mode.** HighLevel sells sub-accounts. We start with one hostname per service and per-client credentials. A real snapshot control plane is tracked, not shipped.
2. **Reputation management.** There is no mature open Birdeye. Reviews are an n8n playbook until a module exists.
3. **Unified login.** Each upstream product authenticates itself today.
4. **You are the operator.** The software license is free. Backups, upgrades, email deliverability, and on-call are not.

## Docs

- [Getting started](docs/getting-started.md)
- [Architecture](docs/architecture.md)
- [Playbooks](docs/playbooks.md)
- [Multi-tenancy for agencies](docs/multi-tenancy.md)
- [Comparison](docs/comparison.md)
- [Roadmap](ROADMAP.md)
- [Contributing](CONTRIBUTING.md)

## How to grow this

1. Star the repo. Discovery for “open source GoHighLevel alternative” is mostly GitHub search plus stars.
2. Open an issue titled with the HighLevel feature you cannot replace yet.
3. Ship one n8n workflow JSON under `n8n/workflows/` with a short note in `docs/playbooks.md`.
4. Run `core` on a cheap VPS and file the first thing that broke.

## Legal

GoHighLevel and HighLevel are trademarks of their owner. This project does not copy their source, UI, copy, or private APIs. Upstream products keep their own licenses (AGPL, GPL, MIT, fair-code). Files we write in this repository — compose, docs, playbook JSON, Caddy config — are MIT unless a file says otherwise.

n8n's Sustainable Use License is not a classic OSI license. Read it before you resell n8n itself. Hosting the upstream image for your own agency is the intended use here; embedding n8n into a paid SaaS you sell may require an n8n enterprise license. That is their license, not ours.

Started in public by [Sahib Yar](https://github.com/SahibYar).
