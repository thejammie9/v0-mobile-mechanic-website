const fs = require("fs")
const path = require("path")

// Path to the dynamic route folder
const dynamicRoutePath = path.join(__dirname, "app", "bookings", "[id]")

console.log("Checking for dynamic route folder...")

// Check if the dynamic route folder exists
if (fs.existsSync(dynamicRoutePath)) {
  console.log(`Removing dynamic route folder: ${dynamicRoutePath}`)

  // Remove the dynamic route folder
  fs.rmSync(dynamicRoutePath, { recursive: true, force: true })

  console.log("Dynamic route folder removed successfully!")
} else {
  console.log("Dynamic route folder not found.")
}
