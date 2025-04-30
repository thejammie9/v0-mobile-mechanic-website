# Deployment Guide for Jamie's Auto Care Website

This guide will help you deploy the static version of your Next.js website to Verpex hosting.

## Step 1: Prepare Your Project

1. Make sure you have the pre-build cleanup script in place:
   - `scripts/pre-build-cleanup.js` - Removes dynamic routes before building

2. Update your package.json scripts:
   \`\`\`json
   "scripts": {
     "dev": "next dev",
     "build": "node scripts/pre-build-cleanup.js && next build",
     "start": "next start",
     "lint": "next lint"
   }
   \`\`\`

## Step 2: Build the Static Export

1. Run the build command:
   \`\`\`bash
   npm run build
   \`\`\`
   This will:
   - Remove dynamic routes before building
   - Create an `out` directory with all static files


## Step 3: Prepare Additional Files

1. Create the following directory structure in your `out` directory:
   - `/api` - For API endpoints
   - `/bookings` - For booking cancellation
   - `/admin` - For admin interface
   - `/js` - For JavaScript files
   - `/css` - For CSS files

2. Copy the following files to your `out` directory:
   - `.htaccess` (root level)
   - `api/submit-booking.php`
   - `bookings/cancel.php`
   - `bookings/index.php`
   - `js/booking-form-static.js`
   - `admin/index.php`
   - `admin/login.php`
   - `admin/logout.php`
   - `css/admin.css`

## Step 4: Upload to Verpex

1. Connect to your Verpex hosting via FTP
2. Navigate to your public_html directory
3. Upload all files from the `out` directory
4. Set proper permissions:
   - Directories: 755 (drwxr-xr-x)
   - Files: 644 (rw-r--r--)
   - PHP files: 644 (rw-r--r--)

## Step 5: Set Up Database

1. Log in to cPanel
2. Go to MySQL Databases
3. Create a new database (e.g., jamiesautocare_db)
4. Create a new user with a strong password
5. Add the user to the database with all privileges
6. Import the `database-setup.sql` file or run the SQL commands

## Step 6: Update Configuration

1. Edit the following files to update database credentials:
   - `api/submit-booking.php`
   - `bookings/cancel.php`
   - `admin/index.php`
   - `admin/login.php`

2. Replace these placeholders:
   - `YOUR_DB_USER`
   - `YOUR_DB_PASSWORD`
   - `YOUR_DB_NAME`
   - `YOUR_ADMIN_PASSWORD`

## Step 7: Test Your Website

1. Visit your website at your domain name
2. Test the booking form
3. Test the booking cancellation link
4. Log in to the admin area at `/admin/login.php`
5. Verify emails are being sent
