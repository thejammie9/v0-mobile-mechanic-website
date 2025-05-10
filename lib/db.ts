import mysql from "mysql2/promise"

// Connection pool
let pool: mysql.Pool | null = null

export async function getConnection() {
  if (!pool) {
    try {
      pool = mysql.createPool({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "mobile_mechanic",
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      })
      console.log("Database connection pool created")
    } catch (error) {
      console.error("Error creating database connection pool:", error)
      throw error
    }
  }
  return pool
}

// Format date for MySQL (YYYY-MM-DD HH:MM:SS)
export function formatDateForMySQL(date: Date): string {
  return date.toISOString().slice(0, 19).replace("T", " ")
}

// Execute a query with parameters
export async function query(sql: string, params: any[] = []) {
  try {
    // Ensure pool is initialized
    if (!pool) {
      await getConnection()
    }

    console.log("Executing query:", sql.substring(0, 100) + "...")
    const [results] = await pool!.execute(sql, params)
    return results
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// Close the connection pool
export async function closeConnection() {
  if (pool) {
    await pool.end()
    pool = null
    console.log("Database connection pool closed")
  }
}

export async function initDatabase() {
  try {
    await getConnection()
    console.log("Database initialized successfully")
  } catch (error) {
    console.error("Error initializing database:", error)
    throw error
  }
}
