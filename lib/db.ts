import mysql from "mysql2/promise"

let pool: mysql.Pool | null = null

export async function initDatabase() {
  try {
    if (!pool) {
      console.log("Initializing database connection pool")

      // Log database connection details (remove in production)
      console.log("DB Connection Details:", {
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        database: process.env.DB_NAME || "mobile_mechanic",
        // Don't log password
      })

      pool = mysql.createPool({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "mobile_mechanic",
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      })

      // Test the connection
      const connection = await pool.getConnection()
      console.log("Database connection successful")
      connection.release()
    }
  } catch (error) {
    console.error("Database initialization error:", error)
    throw error
  }
}

export async function query(sql: string, params: any[] = []) {
  if (!pool) {
    await initDatabase()
  }

  try {
    console.log("Executing query:", sql.substring(0, 100) + "...")
    const [results] = await pool!.execute(sql, params)
    return results
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}
