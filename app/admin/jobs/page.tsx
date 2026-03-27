import { redirect } from "next/navigation"
import Link from "next/link"
import { isAdminAuthenticated } from "@/app/admin/actions"
import { getAllBookings, getAllCustomers, getAllQuotes, getAllInvoices } from "@/lib/db"
import { ClipboardCheck, Plus } from "lucide-react"
import JobsClient from "./jobs-client"

export const dynamic = "force-dynamic"

export default async function JobsPage() {
  const isAuthenticated = await isAdminAuthenticated()
  if (!isAuthenticated) redirect("/admin/login")

  const bookings = getAllBookings()
  const customers = getAllCustomers()
  const quotes = getAllQuotes()
  const invoices = getAllInvoices()
  // Sort by date descending
  const sorted = [...bookings].sort((a, b) => {
    const da = a.confirmed_date || a.preferred_date || a.created_at
    const db_ = b.confirmed_date || b.preferred_date || b.created_at
    return db_.localeCompare(da)
  })

  return (
    <div className="min-h-screen bg-gray-900">
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ClipboardCheck className="h-7 w-7 text-orange-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-100">Job Sheet</h1>
              <p className="text-gray-400 text-sm">Record what was done for each job</p>
            </div>
          </div>
          <Link href="/admin/jobs/new">
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors">
              <Plus className="h-4 w-4" />
              Book a Job
            </button>
          </Link>
        </div>
        <JobsClient bookings={sorted} customers={customers} quotes={quotes} invoices={invoices} />
      </main>
    </div>
  )
}
