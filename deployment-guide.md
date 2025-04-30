# Deployment Guide for Jamie's Auto Care Website

This guide will help you deploy the static version of your Next.js website to Verpex hosting.

## Step 1: Remove Dynamic Routes

Before building, run the script to remove dynamic routes:

\`\`\`bash
node remove-dynamic-routes.js
\`\`\`

This will delete any dynamic route folders that are incompatible with static export.

## Step 2: Build the Static Export

Run the build command:

\`\`\`bash
npm run build
\`\`\`

This will create an `out` directory with all static files.

## Step 3: Add PHP Files

After building, make sure these PHP files are in your `out` directory:

1. `/bookings/cancel.php` - For handling booking cancellations
2. `/bookings/index.php` - For redirecting to homepage
3. `/api/submit-booking.php` - For handling form submissions
4. `/admin/index.php`, `/admin/login.php`, `/admin/logout.php` - For admin interface

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

Edit the following files to update database credentials:
- `api/submit-booking.php`
- `bookings/cancel.php`
- `admin/index.php`
- `admin/login.php`

Replace these placeholders:
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
