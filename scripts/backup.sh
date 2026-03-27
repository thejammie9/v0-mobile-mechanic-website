#!/bin/bash
# ============================================================
# Jamie's Auto Care — Full Site Backup Script
# ============================================================
# Creates a timestamped backup of:
#   - The encrypted database (data/bookings.db)
#   - The environment file (.env.local)
#   - All source code (excluding node_modules / .next)
#
# Usage:
#   bash scripts/backup.sh
#
# For automated daily backups, add to crontab:
#   0 2 * * * bash /var/www/v0-mobile-mechanic-website/scripts/backup.sh
# ============================================================

set -e

SITE_DIR="/var/www/v0-mobile-mechanic-website"
BACKUP_DIR="/var/backups/jamies-autocare"
DATE=$(date +%Y-%m-%d_%H%M)
BACKUP_NAME="jamies-autocare-${DATE}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

echo "========================================"
echo "  Jamie's Auto Care — Backup"
echo "  $(date)"
echo "========================================"

# Create backup directory
mkdir -p "${BACKUP_DIR}"

# --- 1. Database backup (encrypted — safe to store as-is) ---
echo ""
echo "[1/3] Backing up database..."
mkdir -p "${BACKUP_PATH}/data"
if [ -f "${SITE_DIR}/data/bookings.db" ]; then
    # Stop WAL checkpointing cleanly by briefly pausing PM2
    pm2 stop jamies-autocare --silent 2>/dev/null || true
    sleep 1
    cp "${SITE_DIR}/data/bookings.db" "${BACKUP_PATH}/data/bookings.db"
    # Also copy WAL files if present
    [ -f "${SITE_DIR}/data/bookings.db-wal" ] && cp "${SITE_DIR}/data/bookings.db-wal" "${BACKUP_PATH}/data/" || true
    pm2 start jamies-autocare --silent 2>/dev/null || true
    echo "    ✓ Database backed up ($(du -h "${BACKUP_PATH}/data/bookings.db" | cut -f1))"
else
    echo "    ⚠ No database file found at ${SITE_DIR}/data/bookings.db"
fi

# --- 2. Environment file ---
echo ""
echo "[2/3] Backing up environment file..."
if [ -f "${SITE_DIR}/.env.local" ]; then
    cp "${SITE_DIR}/.env.local" "${BACKUP_PATH}/.env.local"
    chmod 600 "${BACKUP_PATH}/.env.local"
    echo "    ✓ .env.local backed up"
else
    echo "    ⚠ No .env.local found — you will need to recreate this manually"
fi

# --- 3. Source code (exclude node_modules, .next, data, backups) ---
echo ""
echo "[3/3] Backing up source code..."
tar -czf "${BACKUP_PATH}/source.tar.gz" \
    --exclude="${SITE_DIR}/node_modules" \
    --exclude="${SITE_DIR}/.next" \
    --exclude="${SITE_DIR}/data" \
    --exclude="${SITE_DIR}/.git" \
    --exclude="${SITE_DIR}/scripts/backup.sh" \
    -C /var/www \
    v0-mobile-mechanic-website
echo "    ✓ Source code backed up ($(du -h "${BACKUP_PATH}/source.tar.gz" | cut -f1))"

# --- Package everything into a single archive ---
echo ""
echo "Packaging into single archive..."
tar -czf "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" -C "${BACKUP_DIR}" "${BACKUP_NAME}"
rm -rf "${BACKUP_PATH}"
chmod 600 "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"

FINAL_SIZE=$(du -h "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" | cut -f1)

echo ""
echo "========================================"
echo "  Backup complete!"
echo "  File: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
echo "  Size: ${FINAL_SIZE}"
echo "========================================"

# --- Tidy up old backups (keep last 14) ---
echo ""
echo "Cleaning up old backups (keeping last 14)..."
ls -t "${BACKUP_DIR}"/*.tar.gz 2>/dev/null | tail -n +15 | xargs rm -f 2>/dev/null || true
TOTAL=$(ls "${BACKUP_DIR}"/*.tar.gz 2>/dev/null | wc -l)
echo "    ✓ ${TOTAL} backup(s) stored in ${BACKUP_DIR}"
echo ""
