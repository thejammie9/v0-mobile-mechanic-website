<?php
require_once '../config.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
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
$requiredFields = ['customerId', 'customerName', 'date', 'dueDate', 'labor', 'parts', 'subtotal', 'tax', 'total', 'status'];
validateRequiredFields($data, $requiredFields);

// Connect to database
$conn = connectDB();

// Generate invoice ID
$year = date('Y');
$stmt = $conn->prepare("SELECT COUNT(*) as count FROM invoices WHERE id LIKE ?");
$idPrefix = "INV-$year-";
$stmt->bind_param("s", $searchPattern);
$searchPattern = "$idPrefix%";
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();
$count = $row['count'] + 1;
$invoiceId = $idPrefix . str_pad($count, 3, '0', STR_PAD_LEFT);

// Start transaction
$conn->begin_transaction();

try {
    // Insert invoice
    $stmt = $conn->prepare("INSERT INTO invoices (id, customer_id, customer_name, date, due_date, subtotal, tax, total, status, paid_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $paidDate = ($data['status'] === 'paid') ? date('Y-m-d') : null;
    $stmt->bind_param("sssssdddss", $invoiceId, $data['customerId'], $data['customerName'], $data['date'], $data['dueDate'], $data['subtotal'], $data['tax'], $data['total'], $data['status'], $paidDate);
    $stmt->execute();

    // Insert labor items
    $laborStmt = $conn->prepare("INSERT INTO invoice_labor (invoice_id, description, hours, hourly_rate, total) VALUES (?, ?, ?, ?, ?)");
    foreach ($data['labor'] as $labor) {
        $laborStmt->bind_param("ssddd", $invoiceId, $labor['description'], $labor['hours'], $labor['hourlyRate'], $labor['total']);
        $laborStmt->execute();
    }

    // Insert parts items
    $partsStmt = $conn->prepare("INSERT INTO invoice_parts (invoice_id, name, quantity, price, total) VALUES (?, ?, ?, ?, ?)");
    foreach ($data['parts'] as $part) {
        $partsStmt->bind_param("ssidd", $invoiceId, $part['name'], $part['quantity'], $part['price'], $part['total']);
        $partsStmt->execute();
    }

    // Commit transaction
    $conn->commit();

    returnJSON([
        'success' => true,
        'message' => 'Invoice created successfully',
        'invoiceId' => $invoiceId
    ]);
} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    returnError("Error creating invoice: " . $e->getMessage());
}

$conn->close();
?>
