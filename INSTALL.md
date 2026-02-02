# Installation Guide - Edinburgh Mobile Mechanic Website

This guide covers deploying the website on a VPS (Ubuntu/Debian).

---

## Prerequisites

- Node.js 18+ (recommended: 20 LTS)
- npm or yarn
- A VPS with SSH access
- Domain name (optional but recommended)

---

## Step 1: Install Node.js

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node -v
npm -v
```

---

## Step 2: Clone or Upload the Project

**Option A: Clone from GitHub**
```bash
cd /var/www
git clone https://github.com/YOUR_USERNAME/v0-mobile-mechanic-website.git
cd v0-mobile-mechanic-website
```

**Option B: Upload via SCP**
```bash
# From your local machine
scp -r ./v0-mobile-mechanic-website user@your-server-ip:/var/www/
```

---

## Step 3: Install Dependencies

```bash
cd /var/www/v0-mobile-mechanic-website
npm install
```

---

## Step 4: Build for Production

```bash
npm run build
```

---

## Step 5: Run the Application

### Quick Start (Testing)
```bash
npm run start
```
The site will be available at `http://your-server-ip:3000`

### Production with PM2 (Recommended)

PM2 keeps your app running and restarts it if it crashes.

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start the application
pm2 start npm --name "mechanic-website" -- start

# Save PM2 process list (auto-restart on reboot)
pm2 save

# Set PM2 to start on system boot
pm2 startup
# Follow the instructions it outputs
```

**Useful PM2 Commands:**
```bash
pm2 status              # Check app status
pm2 logs mechanic-website   # View logs
pm2 restart mechanic-website # Restart app
pm2 stop mechanic-website    # Stop app
```

---

## Step 6: Set Up Nginx Reverse Proxy (Recommended)

This allows you to serve the site on port 80/443 with a domain.

```bash
# Install Nginx
sudo apt install nginx -y

# Create site configuration
sudo nano /etc/nginx/sites-available/mechanic-website
```

**Paste this configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

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
# Create symlink to enable site
sudo ln -s /etc/nginx/sites-available/mechanic-website /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## Step 7: SSL Certificate (HTTPS)

Free SSL with Let's Encrypt:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is set up automatically, but you can test it:
sudo certbot renew --dry-run
```

---

## Updating Your Contact Details

Edit these files to add your real information:

### `/components/contact.tsx`
```typescript
const CONTACT_INFO = {
  phone: "07XXX XXXXXX",        // Your phone number
  email: "you@email.com",       // Your email
  serviceArea: "Edinburgh and surrounding areas",
}
```

### `/components/footer.tsx`
```typescript
const CONTACT_INFO = {
  phone: "07XXX XXXXXX",
  email: "you@email.com",
  serviceArea: "Edinburgh & surrounding areas",
}

const SOCIAL_LINKS = {
  facebook: "https://facebook.com/yourbusiness",
  instagram: "https://instagram.com/yourbusiness",
}
```

After making changes, rebuild and restart:
```bash
npm run build
pm2 restart mechanic-website
```

---

## Adding Portfolio Items

Edit `/components/portfolio.tsx` and add items to the array:

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
  // Add more items...
]
```

Upload images to `/public/images/` folder.

---

## Firewall Setup

```bash
# Allow SSH, HTTP, and HTTPS
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## Troubleshooting

### App not starting?
```bash
pm2 logs mechanic-website --lines 50
```

### Port 3000 already in use?
```bash
sudo lsof -i :3000
kill -9 <PID>
```

### Nginx errors?
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### Need to rebuild?
```bash
rm -rf .next
npm run build
pm2 restart mechanic-website
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Start app | `pm2 start mechanic-website` |
| Stop app | `pm2 stop mechanic-website` |
| Restart app | `pm2 restart mechanic-website` |
| View logs | `pm2 logs mechanic-website` |
| Rebuild | `npm run build` |
| Update code | `git pull && npm install && npm run build && pm2 restart mechanic-website` |
