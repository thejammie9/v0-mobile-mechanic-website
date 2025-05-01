"use server"

import { cookies } from "next/headers"

// Default admin credentials for testing - REMOVE BEFORE PRODUCTION
const DEFAULT_ADMIN_PASSWORD = "admin123"
const DEFAULT_AUTH_TOKEN = "testing_token_123456789"

export async function loginAdmin(formData: FormData) {
  try {
    const password = formData.get("password") as string

    if (!password) {
      return { success: false, error: "Password is required" }
    }

    // For debugging
    console.log("Login attempt with password:", password)
    console.log("Expected password from env:", process.env.ADMIN_PASSWORD)
    console.log("Default password:", DEFAULT_ADMIN_PASSWORD)

    // Check if using default admin password for testing
    if (password === DEFAULT_ADMIN_PASSWORD) {
      console.log("Using default admin password")
      // Set a testing auth cookie
      cookies().set("admin_auth", DEFAULT_AUTH_TOKEN, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 1 day
        path: "/",
      })

      return { success: true, message: "Logged in with default admin account" }
    }

    // Regular authentication with environment variable
    const correctPassword = process.env.ADMIN_PASSWORD

    if (password === correctPassword) {
      console.log("Using environment variable password")
      // Set auth cookie with the server-side token
      const token = process.env.ADMIN_AUTH_TOKEN || DEFAULT_AUTH_TOKEN

      // Set the cookie
      cookies().set("admin_auth", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 1 day
        path: "/",
      })

      return { success: true, message: "Logged in with environment variable" }
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
  cookies().delete("admin_auth")
  return { success: true }
}
