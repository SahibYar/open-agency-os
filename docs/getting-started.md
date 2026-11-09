# Getting started

Aperture is a compose project. You bring a Linux VPS, a domain, and patience. You do not bring a HighLevel export on day one.

## Sizing

| Profile | What runs | RAM |
| --- | --- | --- |
| `core` | Caddy, Postgres 16, Redis, n8n | 8 GB comfortable |
| `core` + `crm` | plus Twenty | 16 GB |
| `core` + `inbox` | plus Chatwoot web + worker | 16 GB |
| `marketing` | MariaDB + Mautic | add 4 GB |
| `pages` | WordPress on the same MariaDB | add 1–2 GB |
| `booking` | Cal.com | add 2 GB |

Do not enable every profile on a laptop. Start with `core`, prove webhooks, then add CRM.

## DNS

Point these A records at your VPS IP before Caddy can issue TLS certificates:

| Subdomain | Routes to |
| --- | --- |
| `glue.example.com` | n8n (workflow automation) |
| `crm.example.com` | Twenty (CRM) |
| `inbox.example.com` | Chatwoot (conversations) |
| `book.example.com` | Cal.com (booking) |
| `go.example.com` | Mautic (marketing) |
| `pages.example.com` | WordPress (sites) |

Replace `example.com` with your actual domain. These match the `Caddyfile` defaults. Edit `Caddyfile` to customise subdomains.

## First boot

The fastest way to get a working `.env` is the setup script — it generates all required secrets automatically:

```bash
git clone https://github.com/SahibYar/open-agency-os.git
cd open-agency-os
bash setup.sh
```

Then open `.env` and set the two values the script cannot guess:

```
DOMAIN=myagency.com
CADDY_EMAIL=ops@myagency.com
```

`CADDY_EMAIL` is your email for Let's Encrypt certificate notifications. Caddy will fall back to `ops@example.com` without it, but your cert renewal warnings will go nowhere.

If you prefer manual setup, copy and fill `.env.example` by hand. Set at minimum:

- `DOMAIN` and `CADDY_EMAIL`
- `POSTGRES_PASSWORD`
- `TWENTY_APP_SECRET` if you will start CRM (32+ random bytes)
- `CHATWOOT_SECRET` if you will start inbox
- `CALCOM_NEXTAUTH_SECRET` and `CALCOM_ENCRYPTION_KEY` if you will start booking
- `MYSQL_ROOT_PASSWORD`, `MAUTIC_DB_PASSWORD`, and `WORDPRESS_DB_PASSWORD` if you will start marketing or pages

> **WordPress note.** WordPress and Mautic share one MariaDB instance but each gets its own database and DB user. `WORDPRESS_DB_PASSWORD` controls the `wordpress` user; `MAUTIC_DB_PASSWORD` controls the `mautic` user. These must both be set before you start the `pages` or `marketing` profiles.

```bash
docker compose --profile core up -d
docker compose ps
```

Open n8n. Create the owner user. Import `n8n/workflows/01-form-to-crm.json` only after Twenty credentials exist. Until then the file is a map, not a finished credentialed workflow.

## Order of layers

1. Core. Confirm n8n can receive a webhook from the public internet.
2. CRM. Create one person by hand. Create an API key or GraphQL token for n8n.
3. One playbook. Form to CRM. See `docs/playbooks.md`.
4. Inbox or booking. Not both on the same afternoon.
5. Marketing last. Mautic wants its own mail transport (SES, Postmark, Mailgun). Do not send from the VPS IP.

## Backups

```bash
docker compose exec postgres pg_dumpall -U aperture > aperture.sql
```

Also snapshot the named volumes `n8n_data`, `mautic_data`, and `wp_data`. Postgres dumps do not include those files.

## Upgrades

Images are pinned to `:latest` in this early public build so agencies can try the stack. That is convenient and unsafe for production. After your first successful boot, pin digests or version tags and upgrade one service per week.
