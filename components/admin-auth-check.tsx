import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default function AdminAuthCheck() {
  const cookieStore = cookies()
  const adminAuth = cookieStore.get("admin_auth")

  // Allow both the environment variable token and the testing token
  const validToken = process.env.ADMIN_AUTH_TOKEN || "default_token"

  if (!adminAuth || (adminAuth.value !== validToken && adminAuth.value !== "testing_token")) {
    redirect("/admin/login")
  }

  return null
}
