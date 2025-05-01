"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// Default admin password for testing
const DEFAULT_ADMIN_PASSWORD = "admin123"
const DEFAULT_ADMIN_TOKEN = "test_admin_token_for_development_only"

export async function loginAdmin(formData: FormData) {
  const password = formData.get("password") as string

  // Check if password matches environment variable or default password
  const isValidPassword = password === process.env.ADMIN_PASSWORD || password === DEFAULT_ADMIN_PASSWORD

  if (!isValidPassword) {
    return {
      success: false,
      message: "Invalid password",
    }
  }

  // Set admin auth cookie
  const token = process.env.ADMIN_AUTH_TOKEN || DEFAULT_ADMIN_TOKEN

  cookies().set("admin_auth", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 1 day
    path: "/",
  })

  return {
    success: true,
    message: "Login successful",
  }
}

export async function logoutAdmin() {
  cookies().delete("admin_auth")
  redirect("/admin/login")
}

export async function checkAdminAuth() {
  const token = cookies().get("admin_auth")?.value

  if (!token) {
    return false
  }

  // Check if token matches environment variable or default token
  return token === process.env.ADMIN_AUTH_TOKEN || token === DEFAULT_ADMIN_TOKEN
}
