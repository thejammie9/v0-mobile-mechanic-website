/**
 * One-time migration script: converts the existing plain SQLite database
 * to an encrypted SQLCipher database.
 *
 * Run ONCE with: node scripts/encrypt-db.js
 * The script is safe to re-run — it checks first.
 */

const path = require("path")
const fs   = require("fs")

// Load key from .env.local manually (dotenv may not be installed)
const envPath = path.join(__dirname, "../.env.local")
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf8").split("\n")
  for (const line of lines) {
    const m = line.match(/^([^#=]+)=(.*)$/)
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "")
  }
}
const key = process.env.DB_ENCRYPTION_KEY
if (!key) { console.error("DB_ENCRYPTION_KEY not set in .env.local"); process.exit(1) }

const dbPath  = path.join(__dirname, "../data/bookings.db")
const tmpPath = path.join(__dirname, "../data/bookings_encrypted_tmp.db")
const bakPath = path.join(__dirname, "../data/bookings_plain_backup.db")

// Verify the source DB is readable
if (!fs.existsSync(dbPath)) { console.error("Source database not found:", dbPath); process.exit(1) }

// Open plain database with regular better-sqlite3
const PlainDB = require("better-sqlite3")
const plainDb = new PlainDB(dbPath, { readonly: true })

// Verify it's NOT already encrypted (try a simple query)
try {
  plainDb.prepare("SELECT 1").get()
  console.log("Source database is plain (unencrypted) — proceeding with migration.")
} catch (e) {
  console.error("Could not read source database — it may already be encrypted:", e.message)
  plainDb.close()
  process.exit(1)
}

// Open encrypted target database
const CipherDB = require("better-sqlite3-multiple-ciphers")
if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath)
const encDb = new CipherDB(tmpPath)
encDb.pragma(`cipher='sqlcipher'`)
encDb.pragma(`key="${key}"`)

console.log("Copying schema and data...")

// Get all objects from source (tables, indexes, triggers, views)
const objects = plainDb.prepare(`
  SELECT type, name, sql FROM sqlite_master
  WHERE sql IS NOT NULL
  ORDER BY
    CASE type WHEN 'table' THEN 1 WHEN 'index' THEN 2 WHEN 'view' THEN 3 ELSE 4 END,
    name
`).all()

encDb.exec("BEGIN")

for (const obj of objects) {
  if (obj.name.startsWith("sqlite_")) continue // skip internal tables
  try {
    encDb.exec(obj.sql)
  } catch (e) {
    console.warn(`  Skipped ${obj.type} "${obj.name}": ${e.message}`)
  }
}

// Copy all table data
const tables = plainDb.prepare(`
  SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'
`).all().map(r => r.name)

for (const table of tables) {
  const rows = plainDb.prepare(`SELECT * FROM "${table}"`).all()
  if (rows.length === 0) { console.log(`  ${table}: 0 rows`); continue }

  const cols = Object.keys(rows[0])
  const placeholders = cols.map(() => "?").join(", ")
  const insert = encDb.prepare(
    `INSERT OR REPLACE INTO "${table}" (${cols.map(c => `"${c}"`).join(", ")}) VALUES (${placeholders})`
  )
  for (const row of rows) {
    insert.run(Object.values(row))
  }
  console.log(`  ${table}: ${rows.length} rows copied`)
}

encDb.exec("COMMIT")

// Verify the encrypted DB is readable
const verifyDb = new CipherDB(tmpPath)
verifyDb.pragma(`cipher='sqlcipher'`)
verifyDb.pragma(`key="${key}"`)
const check = verifyDb.prepare("SELECT COUNT(*) as c FROM sqlite_master").get()
verifyDb.close()
console.log(`Verification: ${check.c} objects in encrypted database.`)

plainDb.close()
encDb.close()

// Swap files
fs.copyFileSync(dbPath, bakPath)
fs.renameSync(tmpPath, dbPath)

console.log("")
console.log("✓ Migration complete.")
console.log(`  Encrypted database: ${dbPath}`)
console.log(`  Plain backup kept:  ${bakPath}`)
console.log("  Once you have confirmed everything works, you can delete the backup.")
