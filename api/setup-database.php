<?php
// Database connection details
$host = getenv('DB_HOST') ?: 'localhost';
$user = getenv('DB_USER') ?: 'root';
$password = getenv('DB_PASSWORD') ?: '';
$database = getenv('DB_NAME') ?: 'jamies_auto_care';

// Create connection
$conn = new mysqli($host, $user, $password);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Create database if it doesn't exist
$sql = "CREATE DATABASE IF NOT EXISTS $database";
if ($conn->query($sql) === TRUE) {
    echo "Database created successfully or already exists<br>";
} else {
    echo "Error creating database: " . $conn->error . "<br>";
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
    issue TEXT NOT NULL,
    booking_date DATE NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    created_at DATETIME NOT NULL,
    cancellation_token VARCHAR(100),
    address VARCHAR(255),
    postcode VARCHAR(20),
    service_type VARCHAR(100),
    vehicle_reg VARCHAR(20)
)";

if ($conn->query($sql) === TRUE) {
    echo "Bookings table created successfully or already exists<br>";
} else {
    echo "Error creating bookings table: " . $conn->error . "<br>";
}

// Create customers table
$sql = "CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address VARCHAR(255),
    postcode VARCHAR(20),
    notes TEXT,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    UNIQUE KEY (email)
)";

if ($conn->query($sql) === TRUE) {
    echo "Customers table created successfully or already exists<br>";
} else {
    echo "Error creating customers table: " . $conn->error . "<br>";
}

// Create invoices table
$sql = "CREATE TABLE IF NOT EXISTS invoices (
    id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    date DATETIME NOT NULL,
    due_date DATETIME NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'paid', 'overdue') NOT NULL DEFAULT 'pending',
    paid_date DATETIME,
    created_at DATETIME NOT NULL,
    updated_at DATETIME
)";

if ($conn->query($sql) === TRUE) {
    echo "Invoices table created successfully or already exists<br>";
} else {
    echo "Error creating invoices table: " . $conn->error . "<br>";
}

// Create invoice_labor table
$sql = "CREATE TABLE IF NOT EXISTS invoice_labor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id VARCHAR(50) NOT NULL,
    description VARCHAR(255) NOT NULL,
    hours DECIMAL(5, 2) NOT NULL,
    hourly_rate DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
)";

if ($conn->query($sql) === TRUE) {
    echo "Invoice labor table created successfully or already exists<br>";
} else {
    echo "Error creating invoice labor table: " . $conn->error . "<br>";
}

// Create invoice_parts table
$sql = "CREATE TABLE IF NOT EXISTS invoice_parts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
)";

if ($conn->query($sql) === TRUE) {
    echo "Invoice parts table created successfully or already exists<br>";
} else {
    echo "Error creating invoice parts table: " . $conn->error . "<br>";
}

echo "Database setup completed successfully!";

// Close connection
$conn->close();
?>
