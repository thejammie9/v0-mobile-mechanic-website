# VPS Deployment Guide for Mobile Mechanic Website

This guide will help you deploy the Mobile Mechanic website on a VPS (Virtual Private Server).

## Prerequisites

- A VPS with Ubuntu 20.04 or later
- Node.js 18.x or later
- MySQL 8.0 or later
- Nginx
- PM2 (for process management)
- Domain name (optional, but recommended)

## Step 1: Set Up Your VPS

1. Update your system:
   \`\`\`bash
   sudo apt update && sudo apt upgrade -y
   \`\`\`

2. Install Node.js:
   \`\`\`bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   \`\`\`

3. Install MySQL:
   \`\`\`bash
   sudo apt install mysql-server -y
   sudo mysql_secure_installation
   \`\`\`

4. Install Nginx:
   \`\`\`bash
   sudo apt install nginx -y
   \`\`\`

5. Install PM2:
   \`\`\`bash
   sudo npm install -g pm2
   \`\`\`

## Step 2: Set Up MySQL Database

1. Log in to MySQL:
   \`\`\`bash
   sudo mysql
   \`\`\`

2. Create a database and user:
   \`\`\`sql
   CREATE DATABASE mobile_mechanic;
   CREATE USER 'mechanic_user'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON mobile_mechanic.* TO 'mechanic_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   \`\`\`

## Step 3: Clone and Set Up the Application

1. Clone your repository:
   \`\`\`bash
   git clone https://github.com/yourusername/mobile-mechanic.git
   cd mobile-mechanic
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Create a `.env.local` file:
   \`\`\`bash
   touch .env.local
   \`\`\`

4. Add the following environment variables to `.env.local`:
   \`\`\`
   # Database
   DB_HOST=localhost
   DB_USER=mechanic_user
   DB_PASSWORD=your_password
   DB_NAME=mobile_mechanic

   # Admin
   ADMIN_PASSWORD=your_admin_password
   ADMIN_AUTH_TOKEN=your_auth_token
   ADMIN_EMAIL=your_email@example.com

   # Email
   SMTP_HOST=your_smtp_host
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your_smtp_user
   SMTP_PASSWORD=your_smtp_password

   # App
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   \`\`\`

5. Build the application:
   \`\`\`bash
   npm run build
   \`\`\`

## Step 4: Set Up PM2

1. Create a PM2 ecosystem file:
   \`\`\`bash
   touch ecosystem.config.js
   \`\`\`

2. Add the following content to `ecosystem.config.js`:
   \`\`\`javascript
   module.exports = {
     apps: [
       {
         name: "mobile-mechanic",
         script: "node_modules/next/dist/bin/next",
         args: "start",
         env: {
           PORT: 3000,
           NODE_ENV: "production",
         },
       },
     ],
   };
   \`\`\`

3. Start the application with PM2:
   \`\`\`bash
   pm2 start ecosystem.config.js
   \`\`\`

4. Set up PM2 to start on boot:
   \`\`\`bash
   pm2 startup
   pm2 save
   \`\`\`

## Step 5: Set Up Nginx

1. Create an Nginx configuration file:
   \`\`\`bash
   sudo nano /etc/nginx/sites-available/mobile-mechanic
   \`\`\`

2. Add the following content:
   \`\`\`nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   \`\`\`

3. Create a symbolic link to enable the site:
   \`\`\`bash
   sudo ln -s /etc/nginx/sites-available/mobile-mechanic /etc/nginx/sites-enabled/
   \`\`\`

4. Test Nginx configuration:
   \`\`\`bash
   sudo nginx -t
   \`\`\`

5. Restart Nginx:
   \`\`\`bash
   sudo systemctl restart nginx
   \`\`\`

## Step 6: Set Up SSL with Let's Encrypt (Optional but Recommended)

1. Install Certbot:
   \`\`\`bash
   sudo apt install certbot python3-certbot-nginx -y
   \`\`\`

2. Obtain SSL certificate:
   \`\`\`bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   \`\`\`

3. Follow the prompts to complete the SSL setup.

## Step 7: Update Your Domain DNS

1. Update your domain's DNS settings to point to your VPS IP address.
2. Wait for DNS propagation (can take up to 48 hours).

## Step 8: Test Your Deployment

1. Visit your domain in a web browser.
2. Test the booking form.
3. Test the admin login at `/admin/login`.

## Maintenance

- To update the application:
  \`\`\`bash
  cd mobile-mechanic
  git pull
  npm install
  npm run build
  pm2 restart mobile-mechanic
  \`\`\`

- To view logs:
  \`\`\`bash
  pm2 logs mobile-mechanic
  \`\`\`

- To monitor the application:
  \`\`\`bash
  pm2 monit
  \`\`\`

## Troubleshooting

- If the application doesn't start, check the logs:
  \`\`\`bash
  pm2 logs mobile-mechanic
  \`\`\`

- If Nginx returns a 502 Bad Gateway error, check if the Node.js application is running:
  \`\`\`bash
  pm2 status
  \`\`\`

- If you can't connect to MySQL, check if the service is running:
  \`\`\`bash
  sudo systemctl status mysql
