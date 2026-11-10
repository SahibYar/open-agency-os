#!/usr/bin/env bash
# setup.sh — Copy .env.example → .env, generate all secrets, and set your domain.
#
# Usage: bash setup.sh
#   Interactive — prompts for DOMAIN and CADDY_EMAIL.
#
# Or non-interactive: bash setup.sh myagency.com ops@myagency.com

set -euo pipefail

if [ -f .env ]; then
  echo "Error: .env already exists. Remove it first if you want a fresh setup." >&2
  exit 1
fi

command -v openssl >/dev/null 2>&1 || { echo "Error: openssl is required" >&2; exit 1; }

# ── Ask for domain ──────────────────────────────────────────────────────────

if [ -n "${1:-}" ]; then
  DOMAIN="$1"
else
  printf "Enter your domain (e.g. myagency.com): "
  read -r DOMAIN
fi

if [ -z "$DOMAIN" ]; then
  echo "Error: DOMAIN is required." >&2
  exit 1
fi

# ── Ask for CADDY_EMAIL ─────────────────────────────────────────────────────

if [ -n "${2:-}" ]; then
  CADDY_EMAIL="$2"
else
  printf "Enter your email for Let's Encrypt [ops@%s]: " "$DOMAIN"
  read -r CADDY_EMAIL
fi

if [ -z "$CADDY_EMAIL" ]; then
  CADDY_EMAIL="ops@${DOMAIN}"
fi

# ── Generate secrets ────────────────────────────────────────────────────────

# r <bytes> → hex string of <bytes>*2 characters
r() { openssl rand -hex "${1:-16}"; }

cp .env.example .env

# sed -i.bak works on both macOS (BSD sed) and Linux (GNU sed)
s() {
  local pattern="$1" replacement="$2"
  sed -i.bak "s|${pattern}|${replacement}|" .env && rm -f .env.bak
}

# Domain and email
s "DOMAIN=example.com"                           "DOMAIN=${DOMAIN}"
s "CADDY_EMAIL=ops@example.com"                  "CADDY_EMAIL=${CADDY_EMAIL}"

# Derived URLs — built from DOMAIN so users never edit these manually
s "N8N_HOST=localhost"                           "N8N_HOST=glue.${DOMAIN}"
s "N8N_WEBHOOK_URL=https://glue.example.com/"   "N8N_WEBHOOK_URL=https://glue.${DOMAIN}/"
s "TWENTY_SERVER_URL=https://crm.example.com"   "TWENTY_SERVER_URL=https://crm.${DOMAIN}"
s "CHATWOOT_URL=https://inbox.example.com"       "CHATWOOT_URL=https://inbox.${DOMAIN}"
s "CALCOM_URL=https://book.example.com"          "CALCOM_URL=https://book.${DOMAIN}"
s "BOOKING_PAGE_URL=https://book.example.com"    "BOOKING_PAGE_URL=https://book.${DOMAIN}"

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
echo "✓  .env created."
echo ""
echo "   Domain:      ${DOMAIN}"
echo "   Let's Encrypt email: ${CADDY_EMAIL}"
echo "   All service URLs set automatically from domain."
echo ""
echo "Remaining steps — open .env and fill in after first login to each service:"
echo "  TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM"
echo "  TWENTY_TOKEN, CHATWOOT_TOKEN, MAUTIC_BASIC, CALCOM_API_KEY"
echo "  GOOGLE_REVIEW_URL  (for the review-request workflow)"
echo ""
echo "Start the core layer:"
echo "  docker compose --profile core up -d"
echo ""
echo "Full walkthrough: docs/getting-started.md"
echo "Agency dashboard: https://dash.${DOMAIN}  (after core is running and DNS resolves)"
