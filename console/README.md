# Console

Removed.

This folder used to hold a clickable sketch of twelve agency screens. The sketch kept its data in memory and, on “Capture lead”, printed “is in Twenty, Chatwoot, and the ads segment” without making an HTTP call. That is not an integration, so the sketch is not in the repository anymore.

The integration you can run from this repo is:

- `docker compose --profile core up -d` for Caddy, Postgres, Redis, and n8n
- the other profiles for Twenty, Chatwoot, Cal.com, Mautic, and WordPress
- the workflows in `n8n/workflows/`, imported by hand and left inactive until the env vars in `.env.example` are set

A system was written only when that product’s API returns success. See `docs/playbooks.md` for the calls each file makes and the calls it still does not make.
