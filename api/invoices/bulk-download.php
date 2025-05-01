<?php
require_once '../config.php';
require_once '../vendor/autoload.php'; // For PDF generation

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    returnError("Method not allowed", 405);
}

// Authenticate admin
authenticateAdmin();

// Get query parameters
$format = isset($_GET['format']) ? $_GET['format'] : 'csv';
$startDate = isset($_GET['startDate']) ? $_GET['startDate'] : null;
$endDate = isset($_GET['endDate']) ? $_GET['endDate'] : null;
$status = isset($_GET['status']) ? $_GET['status'] : null;
$ids = isset($_GET['ids']) ? explode(',', $_GET['ids']) : null;

// Connect to database
$conn = connectDB();

// Build query
$query = "SELECT id, customer_name, date, due_date, subtotal, tax, total, status, paid_date FROM invoices";
$conditions = [];
$params = [];
$types = "";

// Add filters
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

if ($status) {
    $conditions[] = "status = ?";
    $params[] = $status;
    $types .= "s";
}

if ($ids) {
    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $conditions[] = "id IN ($placeholders)";
    foreach ($ids as $id) {
        $params[] = $id;
        $types .= "s";
    }
}

// Add WHERE clause if conditions exist
if (count($conditions) > 0) {
    $query .= " WHERE " . implode(" AND ", $conditions);
}

// Add order by
$query .= " ORDER BY date DESC";

// Prepare and execute query
$stmt = $conn->prepare($query);
if ($params) {
    $stmt->bind_param($types, ...$params);
}
$stmt->execute();
$result = $stmt->get_result();

// Check if any invoices found
if ($result->num_rows === 0) {
    returnError("No invoices found matching the criteria", 404);
}

// Generate output based on format
if ($format === 'csv') {
    // Set headers for CSV download
    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="invoices_' . date('Y-m-d') . '.csv"');
    
    // Create CSV file
    $output = fopen('php://output', 'w');
    
    // Add CSV headers
    fputcsv($output, ['Invoice ID', 'Customer', 'Date', 'Due Date', 'Subtotal', 'Tax', 'Total', 'Status', 'Paid Date']);
    
    // Add invoice data
    while ($row = $result->fetch_assoc()) {
        fputcsv($output, [
            $row['id'],
            $row['customer_name'],
            $row['date'],
            $row['due_date'],
            $row['subtotal'],
            $row['tax'],
            $row['total'],
            $row['status'],
            $row['paid_date'] ?: 'N/A'
        ]);
    }
    
    fclose($output);
    exit;
} elseif ($format === 'pdf') {
    // For PDF generation, you would typically use a library like TCPDF or FPDF
    // This is a simplified example
    require_once '../vendor/tecnickcom/tcpdf/tcpdf.php';
    
    // Create new PDF document
    $pdf = new TCPDF('L', 'mm', 'A4', true, 'UTF-8', false);
    
    // Set document information
    $pdf->SetCreator('Jamie\'s Auto Care');
    $pdf->SetAuthor('Jamie\'s Auto Care');
    $pdf->SetTitle('Invoices Report');
    $pdf->SetSubject('Invoices Report');
    
    // Set default header data
    $pdf->SetHeaderData('', 0, 'Invoices Report', 'Generated on ' . date('Y-m-d H:i:s'));
    
    // Set margins
    $pdf->SetMargins(10, 20, 10);
    $pdf->SetHeaderMargin(10);
    $pdf->SetFooterMargin(10);
    
    // Set auto page breaks
    $pdf->SetAutoPageBreak(TRUE, 15);
    
    // Add a page
    $pdf->AddPage();
    
    // Create table header
    $html = '<table border="1" cellpadding="5">
        <thead>
            <tr>
                <th>Invoice ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Due Date</th>
                <th>Subtotal</th>
                <th>Tax</th>
                <th>Total</th>
                <th>Status</th>
                <th>Paid Date</th>
            </tr>
        </thead>
        <tbody>';
    
    // Add invoice data
    while ($row = $result->fetch_assoc()) {
        $html .= '<tr>
            <td>' . $row['id'] . '</td>
            <td>' . $row['customer_name'] . '</td>
            <td>' . $row['date'] . '</td>
            <td>' . $row['due_date'] . '</td>
            <td>£' . number_format($row['subtotal'], 2) . '</td>
            <td>£' . number_format($row['tax'], 2) . '</td>
            <td>£' . number_format($row['total'], 2) . '</td>
            <td>' . ucfirst($row['status']) . '</td>
            <td>' . ($row['paid_date'] ?: 'N/A') . '</td>
        </tr>';
    }
    
    $html .= '</tbody></table>';
    
    // Print table
    $pdf->writeHTML($html, true, false, true, false, '');
    
    // Close and output PDF
    $pdf->Output('invoices_' . date('Y-m-d') . '.pdf', 'D');
    exit;
} else {
    returnError("Invalid format. Supported formats: csv, pdf", 400);
}

$conn->close();
?>
