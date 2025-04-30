# Deployment Guide for Jamie's Auto Care Website

## Step 1: Prepare for Static Export

1. Make sure you have the `delete-dynamic-routes.js` script in your project root
2. Ensure your `next.config.js` has `output: "export"` and the `exportPathMap` configuration
3. Verify that your `package.json` has the prebuild script: `"prebuild": "node delete-dynamic-routes.js"`

## Step 2: Build the Project

Run the build command:

\`\`\`bash
npm run build
\`\`\`

This will:
1. Run the `delete-dynamic-routes.js` script to remove dynamic routes
2. Build the static export to the `out` directory

## Step 3: Add PHP Files

After building, add these PHP files to your `out` directory:

1. `/bookings/cancel.php` - For handling booking cancellations
2. `/bookings/index.php` - For redirecting to homepage
3. `/api/submit-booking.php` - For handling form submissions
4. `/admin/index.php`, `/admin/login.php`, `/admin/logout.php` - For admin interface

## Step 4: Upload to Hosting

1. Connect to your hosting via FTP
2. Upload all files from the `out` directory to your public_html folder
3. Set proper permissions:
   - Directories: 755 (drwxr-xr-x)
   - Files: 644 (rw-r--r--)
   - PHP files: 644 (rw-r--r--)

## Step 5: Set Up Database

1. Log in to cPanel
2. Create a new MySQL database
3. Create a database user with a strong password
4. Add the user to the database with all privileges
5. Import the `database-setup.sql` file

## Step 6: Update Configuration

Edit these PHP files to update database credentials:
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

1. Visit your website
2. Test the booking form
3. Test the booking cancellation link
4. Log in to the admin area
5. Verify emails are being sent
