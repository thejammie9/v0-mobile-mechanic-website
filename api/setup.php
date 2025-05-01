<?php
require_once 'config.php';

// Create database if it doesn't exist
$conn = new mysqli($db_host, $db_user, $db_password);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Create database if it doesn't exist
$sql = "CREATE DATABASE IF NOT EXISTS $db_name";
if ($conn->query($sql) !== TRUE) {
    die("Error creating database: " . $conn->error);
}

$conn->close();

// Connect to the database
$conn = connectDB();

// Create bookings table if it doesn't exist
$sql = "CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    vehicle VARCHAR(100) NOT NULL,
    issue TEXT NOT NULL,
    date DATE NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    cancellation_token VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

if ($conn->query($sql) !== TRUE) {
    die("Error creating table: " . $conn->error);
}

echo "Database setup completed successfully!";
$conn->close();
?>
