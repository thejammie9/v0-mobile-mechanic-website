-- Create invoices table if it doesn't exist
CREATE TABLE IF NOT EXISTS invoices (
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
);

-- Create invoice_labor table if it doesn't exist
CREATE TABLE IF NOT EXISTS invoice_labor (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id VARCHAR(50) NOT NULL,
  description VARCHAR(255) NOT NULL,
  hours DECIMAL(5, 2) NOT NULL,
  hourly_rate DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- Create invoice_parts table if it doesn't exist
CREATE TABLE IF NOT EXISTS invoice_parts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);
