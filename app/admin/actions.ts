"use server"

import { cookies } from "next/headers"
import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto"
import {
  getAdminUserByUsername,
  createAdminUser,
  updateAdminUserPassword,
  updateAdminUserRole,
  toggleAdminUserActive,
  deleteAdminUser,
  listAdminUsers,
} from "@/lib/db"

const ADMIN_COOKIE_NAME = "admin_session"
const SESSION_MAX_AGE   = 4 * 60 * 60          // 4 hours in seconds
const SESSION_MAX_MS    = SESSION_MAX_AGE * 1000

// ─── Password hashing ────────────────────────────────────────────────────────

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex")
  const hash = pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex")
  return `${salt}:${hash}`
}

function verifyPassword(password: string, stored: string): boolean {
  const colonIdx = stored.indexOf(":")
  if (colonIdx < 1) return false
  const salt = stored.slice(0, colonIdx)
  const storedHash = stored.slice(colonIdx + 1)
  const derived = pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex")
  const a = Buffer.from(derived)
  const b = Buffer.from(storedHash)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

// ─── Session token (v2: includes userId + role) ───────────────────────────────

type SessionPayload = { userId: number; role: "admin" | "staff" }

function makeSessionToken(userId: number, role: string, expiresAt: number): string {
  const secret = process.env.SESSION_SECRET || "fallback-change-me"
  const data   = `jac-admin-v2:${userId}:${role}:${expiresAt}`
  const hmac   = createHmac("sha256", secret).update(data).digest("hex")
  return `${userId}:${role}:${expiresAt}:${hmac}`
}

function verifySessionToken(value: string): SessionPayload | null {
  try {
    const parts = value.split(":")
    if (parts.length < 4) return null
    const [userIdStr, role, expiresAtStr, ...hmacParts] = parts
    const tokenHmac = hmacParts.join(":")
    const userId    = parseInt(userIdStr, 10)
    const expiresAt = parseInt(expiresAtStr, 10)
    if (isNaN(userId) || isNaN(expiresAt) || Date.now() > expiresAt) return null

    const expected = makeSessionToken(userId, role, expiresAt)
    const expectedHmac = expected.split(":").slice(3).join(":")
    const a = Buffer.from(tokenHmac, "hex")
    const b = Buffer.from(expectedHmac, "hex")
    if (a.length !== b.length) return null
    if (!timingSafeEqual(a, b)) return null

    return { userId, role: role as "admin" | "staff" }
  } catch {
    return null
  }
}

function setCookie(cookieStore: Awaited<ReturnType<typeof cookies>>, token: string) {
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure:   true,
    sameSite: "lax",
    path:     "/",
  })
}

// ─── Auth actions ─────────────────────────────────────────────────────────────

export async function loginAdmin(
  username: string,
  password: string,
): Promise<{ success: boolean; error?: string }> {
  const user = getAdminUserByUsername(username.trim().toLowerCase())
  if (!user || !user.is_active) {
    return { success: false, error: "Invalid username or password" }
  }
  if (!verifyPassword(password, user.password_hash)) {
    return { success: false, error: "Invalid username or password" }
  }

  const expiresAt   = Date.now() + SESSION_MAX_MS
  const cookieStore = await cookies()
  setCookie(cookieStore, makeSessionToken(user.id, user.role, expiresAt))
  return { success: true }
}

export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_COOKIE_NAME)
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get(ADMIN_COOKIE_NAME)
  if (!session?.value) return false
  return verifySessionToken(session.value) !== null
}

export async function getCurrentUser(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get(ADMIN_COOKIE_NAME)
  if (!session?.value) return null
  return verifySessionToken(session.value)
}

// ─── User management actions (admin only) ────────────────────────────────────

async function requireAdmin(): Promise<void> {
  const user = await getCurrentUser()
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorised")
  }
}

export async function adminListUsers() {
  await requireAdmin()
  return listAdminUsers()
}

export async function adminCreateUser(
  username: string,
  password: string,
  role: "admin" | "staff",
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin()
  if (!username.trim() || !password) return { success: false, error: "Username and password are required" }
  if (password.length < 6) return { success: false, error: "Password must be at least 6 characters" }
  try {
    createAdminUser(username.trim().toLowerCase(), hashPassword(password), role)
    return { success: true }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes("UNIQUE")) return { success: false, error: "Username already exists" }
    return { success: false, error: "Failed to create user" }
  }
}

export async function adminChangePassword(
  id: number,
  newPassword: string,
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin()
  if (!newPassword || newPassword.length < 6) return { success: false, error: "Password must be at least 6 characters" }
  updateAdminUserPassword(id, hashPassword(newPassword))
  return { success: true }
}

export async function adminUpdateRole(
  id: number,
  role: "admin" | "staff",
): Promise<{ success: boolean }> {
  await requireAdmin()
  updateAdminUserRole(id, role)
  return { success: true }
}

export async function adminToggleActive(id: number): Promise<{ success: boolean }> {
  await requireAdmin()
  toggleAdminUserActive(id)
  return { success: true }
}

export async function adminDeleteUser(id: number): Promise<{ success: boolean; error?: string }> {
  await requireAdmin()
  const current = await getCurrentUser()
  // Prevent self-deletion
  if (current?.userId === id) return { success: false, error: "You cannot delete your own account" }
  deleteAdminUser(id)
  return { success: true }
}
