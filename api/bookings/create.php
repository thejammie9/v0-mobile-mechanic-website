<?php
require_once '../config.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    returnError("Method not allowed", 405);
}

// Get JSON data from request body
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// If JSON parsing failed, try to get data from POST
if (json_last_error() !== JSON_ERROR_NONE) {
    $data = $_POST;
}

// Validate required fields
$requiredFields = ['name', 'email', 'phone', 'vehicle', 'issue', 'date', 'timeSlot'];
validateRequiredFields($data, $requiredFields);

// Sanitize input
$data = sanitizeInput($data);

// Validate email
validateEmail($data['email']);

// Validate date
validateDate($data['date']);

// Validate time slot
validateTimeSlot($data['timeSlot']);

// Connect to database
$conn = connectDB();

// Generate unique ID and cancellation token
$id = generateUniqueId();
$cancellationToken = generateCancellationToken();

// Insert booking into database
$stmt = $conn->prepare("INSERT INTO bookings (id, name, email, phone, vehicle, issue, date, time_slot, cancellation_token) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("sssssssss", $id, $data['name'], $data['email'], $data['phone'], $data['vehicle'], $data['issue'], $data['date'], $data['timeSlot'], $cancellationToken);

if ($stmt->execute()) {
    // Send confirmation email to customer
    $subject = "Booking Confirmation - Jamie's Auto Care";
    $message = "
    <html>
    <head>
        <title>Booking Confirmation</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; }
            h1 { color: #1e3a8a; }
            .details { background-color: #f9fafb; padding: 15px; border-radius: 5px; }
            .label { font-weight: bold; }
        </style>
    </head>
    <body>
        <div class='container'>
            <h1>Booking Confirmation</h1>
            <p>Dear {$data['name']},</p>
            <p>Thank you for booking with Jamie's Auto Care. We have received your request and will contact you shortly to confirm your appointment.</p>
            <div class='details'>
                <p><span class='label'>Booking Reference:</span> $id</p>
                <p><span class='label'>Date:</span> {$data['date']}</p>
                <p><span class='label'>Time:</span> {$data['timeSlot']}</p>
                <p><span class='label'>Vehicle:</span> {$data['vehicle']}</p>
                <p><span class='label'>Issue:</span> {$data['issue']}</p>
            </div>
            <p>If you need to make any changes to your booking, please contact us at $admin_email or call us at 07463451967.</p>
            <p>If you need to cancel your booking, please click <a href='https://yourwebsite.com/bookings/cancel.php?id=$id&token=$cancellationToken'>here</a>.</p>
            <p>We look forward to serving you!</p>
            <p>Best regards,<br>Jamie's Auto Care Team</p>
        </div>
    </body>
    </html>
    ";
    
    // Set headers for HTML email
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: Jamie's Auto Care <noreply@jamiesautocare.com>" . "\r\n";
    
    // Send email to customer
    mail($data['email'], $subject, $message, $headers);
    
    // Send notification to admin
    $adminSubject = "New Booking Request - Jamie's Auto Care";
    $adminMessage = "
    <html>
    <head>
        <title>New Booking Request</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; }
            h1 { color: #1e3a8a; }
            .details { background-color: #f9fafb; padding: 15px; border-radius: 5px; }
            .label { font-weight: bold; }
        </style>
    </head>
    <body>
        <div class='container'>
            <h1>New Booking Request</h1>
            <div class='details'>
                <p><span class='label'>Booking ID:</span> $id</p>
                <p><span class='label'>Name:</span> {$data['name']}</p>
                <p><span class='label'>Email:</span> {$data['email']}</p>
                <p><span class='label'>Phone:</span> {$data['phone']}</p>
                <p><span class='label'>Vehicle:</span> {$data['vehicle']}</p>
                <p><span class='label'>Issue:</span> {$data['issue']}</p>
                <p><span class='label'>Date:</span> {$data['date']}</p>
                <p><span class='label'>Time Slot:</span> {$data['timeSlot']}</p>
            </div>
            <p>Please log in to the admin dashboard to manage this booking.</p>
        </div>
    </body>
    </html>
    ";
    
    mail($admin_email, $adminSubject, $adminMessage, $headers);
    
    // Return success response
    returnJSON([
        'success' => true,
        'message' => 'Booking created successfully',
        'bookingId' => $id
    ]);
} else {
    returnError("Error creating booking: " . $stmt->error);
}

$stmt->close();
$conn->close();
?>
