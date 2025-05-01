<?php
require_once '../config.php';

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    returnError("Method not allowed", 405);
}

// Authenticate admin
authenticateAdmin();

// Get invoice ID from query parameters
$id = isset($_GET['id']) ? $_GET['id'] : null;

if (!$id) {
    returnError("Invoice ID is required");
}

// Connect to database
$conn = connectDB();

// Get invoice
$stmt = $conn->prepare("SELECT id, customer_id, customer_name, date, due_date, subtotal, tax, total, status, paid_date, created_at FROM invoices WHERE id = ?");
$stmt->bind_param("s", $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    returnError("Invoice not found", 404);
}

$invoice = $result->fetch_assoc();

// Format dates
$invoice['date'] = date('Y-m-d', strtotime($invoice['date']));
$invoice['due_date'] = date('Y-m-d', strtotime($invoice['due_date']));
if ($invoice['paid_date']) {
    $invoice['paid_date'] = date('Y-m-d', strtotime($invoice['paid_date']));
}
$invoice['created_at'] = date('c', strtotime($invoice['created_at']));

// Get labor items
$laborStmt = $conn->prepare("SELECT description, hours, hourly_rate as hourlyRate, total FROM invoice_labor WHERE invoice_id = ?");
$laborStmt->bind_param("s", $id);
$laborStmt->execute();
$laborResult = $laborStmt->get_result();

$labor = [];
while ($row = $laborResult->fetch_assoc()) {
    $labor[] = $row;
}

// Get parts items
$partsStmt = $conn->prepare("SELECT name, quantity, price, total FROM invoice_parts WHERE invoice_id = ?");
$partsStmt->bind_param("s", $id);
$partsStmt->execute();
$partsResult = $partsStmt->get_result();

$parts = [];
while ($row = $partsResult->fetch_assoc()) {
    $parts[] = $row;
}

// Add labor and parts to invoice
$invoice['labor'] = $labor;
$invoice['parts'] = $parts;

returnJSON([
    'success' => true,
    'invoice' => $invoice
]);

$conn->close();
?>
