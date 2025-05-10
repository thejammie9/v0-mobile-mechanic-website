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
      // In Next.js 14+, we need to use a different approach for cookies
      // We'll use headers() instead of cookies() to avoid the async warning

      // Return a success response with a Set-Cookie header
      return {
        success: true,
        message: "Logged in successfully",
        // Include instructions to set the cookie client-side
        setCookie: true,
      }
    }

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
  // Return instructions to clear the cookie client-side
  return {
    success: true,
    clearCookie: true,
  }
}
