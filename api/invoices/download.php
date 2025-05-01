<?php
require_once '../config.php';
require_once '../vendor/autoload.php'; // For PDF generation

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    returnError("Method not allowed", 405);
}

// Get query parameters
$id = isset($_GET['id']) ? $_GET['id'] : null;
$format = isset($_GET['format']) ? $_GET['format'] : 'pdf';
$auth = isset($_GET['auth']) ? $_GET['auth'] : null;

if (!$id) {
    returnError("Invoice ID is required");
}

// Validate auth token
if (!$auth || $auth !== $GLOBALS['admin_password']) {
    returnError("Unauthorized", 401);
}

// Connect to database
$conn = connectDB();

// Get invoice
$stmt = $conn->prepare("SELECT id, customer_id, customer_name, date, due_date, subtotal, tax, total, status, paid_date FROM invoices WHERE id = ?");
$stmt->bind_param("s", $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    returnError("Invoice not found", 404);
}

$invoice = $result->fetch_assoc();

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

// Company details
$companyDetails = [
    'name' => "Jamie's Auto Care",
    'address' => "123 Main Street",
    'city' => "Edinburgh",
    'postcode' => "EH1 1AA",
    'phone' => "07123456789",
    'email' => "info@jamiesautocare.com",
    'companyNumber' => "SC123456",
    'vatNumber' => "GB123456789"
];

