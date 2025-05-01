<?php
// Database configuration
$db_host = getenv('DB_HOST') ?: 'localhost';
$db_user = getenv('DB_USER') ?: 'root';
$db_password = getenv('DB_PASSWORD') ?: '';
$db_name = getenv('DB_NAME') ?: 'mobile_mechanic';
$admin_email = getenv('ADMIN_EMAIL') ?: 'contact@jamiesautocare.com';
$admin_password = getenv('ADMIN_PASSWORD') ?: 'admin123'; // Change this in production!

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Connect to database
function connectDB() {
    global $db_host, $db_user, $db_password, $db_name;
    
    $conn = new mysqli($db_host, $db_user, $db_password, $db_name);
    
    if ($conn->connect_error) {
        returnError("Database connection failed: " . $conn->connect_error, 500);
    }
    
    return $conn;
}

// Helper function to return JSON response
function returnJSON($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit();
}

// Helper function to return error
function returnError($message, $status = 400) {
    returnJSON(['success' => false, 'message' => $message], $status);
}

// Helper function to generate a unique ID
function generateUniqueId() {
    return 'booking_' . time() . '_' . bin2hex(random_bytes(4));
}

// Helper function to generate a cancellation token
function generateCancellationToken() {
    return bin2hex(random_bytes(16));
}

// Helper function to validate required fields
function validateRequiredFields($data, $fields) {
    foreach ($fields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            returnError("Missing required field: $field");
        }
    }
}

// Helper function to sanitize input
function sanitizeInput($data) {
    $sanitized = [];
    foreach ($data as $key => $value) {
        if (is_string($value)) {
            $sanitized[$key] = htmlspecialchars(trim($value), ENT_QUOTES, 'UTF-8');
        } else {
            $sanitized[$key] = $value;
        }
    }
    return $sanitized;
}

// Helper function to validate email
function validateEmail($email) {
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        returnError("Invalid email address");
    }
}

// Helper function to validate date
function validateDate($date) {
    $d = DateTime::createFromFormat('Y-m-d', $date);
    if (!$d || $d->format('Y-m-d') !== $date) {
        returnError("Invalid date format. Please use YYYY-MM-DD");
    }
    
    // Check if date is at least 1 day in the future
    $today = new DateTime();
    $today->setTime(0, 0, 0);
    $minDate = clone $today;
    $minDate->modify('+1 day');
    
    $bookingDate = new DateTime($date);
    if ($bookingDate < $minDate) {
        returnError("Booking date must be at least 1 day in the future");
    }
}

// Helper function to validate time slot
function validateTimeSlot($timeSlot) {
    $validTimeSlots = [
        "Morning (09:00 - 12:30)",
        "Afternoon (13:30 - 17:30)",
        "Weekend Sat/Sun (10:30 - 13:30)"
    ];
    
    if (!in_array($timeSlot, $validTimeSlots)) {
        returnError("Invalid time slot");
    }
}

// Helper function to authenticate admin
function authenticateAdmin() {
    global $admin_password;
    
    // Get authorization header
    $headers = getallheaders();
    $auth = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    
    // Check if authorization header is present and valid
    if (empty($auth) || !preg_match('/^Bearer\s+(.*)$/', $auth, $matches)) {
        returnError("Unauthorized", 401);
    }
    
    $token = $matches[1];
    
    // In a real application, you would use a proper JWT or other token system
    // For simplicity, we're just checking if the token matches the admin password
    if ($token !== $admin_password) {
        returnError("Unauthorized", 401);
    }
}
?>
