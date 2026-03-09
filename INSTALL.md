# Installation Guide - Jamie's Auto Care Website

This guide covers deploying the website on a VPS (Ubuntu/Debian) with **fully self-hosted** SQLite database and SMTP email.

---

## System Overview

| Component | Technology | Notes |
|-----------|-----------|-------|
| Framework | Next.js | React-based web framework |
| Database | SQLite | Self-hosted, file-based database |
| Email | SMTP | Uses your existing email hosting |
| Process Manager | PM2 | Keeps app running 24/7 |
| Reverse Proxy | Nginx | Handles domain & SSL |

---

## Prerequisites

- VPS with Ubuntu/Debian (2GB RAM minimum)
- SSH access to your server
- Domain name pointed to your server IP
- Email hosting credentials (SMTP details)

---

## Step 1: Install Node.js

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install build essentials (needed for SQLite)
sudo apt install -y build-essential python3

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node -v
npm -v
```

---

## Step 2: Clone the Project

```bash
# Create web directory
sudo mkdir -p /var/www
sudo chown $USER:$USER /var/www

# Clone from GitHub
cd /var/www
git clone https://github.com/thejammie9/v0-mobile-mechanic-website.git
cd v0-mobile-mechanic-website
```

---

## Step 3: Install Dependencies

```bash
npm install
```

---

## Step 4: Set Up Environment Variables

Create a `.env.local` file:

```bash
nano .env.local
```

Add these variables:

```env
# ===================
# ADMIN LOGIN
# ===================
# Password to access /admin dashboard
ADMIN_PASSWORD=your_secure_password_here

# ===================
# EMAIL CONFIGURATION
# ===================
# Get these from your email hosting provider
SMTP_HOST=mail.jamiesautocare.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=appointments@jamiesautocare.com
SMTP_PASSWORD=your_email_password_here

# Email addresses
ADMIN_EMAIL=appointments@jamiesautocare.com
EMAIL_FROM=contact@jamiesautocare.com

# Your business phone (shown in customer emails)
BUSINESS_PHONE=07XXX XXXXXX
```

**SMTP Settings Guide:**

| Setting | Port 587 (Recommended) | Port 465 |
|---------|------------------------|----------|
| SMTP_PORT | 587 | 465 |
| SMTP_SECURE | false | true |

Save and exit: `Ctrl+X`, then `Y`, then `Enter`

---

## Step 5: Create Data Directory

```bash
# Create directory for SQLite database
mkdir -p data

# Set permissions
chmod 755 data
```

The database file (`bookings.db`) will be created automatically when the first booking is made.

---

## Step 6: Build for Production

```bash
npm run build
```

---

## Step 7: Run with PM2

PM2 keeps your app running and restarts it if it crashes.

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start the application
pm2 start npm --name "jamies-autocare" -- start

# Save PM2 process list
pm2 save

# Set PM2 to start on system boot
pm2 startup
# Follow the instructions it outputs (copy/paste the command it gives you)
```

**Useful PM2 Commands:**
```bash
pm2 status                  # Check app status
pm2 logs jamies-autocare    # View logs
pm2 restart jamies-autocare # Restart app
pm2 stop jamies-autocare    # Stop app
```

---

## Step 8: Set Up Nginx

```bash
# Install Nginx
sudo apt install nginx -y

# Create site configuration
sudo nano /etc/nginx/sites-available/jamies-autocare
```

**Paste this configuration** (replace `jamiesautocare.com` with your domain):

```nginx
server {
    listen 80;
    server_name jamiesautocare.com www.jamiesautocare.com;

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
    }
}
```

**Enable the site:**
```bash
sudo ln -s /etc/nginx/sites-available/jamies-autocare /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Step 9: SSL Certificate (HTTPS)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate (replace with your domain)
sudo certbot --nginx -d jamiesautocare.com -d www.jamiesautocare.com

# Test auto-renewal
sudo certbot renew --dry-run
```

---

## Step 10: Firewall Setup

