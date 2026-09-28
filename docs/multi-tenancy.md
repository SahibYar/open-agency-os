# Multi-tenancy for agencies

HighLevel's product is the sub-account. Aperture does not have that control plane yet. This document is the interim so agencies do not invent five incompatible patterns.

## Model A — one server, one brand (default)

You are the agency. Clients are Twenty companies and Chatwoot inboxes, not separate databases. Use this until you have a reason not to.

- One Twenty workspace
- Pipelines per offer, not per client, unless a client contract demands isolation
- Chatwoot teams map to pods inside the agency
- Cal.com teams map to the same pods

## Model B — hostname per client

When a client must not see another client's users:

- Separate Twenty workspace if upstream supports it; otherwise a separate Twenty container and database (`twenty_clientslug`)
- Separate Chatwoot account on the same Chatwoot install (Chatwoot is multi-account)
- Caddy site block `crm.client.com` reverse-proxied to that client's upstream
- n8n credentials scoped per client. Never one Twilio auth reused across clients who should not share a sender ID

Compose today starts **one** of each service. Model B means duplicated service blocks or a second compose project per client. Do not improvise a shared database with row filters. That is how agencies leak data.

## Model C — SaaS mode (not built)

The thing people mean when they say "open source HighLevel" is usually: create a client, apply a snapshot, bill them, put your logo on it. That needs:

- Tenant registry
- Provisioner (databases, DNS, seed workflows)
- Usage metering for SMS and email so you can rebill
- A portal that is not the upstream admin UI

Tracked on the roadmap. Pull requests that skip straight to a half multi-tenant schema will be closed. Start with a design issue.

## What you can white-label now

- Caddy in front, your domain
- WordPress theme
- Chatwoot brand color and logo (built into Chatwoot)
- Cal.com brand on the booking page
- Email from your domain via Mautic

What you cannot honestly white-label yet: a mobile app, a single client login that spans CRM and inbox, and a billing meter.
