"use client"

import { Download } from "lucide-react"
import type { Expense } from "@/lib/db"

type PaidInvoiceSummary = {
  invoice_number: string
  customer_name: string
  vehicle: string
  paid_at: string
  total: number
  vat: number
  payment_method: string
}

type Props = {
  expenses: Expense[]
  paidInvoices: PaidInvoiceSummary[]
}

function escCsv(val: string | number | null | undefined): string {
  const s = val == null ? "" : String(val)
  if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`
  return s
}

function downloadCsv(filename: string, rows: string[][]): void {
  const csv = rows.map(r => r.map(escCsv).join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function ReportsClient({ expenses, paidInvoices }: Props) {
  function exportIncome() {
    const rows: string[][] = [
      ["Invoice No.", "Date", "Customer", "Vehicle", "Total (incl VAT)", "VAT", "Net", "Payment Method"],
      ...paidInvoices.map(i => [
        i.invoice_number,
        i.paid_at.slice(0, 10),
        i.customer_name,
        i.vehicle,
        i.total.toFixed(2),
        i.vat.toFixed(2),
        (i.total - i.vat).toFixed(2),
        i.payment_method,
      ])
    ]
    downloadCsv(`income-${new Date().toISOString().slice(0, 10)}.csv`, rows)
  }

  function exportExpenses() {
    const rows: string[][] = [
      ["Date", "Category", "Description", "Amount", "VAT (Input)", "Net", "Receipt Ref", "Notes"],
      ...expenses.map(e => [
        e.date,
        e.category,
        e.description,
        e.amount.toFixed(2),
        (e.vat_amount || 0).toFixed(2),
        (e.amount - (e.vat_amount || 0)).toFixed(2),
        e.receipt_ref || "",
        e.notes || "",
      ])
    ]
    downloadCsv(`expenses-${new Date().toISOString().slice(0, 10)}.csv`, rows)
  }

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <button
        onClick={exportIncome}
        className="flex items-center gap-2 px-4 py-2 bg-green-800 hover:bg-green-700 text-green-100 rounded-lg text-sm font-medium transition-colors"
      >
        <Download className="h-4 w-4" />
        Export Income CSV
      </button>
      <button
        onClick={exportExpenses}
        className="flex items-center gap-2 px-4 py-2 bg-red-900 hover:bg-red-800 text-red-100 rounded-lg text-sm font-medium transition-colors"
      >
        <Download className="h-4 w-4" />
        Export Expenses CSV
      </button>
    </div>
  )
}
