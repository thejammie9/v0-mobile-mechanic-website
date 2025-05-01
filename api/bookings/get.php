<?php
require_once '../config.php';

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    returnError("Method not allowed", 405);
}

// Get booking ID from query parameters
$id = isset($_GET['id']) ? $_GET['id'] : null;
$token = isset($_GET['token']) ? $_GET['token'] : null;

if (!$id) {
    returnError("Booking ID is required");
}

// Connect to database
$conn = connectDB();

// Build query
$query = "SELECT id, name, email, phone, vehicle, issue, date, time_slot as timeSlot, status, created_at as createdAt FROM bookings WHERE id = ?";
$params = [$id];
$types = "s";

// If token is provided, add it to the query
if ($token) {
    $query .= " AND cancellation_token = ?";
    $params[] = $token;
    $types .= "s";
} else {
    // If no token, require admin authentication
    authenticateAdmin();
}

// Prepare and execute query
$stmt = $conn->prepare($query);
$stmt->bind_param($types, ...$params);
$stmt->execute();
$result = $stmt->get_result();

if ($result && $result->num_rows > 0) {
    $booking = $result->fetch_assoc();
    
    // Format date for consistency
    $booking['date'] = date('Y-m-d', strtotime($booking['date']));
    $booking['createdAt'] = date('c', strtotime($booking['createdAt']));
    
    returnJSON([
        'success' => true,
        'booking' => $booking
    ]);
} else {
    returnError("Booking not found", 404);
}

$stmt->close();
$conn->close();
?>
