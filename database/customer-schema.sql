-- Create customers table if it doesn't exist
CREATE TABLE IF NOT EXISTS customers (
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
);

-- Add vehicle_reg column to bookings table if it doesn't exist
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS vehicle_reg VARCHAR(20);

-- Add address column to bookings table if it doesn't exist
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS address VARCHAR(255);

-- Add postcode column to bookings table if it doesn't exist
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS postcode VARCHAR(20);

-- Add service_type column to bookings table if it doesn't exist
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_type VARCHAR(100);
