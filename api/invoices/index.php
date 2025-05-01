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
$startDate = isset($_GET['startDate']) ? $_GET['startDate'] : null;
$endDate = isset($_GET['endDate']) ? $_GET['endDate'] : null;
$customerId = isset($_GET['customerId']) ? $_GET['customerId'] : null;
$search = isset($_GET['search']) ? $_GET['search'] : null;

// Build query
$query = "SELECT id, customer_id, customer_name, date, due_date, subtotal, tax, total, status, paid_date, created_at FROM invoices";
$conditions = [];
$params = [];
$types = "";

// Add filters
if ($status) {
    $conditions[] = "status = ?";
    $params[] = $status;
    $types .= "s";
}

if ($startDate) {
    $conditions[] = "date >= ?";
    $params[] = $startDate;
    $types .= "s";
}

if ($endDate) {
    $conditions[] = "date <= ?";
    $params[] = $endDate;
    $types .= "s";
}

if ($customerId) {
    $conditions[] = "customer_id = ?";
    $params[] = $customerId;
    $types .= "s";
}

if ($search) {
    $conditions[] = "(id LIKE ? OR customer_name LIKE ?)";
    $searchParam = "%$search%";
    $params[] = $searchParam;
    $params[] = $searchParam;
    $types .= "ss";
}

// Add WHERE clause if conditions exist
if (count($conditions) > 0) {
    $query .= " WHERE " . implode(" AND ", $conditions);
}

// Add order by and limit
$query .= " ORDER BY created_at DESC LIMIT ? OFFSET ?";
$params[] = $limit;
$params[] = $offset;
$types .= "ii";

// Prepare and execute query
$stmt = $conn->prepare($query);
if ($params) {
    $stmt->bind_param($types, ...$params);
}
$stmt->execute();
$result = $stmt->get_result();

// Get total count for pagination
$countQuery = "SELECT COUNT(*) as total FROM invoices";
if (count($conditions) > 0) {
    $countQuery .= " WHERE " . implode(" AND ", $conditions);
}
$countStmt = $conn->prepare($countQuery);
if ($params && count($conditions) > 0) {
    // Remove limit and offset from params
    array_pop($params);
    array_pop($params);
    $countTypes = substr($types, 0, -2);
    $countStmt->bind_param($countTypes, ...$params);
}
$countStmt->execute();
$countResult = $countStmt->get_result();
$totalCount = $countResult->fetch_assoc()['total'];

// Fetch invoices
$invoices = [];
while ($row = $result->fetch_assoc()) {
    // Format dates
    $row['date'] = date('Y-m-d', strtotime($row['date']));
    $row['due_date'] = date('Y-m-d', strtotime($row['due_date']));
    if ($row['paid_date']) {
        $row['paid_date'] = date('Y-m-d', strtotime($row['paid_date']));
    }
    $row['created_at'] = date('c', strtotime($row['created_at']));
    
    $invoices[] = $row;
}

returnJSON([
    'success' => true,
    'invoices' => $invoices,
    'total' => $totalCount,
    'limit' => $limit,
    'offset' => $offset
]);

$conn->close();
?>
