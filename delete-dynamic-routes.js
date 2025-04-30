const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

console.log("Forcefully deleting dynamic routes...")

// Function to recursively search for dynamic route patterns
function findDynamicRoutes(dir, dynamicRoutes = []) {
  if (!fs.existsSync(dir)) {
    return dynamicRoutes
  }

  const files = fs.readdirSync(dir)

  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      // Check if directory name is a dynamic route pattern [something]
      if (file.startsWith("[") && file.endsWith("]")) {
        dynamicRoutes.push(filePath)
      } else {
        // Recursively search subdirectories
        findDynamicRoutes(filePath, dynamicRoutes)
      }
    }
  }

  return dynamicRoutes
}

// Find all dynamic routes in the app directory
const appDir = path.join(__dirname, "app")
const dynamicRoutes = findDynamicRoutes(appDir)

if (dynamicRoutes.length > 0) {
  console.log(`Found ${dynamicRoutes.length} dynamic route(s):`)

  // Remove each dynamic route
  for (const route of dynamicRoutes) {
    console.log(`Removing: ${route}`)
    fs.rmSync(route, { recursive: true, force: true })
  }
}

// Also check for any cached dynamic routes in the .next directory
const nextDir = path.join(__dirname, ".next")
if (fs.existsSync(nextDir)) {
  console.log("Cleaning .next directory...")
  fs.rmSync(nextDir, { recursive: true, force: true })
  console.log(".next directory cleaned")
}

// Create a simple bookings page
const bookingsDir = path.join(__dirname, "app", "bookings")
if (!fs.existsSync(bookingsDir)) {
  fs.mkdirSync(bookingsDir, { recursive: true })
}

// Create a simple page.tsx in the bookings folder
const pageContent = `
export default function BookingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Bookings</h1>
      <p>Please check your email for booking information.</p>
    </div>
  );
}
`

fs.writeFileSync(path.join(bookingsDir, "page.tsx"), pageContent)
console.log("Created bookings/page.tsx")

console.log("Dynamic route deletion completed!")
