import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/app/admin/actions"
import { getExpenses } from "@/lib/db"

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

  const expenses = getExpenses()

  const headers = ["Date", "Category", "Description", "Amount (£)", "Receipt Ref", "Notes"]

  const rows = expenses.map((e) => [
    e.date,
    e.category,
    e.description,
    e.amount.toFixed(2),
    e.receipt_ref ?? "",
    e.notes ?? "",
  ].map(escapeCSV).join(","))

  const csv = [headers.join(","), ...rows].join("\n")
  const filename = `expenses-${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
