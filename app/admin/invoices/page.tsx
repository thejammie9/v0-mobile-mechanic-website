import { redirect } from "next/navigation"
import Link from "next/link"
import { isAdminAuthenticated } from "@/app/admin/actions"
import { getInvoices } from "@/app/actions/invoices"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Download, FileText } from "lucide-react"
import type { Invoice } from "@/lib/db"
import InvoiceRowActions from "./invoice-row-actions"

export const dynamic = "force-dynamic"

const statusColors: Record<string, string> = {
  draft: "bg-gray-700/60 text-gray-300 border-gray-600",
  sent: "bg-blue-900/50 text-blue-300 border-blue-700",
  paid: "bg-green-900/50 text-green-300 border-green-700",
}

function calcTotal(invoice: Invoice): number {
  let labourItems: { hours: number; rate: number }[] = []
  let partsItems: { qty: number; unitPrice: number }[] = []
  try { labourItems = JSON.parse(invoice.labour_items || "[]") } catch {}
  try { partsItems = JSON.parse(invoice.parts_items || "[]") } catch {}
  const subtotal =
    labourItems.reduce((s, i) => s + i.hours * i.rate, 0) +
    partsItems.reduce((s, i) => s + i.qty * i.unitPrice, 0)
  const vat = invoice.vat_enabled ? (subtotal * invoice.vat_rate) / 100 : 0
  return subtotal + vat
}

export default async function InvoicesPage() {
  const isAuthenticated = await isAdminAuthenticated()
  if (!isAuthenticated) {
    redirect("/admin/login")
  }

  const invoices = await getInvoices()

  return (
    <div className="min-h-screen bg-gray-900">
      <main className="container mx-auto px-4 py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-100">Invoices</h1>
          <div className="flex gap-2">
            <a href="/api/admin/export/invoices">
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-gray-100">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </a>
            <Link href="/admin/invoices/new">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                <PlusCircle className="h-4 w-4 mr-2" />
                New Invoice
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-400">Total</CardDescription>
              <CardTitle className="text-3xl text-gray-100">{invoices.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-400">Draft</CardDescription>
              <CardTitle className="text-3xl text-gray-400">
                {invoices.filter(i => i.status === "draft").length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-400">Sent</CardDescription>
              <CardTitle className="text-3xl text-blue-400">
                {invoices.filter(i => i.status === "sent").length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-400">Paid</CardDescription>
              <CardTitle className="text-3xl text-green-400">
                {invoices.filter(i => i.status === "paid").length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Invoices table */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-gray-100">All Invoices</CardTitle>
              <CardDescription className="text-gray-400">
                Manage customer invoices
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p className="text-lg mb-1">No invoices yet</p>
                <p className="text-sm mb-6">Create your first invoice to get started.</p>
                <Link href="/admin/invoices/new">
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    New Invoice
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700 hover:bg-gray-700/50">
                      <TableHead className="text-gray-400">Invoice #</TableHead>
                      <TableHead className="text-gray-400">Customer</TableHead>
                      <TableHead className="text-gray-400">Vehicle</TableHead>
                      <TableHead className="text-gray-400">Total</TableHead>
                      <TableHead className="text-gray-400">Status</TableHead>
                      <TableHead className="text-gray-400">Date</TableHead>
                      <TableHead className="text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => {
                      const total = calcTotal(invoice)
                      const date = new Date(invoice.created_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                      return (
                        <TableRow
                          key={invoice.id}
                          className="border-gray-700 hover:bg-gray-700/40"
                        >
                          <TableCell className="font-mono text-gray-200 font-medium">
                            {invoice.invoice_number}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-gray-100">{invoice.customer_name}</div>
                            <div className="text-sm text-gray-400">{invoice.customer_email}</div>
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {invoice.vehicle || <span className="text-gray-600">—</span>}
                          </TableCell>
                          <TableCell className="text-gray-100 font-medium">
                            £{total.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`capitalize ${statusColors[invoice.status] || statusColors.draft}`}
                            >
                              {invoice.status}
                              {invoice.status === "paid" && invoice.payment_method
                                ? ` · ${invoice.payment_method}`
                                : ""}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-400 text-sm">{date}</TableCell>
                          <TableCell>
                            <InvoiceRowActions
                              invoiceId={invoice.id}
                              status={invoice.status}
                              paymentMethod={invoice.payment_method ?? null}
                            />
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
