<?php
require_once '../config.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    returnError("Method not allowed", 405);
}

// Authenticate admin
authenticateAdmin();

// Get JSON data from request body
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// If JSON parsing failed, try to get data from POST
if (json_last_error() !== JSON_ERROR_NONE) {
    $data = $_POST;
}

// Validate required fields
$requiredFields = ['id', 'status'];
validateRequiredFields($data, $requiredFields);

// Validate status
$validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
if (!in_array($data['status'], $validStatuses)) {
    returnError("Invalid status");
}

// Connect to database
$conn = connectDB();

// Update booking status
$stmt = $conn->prepare("UPDATE bookings SET status = ? WHERE id = ?");
$stmt->bind_param("ss", $data['status'], $data['id']);

if ($stmt->execute()) {
    // If status is updated to confirmed, send confirmation email
    if ($data['status'] === 'confirmed') {
        // Get booking details
        $bookingStmt = $conn->prepare("SELECT name, email, date, time_slot, vehicle FROM bookings WHERE id = ?");
        $bookingStmt->bind_param("s", $data['id']);
        $bookingStmt->execute();
        $bookingResult = $bookingStmt->get_result();
        
        if ($bookingResult && $bookingResult->num_rows > 0) {
            $booking = $bookingResult->fetch_assoc();
            
            // Send confirmation email
            $subject = "Booking Confirmed - Jamie's Auto Care";
            $message = "
            <html>
            <head>
                <title>Booking Confirmed</title>
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
                    <h1>Booking Confirmed</h1>
                    <p>Dear {$booking['name']},</p>
                    <p>Your booking with Jamie's Auto Care has been confirmed!</p>
                    <div class='details'>
                        <p><span class='label'>Booking Reference:</span> {$data['id']}</p>
                        <p><span class='label'>Date:</span> {$booking['date']}</p>
                        <p><span class='label'>Time:</span> {$booking['time_slot']}</p>
                        <p><span class='label'>Vehicle:</span> {$booking['vehicle']}</p>
                    </div>
                    <p>If you need to make any changes to your booking, please contact us at $admin_email or call us at 07463451967.</p>
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
            mail($booking['email'], $subject, $message, $headers);
        }
        
        $bookingStmt->close();
    }
    
    returnJSON([
        'success' => true,
        'message' => 'Booking status updated successfully'
    ]);
} else {
    returnError("Error updating booking status: " . $stmt->error);
}

$stmt->close();
$conn->close();
?>
