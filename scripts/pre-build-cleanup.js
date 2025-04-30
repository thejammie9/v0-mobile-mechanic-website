const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

console.log("Starting pre-build cleanup...")

// Define paths to check and remove
const pathsToRemove = [
  path.join(process.cwd(), "app", "bookings", "[id]"),
  path.join(process.cwd(), "app", "bookings", "[id].tsx"),
  path.join(process.cwd(), "app", "bookings", "[id].jsx"),
  path.join(process.cwd(), "app", "bookings", "[id]", "cancel"),
  path.join(process.cwd(), "app", "bookings", "[id]", "cancel.tsx"),
  path.join(process.cwd(), "app", "bookings", "[id]", "cancel.jsx"),
  path.join(process.cwd(), "app", "bookings", "[id]", "page.tsx"),
  path.join(process.cwd(), "app", "bookings", "[id]", "page.jsx"),
  path.join(process.cwd(), "app", "bookings", "[id]", "cancel", "page.tsx"),
  path.join(process.cwd(), "app", "bookings", "[id]", "cancel", "page.jsx"),
]

// Check and remove each path
pathsToRemove.forEach((pathToRemove) => {
  if (fs.existsSync(pathToRemove)) {
    console.log(`Removing: ${pathToRemove}`)

    try {
      if (fs.lstatSync(pathToRemove).isDirectory()) {
        fs.rmSync(pathToRemove, { recursive: true, force: true })
      } else {
        fs.unlinkSync(pathToRemove)
      }
      console.log(`Successfully removed: ${pathToRemove}`)
    } catch (error) {
      console.error(`Error removing ${pathToRemove}:`, error)
    }
  }
})

// Create a simple bookings folder if it doesn't exist
const bookingsDir = path.join(process.cwd(), "app", "bookings")
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

console.log("Pre-build cleanup completed!")
