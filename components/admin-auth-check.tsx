import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function AdminAuthCheck() {
  // Get all cookies and check manually instead of using .has()
  const cookiesList = cookies()
  const allCookies = cookiesList.getAll()
  const isLoggedIn = allCookies.some((cookie) => cookie.name === "admin_logged_in")

  if (!isLoggedIn) {
    redirect("/admin/login")
  }

  return null
}
