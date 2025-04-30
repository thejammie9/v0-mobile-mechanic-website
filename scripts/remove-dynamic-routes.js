const fs = require("fs")
const path = require("path")

// Paths to remove after build
const pathsToRemove = ["out/bookings/[id]"]

console.log("Removing dynamic route folders...")

pathsToRemove.forEach((routePath) => {
  const fullPath = path.join(process.cwd(), routePath)

  if (fs.existsSync(fullPath)) {
    console.log(`Removing: ${fullPath}`)
    fs.rmSync(fullPath, { recursive: true, force: true })
  } else {
    console.log(`Path not found: ${fullPath}`)
  }
})

console.log("Dynamic routes removed successfully!")
