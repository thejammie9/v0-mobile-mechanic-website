const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

console.log("Starting build process with enhanced error handling...")

// Step 1: Clean dynamic routes
console.log("\n--- Step 1: Cleaning dynamic routes ---")
try {
  execSync("node clean-routes.js", { stdio: "inherit" })
} catch (error) {
  console.error("Error during route cleaning:", error.message)
  process.exit(1)
}

// Step 2: Build the project
console.log("\n--- Step 2: Building the project ---")
try {
  execSync("next build", { stdio: "inherit" })
} catch (error) {
  console.error("Error during build:", error.message)
  process.exit(1)
}

console.log("\nBuild completed successfully!")
