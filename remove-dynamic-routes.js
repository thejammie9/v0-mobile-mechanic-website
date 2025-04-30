const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

console.log("Searching for and removing all dynamic routes...")

// Function to recursively search for dynamic route patterns
function findDynamicRoutes(dir, dynamicRoutes = []) {
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
if (fs.existsSync(appDir)) {
  const dynamicRoutes = findDynamicRoutes(appDir)

  if (dynamicRoutes.length > 0) {
    console.log(`Found ${dynamicRoutes.length} dynamic route(s):`)

    // Remove each dynamic route
    for (const route of dynamicRoutes) {
      console.log(`Removing: ${route}`)
      fs.rmSync(route, { recursive: true, force: true })
    }

    console.log("All dynamic routes removed successfully!")
  } else {
    console.log("No dynamic routes found.")
  }
} else {
  console.log("App directory not found.")
}

// Create a simple bookings folder if it doesn't exist
const bookingsDir = path.join(__dirname, "app", "bookings")
if (!fs.existsSync(bookingsDir)) {
  fs.mkdirSync(bookingsDir, { recursive: true })
  console.log(`Created directory: ${bookingsDir}`)

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
}

// Also check for any references to the dynamic route in app/actions/booking-actions.ts
const bookingActionsPath = path.join(__dirname, "app", "actions", "booking-actions.ts")
if (fs.existsSync(bookingActionsPath)) {
  console.log("Checking booking-actions.ts for dynamic route references...")

  const content = fs.readFileSync(bookingActionsPath, "utf8")

  // Replace any references to dynamic routes with PHP alternatives
  const updatedContent = content.replace(
    /`\${appUrl}\/bookings\/\${booking\.id}\/cancel\?token=\${booking\.cancellationToken}`/g,
    "`${appUrl}/bookings/cancel.php?id=${booking.id}&token=${booking.cancellationToken}`",
  )

  if (content !== updatedContent) {
    fs.writeFileSync(bookingActionsPath, updatedContent)
    console.log("Updated booking-actions.ts to use PHP cancellation page")
  }
}

console.log("Dynamic route cleanup completed!")
