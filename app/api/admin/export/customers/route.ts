import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/app/admin/actions"
import { getAllCustomers } from "@/lib/db"

export const dynamic = "force-dynamic"

function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ""
  const str = String(value)
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export async function GET() {
  const isAuthenticated = await isAdminAuthenticated()
  if (!isAuthenticated) {
    return new NextResponse("Unauthorised", { status: 401 })
  }

  const customers = getAllCustomers()

  const headers = [
    "Name",
    "Email",
    "Phone",
    "Address",
    "Bookings",
    "Invoices",
    "Service Reminder",
    "Created",
  ]

  const rows = customers.map((c) => [
    c.name,
    c.email,
    c.phone ?? "",
    c.address ?? "",
    c.booking_count,
    c.invoice_count,
    c.service_reminder ? "Yes" : "No",
    new Date(c.created_at).toLocaleDateString("en-GB"),
  ].map(escapeCSV).join(","))

  const csv = [headers.join(","), ...rows].join("\n")
  const filename = `customers-${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
