-- Create invoices table if it doesn't exist
CREATE TABLE IF NOT EXISTS invoices (
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
);

-- Create invoice_labor table if it doesn't exist
CREATE TABLE IF NOT EXISTS invoice_labor (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id VARCHAR(20) NOT NULL,
  description VARCHAR(255) NOT NULL,
  hours DECIMAL(5, 2) NOT NULL,
  hourly_rate DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- Create invoice_parts table if it doesn't exist
CREATE TABLE IF NOT EXISTS invoice_parts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id VARCHAR(20) NOT NULL,
  name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);
