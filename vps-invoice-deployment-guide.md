# Invoice Management System Deployment Guide

This guide will walk you through deploying the invoice management system on your VPS where Nginx Manager is already running on port 80.

## Prerequisites

- VPS with Nginx Manager running on port 80
- SSH access to your VPS
- MySQL/MariaDB database server
- PHP 7.4+ with required extensions
- Composer (for PHP dependencies)

## Step 1: Prepare the Database

1. Log in to your MySQL server:
   \`\`\`bash
   mysql -u root -p
   \`\`\`

2. Create a database for the invoice system:
   \`\`\`sql
   CREATE DATABASE mobile_mechanic;
   \`\`\`

3. Create a dedicated user for the application:
   \`\`\`sql
   CREATE USER 'mechanic_user'@'localhost' IDENTIFIED BY 'strong_password_here';
   GRANT ALL PRIVILEGES ON mobile_mechanic.* TO 'mechanic_user'@'localhost';
   FLUSH PRIVILEGES;
   \`\`\`

4. Exit MySQL:
   \`\`\`sql
   EXIT;
   \`\`\`

## Step 2: Upload Application Files

1. Create a directory for the application:
   \`\`\`bash
   mkdir -p /var/www/jamiesautocare
   \`\`\`

2. Upload your application files to the server using SCP or SFTP:
   \`\`\`bash
   scp -r /path/to/local/project/* user@your-vps-ip:/var/www/jamiesautocare/
   \`\`\`

   Alternatively, if you're using Git:
   \`\`\`bash
   cd /var/www/jamiesautocare
   git clone your-repository-url .
   \`\`\`

3. Set proper permissions:
   \`\`\`bash
   chown -R www-data:www-data /var/www/jamiesautocare
   chmod -R 755 /var/www/jamiesautocare
   \`\`\`

## Step 3: Configure Environment Variables

1. Create a `.env` file:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

2. Edit the `.env` file with your database credentials and other settings:
   \`\`\`bash
   nano .env
   \`\`\`

   Update the following variables:
   \`\`\`
   DB_HOST=localhost
   DB_USER=mechanic_user
   DB_PASSWORD=strong_password_here
   DB_NAME=mobile_mechanic
   ADMIN_EMAIL=your-email@example.com
   ADMIN_PASSWORD=your-secure-admin-password
   \`\`\`

## Step 4: Set Up the Database Schema

1. Run the database setup scripts:
   \`\`\`bash
   php api/setup.php
   php api/setup-invoices.php
   \`\`\`

## Step 5: Configure Nginx

Since Nginx Manager is already using port 80, we'll configure a virtual host for your application.

1. Create a new Nginx configuration file:
   \`\`\`bash
   nano /etc/nginx/sites-available/jamiesautocare
   \`\`\`

2. Add the following configuration:
   ```nginx
   server {
       listen 80;
       server_name jamiesautocare.com www.jamiesautocare.com; # Replace with your domain
       root /var/www/jamiesautocare;
       index index.php index.html;

       location / {
           try_files $uri $uri/ /index.php?$query_string;
       }

       location ~ \.php$ {
           include snippets/fastcgi-php.conf;
           fastcgi_pass unix:/var/run/php/php7.4-fpm.sock; # Adjust PHP version if needed
       }

       location ~ /\.ht {
           deny all;
       }

       # API endpoints
       location /api/ {
           try_files $uri $uri/ /api/index.php?$query_string;
       }

       # Static files
       location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
           expires max;
           log_not_found off;
       }
   }
   \`\`\`

3. Enable the site:
   \`\`\`bash
   ln -s /etc/nginx/sites-available/jamiesautocare /etc/nginx/sites-enabled/
   \`\`\`

4. Test the Nginx configuration:
   \`\`\`bash
   nginx -t
   \`\`\`

5. If the test is successful, reload Nginx:
   \`\`\`bash
   systemctl reload nginx
   \`\`\`

## Step 6: Set Up SSL (Optional but Recommended)

1. Install Certbot:
   \`\`\`bash
   apt-get update
   apt-get install certbot python3-certbot-nginx
   \`\`\`

2. Obtain and install SSL certificate:
   \`\`\`bash
   certbot --nginx -d jamiesautocare.com -d www.jamiesautocare.com
   \`\`\`

3. Follow the prompts to complete the SSL setup.

## Step 7: Final Checks and Testing

1. Visit your domain in a web browser to ensure the site loads correctly.

2. Test the admin login:
   - Go to `https://jamiesautocare.com/admin/login`
   - Log in with the admin credentials you set in the `.env` file

