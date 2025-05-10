"use server"

import { cookies } from "next/headers"

export async function loginAdmin(formData: FormData) {
  try {
    const password = formData.get("password") as string

    if (!password) {
      return { success: false, error: "Password is required" }
    }

    // Get the admin password from environment variables
    const correctPassword = process.env.ADMIN_PASSWORD

    if (!correctPassword) {
      console.error("ADMIN_PASSWORD environment variable is not set")
      return { success: false, error: "Server configuration error" }
    }

    // Check if the password matches
    if (password === correctPassword) {
      console.log("Password is correct, setting cookie")

      // Set a cookie to indicate the user is logged in
      cookies().set({
        name: "admin_logged_in",
        value: "true",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 1 day
        path: "/",
      })

      return { success: true, message: "Logged in successfully" }
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
  cookies().delete("admin_logged_in")
  return { success: true }
}
