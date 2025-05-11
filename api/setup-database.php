<?php
// Database configuration
$host = getenv('DB_HOST') ?: 'localhost';
$user = getenv('DB_USER') ?: 'root';
$password = getenv('DB_PASSWORD') ?: '';
$database = getenv('DB_NAME') ?: 'mobile_mechanic';

// Create connection
$conn = new mysqli($host, $user, $password);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "<h1>Database Setup</h1>";

// Create database if it doesn't exist
$sql = "CREATE DATABASE IF NOT EXISTS $database";
if ($conn->query($sql) === TRUE) {
    echo "<p>Database created successfully or already exists</p>";
} else {
    echo "<p>Error creating database: " . $conn->error . "</p>";
}

// Select the database
$conn->select_db($database);

// Create bookings table
$sql = "CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    vehicle VARCHAR(255) NOT NULL,
    vehicle_reg VARCHAR(20) DEFAULT NULL,
    issue TEXT NOT NULL,
    booking_date DATE NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    created_at DATETIME NOT NULL,
    cancellation_token VARCHAR(100) DEFAULT NULL,
    address VARCHAR(255) DEFAULT NULL,
    postcode VARCHAR(10) DEFAULT NULL,
    service_type VARCHAR(100) DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    completed_at DATETIME DEFAULT NULL,
    service_performed VARCHAR(255) DEFAULT NULL,
    cost VARCHAR(50) DEFAULT NULL
)";

if ($conn->query($sql) === TRUE) {
    echo "<p>Bookings table created successfully or already exists</p>";
} else {
    echo "<p>Error creating bookings table: " . $conn->error . "</p>";
}

// Create invoices table
$sql = "CREATE TABLE IF NOT EXISTS invoices (
    id VARCHAR(20) PRIMARY KEY,
    customer_id VARCHAR(20) DEFAULT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100) DEFAULT NULL,
    customer_phone VARCHAR(20) DEFAULT NULL,
    date DATETIME NOT NULL,
    due_date DATETIME NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    status ENUM('draft', 'pending', 'paid', 'overdue') NOT NULL DEFAULT 'pending',
    notes TEXT DEFAULT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME DEFAULT NULL
)";

if ($conn->query($sql) === TRUE) {
    echo "<p>Invoices table created successfully or already exists</p>";
} else {
    echo "<p>Error creating invoices table: " . $conn->error . "</p>";
}

// Create invoice_labor table
$sql = "CREATE TABLE IF NOT EXISTS invoice_labor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id VARCHAR(20) NOT NULL,
    description VARCHAR(255) NOT NULL,
    hours DECIMAL(5, 2) NOT NULL,
    hourly_rate DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
)";

if ($conn->query($sql) === TRUE) {
    echo "<p>Invoice labor table created successfully or already exists</p>";
} else {
    echo "<p>Error creating invoice labor table: " . $conn->error . "</p>";
}

// Create invoice_parts table
$sql = "CREATE TABLE IF NOT EXISTS invoice_parts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
)";

if ($conn->query($sql) === TRUE) {
    echo "<p>Invoice parts table created successfully or already exists</p>";
} else {
    echo "<p>Error creating invoice parts table: " . $conn->error . "</p>";
}

// Create customers table
$sql = "CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address VARCHAR(255) DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    created_at DATETIME NOT NULL
)";

if ($conn->query($sql) === TRUE) {
    echo "<p>Customers table created successfully or already exists</p>";
} else {
    echo "<p>Error creating customers table: " . $conn->error . "</p>";
}

// Create vehicles table
$sql = "CREATE TABLE IF NOT EXISTS vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id VARCHAR(20) NOT NULL,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year VARCHAR(4) DEFAULT NULL,
    registration VARCHAR(20) DEFAULT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
)";

if ($conn->query($sql) === TRUE) {
    echo "<p>Vehicles table created successfully or already exists</p>";
} else {
    echo "<p>Error creating vehicles table: " . $conn->error . "</p>";
}

// Check if there are any bookings
$result = $conn->query("SELECT COUNT(*) as count FROM bookings");
$row = $result->fetch_assoc();
echo "<p>Current number of bookings: " . $row['count'] . "</p>";

// Check if there are any invoices
$result = $conn->query("SELECT COUNT(*) as count FROM invoices");
$row = $result->fetch_assoc();
echo "<p>Current number of invoices: " . $row['count'] . "</p>";

// Check if there are any customers
$result = $conn->query("SELECT COUNT(*) as count FROM customers");
$row = $result->fetch_assoc();
echo "<p>Current number of customers: " . $row['count'] . "</p>";

// Close connection
$conn->close();

echo "<h2>Database setup completed!</h2>";
echo "<p>You can now return to your application.</p>";
?>
