import { redirect } from "next/navigation"
import { isAdminAuthenticated } from "./actions"
import { getBookings } from "@/app/actions/bookings"
import AdminDashboard from "@/components/admin-dashboard"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const isAuthenticated = await isAdminAuthenticated()
  
  if (!isAuthenticated) {
    redirect("/admin/login")
  }

  const bookings = await getBookings()

  return <AdminDashboard bookings={bookings} />
}
