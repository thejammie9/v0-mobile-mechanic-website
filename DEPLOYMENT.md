# Jamie's Auto Care — Deployment & Recovery Guide

This document covers everything needed to redeploy this site on a new machine from scratch,
or restore it after a server failure. Keep this file and the `.env.local` / database backup
somewhere safe and offline (e.g. a USB drive or password manager note).

---

## What This Site Is

| Component         | Technology                          | Notes |
|-------------------|-------------------------------------|-------|
| Framework         | Next.js 15 (App Router)             | React-based web framework |
| Database          | SQLite via SQLCipher (AES-256)      | Encrypted at rest, single file |
| Native DB driver  | better-sqlite3-multiple-ciphers     | Requires native compilation |
| Package manager   | pnpm                                | Do NOT use npm install — use pnpm |
| Process manager   | PM2                                 | Keeps app running 24/7 |
| Reverse proxy     | Nginx + Let's Encrypt (SSL)         | Handles domain & HTTPS |
| Email             | SMTP (mysecurecloudhost.com)        | Transactional emails only |

---

## Critical Files to Back Up

These files are NOT in Git and must be kept safe separately:

| File | Why it's critical |
|------|-------------------|
| `.env.local` | All secrets — DB key, admin password, SMTP credentials |
| `data/bookings.db` | The encrypted database — all customers, bookings, invoices |

> **If you lose `DB_ENCRYPTION_KEY` from `.env.local`, the database cannot be recovered.**
> Store this key in a password manager or written down somewhere secure.

---

## Step 1 — Provision the New Server

Minimum spec: **2 vCPU, 2GB RAM, 20GB SSD** — Ubuntu 24.04 LTS recommended.

```bash
# Update system
apt update && apt upgrade -y

# Install build tools (required to compile the SQLite native addon)
apt install -y build-essential python3 git curl

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verify
node -v   # should be v20.x.x
npm -v

# Install pnpm (package manager used by this project)
npm install -g pnpm

# Install PM2 (process manager)
npm install -g pm2
```

---

## Step 2 — Copy the Project Files

### Option A: From a backup archive

```bash
mkdir -p /var/www
cd /var/www
tar -xzf jamies-autocare-backup-YYYYMMDD.tar.gz
cd v0-mobile-mechanic-website
```

### Option B: From GitHub + restore database separately

```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/thejammie9/v0-mobile-mechanic-website.git
cd v0-mobile-mechanic-website

# Then copy your database backup into place:
mkdir -p data
cp /path/to/bookings.db data/bookings.db
chmod 600 data/bookings.db
```

---

## Step 3 — Restore the Environment File

Create `.env.local` in the project root with your saved values:

```bash
nano /var/www/v0-mobile-mechanic-website/.env.local
```

Paste in the full contents (keep this exactly — every value matters):

```env
# ===================
# ADMIN LOGIN
# ===================
ADMIN_PASSWORD=your_admin_password_here

# Secret used to sign the admin session cookie
SESSION_SECRET=your_session_secret_here

# Database encryption key (AES-256 via SQLCipher) — NEVER LOSE THIS
# Without this key the database cannot be opened
DB_ENCRYPTION_KEY=your_db_encryption_key_here

# ===================
# EMAIL CONFIGURATION
# ===================
SMTP_HOST=s800.can1.mysecurecloudhost.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=contact@jamiesautocare.com
SMTP_PASSWORD=your_smtp_password_here

ADMIN_EMAIL=contact@jamiesautocare.com
EMAIL_FROM=contact@jamiesautocare.com

BUSINESS_PHONE=07463 451967
BUSINESS_ADDRESS=5 The Crescent, EH23 4PP

NEXT_PUBLIC_SITE_URL=https://jamiesautocare.com

# Google Calendar (optional — leave blank if not used)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
GOOGLE_CALENDAR_ID=primary

CRON_SECRET=your_cron_secret_here
```

Lock down the file permissions so only root can read it:

```bash
chmod 600 /var/www/v0-mobile-mechanic-website/.env.local
```

---

## Step 4 — Install Dependencies

> **Important:** Use `pnpm`, not `npm install`. The project uses pnpm and has native
> modules (`better-sqlite3-multiple-ciphers`) that require it.

```bash
cd /var/www/v0-mobile-mechanic-website
pnpm install
```

This will compile the native SQLite addon. It may take a minute or two.

If you see a warning about "Ignored build scripts", run:
```bash
pnpm approve-builds
# Select better-sqlite3-multiple-ciphers from the list
pnpm install
```

---

## Step 5 — Verify the Database Opens

Before building, confirm the database can be read with the encryption key:

```bash
node -e "
const Database = require('better-sqlite3-multiple-ciphers');
const db = new Database('data/bookings.db');
db.pragma(\"cipher='sqlcipher'\");
db.pragma(\"key='\" + process.env.DB_ENCRYPTION_KEY + \"'\");
const count = db.prepare('SELECT COUNT(*) as c FROM customers').get();
console.log('Customers in DB:', count.c);
db.close();
"
```

> Run this with the env loaded: prefix with `source .env.local &&` or set DB_ENCRYPTION_KEY manually.
> If it prints a number, the database and key are working correctly.

---

## Step 6 — Build for Production

```bash
cd /var/www/v0-mobile-mechanic-website
npm run build
```

This takes 1-2 minutes. It should end with:
```
✓ Compiled successfully
✓ Generating static pages
```

---

## Step 7 — Start with PM2

