#!/usr/bin/env bash
# client-add.sh — Provision a per-client Caddy hostname block (Model B multi-tenancy).
#
# Usage: bash ops/client-add.sh clientname domain.com
#
# Example: bash ops/client-add.sh acme acmeco.com
#   Creates:
#     ops/clients/acme/caddy.conf   — Caddy site block for *.acmeco.com
#     ops/clients/acme/.env         — per-client credential template
#     ops/clients/acme/README.md    — setup notes
#
# After running: append the generated caddy.conf to your Caddyfile,
# then fill in the .env file with the client's API tokens.

set -euo pipefail

CLIENT="${1:-}"
DOMAIN="${2:-}"

if [ -z "$CLIENT" ] || [ -z "$DOMAIN" ]; then
  echo "Usage: bash ops/client-add.sh <client-slug> <client-domain>" >&2
  echo "  e.g. bash ops/client-add.sh acme acmeco.com" >&2
  exit 1
fi

# Validate slug (lowercase letters, numbers, hyphens only)
if ! [[ "$CLIENT" =~ ^[a-z0-9-]+$ ]]; then
  echo "Error: client slug must be lowercase letters, numbers, and hyphens only." >&2
  exit 1
fi

DIR="ops/clients/${CLIENT}"
if [ -d "$DIR" ]; then
  echo "Error: $DIR already exists. Remove it first to re-provision." >&2
  exit 1
fi

mkdir -p "$DIR"

r() { openssl rand -hex "${1:-16}"; }

# ── Caddy site block ──────────────────────────────────────────────────────────
cat > "${DIR}/caddy.conf" <<EOF
# ${CLIENT} — ${DOMAIN}
# Append the contents of this file to your Caddyfile, then:
#   docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile

crm.${DOMAIN} {
  reverse_proxy twenty:3000
}

inbox.${DOMAIN} {
  reverse_proxy chatwoot:3000
}

book.${DOMAIN} {
  reverse_proxy calcom:3000
}

go.${DOMAIN} {
  reverse_proxy mautic:80
}
EOF

# ── Per-client credential template ───────────────────────────────────────────
cat > "${DIR}/.env" <<EOF
# ${CLIENT} — per-client API tokens
# Fill these after the client's first login to each service.
# These are passed to dedicated n8n sub-workflows for this client.

CLIENT_NAME=${CLIENT}
CLIENT_DOMAIN=${DOMAIN}

# Twenty CRM — Settings > API > Create API key
${CLIENT^^}_TWENTY_TOKEN=

# Chatwoot — Profile > Access Token; Account ID from the URL (/app/accounts/N/...)
${CLIENT^^}_CHATWOOT_TOKEN=
${CLIENT^^}_CHATWOOT_ACCOUNT_ID=

# Mautic — base64 of "username:password"
${CLIENT^^}_MAUTIC_BASIC=

# Cal.com — Settings > Developer > API Keys
${CLIENT^^}_CALCOM_API_KEY=

# Twilio phone number assigned to this client
${CLIENT^^}_TWILIO_FROM=

# Workflow settings for this client
${CLIENT^^}_BRAND_NAME=${CLIENT^} Agency
${CLIENT^^}_BOOKING_PAGE_URL=https://book.${DOMAIN}
${CLIENT^^}_GOOGLE_REVIEW_URL=
EOF

# ── README ────────────────────────────────────────────────────────────────────
cat > "${DIR}/README.md" <<EOF
# ${CLIENT} — ${DOMAIN}

Provisioned: $(date +%Y-%m-%d)

## DNS records needed

Point these A records to your server IP:

| Subdomain | Routes to |
|---|---|
| \`crm.${DOMAIN}\` | Twenty |
| \`inbox.${DOMAIN}\` | Chatwoot |
| \`book.${DOMAIN}\` | Cal.com |
| \`go.${DOMAIN}\` | Mautic |

## Activation steps

1. Add \`ops/clients/${CLIENT}/caddy.conf\` contents to your \`Caddyfile\`
2. Reload Caddy: \`docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile\`
3. Have the client complete first-login for each service and generate API tokens
4. Fill in \`ops/clients/${CLIENT}/.env\` with the tokens
5. Create a copy of an n8n workflow for this client, loading env from this file

## Notes

Each service (Twenty, Chatwoot, Cal.com, Mautic) is shared infrastructure.
The client uses their own login credentials and API tokens within each service.
True namespace isolation requires separate compose stacks (Model C — not yet built).
EOF

echo ""
echo "✓  Client '${CLIENT}' provisioned at ${DIR}/"
echo ""
echo "Next steps:"
echo "  1. cat ${DIR}/caddy.conf >> Caddyfile"
echo "  2. docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile"
echo "  3. Fill in ${DIR}/.env with client API tokens"
echo "  4. See ${DIR}/README.md for DNS records needed"
