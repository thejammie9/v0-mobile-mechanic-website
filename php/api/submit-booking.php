<?php
// Set headers to allow cross-origin requests
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Check if it's a POST request
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
    exit;
}

// Get form data
$name = isset($_POST["name"]) ? $_POST["name"] : "";
$email = isset($_POST["email"]) ? $_POST["email"] : "";
$phone = isset($_POST["phone"]) ? $_POST["phone"] : "";
$vehicle = isset($_POST["vehicle"]) ? $_POST["vehicle"] : "";
$issue = isset($_POST["issue"]) ? $_POST["issue"] : "";
$date = isset($_POST["date"]) ? $_POST["date"] : "";
$timeSlot = isset($_POST["timeSlot"]) ? $_POST["timeSlot"] : "";

// Validate required fields
if (empty($name) || empty($email) || empty($phone) || empty($vehicle) || empty($issue) || empty($date) || empty($timeSlot)) {
    echo json_encode(["success" => false, "message" => "All fields are required"]);
    exit;
}

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success" => false, "message" => "Invalid email address"]);
    exit;
}

// In a real implementation, you would save this data to a database
// For now, we'll just send an email

// Generate a booking ID
$bookingId = uniqid("booking_");

// Generate a cancellation token
$cancellationToken = bin2hex(random_bytes(16));

// Send email to admin
$adminEmail = "YOUR_ADMIN_EMAIL"; // Replace with your email
$subject = "New Booking Request - Jamie's Auto Care";
$message = "
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
            <p><span class='label'>Booking ID:</span> $bookingId</p>
            <p><span class='label'>Name:</span> $name</p>
            <p><span class='label'>Email:</span> $email</p>
            <p><span class='label'>Phone:</span> $phone</p>
            <p><span class='label'>Vehicle:</span> $vehicle</p>
            <p><span class='label'>Issue:</span> $issue</p>
            <p><span class='label'>Date:</span> $date</p>
            <p><span class='label'>Time Slot:</span> $timeSlot</p>
        </div>
    </div>
</body>
</html>
";

// Set headers for HTML email
$headers = "MIME-Version: 1.0" . "\r\n";
$headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
$headers .= "From: Jamie's Auto Care <noreply@jamiesautocare.com>" . "\r\n";

// Send email to admin
$adminEmailSent = mail($adminEmail, $subject, $message, $headers);

// Send confirmation email to customer
$customerSubject = "Booking Confirmation - Jamie's Auto Care";
$siteUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]";
$cancellationUrl = "$siteUrl/bookings/cancel.php?id=$bookingId&token=$cancellationToken";

$customerMessage = "
<html>
<head>
    <title>Booking Confirmation</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; }
        h1 { color: #1e3a8a; }
        .details { background-color: #f9fafb; padding: 15px; border-radius: 5px; }
        .label { font-weight: bold; }
        .button { display: inline-block; background-color: #ea580c; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; }
    </style>
</head>
<body>
    <div class='container'>
        <h1>Booking Confirmation</h1>
        <p>Dear $name,</p>
        <p>Thank you for booking with Jamie's Auto Care. We have received your request and will contact you shortly to confirm your appointment.</p>
        <div class='details'>
            <p><span class='label'>Booking Reference:</span> $bookingId</p>
            <p><span class='label'>Date:</span> $date</p>
            <p><span class='label'>Time:</span> $timeSlot</p>
            <p><span class='label'>Vehicle:</span> $vehicle</p>
            <p><span class='label'>Issue:</span> $issue</p>
        </div>
        <p>If you need to make any changes to your booking, please contact us at $adminEmail or call us at 07463451967.</p>
        <p>If you need to cancel your booking, please <a href='$cancellationUrl'>click here</a>.</p>
        <p>We look forward to serving you!</p>
        <p>Best regards,<br>Jamie's Auto Care Team</p>
    </div>
</body>
</html>
";

// Send email to customer
$customerEmailSent = mail($email, $customerSubject, $customerMessage, $headers);

// Return success response
echo json_encode([
    "success" => true,
    "message" => "Booking submitted successfully!",
    "bookingId" => $bookingId
]);
?>
