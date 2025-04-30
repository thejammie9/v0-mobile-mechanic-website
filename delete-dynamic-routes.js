const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

console.log("Forcefully deleting dynamic routes...")

// Paths to delete
const pathsToDelete = [
  path.join(__dirname, "app", "bookings", "[id]"),
  path.join(__dirname, "app", "bookings", "[id].js"),
  path.join(__dirname, "app", "bookings", "[id].jsx"),
  path.join(__dirname, "app", "bookings", "[id].ts"),
  path.join(__dirname, "app", "bookings", "[id].tsx"),
  path.join(__dirname, ".next", "app", "bookings", "[id]"),
  path.join(__dirname, ".next", "server", "app", "bookings", "[id]"),
  path.join(__dirname, ".next", "types", "app", "bookings", "[id]"),
]

// Delete each path if it exists
pathsToDelete.forEach((pathToDelete) => {
  try {
    if (fs.existsSync(pathToDelete)) {
      console.log(`Deleting: ${pathToDelete}`)

      if (fs.lstatSync(pathToDelete).isDirectory()) {
        fs.rmSync(pathToDelete, { recursive: true, force: true })
      } else {
        fs.unlinkSync(pathToDelete)
      }

      console.log(`Successfully deleted: ${pathToDelete}`)
    }
  } catch (error) {
    console.error(`Error deleting ${pathToDelete}:`, error)
  }
})

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

// Clean the .next directory to remove any cached files
try {
  console.log("Cleaning .next directory...")
  execSync("rm -rf .next")
  console.log(".next directory cleaned")
} catch (error) {
  console.error("Error cleaning .next directory:", error)
}

console.log("Dynamic route deletion completed!")
