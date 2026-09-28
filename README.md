# Aperture — Open Agency OS

**An open-source alternative to GoHighLevel.**

We are integrating mature, already-available, but disconnected open-source products into one self-hosted agency operating system.

[![License: MIT (integration)](https://img.shields.io/badge/integration_license-MIT-lightgrey)](LICENSE)
[![Status: public build](https://img.shields.io/badge/status-public_build-0a0a0b)](https://github.com/SahibYar/open-agency-os)
[![Stars](https://img.shields.io/github/stars/SahibYar/open-agency-os?style=social)](https://github.com/SahibYar/open-agency-os)

> **Public claim.** This repository is not a HighLevel clone and is not affiliated with GoHighLevel. HighLevel is a trademark of its owner. Aperture is an independent integration layer: compose files, identity notes, n8n playbooks, and docs that turn Twenty, Mautic, Chatwoot, Cal.com, n8n, and WordPress into a coherent self-hosted stack for agencies.

If you want agencies to **own their CRM, automations, and client data**, star this repo. Stars are how new contributors find the work.

---

## Why this exists

GoHighLevel won because it bundled CRM, email/SMS, conversations, calendars, funnels, and agency sub-accounts into one login. The cost is lock-in. The open-source world already has each piece. They are excellent in isolation and painful as a system. **Aperture is the system.**

We are not rewriting Twenty. We are not forking Mautic into a fake HighLevel UI. We are publishing the missing layer: how they talk to each other, how you deploy them, and which HighLevel features still have no honest open equivalent.

---

## The stack (defaults)

| Layer | Default | Replaces in HighLevel | License |
| --- | --- | --- | --- |
| CRM & pipelines | [Twenty](https://github.com/twentyhq/twenty) | Contacts, pipelines, custom objects | AGPL-3.0 |
| Marketing automation | [Mautic](https://www.mautic.org/) | Campaigns, scoring, drip | GPL-3.0 |
| Conversations | [Chatwoot](https://github.com/chatwoot/chatwoot) | Unified inbox, live chat, social | MIT |
| Booking | [Cal.com](https://github.com/calcom/cal.com) | Calendars, round-robin | AGPL-3.0 |
| Funnels & sites | [WordPress](https://wordpress.org/) | Funnel / site builder | GPL |
| Workflow glue | [n8n](https://github.com/n8n-io/n8n) | Cross-app workflows, Zapier-class jobs | Fair-code |
| SMS & voice | Twilio / Telnyx / any SIP | LC Phone usage layer | Commercial API |
| Edge | [Caddy](https://caddyserver.com/) | Hosted domains + TLS | Apache-2.0 |

The contract is **events through n8n**, not a proprietary database.

---

## Quick start

8 GB RAM for `core`. 16 GB if you enable CRM + inbox.

```bash
git clone https://github.com/SahibYar/open-agency-os.git
cd open-agency-os
cp .env.example .env
docker compose --profile core up -d
```

Then add layers: `--profile crm`, `inbox`, `booking`, `marketing`, `pages`.

Import playbooks from `n8n/workflows/`.

---

## What HighLevel still does better (we will not fake this)

| Gap | Status |
| --- | --- |
| White-label SaaS mode | Partial — hostnames + branding |
| Reputation / reviews | Missing |
| Single login across apps | Missing — Authelia on the roadmap |
| Zero-ops | You operate the box |

Stay on HighLevel if you need SaaS mode this week. Move here if you need ownership and cost control.

---

## How to help

1. Star the repo so agencies searching “open source GoHighLevel alternative” can find it.
2. Open an issue with the HighLevel feature you cannot live without.
3. Contribute a playbook.
4. Run `core` on a VPS and report friction.

## Legal

GoHighLevel is a trademark of its owner. This project is independent. We do not copy HighLevel source, UI, or proprietary APIs. Upstream products keep their own licenses. Integration artifacts in this repo are MIT.

Started in public by [Sahib Yar](https://github.com/SahibYar).
