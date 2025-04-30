import mysql from "mysql2/promise"

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "mobile_mechanic",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// Execute a query with parameters
export async function query(sql: string, params: any[] = []) {
  try {
    const [results] = await pool.execute(sql, params)
    return results
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// Initialize database tables
export async function initDatabase() {
  try {
    // Create bookings table if it doesn't exist
    await query(`
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
      )
    `)

    // Check if cancellation_token column exists, add it if it doesn't
    try {
      await query(`
        SELECT cancellation_token FROM bookings LIMIT 1
      `)
    } catch (error) {
      // Column doesn't exist, add it
      await query(`
        ALTER TABLE bookings ADD COLUMN cancellation_token VARCHAR(100)
      `)
    }

    console.log("Database initialized successfully")
  } catch (error) {
    console.error("Failed to initialize database:", error)
    throw error
  }
}