// Generate output based on format
if ($format === 'pdf') {
    // For PDF generation, you would typically use a library like TCPDF or FPDF
    require_once '../vendor/tecnickcom/tcpdf/tcpdf.php';
    
    // Create new PDF document
    $pdf = new TCPDF('P', 'mm', 'A4', true, 'UTF-8', false);
    
    // Set document information
    $pdf->SetCreator($companyDetails['name']);
    $pdf->SetAuthor($companyDetails['name']);
    $pdf->SetTitle('Invoice ' . $invoice['id']);
    $pdf->SetSubject('Invoice ' . $invoice['id']);
    
    // Remove default header/footer
    $pdf->setPrintHeader(false);
    $pdf->setPrintFooter(false);
    
    // Set margins
    $pdf->SetMargins(15, 15, 15);
    
    // Set auto page breaks
    $pdf->SetAutoPageBreak(TRUE, 15);
    
    // Add a page
    $pdf->AddPage();
    
    // Set font
    $pdf->SetFont('helvetica', '', 10);
    
    // Invoice title
    $pdf->SetFont('helvetica', 'B', 20);
    $pdf->SetTextColor(37, 99, 235);
    $pdf->Cell(0, 10, 'INVOICE', 0, 1, 'L');
    $pdf->SetTextColor(0, 0, 0);
    $pdf->SetFont('helvetica', '', 10);
    $pdf->Ln(5);
    
    // Company and invoice details
    $pdf->SetFont('helvetica', 'B', 12);
    $pdf->Cell(95, 5, $companyDetails['name'], 0, 0);
    $pdf->Cell(95, 5, 'Invoice Details', 0, 1, 'R');
    $pdf->SetFont('helvetica', '', 10);
    
    $pdf->Cell(95, 5, $companyDetails['address'], 0, 0);
    $pdf->Cell(95, 5, 'Invoice Number: ' . $invoice['id'], 0, 1, 'R');
    
    $pdf->Cell(95, 5, $companyDetails['city'] . ', ' . $companyDetails['postcode'], 0, 0);
    $pdf->Cell(95, 5, 'Date: ' . date('d M Y', strtotime($invoice['date'])), 0, 1, 'R');
    
    $pdf->Cell(95, 5, 'Phone: ' . $companyDetails['phone'], 0, 0);
    $pdf->Cell(95, 5, 'Due Date: ' . date('d M Y', strtotime($invoice['due_date'])), 0, 1, 'R');
    
    $pdf->Cell(95, 5, 'Email: ' . $companyDetails['email'], 0, 0);
    $pdf->Cell(95, 5, 'Status: ' . ucfirst($invoice['status']), 0, 1, 'R');
    
    $pdf->Cell(95, 5, 'Company No: ' . $companyDetails['companyNumber'], 0, 0);
    if ($invoice['paid_date']) {
        $pdf->Cell(95, 5, 'Paid Date: ' . date('d M Y', strtotime($invoice['paid_date'])), 0, 1, 'R');
    } else {
        $pdf->Ln(5);
    }
    
    $pdf->Cell(95, 5, 'VAT No: ' . $companyDetails['vatNumber'], 0, 1);
    
    $pdf->Ln(5);
    
    // Customer details
    $pdf->SetFont('helvetica', 'B', 12);
    $pdf->Cell(0, 5, 'Bill To', 0, 1);
    $pdf->SetFont('helvetica', 'B', 10);
    $pdf->Cell(0, 5, $invoice['customer_name'], 0, 1);
    $pdf->SetFont('helvetica', '', 10);
    
    $pdf->Ln(5);
    
    // Labor section
    $pdf->SetFont('helvetica', 'B', 12);
    $pdf->Cell(0, 5, 'Labor', 0, 1);
    $pdf->SetFont('helvetica', '', 10);
    $pdf->Ln(2);
    
    // Labor table header
    $pdf->SetFillColor(243, 244, 246);
    $pdf->SetFont('helvetica', 'B', 10);
    $pdf->Cell(90, 7, 'Description', 1, 0, 'L', true);
    $pdf->Cell(30, 7, 'Hours', 1, 0, 'L', true);
    $pdf->Cell(30, 7, 'Rate (£/h)', 1, 0, 'L', true);
    $pdf->Cell(30, 7, 'Total (£)', 1, 1, 'L', true);
    
    // Labor table rows
    $pdf->SetFont('helvetica', '', 10);
    foreach ($labor as $item) {
        $pdf->Cell(90, 7, $item['description'], 1);
        $pdf->Cell(30, 7, $item['hours'], 1);
        $pdf->Cell(30, 7, number_format($item['hourlyRate'], 2), 1);
        $pdf->Cell(30, 7, number_format($item['total'], 2), 1, 1);
    }
    
    $pdf->Ln(5);
    
    // Parts section
    $pdf->SetFont('helvetica', 'B', 12);
    $pdf->Cell(0, 5, 'Parts', 0, 1);
    $pdf->SetFont('helvetica', '', 10);
    $pdf->Ln(2);
    
    // Parts table header
    $pdf->SetFillColor(243, 244, 246);
    $pdf->SetFont('helvetica', 'B', 10);
    $pdf->Cell(90, 7, 'Part Name', 1, 0, 'L', true);
    $pdf->Cell(30, 7, 'Quantity', 1, 0, 'L', true);
    $pdf->Cell(30, 7, 'Price (£)', 1, 0, 'L', true);
    $pdf->Cell(30, 7, 'Total (£)', 1, 1, 'L', true);
    
    // Parts table rows
    $pdf->SetFont('helvetica', '', 10);
    foreach ($parts as $part) {
        $pdf->Cell(90, 7, $part['name'], 1);
        $pdf->Cell(30, 7, $part['quantity'], 1);
        $pdf->Cell(30, 7, number_format($part['price'], 2), 1);
        $pdf->Cell(30, 7, number_format($part['total'], 2), 1, 1);
    }
    
    $pdf->Ln(5);
    
    // Totals
    $pdf->Cell(120);
    $pdf->Cell(40, 7, 'Subtotal:', 0, 0, 'R');
    $pdf->Cell(20, 7, '£' . number_format($invoice['subtotal'], 2), 0, 1, 'R');
    
    $pdf->Cell(120);
    $pdf->Cell(40, 7, 'VAT (20%):', 0, 0, 'R');
    $pdf->Cell(20, 7, '£' . number_format($invoice['tax'], 2), 0, 1, 'R');
    
    $pdf->SetFont('helvetica', 'B', 10);
    $pdf->Cell(120);
    $pdf->Cell(40, 7, 'Total:', 'T', 0, 'R');
    $pdf->Cell(20, 7, '£' . number_format($invoice['total'], 2), 'T', 1, 'R');
    
    $pdf->Ln(10);
    
    // Payment terms
    $pdf->SetFont('helvetica', 'B', 10);
    $pdf->Cell(0, 5, 'Payment Terms:', 0, 1);
    $pdf->SetFont('helvetica', '', 10);
    $pdf->Cell(0, 5, 'Payment is due upon receipt.', 0, 1);
    $pdf->Ln(5);
    $pdf->Cell(0, 5, 'Thank you for your business!', 0, 1);
    
    // Close and output PDF
    $pdf->Output('invoice_' . $invoice['id'] . '.pdf', 'D');
    exit;
} else {
    returnError("Invalid format. Supported format: pdf", 400);
}

$conn->close();
?>
