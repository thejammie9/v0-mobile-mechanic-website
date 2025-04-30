const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

console.log("Starting static site build process...")

// Create out directory if it doesn't exist
const outDir = path.join(__dirname, "out")
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true })
}

// Copy static HTML files from static-site directory
console.log("Copying static HTML files...")
try {
  // Create static-site directory if it doesn't exist
  const staticDir = path.join(__dirname, "static-site")
  if (!fs.existsSync(staticDir)) {
    fs.mkdirSync(staticDir, { recursive: true })

    // Create a basic index.html file
    const indexHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jamie's Auto Care - Mobile Mechanic Services</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body>
    <header class="bg-blue-900 text-white py-4">
        <div class="container mx-auto px-4">
            <h1 class="text-2xl font-bold">Jamie's Auto Care</h1>
        </div>
    </header>
    <main class="container mx-auto px-4 py-8">
        <h2 class="text-3xl font-bold mb-4">Welcome to Jamie's Auto Care</h2>
        <p class="mb-4">Our website is currently being updated. Please check back soon.</p>
        <p>For bookings, please call: <strong>07463451967</strong></p>
    </main>
</body>
</html>
    `
    fs.writeFileSync(path.join(staticDir, "index.html"), indexHtml)
  }

  // Copy all files from static-site to out
  copyDirectory(staticDir, outDir)

  // Copy PHP files
  const phpDir = path.join(__dirname, "php")
  if (fs.existsSync(phpDir)) {
    copyDirectory(phpDir, outDir)
  }

  console.log("Static site build completed successfully!")
} catch (error) {
  console.error("Error during build:", error)
  process.exit(1)
}

// Function to copy directory recursively
function copyDirectory(source, destination) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true })
  }

  // Get all files and directories in the source
  const entries = fs.readdirSync(source, { withFileTypes: true })

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name)
    const destPath = path.join(destination, entry.name)

    if (entry.isDirectory()) {
      // Recursively copy directory
      copyDirectory(sourcePath, destPath)
    } else {
      // Copy file
      fs.copyFileSync(sourcePath, destPath)
    }
  }
}
