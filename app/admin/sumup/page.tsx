import { redirect } from "next/navigation"
import { isAdminAuthenticated } from "@/app/admin/actions"
import { getAllInvoices } from "@/lib/db"
import type { Invoice } from "@/lib/db"
import SumUpClient from "./sumup-client"

export const dynamic = "force-dynamic"

type LabourItem = { hours: number; rate: number }
type PartsItem = { qty: number; unitPrice: number }

function calcTotal(invoice: Invoice): number {
  let labour: LabourItem[] = []
  let parts: PartsItem[] = []
  try { labour = JSON.parse(invoice.labour_items || "[]") } catch {}
  try { parts = JSON.parse(invoice.parts_items || "[]") } catch {}
  const labourSub = labour.reduce((s, i) => s + i.hours * i.rate, 0)
  const discount = invoice.labour_discount ?? 0
  const subtotal = (labourSub * (1 - discount / 100)) + parts.reduce((s, i) => s + i.qty * i.unitPrice, 0)
  return subtotal + (invoice.vat_enabled ? (subtotal * invoice.vat_rate) / 100 : 0)
}

export default async function SumUpPage() {
  const authed = await isAdminAuthenticated()
  if (!authed) redirect("/admin/login")

  const configured = !!process.env.SUMUP_API_KEY

  const unpaidInvoices = getAllInvoices()
    .filter(i => i.status === "sent" || i.status === "draft")
    .map(i => ({
      id: i.id,
      invoice_number: i.invoice_number,
      customer_name: i.customer_name,
      vehicle: i.vehicle || "",
      total: calcTotal(i),
      created_at: i.created_at,
      transaction_ref: i.transaction_ref,
    }))

  return (
    <div className="min-h-screen bg-gray-900">
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <SumUpClient unpaidInvoices={unpaidInvoices} configured={configured} />
      </main>
    </div>
  )
}
