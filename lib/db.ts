import Database from "better-sqlite3"
import path from "path"

// Database file will be stored in the project root
const dbPath = path.join(process.cwd(), "data", "bookings.db")

// Initialize database connection
let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!db) {
    // Ensure data directory exists
    const fs = require("fs")
    const dataDir = path.join(process.cwd(), "data")
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    
    db = new Database(dbPath)
    db.pragma("journal_mode = WAL") // Better performance for concurrent reads
    
    // Initialize tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        vehicle TEXT NOT NULL,
        issue TEXT NOT NULL,
        preferred_date TEXT,
        preferred_time TEXT,
        status TEXT DEFAULT 'pending',
        created_at TEXT DEFAULT (datetime('now'))
      )
    `)
  }
  return db
}

export type Booking = {
  id: number
  name: string
  phone: string
  email: string
  vehicle: string
  issue: string
  preferred_date: string | null
  preferred_time: string | null
  status: string
  created_at: string
}

// Create a new booking
export function createBooking(data: {
  name: string
  phone: string
  email: string
  vehicle: string
  issue: string
  preferred_date: string | null
  preferred_time: string | null
}): Booking {
  const db = getDb()
  const stmt = db.prepare(`
    INSERT INTO bookings (name, phone, email, vehicle, issue, preferred_date, preferred_time, status)
    VALUES (@name, @phone, @email, @vehicle, @issue, @preferred_date, @preferred_time, 'pending')
  `)
  
  const result = stmt.run({
    name: data.name,
    phone: data.phone,
    email: data.email,
    vehicle: data.vehicle,
    issue: data.issue,
    preferred_date: data.preferred_date,
    preferred_time: data.preferred_time,
  })
  
  return getBookingById(result.lastInsertRowid as number)!
}

// Get all bookings ordered by creation date
export function getAllBookings(): Booking[] {
  const db = getDb()
  const stmt = db.prepare("SELECT * FROM bookings ORDER BY created_at DESC")
  return stmt.all() as Booking[]
}

// Get a single booking by ID
export function getBookingById(id: number): Booking | null {
  const db = getDb()
  const stmt = db.prepare("SELECT * FROM bookings WHERE id = ?")
  return stmt.get(id) as Booking | null
}

// Update booking status
export function updateBookingStatus(id: number, status: string): boolean {
  const db = getDb()
  const stmt = db.prepare("UPDATE bookings SET status = ? WHERE id = ?")
  const result = stmt.run(status, id)
  return result.changes > 0
}

// Delete a booking
export function deleteBooking(id: number): boolean {
  const db = getDb()
  const stmt = db.prepare("DELETE FROM bookings WHERE id = ?")
  const result = stmt.run(id)
  return result.changes > 0
}
