<?php
require_once '../config.php';

// Only allow PATCH requests
if ($_SERVER['REQUEST_METHOD'] !== 'PATCH') {
    returnError("Method not allowed", 405);
}

// Authenticate admin
authenticateAdmin();

// Get request body
$data = json_decode(file_get_contents('php://input'), true);
if (!$data) {
    returnError("Invalid request data");
}

// Validate required fields
validateRequiredFields($data, ['id', 'status']);

// Validate status
$validStatuses = ['pending', 'paid', 'overdue'];
if (!in_array($data['status'], $validStatuses)) {
    returnError("Invalid status");
}

// Connect to database
$conn = connectDB();

// Update invoice status
$stmt = $conn->prepare("UPDATE invoices SET status = ?, paid_date = ? WHERE id = ?");
$paidDate = ($data['status'] === 'paid') ? date('Y-m-d') : null;
$stmt->bind_param("sss", $data['status'], $paidDate, $data['id']);
$stmt->execute();

if ($stmt->affected_rows === 0) {
    returnError("Invoice not found or status not changed", 404);
}

returnJSON([
    'success' => true,
    'message' => 'Invoice status updated successfully'
]);

$conn->close();
?>
