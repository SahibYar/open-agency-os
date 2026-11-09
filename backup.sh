#!/usr/bin/env bash
# backup.sh — Dump Postgres and list named volumes for snapshotting.
#
# Usage: bash backup.sh
#
# Requires: docker compose is running and .env is loaded.

set -euo pipefail

STAMP=$(date +%Y%m%d-%H%M%S)
SQL_FILE="backup-${STAMP}.sql"
PG_USER="${POSTGRES_USER:-aperture}"

echo "==> Dumping Postgres databases to ${SQL_FILE} ..."
docker compose exec -T postgres pg_dumpall -U "${PG_USER}" > "${SQL_FILE}"
echo "    Done: ${SQL_FILE} ($(du -sh "${SQL_FILE}" | cut -f1))"

echo ""
echo "==> Postgres dump complete. The following named volumes also need snapshotting:"
echo "    n8n_data    — workflow history and n8n credentials"
echo "    mautic_data — Mautic config, templates, and media"
echo "    wp_data     — WordPress uploads and plugins"
echo ""
echo "Example volume snapshot (repeat for each volume):"
echo ""
echo "  docker run --rm \\"
echo "    -v aperture_n8n_data:/data \\"
echo "    -v \$(pwd):/backup \\"
echo "    alpine tar czf /backup/n8n_data-${STAMP}.tar.gz /data"
echo ""
echo "Replace 'aperture_n8n_data' with the volume name shown by 'docker volume ls'."
echo "The compose project prefix defaults to 'aperture' (set via 'name:' in docker-compose.yml)."
