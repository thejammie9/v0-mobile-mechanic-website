<?php
require_once 'config.php';

// Connect to database
$conn = connectDB();

// Check if invoices table exists
$result = $conn->query("SHOW TABLES LIKE 'invoices'");
if ($result->num_rows == 0) {
    // Create invoices table
    $conn->query("
    CREATE TABLE IF NOT EXISTS invoices (
      id VARCHAR(20) PRIMARY KEY,
      customer_id VARCHAR(20),
      customer_name VARCHAR(255) NOT NULL,
      date DATE NOT NULL,
      due_date DATE NOT NULL,
      subtotal DECIMAL(10, 2) NOT NULL,
      tax DECIMAL(10, 2) NOT NULL,
      total DECIMAL(10, 2) NOT NULL,
      status VARCHAR(20) NOT NULL,
      paid_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
    ");
    echo "Created invoices table.\n";
}

// Check if invoice_labor table exists
$result = $conn->query("SHOW TABLES LIKE 'invoice_labor'");
if ($result->num_rows == 0) {
    // Create invoice_labor table
    $conn->query("
    CREATE TABLE IF NOT EXISTS invoice_labor (
      id INT AUTO_INCREMENT PRIMARY KEY,
      invoice_id VARCHAR(20) NOT NULL,
      description VARCHAR(255) NOT NULL,
      hours DECIMAL(5, 2) NOT NULL,
      hourly_rate DECIMAL(10, 2) NOT NULL,
      total DECIMAL(10, 2) NOT NULL,
      FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
    )
    ");
    echo "Created invoice_labor table.\n";
}

// Check if invoice_parts table exists
$result = $conn->query("SHOW TABLES LIKE 'invoice_parts'");
if ($result->num_rows == 0) {
    // Create invoice_parts table
    $conn->query("
    CREATE TABLE IF NOT EXISTS invoice_parts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      invoice_id VARCHAR(20) NOT NULL,
      name VARCHAR(255) NOT NULL,
      quantity INT NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      total DECIMAL(10, 2) NOT NULL,
      FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
    )
    ");
    echo "Created invoice_parts table.\n";
}

// Check for any needed column updates
// For example, if we need to add a new column to invoices table:
/*
$result = $conn->query("SHOW COLUMNS FROM invoices LIKE 'new_column'");
if ($result->num_rows == 0) {
    $conn->query("ALTER TABLE invoices ADD COLUMN new_column VARCHAR(255) AFTER total");
    echo "Added new_column to invoices table.\n";
}
*/

echo "Schema update completed successfully!\n";

$conn->close();
?>
