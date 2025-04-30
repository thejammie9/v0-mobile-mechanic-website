# Deployment Guide for Jamie's Auto Care Website

## Overview

This is a static website with PHP backend for form handling. The build process creates a static site that can be deployed to any web hosting service that supports PHP.

## Deployment Steps

### 1. Prepare Your Hosting Environment

Make sure your hosting environment meets these requirements:
- PHP 7.4 or higher
- MySQL database (optional, for storing bookings)
- Email functionality enabled

### 2. Build the Website

Run the build command:

\`\`\`bash
npm run build
\`\`\`

This will create an `out` directory with all the static files.

### 3. Upload Files to Your Hosting

Upload all files from the `out` directory to your web hosting's public directory (usually `public_html` or `www`).

### 4. Configure PHP Files

Edit these PHP files to update with your information:

- `api/submit-booking.php`: Update the admin email address
- `admin/login.php`: Update the admin password
- If using a database, update the database connection details in all PHP files

### 5. Set Up Database (Optional)

If you want to store bookings in a database:

1. Create a new MySQL database
2. Import the `database-setup.sql` file (you'll need to create this)
3. Update the database connection details in the PHP files

### 6. Test Your Website

1. Visit your website
2. Test the booking form
3. Test the admin login

## Troubleshooting

- If forms aren't working, check that PHP is properly configured
- If emails aren't being sent, check your hosting's email settings
- If you see 404 errors, make sure your .htaccess file is uploaded and working

## Maintenance

To update the website:

1. Make changes to the source files
2. Run `npm run build` again
3. Upload the updated files to your hosting
