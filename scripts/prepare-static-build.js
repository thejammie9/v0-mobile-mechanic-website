const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

// Path to the dynamic route folder
const dynamicRoutePath = path.join(process.cwd(), "app", "bookings", "[id]")

console.log("Preparing for static build...")

// Check if the dynamic route folder exists
if (fs.existsSync(dynamicRoutePath)) {
  console.log(`Backing up and removing dynamic route: ${dynamicRoutePath}`)

  // Create a backup folder if it doesn't exist
  const backupDir = path.join(process.cwd(), ".backup")
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
  }

  // Backup the dynamic route folder
  const backupPath = path.join(backupDir, "bookings-id-" + Date.now())
  fs.cpSync(dynamicRoutePath, backupPath, { recursive: true })
  console.log(`Backed up to: ${backupPath}`)

  // Remove the dynamic route folder
  fs.rmSync(dynamicRoutePath, { recursive: true, force: true })
  console.log("Dynamic route removed successfully")
}

console.log("Static build preparation complete!")
