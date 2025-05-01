#!/bin/bash

# Invoice Management System Deployment Script
# This script automates the deployment process

# Exit on error
set -e

# Configuration
APP_DIR="/var/www/jamiesautocare"
DB_USER="mechanic_user"
DB_PASSWORD="your_password_here" # Replace with your actual password
DB_NAME="mobile_mechanic"
DOMAIN="jamiesautocare.com" # Replace with your domain

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting deployment of Invoice Management System...${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run as root${NC}"
  exit 1
fi

# Create application directory if it doesn't exist
echo -e "${GREEN}Creating application directory...${NC}"
mkdir -p $APP_DIR

# Copy files to the application directory
echo -e "${GREEN}Copying application files...${NC}"
# Assuming the script is run from the directory containing the application files
cp -R ./* $APP_DIR/

# Set proper permissions
echo -e "${GREEN}Setting file permissions...${NC}"
chown -R www-data:www-data $APP_DIR
chmod -R 755 $APP_DIR

# Create .env file if it doesn't exist
if [ ! -f "$APP_DIR/.env" ]; then
  echo -e "${GREEN}Creating .env file...${NC}"
  cat > $APP_DIR/.env << EOF
DB_HOST=localhost
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
EOF
  echo -e "${YELLOW}Please update the admin credentials in $APP_DIR/.env${NC}"
fi

# Create Nginx configuration
echo -e "${GREEN}Creating Nginx configuration...${NC}"
cat > /etc/nginx/sites-available/jamiesautocare << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    root $APP_DIR;
    index index.php index.html;

    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
    }

    location ~ /\.ht {
        deny all;
    }

    location /api/ {
        try_files \$uri \$uri/ /api/index.php?\$query_string;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
        expires max;
        log_not_found off;
    }
}
EOF

# Enable the site
echo -e "${GREEN}Enabling the site...${NC}"
ln -sf /etc/nginx/sites-available/jamiesautocare /etc/nginx/sites-enabled/

# Test Nginx configuration
echo -e "${GREEN}Testing Nginx configuration...${NC}"
nginx -t

# Reload Nginx if configuration test passed
if [ $? -eq 0 ]; then
  echo -e "${GREEN}Reloading Nginx...${NC}"
  systemctl reload nginx
else
  echo -e "${RED}Nginx configuration test failed. Please check the configuration.${NC}"
  exit 1
fi

# Set up database
echo -e "${GREEN}Setting up database...${NC}"
# Check if database exists
mysql -u$DB_USER -p$DB_PASSWORD -e "USE $DB_NAME" 2>/dev/null

if [ $? -ne 0 ]; then
  echo -e "${YELLOW}Database does not exist. Creating...${NC}"
  mysql -u root -p << EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF
fi

# Run database setup scripts
echo -e "${GREEN}Running database setup scripts...${NC}"
php $APP_DIR/api/setup.php
php $APP_DIR/api/setup-invoices.php

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${YELLOW}Please visit http://$DOMAIN to access your application.${NC}"
echo -e "${YELLOW}Admin login: http://$DOMAIN/admin/login${NC}"
echo -e "${YELLOW}Don't forget to set up SSL using Certbot!${NC}"
