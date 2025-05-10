import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function AdminAuthCheck() {
  const cookieStore = cookies()
  const isLoggedIn = cookieStore.has("admin_logged_in")

  if (!isLoggedIn) {
    redirect("/admin/login")
  }

  return null
}
