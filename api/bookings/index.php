<?php
require_once '../config.php';

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    returnError("Method not allowed", 405);
}

// Authenticate admin
authenticateAdmin();

// Connect to database
$conn = connectDB();

// Get query parameters
$status = isset($_GET['status']) ? $_GET['status'] : null;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
$offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

// Build query
$query = "SELECT id, name, email, phone, vehicle, issue, date, time_slot as timeSlot, status, created_at as createdAt FROM bookings";

// Add status filter if provided
if ($status) {
    $validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!in_array($status, $validStatuses)) {
        returnError("Invalid status");
    }
    $query .= " WHERE status = '$status'";
}

// Add order by and limit
$query .= " ORDER BY created_at DESC LIMIT $limit OFFSET $offset";

// Execute query
$result = $conn->query($query);

if ($result) {
    $bookings = [];
    while ($row = $result->fetch_assoc()) {
        // Format date for consistency
        $row['date'] = date('Y-m-d', strtotime($row['date']));
        $row['createdAt'] = date('c', strtotime($row['createdAt']));
        $bookings[] = $row;
    }
    
    returnJSON([
        'success' => true,
        'bookings' => $bookings,
        'count' => count($bookings),
        'limit' => $limit,
        'offset' => $offset
    ]);
} else {
    returnError("Error fetching bookings: " . $conn->error);
}

$conn->close();
?>
