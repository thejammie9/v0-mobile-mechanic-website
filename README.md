# Jamie's Auto Care - Booking API

This repository contains the API endpoints for handling booking data for Jamie's Auto Care website.

## Setup Instructions

1. **Database Setup**

   Run the setup script to create the database and tables:

   \`\`\`
   php api/setup.php
   \`\`\`

2. **Environment Variables**

   Create a `.env` file in the root directory with the following variables:

   \`\`\`
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=mobile_mechanic
   ADMIN_EMAIL=your_email@example.com
   ADMIN_PASSWORD=your_admin_password
   \`\`\`

3. **API Endpoints**

   The following API endpoints are available:

   - `POST /api/bookings/create.php` - Create a new booking
   - `GET /api/bookings/index.php` - Get all bookings (admin only)
   - `GET /api/bookings/get.php` - Get a single booking
   - `POST /api/bookings/update-status.php` - Update booking status (admin only)
   - `POST /api/bookings/cancel.php` - Cancel a booking

4. **Admin Access**

   Access the admin dashboard at `/admin/login.html` using the admin password set in the `.env` file.

## API Documentation

### Create Booking

**Endpoint:** `POST /api/bookings/create.php`

**Request Body:**
\`\`\`json
{
  "name": "John Smith",
  "email": "john@example.com",
  "phone": "07123456789",
  "vehicle": "Ford Focus 2018",
  "issue": "Engine problem",
  "date": "2023-12-15",
  "timeSlot": "Morning (09:00 - 12:30)"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Booking created successfully",
  "bookingId": "booking_1234567890"
}
\`\`\`

### Get All Bookings (Admin Only)

**Endpoint:** `GET /api/bookings/index.php`

**Headers:**
\`\`\`
Authorization: Bearer your_admin_password
\`\`\`

**Query Parameters:**
- `status` (optional) - Filter by status (pending, confirmed, completed, cancelled)
- `limit` (optional) - Limit the number of results (default: 100)
- `offset` (optional) - Offset for pagination (default: 0)

**Response:**
\`\`\`json
{
  "success": true,
  "bookings": [
    {
      "id": "booking_1234567890",
      "name": "John Smith",
      "email": "john@example.com",
      "phone": "07123456789",
      "vehicle": "Ford Focus 2018",
      "issue": "Engine problem",
      "date": "2023-12-15",
      "timeSlot": "Morning (09:00 - 12:30)",
      "status": "pending",
      "createdAt": "2023-12-10T14:30:00Z"
    }
  ],
  "count": 1,
  "limit": 100,
  "offset": 0
}
\`\`\`

### Get Single Booking

**Endpoint:** `GET /api/bookings/get.php?id=booking_1234567890`

**Headers (Admin Only):**
\`\`\`
Authorization: Bearer your_admin_password
\`\`\`

**OR**

**Query Parameters (Customer):**
- `id` - Booking ID
- `token` - Cancellation token

**Response:**
\`\`\`json
{
  "success": true,
  "booking": {
    "id": "booking_1234567890",
    "name": "John Smith",
    "email": "john@example.com",
    "phone": "07123456789",
    "vehicle": "Ford Focus 2018",
    "issue": "Engine problem",
    "date": "2023-12-15",
    "timeSlot": "Morning (09:00 - 12:30)",
    "status": "pending",
    "createdAt": "2023-12-10T14:30:00Z"
  }
}
\`\`\`

### Update Booking Status (Admin Only)

**Endpoint:** `POST /api/bookings/update-status.php`

**Headers:**
\`\`\`
Authorization: Bearer your_admin_password
\`\`\`

**Request Body:**
\`\`\`json
{
  "id": "booking_1234567890",
  "status": "confirmed"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Booking status updated successfully"
}
\`\`\`

### Cancel Booking

**Endpoint:** `POST /api/bookings/cancel.php`

**Request Body:**
\`\`\`json
{
  "id": "booking_1234567890",
  "token": "cancellation_token"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Booking cancelled successfully"
}
\`\`\`

## Client-Side Integration

The API can be integrated with the client-side code using the provided JavaScript files:

- `booking-api.js` - Contains functions to interact with the API
- `booking-form.js` - Handles the booking form submission
- `admin-bookings.js` - Handles the admin bookings page
- `admin-login.js` - Handles the admin login form

## Security Considerations

- The API uses simple token-based authentication for admin access
- In a production environment, you should use a more secure authentication method
- All user inputs are sanitized to prevent SQL injection and XSS attacks
- CORS headers are set to allow cross-origin requests
