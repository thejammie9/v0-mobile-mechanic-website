import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/app/admin/actions"
import { getAllInvoices, type Invoice } from "@/lib/db"

export const dynamic = "force-dynamic"

function calcTotal(invoice: Invoice) {
  let labourItems: { hours: number; rate: number }[] = []
  let partsItems: { qty: number; unitPrice: number }[] = []
  try { labourItems = JSON.parse(invoice.labour_items || "[]") } catch {}
  try { partsItems = JSON.parse(invoice.parts_items || "[]") } catch {}
  const labour = labourItems.reduce((s, i) => s + i.hours * i.rate, 0)
  const parts  = partsItems.reduce((s, i) => s + i.qty * i.unitPrice, 0)
  const subtotal = labour + parts
  const vat = invoice.vat_enabled ? (subtotal * invoice.vat_rate) / 100 : 0
  return { labour, parts, subtotal, vat, total: subtotal + vat }
}

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

  const invoices = getAllInvoices()

  const headers = [
    "Invoice Number",
    "Customer Name",
    "Email",
    "Vehicle",
    "Status",
    "Labour (£)",
    "Parts (£)",
    "Subtotal (£)",
    "VAT (£)",
    "Total (£)",
    "Date",
  ]

  const rows = invoices.map((inv) => {
    const t = calcTotal(inv)
    const date = new Date(inv.created_at).toLocaleDateString("en-GB")
    return [
      inv.invoice_number,
      inv.customer_name,
      inv.customer_email,
      inv.vehicle ?? "",
      inv.status,
      t.labour.toFixed(2),
      t.parts.toFixed(2),
      t.subtotal.toFixed(2),
      t.vat.toFixed(2),
      t.total.toFixed(2),
      date,
    ].map(escapeCSV).join(",")
  })

  const csv = [headers.join(","), ...rows].join("\n")
  const filename = `invoices-${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
