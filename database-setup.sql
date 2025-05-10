-- Database setup script for Mobile Mechanic Website
-- This script creates all necessary tables and relationships

-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS invoice_parts;
DROP TABLE IF EXISTS invoice_labor;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS parts;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS settings;

-- Create users table for admin access
CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  role ENUM('admin', 'staff') NOT NULL DEFAULT 'staff',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create customers table
CREATE TABLE customers (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create bookings table
CREATE TABLE bookings (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  vehicle VARCHAR(100) NOT NULL,
  issue TEXT NOT NULL,
  booking_date VARCHAR(50) NOT NULL,
  time_slot VARCHAR(50) NOT NULL,
  status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  cancellation_token VARCHAR(100),
  customer_id VARCHAR(50),
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

-- Create parts table for inventory
CREATE TABLE parts (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  cost DECIMAL(10, 2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  min_stock INT NOT NULL DEFAULT 0,
  category VARCHAR(50) NOT NULL,
  is_vehicle_specific BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create invoices table
CREATE TABLE invoices (
  id VARCHAR(50) PRIMARY KEY,
  customer_id VARCHAR(50),
  customer_name VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  due_date DATE NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'paid', 'overdue') DEFAULT 'pending',
  paid_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

-- Create invoice_labor table for labor items on invoices
CREATE TABLE invoice_labor (
  id VARCHAR(50) PRIMARY KEY,
  invoice_id VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  hours DECIMAL(5, 2) NOT NULL,
  hourly_rate DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- Create invoice_parts table for parts used on invoices
CREATE TABLE invoice_parts (
  id VARCHAR(50) PRIMARY KEY,
  invoice_id VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  part_id VARCHAR(50),
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE SET NULL
);

-- Create settings table for website configuration
CREATE TABLE settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(50) NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_date ON invoices(date);
CREATE INDEX idx_parts_category ON parts(category);

-- Insert default admin user (password: admin123)
-- In production, use a secure password and change it immediately
INSERT INTO users (id, username, email, password, role) 
VALUES ('user_admin', 'admin', 'admin@jamiesautocare.com', SHA2('admin123', 256), 'admin');

-- Insert default settings
INSERT INTO settings (setting_key, setting_value) VALUES
('company_name', 'Jamie\'s Auto Care'),
('company_address', '123 Main Street'),
('company_city', 'Edinburgh'),
('company_postcode', 'EH1 1AA'),
('company_phone', '07123456789'),
('company_email', 'info@jamiesautocare.com'),
('company_number', 'SC123456'),
('vat_number', 'GB123456789'),
('vat_rate', '20'),
('default_hourly_rate', '45'),
('booking_lead_time', '1'), -- Minimum days in advance for booking
('weekend_hours', '10:30-13:30'),
('weekday_hours', '09:00-12:30,13:30-17:30');

-- Insert sample vehicle-specific part category
INSERT INTO parts (id, name, price, cost, stock, min_stock, category, is_vehicle_specific) 
VALUES ('part_vehicle_specific', 'Vehicle-Specific Part', 0, 0, 999, 0, 'Vehicle-Specific', TRUE);

-- Create a view for upcoming bookings
CREATE OR REPLACE VIEW upcoming_bookings AS
SELECT * FROM bookings 
WHERE status = 'confirmed' 
AND STR_TO_DATE(booking_date, '%Y-%m-%d') >= CURDATE()
ORDER BY STR_TO_DATE(booking_date, '%Y-%m-%d'), time_slot;

-- Create a view for overdue invoices
CREATE OR REPLACE VIEW overdue_invoices AS
SELECT * FROM invoices
WHERE status = 'pending' AND due_date < CURDATE()
ORDER BY due_date;

-- Create a view for low stock parts
CREATE OR REPLACE VIEW low_stock_parts AS
SELECT * FROM parts
WHERE stock <= min_stock AND is_vehicle_specific = FALSE
ORDER BY stock ASC;
