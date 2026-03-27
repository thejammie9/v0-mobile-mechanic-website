import { redirect } from "next/navigation"
import { isAdminAuthenticated } from "./actions"
import { getBookings } from "@/app/actions/bookings"
import { getAllInvoices } from "@/lib/db"
import AdminDashboard from "@/components/admin-dashboard"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const isAuthenticated = await isAdminAuthenticated()

  if (!isAuthenticated) {
    redirect("/admin/login")
  }

  const bookings = await getBookings()
  const invoices = getAllInvoices()

  return <AdminDashboard bookings={bookings} invoices={invoices} />
}
