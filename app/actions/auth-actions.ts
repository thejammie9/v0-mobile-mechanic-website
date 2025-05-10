"use server"

import { cookies } from "next/headers"

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
      // Set a simple flag cookie that indicates the user is logged in
      const cookieStore = cookies()
      cookieStore.set("admin_logged_in", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      })

      return { success: true, message: "Logged in successfully" }
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
  // Delete the auth cookie
  const cookieStore = cookies()
  cookieStore.delete("admin_logged_in")
  return { success: true }
}