```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## Admin Dashboard

**URL:** `https://jamiesautocare.com/admin`

**Password:** Whatever you set as `ADMIN_PASSWORD` in `.env.local`

**Features:**
- View all booking requests
- Update booking status (pending/confirmed/completed/cancelled)
- See customer contact details and vehicle information

---

## Email System

The website sends two types of emails:

1. **Admin Notification** (to `appointments@jamiesautocare.com`)
   - Sent when a new booking is received
   - Contains all customer and vehicle details

2. **Customer Confirmation** (to customer's email)
   - Sent to confirm their booking was received
   - Professional branded email with booking details

**Testing Email:**
After deploying, submit a test booking and check both email addresses receive the messages.

---

## Updating Contact Details

### Business Contact Info

Edit `/components/contact.tsx`:
```typescript
const CONTACT_INFO = {
  phone: "07XXX XXXXXX",
  email: "contact@jamiesautocare.com",
  serviceArea: "Edinburgh and surrounding areas",
}
```

### Footer Info

Edit `/components/footer.tsx`:
```typescript
const CONTACT_INFO = {
  phone: "07XXX XXXXXX",
  email: "contact@jamiesautocare.com",
  serviceArea: "Edinburgh & surrounding areas",
}

const SOCIAL_LINKS = {
  facebook: "https://facebook.com/jamiesautocare",
  instagram: "https://instagram.com/jamiesautocare",
}
```

After changes:
```bash
npm run build
pm2 restart jamies-autocare
```

---

## Adding Portfolio Items

Edit `/components/portfolio.tsx`:

```typescript
const portfolioItems = [
  {
    title: "Engine Overhaul",
    vehicle: "2018 VW Golf",
    description: "Complete engine rebuild after timing belt failure.",
    imageBefore: "/images/golf-before.jpg",
    imageAfter: "/images/golf-after.jpg",
    testimonial: "Great service, highly recommend!",
    customer: "John D.",
  },
  // Add more...
]
```

Upload images to `/public/images/` folder.

---

## Database Backups

Your bookings are stored in `/var/www/v0-mobile-mechanic-website/data/bookings.db`

**Manual backup:**
```bash
cp data/bookings.db data/bookings-backup-$(date +%Y%m%d).db
```

**Automated daily backup (optional):**
```bash
# Add to crontab
crontab -e

# Add this line (backs up at 2am daily)
0 2 * * * cp /var/www/v0-mobile-mechanic-website/data/bookings.db /var/www/v0-mobile-mechanic-website/data/backups/bookings-$(date +\%Y\%m\%d).db
```

---

## Troubleshooting

### App not starting?
```bash
pm2 logs jamies-autocare --lines 50
```

### Database errors?
```bash
# Check if data directory exists and has correct permissions
ls -la data/
# Should show: drwxr-xr-x for the directory
```

### Email not sending?
1. Check SMTP credentials in `.env.local`
2. Check logs: `pm2 logs jamies-autocare | grep -i email`
3. Verify your email host allows SMTP connections

### Port 3000 already in use?
```bash
sudo lsof -i :3000
kill -9 <PID>
```

### Need to rebuild?
```bash
rm -rf .next
npm run build
pm2 restart jamies-autocare
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Start app | `pm2 start jamies-autocare` |
| Stop app | `pm2 stop jamies-autocare` |
| Restart app | `pm2 restart jamies-autocare` |
| View logs | `pm2 logs jamies-autocare` |
| Rebuild | `npm run build` |
| Update from Git | `git pull && npm install && npm run build && pm2 restart jamies-autocare` |
| Backup database | `cp data/bookings.db data/bookings-backup.db` |

---

## File Structure

```
/var/www/v0-mobile-mechanic-website/
├── .env.local          # Your environment variables
├── data/
│   └── bookings.db     # SQLite database (auto-created)
├── app/                # Next.js pages
├── components/         # React components
├── lib/
│   ├── db.ts          # Database functions
│   └── email.ts       # Email functions
└── public/            # Static files (images, etc.)
```
