"use server"

import { cookies } from "next/headers"

const ADMIN_COOKIE_NAME = "admin_session"
const SESSION_DURATION = 60 * 60 * 24 * 7 // 7 days in seconds

export async function loginAdmin(password: string): Promise<{ success: boolean; error?: string }> {
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword) {
    return { success: false, error: "Admin password not configured" }
  }

  if (password !== adminPassword) {
    return { success: false, error: "Invalid password" }
  }

  // Set a simple session cookie
  const cookieStore = await cookies()
  cookieStore.set(ADMIN_COOKIE_NAME, "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION,
    path: "/",
  })

  return { success: true }
}

export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_COOKIE_NAME)
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get(ADMIN_COOKIE_NAME)
  return session?.value === "authenticated"
}
