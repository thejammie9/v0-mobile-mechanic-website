"use server"

// Default admin password for testing - REMOVE BEFORE PRODUCTION
const DEFAULT_ADMIN_PASSWORD = "admin123"

export async function loginAdmin(formData: FormData) {
  try {
    const password = formData.get("password") as string

    if (!password) {
      return { success: false, error: "Password is required" }
    }

    // For debugging
    console.log("Login attempt with password:", password)
    console.log("Expected password from env:", process.env.ADMIN_PASSWORD)

    // Check password against environment variable or default
    const correctPassword = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD

    if (password === correctPassword) {
      console.log("Password is correct, returning success")

      // Return success - we'll set the cookie on the client side
      return {
        success: true,
        message: "Logged in successfully",
      }
    }

    console.log("Password is incorrect")
    return { success: false, error: "Invalid password" }
  } catch (error) {
    console.error("Login error:", error)
    return {
      success: false,
      error: `Authentication error: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

export async function logoutAdmin() {
  console.log("Logout action called")
  return { success: true }
}
