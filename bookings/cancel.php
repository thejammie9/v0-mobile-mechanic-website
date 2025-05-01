<?php
// Include API config
require_once '../api/config.php';

// Get booking ID and token from query parameters
$id = isset($_GET['id']) ? $_GET['id'] : null;
$token = isset($_GET['token']) ? $_GET['token'] : null;

$booking = null;
$error = null;
$cancelled = false;

// If ID and token are provided, try to get booking details
if ($id && $token) {
    // Connect to database
    $conn = connectDB();
    
    // Get booking details
    $stmt = $conn->prepare("SELECT name, email, date, time_slot, vehicle, status FROM bookings WHERE id = ? AND cancellation_token = ?");
    $stmt->bind_param("ss", $id, $token);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result && $result->num_rows > 0) {
        $booking = $result->fetch_assoc();
        
        // Check if booking is already cancelled
        if ($booking['status'] === 'cancelled') {
            $error = "This booking has already been cancelled.";
        }
        
        // Process cancellation if form is submitted
        if (isset($_POST['confirm']) && $_POST['confirm'] === 'yes') {
            // Update booking status to cancelled
            $updateStmt = $conn->prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ?");
            $updateStmt->bind_param("s", $id);
            
            if ($updateStmt->execute()) {
                $cancelled = true;
                
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
                            <p><span class='label'>Booking Reference:</span> $id</p>
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
                            <p><span class='label'>Booking Reference:</span> $id</p>
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
            } else {
                $error = "Error cancelling booking. Please try again.";
            }
            
            $updateStmt->close();
        }
    } else {
        $error = "Invalid booking ID or cancellation token.";
    }
    
    $stmt->close();
    $conn->close();
} else {
    $error = "Missing booking ID or cancellation token.";
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cancel Booking - Jamie's Auto Care</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100">
    <header class="bg-blue-900 text-white py-4">
        <div class="container mx-auto px-4">
            <div class="flex items-center">
                <a href="/" class="flex items-center text-gray-300 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Back to Home</span>
                </a>
                <div class="mx-auto font-bold">Jamie's Auto Care</div>
            </div>
        </div>
    </header>

    <div class="container mx-auto px-4 py-8">
        <div class="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
            <?php if ($cancelled): ?>
                <h1 class="text-2xl font-bold mb-4 text-green-600">Booking Cancelled</h1>
                <p class="mb-4">Your booking has been successfully cancelled. A confirmation email has been sent to your registered email address.</p>
                <div class="flex justify-center">
                    <a href="/" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Return to Homepage
                    </a>
                </div>
            <?php elseif ($error): ?>
                <h1 class="text-2xl font-bold mb-4 text-red-600">Error</h1>
                <p class="mb-4"><?php echo htmlspecialchars($error); ?></p>
                <div class="flex justify-center">
                    <a href="/" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Return to Homepage
                    </a>
                </div>
            <?php elseif ($booking): ?>
                <h1 class="text-2xl font-bold mb-4">Cancel Booking</h1>
                <p class="mb-4">Are you sure you want to cancel your booking for <strong><?php echo htmlspecialchars($booking['vehicle']); ?></strong> on <strong><?php echo htmlspecialchars($booking['date']); ?></strong> at <strong><?php echo htmlspecialchars($booking['time_slot']); ?></strong>?</p>
                
                <form method="post" class="mt-6">
                    <input type="hidden" name="confirm" value="yes">
                    <div class="flex justify-center space-x-4">
                        <button type="submit" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                            Yes, Cancel Booking
                        </button>
                        <a href="/" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                            No, Keep Booking
                        </a>
                    </div>
                </form>
            <?php else: ?>
                <h1 class="text-2xl font-bold mb-4 text-red-600">Invalid Request</h1>
                <p class="mb-4">The cancellation link is invalid or has expired.</p>
                <div class="flex justify-center">
                    <a href="/" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Return to Homepage
                    </a>
                </div>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>