```bash
cd /var/www/v0-mobile-mechanic-website

# Start the app
pm2 start npm --name "jamies-autocare" -- start

# Save so it survives reboots
pm2 save

# Set PM2 to auto-start on system boot
pm2 startup
# Copy and run the command it outputs (it will look like: sudo env PATH=... pm2 startup ...)
```

**Check it's running:**
```bash
pm2 status
pm2 logs jamies-autocare --lines 20
```

The app runs on port 3000 internally. Nginx (Step 8) exposes it on 80/443.

---

## Step 8 — Install and Configure Nginx

```bash
apt install nginx -y

# Create site config
nano /etc/nginx/sites-available/jamies-autocare
```

Paste this config (already tuned with security headers):

```nginx
server {
    server_name jamiesautocare.com www.jamiesautocare.com;

    # Security headers
    add_header Strict-Transport-Security  "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options            "SAMEORIGIN" always;
    add_header X-Content-Type-Options     "nosniff" always;
    add_header Referrer-Policy            "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy         "camera=(), microphone=(), geolocation=()" always;
    add_header X-XSS-Protection           "1; mode=block" always;

    server_tokens off;

    location ~ /\. {
        deny all;
        return 404;
    }

    location ~* ^/[a-zA-Z0-9_\-]+\.html$ {
        root /var/www/v0-mobile-mechanic-website/public;
        try_files $uri =404;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 2M;
    }

    listen 80;
}
```

Enable it:
```bash
ln -s /etc/nginx/sites-available/jamies-autocare /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

---

## Step 9 — SSL Certificate

> Point your domain DNS to the new server IP before running this.

```bash
apt install certbot python3-certbot-nginx -y

certbot --nginx -d jamiesautocare.com -d www.jamiesautocare.com

# Test auto-renewal
certbot renew --dry-run
```

---

## Step 10 — Firewall

```bash
ufw allow ssh
ufw allow 'Nginx Full'
ufw enable
```

---

## Step 11 — Verify Everything Works

1. Visit `https://jamiesautocare.com` — site loads
2. Visit `https://jamiesautocare.com/admin` — login works with your admin password
3. Check Admin → Customers — your existing data is there
4. Submit a test booking — confirm emails arrive

---

## Routine Maintenance

### After any code change:

```bash
cd /var/www/v0-mobile-mechanic-website
npm run build
pm2 restart jamies-autocare --update-env
```

### View live logs:

```bash
pm2 logs jamies-autocare
```

### Update from GitHub (if no local changes):

```bash
cd /var/www/v0-mobile-mechanic-website
git pull
pnpm install
npm run build
pm2 restart jamies-autocare --update-env
```

---

## Database Encryption Notes

The database uses **SQLCipher AES-256** encryption. Key points:

- The key is stored in `DB_ENCRYPTION_KEY` in `.env.local`
- Without this key, the database file is completely unreadable — not even SQLite can open it
- If you ever need to change the key, use the SQLCipher `PRAGMA rekey` command
- Do NOT run `sqlite3 data/bookings.db` directly — it will fail with "file is not a database" because it's encrypted. Always use the app or a script that sets the cipher key first.

---

## Backup Script

Run `scripts/backup.sh` to create a full backup:

```bash
bash /var/www/v0-mobile-mechanic-website/scripts/backup.sh
```

Backups are saved to `/var/backups/jamies-autocare/` with a date stamp.
Each backup includes the source code, encrypted database, and env file.

**Automated daily backups:**
```bash
crontab -e
# Add ONLY this line (all other cron jobs run inside the app itself):
0 2 * * * bash /var/www/v0-mobile-mechanic-website/scripts/backup.sh >> /var/log/jamies-backup.log 2>&1
```

> **Note:** Expire-bookings (every 5 min), service reminders (daily 9am), and recurring expenses (daily 00:05) all run **inside the app process** via `instrumentation.ts` using `node-cron`. They require no crontab entries and will automatically move to a new server with the codebase. The only crontab entry needed is the backup script above.

---

## Troubleshooting

### Site not loading
```bash
pm2 status                          # Is the app running?
pm2 logs jamies-autocare --lines 50 # Any errors?
systemctl status nginx              # Is Nginx running?
```

### "file is not a database" error in logs
The DB encryption key is wrong or missing. Check `DB_ENCRYPTION_KEY` in `.env.local` and restart:
```bash
pm2 restart jamies-autocare --update-env
```

### "Could not locate bindings file" error
The native SQLite addon needs recompiling:
```bash
cd /var/www/v0-mobile-mechanic-website
pnpm install
npm run build
pm2 restart jamies-autocare --update-env
```

### Emails not sending
1. Check `SMTP_PASSWORD` in `.env.local`
2. Check logs: `pm2 logs jamies-autocare | grep -i "email\|smtp"`
3. Verify SMTP port 587 is not blocked by the server firewall

### Port 3000 already in use
```bash
lsof -i :3000
kill -9 <PID>
pm2 start jamies-autocare
```

### SSL certificate expired
```bash
certbot renew
systemctl reload nginx
```

---

## Quick Reference Card

| Task | Command |
|------|---------|
| Start app | `pm2 start jamies-autocare` |
| Stop app | `pm2 stop jamies-autocare` |
| Restart app | `pm2 restart jamies-autocare --update-env` |
| View logs | `pm2 logs jamies-autocare` |
| Rebuild | `npm run build` |
| Install deps | `pnpm install` |
| Run backup | `bash scripts/backup.sh` |
| Check Nginx | `nginx -t && systemctl reload nginx` |
| Renew SSL | `certbot renew` |
