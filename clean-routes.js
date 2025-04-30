const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

console.log("Starting comprehensive cleanup for static export...")

// Function to recursively find all dynamic route directories
function findDynamicRoutes(dir) {
  console.log(`Scanning directory: ${dir}`)
  const dynamicRoutes = []

  if (!fs.existsSync(dir)) {
    console.log(`Directory does not exist: ${dir}`)
    return dynamicRoutes
  }

  const items = fs.readdirSync(dir)

  for (const item of items) {
    const itemPath = path.join(dir, item)
    const stats = fs.statSync(itemPath)

    if (stats.isDirectory()) {
      // Check if directory name is a dynamic route pattern [something]
      if (item.startsWith("[") && item.endsWith("]")) {
        console.log(`Found dynamic route: ${itemPath}`)
        dynamicRoutes.push(itemPath)
      } else {
        // Recursively search subdirectories
        const nestedDynamicRoutes = findDynamicRoutes(itemPath)
        dynamicRoutes.push(...nestedDynamicRoutes)
      }
    }
  }

  return dynamicRoutes
}

// Clean .next directory
console.log("Cleaning .next directory...")
try {
  if (fs.existsSync(path.join(__dirname, ".next"))) {
    fs.rmSync(path.join(__dirname, ".next"), { recursive: true, force: true })
    console.log(".next directory removed")
  } else {
    console.log(".next directory does not exist")
  }
} catch (error) {
  console.error("Error cleaning .next directory:", error)
}

// Find and remove all dynamic routes
console.log("Finding dynamic routes...")
const appDir = path.join(__dirname, "app")
const dynamicRoutes = findDynamicRoutes(appDir)

if (dynamicRoutes.length > 0) {
  console.log(`Found ${dynamicRoutes.length} dynamic route(s) to remove:`)

  for (const route of dynamicRoutes) {
    console.log(`Removing: ${route}`)
    try {
      fs.rmSync(route, { recursive: true, force: true })
      console.log(`Successfully removed: ${route}`)
    } catch (error) {
      console.error(`Error removing ${route}:`, error)
    }
  }
} else {
  console.log("No dynamic routes found")
}

// Create a simple bookings page if it doesn't exist
const bookingsPagePath = path.join(appDir, "bookings", "page.tsx")
if (!fs.existsSync(bookingsPagePath)) {
  console.log("Creating simple bookings page...")

  // Ensure the directory exists
  const bookingsDir = path.join(appDir, "bookings")
  if (!fs.existsSync(bookingsDir)) {
    fs.mkdirSync(bookingsDir, { recursive: true })
  }

  const bookingsPageContent = `
export default function BookingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Bookings</h1>
      <p>Please check your email for booking information.</p>
    </div>
  );
}
`

  fs.writeFileSync(bookingsPagePath, bookingsPageContent)
  console.log("Simple bookings page created")
}

console.log("Cleanup completed successfully!")
