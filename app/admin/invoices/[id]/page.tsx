import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { isAdminAuthenticated } from "@/app/admin/actions"
import { getInvoice, updateStatus, sendInvoiceEmail } from "@/app/actions/invoices"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowLeft, Printer, CheckCircle, FileText, Pencil } from "lucide-react"
import type { Invoice } from "@/lib/db"
import { DeleteInvoiceButton } from "./delete-button"
import { HealthReportUpload } from "./health-report-upload"
import SendInvoiceButton from "./send-invoice-button"
import { DepositPaidButton } from "./deposit-paid-button"

export const dynamic = "force-dynamic"

const statusColors: Record<string, string> = {
  draft: "bg-gray-700/60 text-gray-300 border-gray-600",
  sent: "bg-blue-900/50 text-blue-300 border-blue-700",
  paid: "bg-green-900/50 text-green-300 border-green-700",
}

type LabourItem = { description: string; hours: number; rate: number }
type PartsItem = { description: string; qty: number; unitPrice: number }

function parseInvoice(invoice: Invoice) {
  let labourItems: LabourItem[] = []
  let partsItems: PartsItem[] = []
  try { labourItems = JSON.parse(invoice.labour_items || "[]") } catch {}
  try { partsItems = JSON.parse(invoice.parts_items || "[]") } catch {}

  const labourSubtotal = labourItems.reduce((s, i) => s + i.hours * i.rate, 0)
  const partsSubtotal = partsItems.reduce((s, i) => s + i.qty * i.unitPrice, 0)
  const discountPct = invoice.labour_discount ?? 0
  const labourDiscountAmount = labourSubtotal * (discountPct / 100)
  const subtotal = (labourSubtotal - labourDiscountAmount) + partsSubtotal
  const vatAmount = invoice.vat_enabled ? (subtotal * invoice.vat_rate) / 100 : 0
  const total = subtotal + vatAmount

  return { labourItems, partsItems, labourSubtotal, partsSubtotal, labourDiscountAmount, discountPct, subtotal, vatAmount, total }
}