3. Test creating and viewing invoices.

4. Check that the database is storing invoice data correctly:
   \`\`\`bash
   mysql -u mechanic_user -p mobile_mechanic -e "SELECT * FROM invoices LIMIT 5;"
   \`\`\`

## Troubleshooting

### Application Not Loading

- Check Nginx error logs:
  \`\`\`bash
  tail -f /var/log/nginx/error.log
  \`\`\`

- Check PHP error logs:
  \`\`\`bash
  tail -f /var/log/php7.4-fpm.log
  \`\`\`

### Database Connection Issues

- Verify database credentials in the `.env` file
- Check if MySQL is running:
  \`\`\`bash
  systemctl status mysql
  \`\`\`

### Permission Issues

- Ensure proper ownership and permissions:
  \`\`\`bash
  chown -R www-data:www-data /var/www/jamiesautocare
  chmod -R 755 /var/www/jamiesautocare
  chmod -R 777 /var/www/jamiesautocare/storage # If applicable
  \`\`\`

## Maintenance

### Regular Backups

Set up a cron job to backup your database regularly:

1. Create a backup script:
   \`\`\`bash
   nano /root/backup_invoice_db.sh
   \`\`\`

2. Add the following content:
   \`\`\`bash
   #!/bin/bash
   TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
   BACKUP_DIR="/root/backups"
   mkdir -p $BACKUP_DIR
   
   # Database backup
   mysqldump -u mechanic_user -p'strong_password_here' mobile_mechanic > $BACKUP_DIR/invoice_db_$TIMESTAMP.sql
   
   # Compress the backup
   gzip $BACKUP_DIR/invoice_db_$TIMESTAMP.sql
   
   # Delete backups older than 30 days
   find $BACKUP_DIR -name "invoice_db_*.sql.gz" -type f -mtime +30 -delete
   \`\`\`

3. Make the script executable:
   \`\`\`bash
   chmod +x /root/backup_invoice_db.sh
   \`\`\`

4. Add a cron job to run daily:
   \`\`\`bash
   crontab -e
   \`\`\`
   
   Add this line:
   \`\`\`
   0 2 * * * /root/backup_invoice_db.sh
   \`\`\`

### Updating the Application

When you have updates to deploy:

1. Pull the latest changes (if using Git):
   \`\`\`bash
   cd /var/www/jamiesautocare
   git pull
   \`\`\`

2. Or upload new files via SCP/SFTP

3. Update database schema if needed:
   \`\`\`bash
   php api/update-schema.php # If you have such a script
   \`\`\`

4. Reset permissions:
   \`\`\`bash
   chown -R www-data:www-data /var/www/jamiesautocare
   \`\`\`

## Security Considerations

1. Ensure your `.env` file is not accessible from the web:
   ```nginx
   # Add to your Nginx configuration
   location ~ \.env {
       deny all;
   }
   \`\`\`

2. Regularly update your server and PHP packages:
   \`\`\`bash
   apt-get update && apt-get upgrade
   \`\`\`

3. Consider setting up a firewall (if not already configured):
   \`\`\`bash
   apt-get install ufw
   ufw allow ssh
   ufw allow http
   ufw allow https
   ufw enable
   \`\`\`

4. Monitor your logs for suspicious activity.
