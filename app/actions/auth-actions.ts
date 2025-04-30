"use server"

import { cookies } from "next/headers"

export async function loginAdmin(formData: FormData) {
  const password = formData.get("password") as string

  // Validate password against the server-side environment variable
  const correctPassword = process.env.ADMIN_PASSWORD

  if (password === correctPassword) {
    // Set auth cookie with the server-side token
    const token = process.env.ADMIN_AUTH_TOKEN

    // Set the cookie
    cookies().set("admin_auth", token || "", {
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
  return { success: true }
}
