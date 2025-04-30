<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit();
}

// Get form data
$data = json_decode(file_get_contents('php://input'), true);
if (!$data) {
  $data = $_POST;
}

// Validate required fields
if (!isset($data['name']) || !isset($data['email']) || !isset($data['phone'])) {
  echo json_encode(['success' => false, 'message' => 'Missing required fields']);
  exit;
}

// Connect to database
$conn = new mysqli('localhost', 'YOUR_DB_USER', 'YOUR_DB_PASSWORD', 'YOUR_DB_NAME');

if ($conn->connect_error) {
  echo json_encode(['success' => false, 'message' => 'Database connection failed']);
  exit;
}

// Generate booking ID and token
$bookingId = 'booking_' . time();
$cancellationToken = bin2hex(random_bytes(16));

// Insert booking
$stmt = $conn->prepare("INSERT INTO bookings (id, name, email, phone, vehicle, issue, booking_date, time_slot, status, created_at, cancellation_token) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), ?)");
$stmt->bind_param("sssssssss", $bookingId, $data['name'], $data['email'], $data['phone'], $data['vehicle'], $data['issue'], $data['date'], $data['timeSlot'], $cancellationToken);

if ($stmt->execute()) {
  // Send email notification
  $to = "contact@jamiesautocare.com";
  $subject = "New Booking: " . $data['name'];
  $message = "Name: " . $data['name'] . "\n";
  $message .= "Email: " . $data['email'] . "\n";
  $message .= "Phone: " . $data['phone'] . "\n";
  $message .= "Vehicle: " . $data['vehicle'] . "\n";
  $message .= "Issue: " . $data['issue'] . "\n";
  $message .= "Date: " . $data['date'] . "\n";
  $message .= "Time: " . $data['timeSlot'] . "\n";
  
  mail($to, $subject, $message);
  
  // Send confirmation to customer
  $customerSubject = "Your Booking Confirmation - Jamie's Auto Care";
  $customerMessage = "Dear " . $data['name'] . ",\n\n";
  $customerMessage .= "Thank you for booking with Jamie's Auto Care. We have received your request and will contact you shortly to confirm your appointment.\n\n";
  $customerMessage .= "Booking Details:\n";
  $customerMessage .= "Date: " . $data['date'] . "\n";
  $customerMessage .= "Time: " . $data['timeSlot'] . "\n";
  $customerMessage .= "Vehicle: " . $data['vehicle'] . "\n";
  $customerMessage .= "Issue: " . $data['issue'] . "\n\n";
  $customerMessage .= "If you need to make any changes to your booking, please contact us at contact@jamiesautocare.com or call us at 07463451967.\n\n";
  $customerMessage .= "We look forward to serving you!\n\n";
  $customerMessage .= "Best regards,\nJamie's Auto Care Team";
  
  mail($data['email'], $customerSubject, $customerMessage, "From: contact@jamiesautocare.com");
  
  echo json_encode(['success' => true, 'message' => 'Booking submitted successfully']);
} else {
  echo json_encode(['success' => false, 'message' => 'Failed to submit booking']);
}

$conn->close();
?>
