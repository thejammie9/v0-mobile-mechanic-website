"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// Default admin credentials for testing - REMOVE BEFORE PRODUCTION
const DEFAULT_ADMIN_PASSWORD = "admin123"

export async function loginAdmin(formData: FormData) {
  const password = formData.get("password") as string

  // Check if using default admin password for testing
  if (password === DEFAULT_ADMIN_PASSWORD) {
    // Set a testing auth cookie
    cookies().set("admin_auth", "testing_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    })

    return { success: true }
  }

  // Regular authentication with environment variable
  const correctPassword = process.env.ADMIN_PASSWORD

  if (password === correctPassword) {
    // Set auth cookie with the server-side token
    const token = process.env.ADMIN_AUTH_TOKEN || "default_token"

    // Set the cookie
    cookies().set("admin_auth", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    })

    return { success: true }
  }

  return { success: false, error: "Invalid password" }
}

export async function logoutAdmin() {
  // Delete the auth cookie
  cookies().delete("admin_auth")
  redirect("/admin/login")
}
