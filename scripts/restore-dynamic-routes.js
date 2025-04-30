const fs = require("fs")
const path = require("path")

// Path to the dynamic route folder
const dynamicRoutePath = path.join(process.cwd(), "app", "bookings", "[id]")
const backupDir = path.join(process.cwd(), ".backup")

console.log("Checking for dynamic route backups...")

// Check if backup directory exists
if (fs.existsSync(backupDir)) {
  // Get all backup folders
  const backups = fs
    .readdirSync(backupDir)
    .filter((name) => name.startsWith("bookings-id-"))
    .sort()
    .reverse()

  if (backups.length > 0) {
    const latestBackup = path.join(backupDir, backups[0])
    console.log(`Found latest backup: ${latestBackup}`)

    // Check if the dynamic route folder needs to be restored
    if (!fs.existsSync(dynamicRoutePath)) {
      console.log(`Restoring dynamic route to: ${dynamicRoutePath}`)

      // Create the parent directory if it doesn't exist
      const parentDir = path.dirname(dynamicRoutePath)
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true })
      }

      // Restore from backup
      fs.cpSync(latestBackup, dynamicRoutePath, { recursive: true })
      console.log("Dynamic route restored successfully")
    } else {
      console.log("Dynamic route already exists, no need to restore")
    }
  } else {
    console.log("No backups found")
  }
} else {
  console.log("No backup directory found")
}

console.log("Restore process complete!")
