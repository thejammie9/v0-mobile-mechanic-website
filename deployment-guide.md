# Deployment Guide for Jamie's Auto Care Website

This guide will help you deploy the static version of your Next.js website to Verpex hosting.

## Step 1: Build the Static Export

1. Update your `next.config.js` file with the provided configuration
2. Run the build command:
   \`\`\`
   npm run build
   \`\`\`
3. This will create an `out` directory with all static files

## Step 2: Prepare Additional Files

1. Copy the following files to your `out` directory:
   - `.htaccess` (root level)
   - `api/submit-booking.php`
   - `js/booking-form-static.js`
   - `admin/index.php`
   - `admin/login.php`
   - `admin/logout.php`
   - `css/admin.css`

2. Add a script tag to load the booking form JavaScript in your HTML:
   ```html
   <script src="/js/booking-form-static.js"></script>
   \`\`\`

3. Update the booking form HTML to include an ID and status message container:
   ```html
   <form id="booking-form" class="...">
     <!-- Form fields -->
   </form>
   <div id="form-status"></div>
   \`\`\`

## Step 3: Upload to Verpex

1. Connect to your Verpex hosting via FTP
2. Navigate to your public_html directory
3. Upload all files from the `out` directory
4. Set proper permissions:
   - Directories: 755 (drwxr-xr-x)
   - Files: 644 (rw-r--r--)
   - PHP files: 644 (rw-r--r--)

## Step 4: Set Up Database

1. Log in to cPanel
2. Go to MySQL Databases
3. Create a new database (e.g., jamiesautocare_db)
4. Create a new user with a strong password
5. Add the user to the database with all privileges
6. Import the `database-setup.sql` file or run the SQL commands

## Step 5: Update Configuration

1. Edit the following files to update database credentials:
   - `api/submit-booking.php`
   - `admin/index.php`
   - `admin/login.php`

2. Replace these placeholders:
   - `YOUR_DB_USER`
   - `YOUR_DB_PASSWORD`
   - `YOUR_DB_NAME`
   - `YOUR_ADMIN_PASSWORD`

## Step 6: Test Your Website

1. Visit your website at your domain name
2. Test the booking form
3. Log in to the admin area at `/admin/login.php`
4. Verify emails are being sent

## Troubleshooting

### CSS Not Loading
- Check that the .htaccess file is properly uploaded
- Verify file permissions
- Check browser console for errors

### Form Not Working
- Check browser console for JavaScript errors
- Verify PHP is enabled on your hosting
- Check database connection

### Images Not Displaying
- Verify image paths are correct
- Check file permissions

### Email Not Sending
- Contact Verpex support to ensure mail() function is enabled
- Consider using an SMTP library for more reliable email delivery