const fmt = (n: number) => `£${n.toFixed(2)}`

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const isAuthenticated = await isAdminAuthenticated()
  if (!isAuthenticated) {
    redirect("/admin/login")
  }

  const { id } = await params
  const invoiceId = parseInt(id, 10)
  if (isNaN(invoiceId)) notFound()

  const invoice = await getInvoice(invoiceId)
  if (!invoice) notFound()

  const { labourItems, partsItems, labourSubtotal, partsSubtotal, labourDiscountAmount, discountPct, subtotal, vatAmount, total } =
    parseInvoice(invoice)

  const invoiceDate = new Date(invoice.invoice_date || invoice.created_at).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })

  return (
    <div className="min-h-screen bg-gray-900">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/invoices"
              className="inline-flex items-center gap-1 text-gray-400 hover:text-gray-200 text-sm transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Invoices
            </Link>
            <span className="text-gray-600">/</span>
            <div>
              <h1 className="text-xl font-bold text-gray-100">{invoice.invoice_number}</h1>
              <p className="text-gray-400 text-sm">{invoice.customer_name}</p>
            </div>
          </div>
          <Badge className={`capitalize text-sm px-3 py-1 ${statusColors[invoice.status] || statusColors.draft}`}>
            {invoice.status}
          </Badge>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          {/* Edit */}
          <Link href={`/admin/invoices/${invoiceId}/edit`}>
            <Button variant="outline" className="border-gray-500 text-gray-200 hover:bg-gray-700">
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>

          {/* Send email */}
          <SendInvoiceButton
            invoiceId={invoiceId}
            invoiceTotal={total}
            invoiceNumber={invoice.invoice_number}
            customerName={invoice.customer_name}
            vehicle={invoice.vehicle || ""}
            hasSumUp={!!process.env.SUMUP_API_KEY}
            existingPaymentLink={invoice.payment_link ?? null}
          />

          {/* Mark as Paid */}
          {invoice.status !== "paid" && (
            <form
              action={async () => {
                "use server"
                await updateStatus(invoiceId, "paid")
                redirect(`/admin/invoices/${invoiceId}`)
              }}
            >
              <Button type="submit" className="bg-green-700 hover:bg-green-600 text-white">
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Paid
              </Button>
            </form>
          )}

          {/* Mark as Sent */}
          {invoice.status === "draft" && (
            <form
              action={async () => {
                "use server"
                await updateStatus(invoiceId, "sent")
                redirect(`/admin/invoices/${invoiceId}`)
              }}
            >
              <Button
                type="submit"
                variant="outline"
                className="border-blue-700 text-blue-300 hover:bg-blue-900/40"
              >
                Mark as Sent
              </Button>
            </form>
          )}

          {/* Mark as Draft */}
          {invoice.status !== "draft" && (
            <form
              action={async () => {
                "use server"
                await updateStatus(invoiceId, "draft")
                redirect(`/admin/invoices/${invoiceId}`)
              }}
            >
              <Button
                type="submit"
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Mark as Draft
              </Button>
            </form>
          )}

          {/* Print */}
          <Link href={`/admin/invoices/${invoiceId}/print`} target="_blank">
            <Button
              type="button"
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print / Save PDF
            </Button>
          </Link>

          {/* Set deposit paid */}
          <DepositPaidButton
            invoiceId={invoiceId}
            currentDeposit={invoice.parts_deposit_paid ?? 0}
          />

          {/* Delete */}
          <DeleteInvoiceButton invoiceId={invoiceId} />
        </div>

        <div className="space-y-6">
          {/* Invoice summary header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer details */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-100 text-base">Customer Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-400">Name: </span>
                  <span className="text-gray-100 font-medium">{invoice.customer_name}</span>
                </div>
                <div>
                  <span className="text-gray-400">Email: </span>
                  <span className="text-gray-200">{invoice.customer_email}</span>
                </div>
                {invoice.customer_phone && (
                  <div>
                    <span className="text-gray-400">Phone: </span>
                    <span className="text-gray-200">{invoice.customer_phone}</span>
                  </div>
                )}
                {invoice.customer_address && (
                  <div>
                    <span className="text-gray-400">Address: </span>
                    <span className="text-gray-200 whitespace-pre-line">{invoice.customer_address}</span>
                  </div>
                )}
                {invoice.vehicle && (
                  <div>
                    <span className="text-gray-400">Vehicle: </span>
                    <span className="text-gray-200">{invoice.vehicle}</span>
                  </div>
                )}
                {invoice.mileage && (
                  <div>
                    <span className="text-gray-400">Mileage: </span>
                    <span className="text-gray-200">{invoice.mileage.toLocaleString()} miles</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Invoice details */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-100 text-base">Invoice Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-400">Invoice #: </span>
                  <span className="text-gray-100 font-mono font-medium">{invoice.invoice_number}</span>
                </div>
                <div>
                  <span className="text-gray-400">Date: </span>
                  <span className="text-gray-200">{invoiceDate}</span>
                </div>
                <div>
                  <span className="text-gray-400">Status: </span>
                  <Badge className={`capitalize ml-1 ${statusColors[invoice.status] || statusColors.draft}`}>
                    {invoice.status}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-400">VAT: </span>
                  <span className="text-gray-200">
                    {invoice.vat_enabled ? `Yes (${invoice.vat_rate}%)` : "No"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Labour items */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100 text-base">Labour</CardTitle>
            </CardHeader>
            <CardContent>
              {labourItems.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No labour items</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-400">Description</TableHead>
                      <TableHead className="text-gray-400 text-right">Hours</TableHead>
                      <TableHead className="text-gray-400 text-right">Rate/hr</TableHead>
                      <TableHead className="text-gray-400 text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {labourItems.map((item, idx) => (
                      <TableRow key={idx} className="border-gray-700">
                        <TableCell className="text-gray-200">{item.description}</TableCell>
                        <TableCell className="text-gray-300 text-right">{item.hours}</TableCell>
                        <TableCell className="text-gray-300 text-right">{fmt(item.rate)}</TableCell>
                        <TableCell className="text-gray-100 text-right font-medium">{fmt(item.hours * item.rate)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <div className="flex justify-end pt-3 border-t border-gray-700 mt-3 text-sm text-gray-300">
                Labour Subtotal: <span className="ml-2 text-gray-100 font-medium">{fmt(labourSubtotal)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Parts items */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100 text-base">Parts &amp; Materials</CardTitle>
            </CardHeader>
            <CardContent>
              {partsItems.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No parts items</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-400">Description</TableHead>
                      <TableHead className="text-gray-400 text-right">Qty</TableHead>
                      <TableHead className="text-gray-400 text-right">Unit Price</TableHead>
                      <TableHead className="text-gray-400 text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {partsItems.map((item, idx) => (
                      <TableRow key={idx} className="border-gray-700">
                        <TableCell className="text-gray-200">{item.description}</TableCell>
                        <TableCell className="text-gray-300 text-right">{item.qty}</TableCell>
                        <TableCell className="text-gray-300 text-right">{fmt(item.unitPrice)}</TableCell>
                        <TableCell className="text-gray-100 text-right font-medium">{fmt(item.qty * item.unitPrice)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <div className="flex justify-end pt-3 border-t border-gray-700 mt-3 text-sm text-gray-300">
                Parts Subtotal: <span className="ml-2 text-gray-100 font-medium">{fmt(partsSubtotal)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Totals */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <div className="max-w-xs ml-auto space-y-2 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Labour Subtotal</span>
                  <span>{fmt(labourSubtotal)}</span>
                </div>
                {discountPct > 0 && (
                  <div className="flex justify-between text-orange-400">
                    <span>Labour Discount ({discountPct}%)</span>
                    <span>−{fmt(labourDiscountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-300">
                  <span>Parts Subtotal</span>
                  <span>{fmt(partsSubtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-300 border-t border-gray-700 pt-2">
                  <span>Subtotal</span>
                  <span>{fmt(subtotal)}</span>
                </div>
                {invoice.vat_enabled ? (
                  <div className="flex justify-between text-gray-300">
                    <span>VAT ({invoice.vat_rate}%)</span>
                    <span>{fmt(vatAmount)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-gray-100 font-bold text-lg border-t border-gray-600 pt-2">
                  <span>Total</span>
                  <span>{fmt(total)}</span>
                </div>
                {invoice.parts_deposit_paid && invoice.parts_deposit_paid > 0 ? (
                  <>
                    <div className="flex justify-between text-green-400">
                      <span>Parts Deposit Paid</span>
                      <span>−{fmt(invoice.parts_deposit_paid)}</span>
                    </div>
                    <div className="flex justify-between text-gray-100 font-bold text-lg border-t border-gray-600 pt-2">
                      <span>Balance Due</span>
                      <span>{fmt(Math.max(0, total - invoice.parts_deposit_paid))}</span>
                    </div>
                  </>
                ) : null}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {invoice.notes && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-100 text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm whitespace-pre-line">{invoice.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Vehicle Health Report */}
          <HealthReportUpload invoiceId={invoiceId} hasReport={!!invoice.health_report} />
        </div>
      </main>
    </div>
  )
}
