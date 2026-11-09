#!/usr/bin/env bash
# setup.sh — Copy .env.example → .env and fill all required secrets.
#
# Usage: bash setup.sh
#
# After this runs you still need to set two values manually in .env:
#   DOMAIN=      your domain (e.g. myagency.com)
#   CADDY_EMAIL= your email for Let's Encrypt (e.g. ops@myagency.com)
#
# Then also update the URL values that reference your domain:
#   TWENTY_SERVER_URL, CHATWOOT_URL, CALCOM_URL, N8N_WEBHOOK_URL, BOOKING_PAGE_URL

set -euo pipefail

if [ -f .env ]; then
  echo "Error: .env already exists. Remove it first if you want a fresh setup." >&2
  exit 1
fi

command -v openssl >/dev/null 2>&1 || { echo "Error: openssl is required" >&2; exit 1; }

# r <bytes> → hex string of <bytes>*2 characters
r() { openssl rand -hex "${1:-16}"; }

cp .env.example .env

# sed -i.bak works on both macOS (BSD sed) and Linux (GNU sed)
s() {
  local pattern="$1" replacement="$2"
  sed -i.bak "s|${pattern}|${replacement}|" .env && rm -f .env.bak
}

# Database secrets
s "POSTGRES_PASSWORD=change-me-now"            "POSTGRES_PASSWORD=$(r 16)"
s "MYSQL_ROOT_PASSWORD=change-me-root"         "MYSQL_ROOT_PASSWORD=$(r 16)"
s "MAUTIC_DB_PASSWORD=change-me-mautic"        "MAUTIC_DB_PASSWORD=$(r 16)"
s "WORDPRESS_DB_PASSWORD=change-me-wordpress"  "WORDPRESS_DB_PASSWORD=$(r 16)"

# App secrets
s "TWENTY_APP_SECRET=generate-a-32-char-secret"       "TWENTY_APP_SECRET=$(r 16)"
s "CHATWOOT_SECRET=generate-a-64-char-secret"         "CHATWOOT_SECRET=$(r 32)"
s "CALCOM_NEXTAUTH_SECRET=generate-a-32-char-secret"  "CALCOM_NEXTAUTH_SECRET=$(r 16)"
s "CALCOM_ENCRYPTION_KEY=generate-32-char-key"        "CALCOM_ENCRYPTION_KEY=$(r 16)"

# Authelia SSO secrets (only used if you start --profile sso)
s "AUTHELIA_JWT_SECRET=$"                 "AUTHELIA_JWT_SECRET=$(r 32)"
s "AUTHELIA_SESSION_SECRET=$"             "AUTHELIA_SESSION_SECRET=$(r 32)"
s "AUTHELIA_STORAGE_ENCRYPTION_KEY=$"     "AUTHELIA_STORAGE_ENCRYPTION_KEY=$(r 32)"

echo ""
echo "✓  .env created with fresh secrets."
echo ""
echo "Required before first boot — open .env and set:"
echo ""
echo "  DOMAIN=       e.g. myagency.com"
echo "  CADDY_EMAIL=  e.g. ops@myagency.com  (for Let's Encrypt)"
echo ""
echo "Then also update these URL placeholders in .env:"
echo "  N8N_WEBHOOK_URL, TWENTY_SERVER_URL, CHATWOOT_URL, CALCOM_URL, BOOKING_PAGE_URL"
echo ""
echo "Start the core layer when DNS and email are set:"
echo "  docker compose --profile core up -d"
echo ""
echo "Full walkthrough: docs/getting-started.md"
echo "Agency dashboard: https://dash.\$DOMAIN  (after core is running)"
