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
$requiredFields = ['id', 'token'];
validateRequiredFields($data, $requiredFields);

// Connect to database
$conn = connectDB();

// Verify booking and token
$stmt = $conn->prepare("SELECT name, email, date, time_slot, vehicle, status FROM bookings WHERE id = ? AND cancellation_token = ?");
$stmt->bind_param("ss", $data['id'], $data['token']);
$stmt->execute();
$result = $stmt->get_result();

if ($result && $result->num_rows > 0) {
    $booking = $result->fetch_assoc();
    
    // Check if booking is already cancelled
    if ($booking['status'] === 'cancelled') {
        returnError("Booking is already cancelled");
    }
    
    // Update booking status to cancelled
    $updateStmt = $conn->prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ?");
    $updateStmt->bind_param("s", $data['id']);
    
    if ($updateStmt->execute()) {
        // Send cancellation email
        $subject = "Booking Cancellation - Jamie's Auto Care";
        $message = "
        <html>
        <head>
            <title>Booking Cancellation</title>
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
                <h1>Booking Cancellation</h1>
                <p>Dear {$booking['name']},</p>
                <p>Your booking with Jamie's Auto Care has been cancelled as requested.</p>
                <div class='details'>
                    <p><span class='label'>Booking Reference:</span> {$data['id']}</p>
                    <p><span class='label'>Date:</span> {$booking['date']}</p>
                    <p><span class='label'>Time:</span> {$booking['time_slot']}</p>
                    <p><span class='label'>Vehicle:</span> {$booking['vehicle']}</p>
                </div>
                <p>If you wish to book again in the future, please visit our website or contact us at $admin_email.</p>
                <p>Thank you,<br>Jamie's Auto Care Team</p>
            </div>
        </body>
        </html>
        ";
        
        // Set headers for HTML email
        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
        $headers .= "From: Jamie's Auto Care <noreply@jamiesautocare.com>" . "\r\n";
        
        // Send email to customer
        mail($booking['email'], $subject, $message, $headers);
        
        // Send notification to admin
        $adminSubject = "Booking Cancelled - Jamie's Auto Care";
        $adminMessage = "
        <html>
        <head>
            <title>Booking Cancellation</title>
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
                <h1>Booking Cancellation</h1>
                <p>A booking has been cancelled:</p>
                <div class='details'>
                    <p><span class='label'>Booking Reference:</span> {$data['id']}</p>
                    <p><span class='label'>Name:</span> {$booking['name']}</p>
                    <p><span class='label'>Email:</span> {$booking['email']}</p>
                    <p><span class='label'>Date:</span> {$booking['date']}</p>
                    <p><span class='label'>Time:</span> {$booking['time_slot']}</p>
                    <p><span class='label'>Vehicle:</span> {$booking['vehicle']}</p>
                </div>
            </div>
        </body>
        </html>
        ";
        
        mail($admin_email, $adminSubject, $adminMessage, $headers);
        
        returnJSON([
            'success' => true,
            'message' => 'Booking cancelled successfully'
        ]);
    } else {
        returnError("Error cancelling booking: " . $updateStmt->error);
    }
    
    $updateStmt->close();
} else {
    returnError("Invalid booking ID or cancellation token", 404);
}

$stmt->close();
$conn->close();
?>
