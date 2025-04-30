CREATE TABLE IF NOT EXISTS bookings (
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
  cancellation_token VARCHAR(100)
);
