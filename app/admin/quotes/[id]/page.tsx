import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { isAdminAuthenticated } from "@/app/admin/actions"
import { getQuote, updateQuoteStatusAction, convertToInvoice, markQuoteDepositPaidAction } from "@/app/actions/quotes"
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
import { ArrowLeft, Printer, CheckCircle, Pencil, RefreshCw, CheckSquare } from "lucide-react"
import type { Quote } from "@/lib/db"
import { DeleteQuoteButton } from "./delete-button"
import SendQuoteButton from "./send-quote-button"
import { AcceptDepositButton } from "./accept-deposit-button"

export const dynamic = "force-dynamic"

const statusColors: Record<string, string> = {
  draft: "bg-gray-700/60 text-gray-300 border-gray-600",
  sent: "bg-blue-900/50 text-blue-300 border-blue-700",
  accepted: "bg-green-900/50 text-green-300 border-green-700",
  declined: "bg-red-900/50 text-red-300 border-red-700",
  converted: "bg-purple-900/50 text-purple-300 border-purple-700",
}

type LabourItem = { description: string; hours: number; rate: number }
type PartsItem = { description: string; qty: number; unitPrice: number }

function parseQuote(quote: Quote) {
  let labourItems: LabourItem[] = []
  let partsItems: PartsItem[] = []
  try { labourItems = JSON.parse(quote.labour_items || "[]") } catch {}
  try { partsItems = JSON.parse(quote.parts_items || "[]") } catch {}

  const labourSubtotal = labourItems.reduce((s, i) => s + i.hours * i.rate, 0)
  const partsSubtotal = partsItems.reduce((s, i) => s + i.qty * i.unitPrice, 0)
  const subtotal = labourSubtotal + partsSubtotal
  const vatAmount = quote.vat_enabled ? (subtotal * quote.vat_rate) / 100 : 0
  const total = subtotal + vatAmount

  return { labourItems, partsItems, labourSubtotal, partsSubtotal, subtotal, vatAmount, total }
}

const fmt = (n: number) => `£${n.toFixed(2)}`

export default async function QuotePage({ params }: { params: Promise<{ id: string }> }) {
  const isAuthenticated = await isAdminAuthenticated()
  if (!isAuthenticated) {
    redirect("/admin/login")
  }

  const { id } = await params
  const quoteId = parseInt(id, 10)
  if (isNaN(quoteId)) notFound()

  const quote = await getQuote(quoteId)
  if (!quote) notFound()

  const { labourItems, partsItems, labourSubtotal, partsSubtotal, subtotal, vatAmount, total } =
    parseQuote(quote)

  const quoteDate = new Date(quote.invoice_date || quote.created_at).toLocaleDateString("en-GB", {
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
              href="/admin/quotes"
              className="inline-flex items-center gap-1 text-gray-400 hover:text-gray-200 text-sm transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Quotes
            </Link>
            <span className="text-gray-600">/</span>
            <div>
              <h1 className="text-xl font-bold text-gray-100">{quote.quote_number}</h1>
              <p className="text-gray-400 text-sm">{quote.customer_name}</p>
            </div>
          </div>
          <Badge className={`capitalize text-sm px-3 py-1 ${statusColors[quote.status] || statusColors.draft}`}>
            {quote.status}
          </Badge>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          {/* Edit */}
          <Link href={`/admin/quotes/${quoteId}/edit`}>
            <Button variant="outline" className="border-gray-500 text-gray-200 hover:bg-gray-700">
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>

          {/* Send quote email */}
          <SendQuoteButton
            quoteId={quoteId}
            quoteNumber={quote.quote_number}
            customerName={quote.customer_name}
            vehicle={quote.vehicle || ""}
            hasSumUp={!!process.env.SUMUP_API_KEY}
            existingPaymentLink={quote.payment_link ?? null}
            existingDepositAmount={quote.deposit_amount ?? null}
          />

          {/* Convert to Invoice */}
          {quote.status !== "converted" && (
            <form
              action={async () => {
                "use server"
                const result = await convertToInvoice(quoteId)
                if (result.success && result.invoiceId) {
                  redirect(`/admin/invoices/${result.invoiceId}`)
                } else {
                  redirect(`/admin/quotes/${quoteId}`)
                }
              }}
            >
              <Button type="submit" className="bg-purple-700 hover:bg-purple-600 text-white">
                <RefreshCw className="h-4 w-4 mr-2" />
                Convert to Invoice
              </Button>
            </form>
          )}

          {/* Accept & send deposit (when SumUp configured and parts exist) */}
          {quote.status !== "accepted" && quote.status !== "converted" && partsSubtotal > 0 && !!process.env.SUMUP_API_KEY && (
            <AcceptDepositButton quoteId={quoteId} />
          )}

          {/* Mark as Accepted (plain — no SumUp or no parts) */}
          {quote.status !== "accepted" && quote.status !== "converted" && (partsSubtotal === 0 || !process.env.SUMUP_API_KEY) && (
            <form
              action={async () => {
                "use server"
                await updateQuoteStatusAction(quoteId, "accepted")
                redirect(`/admin/quotes/${quoteId}`)
              }}
            >
              <Button type="submit" className="bg-green-700 hover:bg-green-600 text-white">
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Accepted
              </Button>
            </form>
          )}

          {/* Mark as Sent */}
          {quote.status === "draft" && (
            <form
              action={async () => {
                "use server"
                await updateQuoteStatusAction(quoteId, "sent")
                redirect(`/admin/quotes/${quoteId}`)
              }}
            >
              <Button type="submit" variant="outline" className="border-blue-700 text-blue-300 hover:bg-blue-900/40">
                Mark as Sent
              </Button>
            </form>
          )}

          {/* Mark as Declined */}
          {(quote.status === "sent" || quote.status === "accepted") && (
            <form
              action={async () => {
                "use server"
                await updateQuoteStatusAction(quoteId, "declined")
                redirect(`/admin/quotes/${quoteId}`)
              }}
            >
              <Button type="submit" variant="outline" className="border-red-700 text-red-300 hover:bg-red-900/40">
                Mark as Declined
              </Button>
            </form>
          )}

          {/* Print */}
          <Link href={`/admin/quotes/${quoteId}/print`} target="_blank">
            <Button type="button" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
              <Printer className="h-4 w-4 mr-2" />
              Print / Save PDF
            </Button>
          </Link>

          {/* Mark Deposit Paid */}
          {quote.deposit_amount && quote.deposit_amount > 0 && !quote.deposit_paid_amount && (
            <form
              action={async () => {
                "use server"
                await markQuoteDepositPaidAction(quoteId, quote.deposit_amount!)
                redirect(`/admin/quotes/${quoteId}`)
              }}
            >
              <Button type="submit" className="bg-orange-700 hover:bg-orange-600 text-white">
                <CheckSquare className="h-4 w-4 mr-2" />
                Mark Deposit Paid
              </Button>
            </form>
          )}

          {/* Delete */}
          <DeleteQuoteButton quoteId={quoteId} />
        </div>

        {/* Converted notice */}
        {quote.converted_invoice_id && (
          <div className="mb-6 bg-purple-900/30 border border-purple-700 text-purple-300 rounded-md px-4 py-3 text-sm">
            This quote has been converted to{" "}
            <Link href={`/admin/invoices/${quote.converted_invoice_id}`} className="underline hover:text-purple-100">
              Invoice #{quote.converted_invoice_id}
            </Link>
          </div>
        )}

        <div className="space-y-6">
          {/* Details grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-100 text-base">Customer Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-400">Name: </span>
                  <span className="text-gray-100 font-medium">{quote.customer_name}</span>
                </div>
                <div>
                  <span className="text-gray-400">Email: </span>
                  <span className="text-gray-200">{quote.customer_email}</span>
                </div>
                {quote.customer_phone && (
                  <div>
                    <span className="text-gray-400">Phone: </span>
                    <span className="text-gray-200">{quote.customer_phone}</span>
                  </div>
                )}
                {quote.customer_address && (
                  <div>
                    <span className="text-gray-400">Address: </span>
                    <span className="text-gray-200 whitespace-pre-line">{quote.customer_address}</span>
                  </div>
                )}
                {quote.vehicle && (
                  <div>
                    <span className="text-gray-400">Vehicle: </span>
                    <span className="text-gray-200">{quote.vehicle}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-100 text-base">Quote Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-400">Quote #: </span>
                  <span className="text-gray-100 font-mono font-medium">{quote.quote_number}</span>
                </div>
                <div>
                  <span className="text-gray-400">Date: </span>
                  <span className="text-gray-200">{quoteDate}</span>
                </div>
                <div>
                  <span className="text-gray-400">Status: </span>
                  <Badge className={`capitalize ml-1 ${statusColors[quote.status] || statusColors.draft}`}>
                    {quote.status}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-400">VAT: </span>
                  <span className="text-gray-200">
                    {quote.vat_enabled ? `Yes (${quote.vat_rate}%)` : "No"}
                  </span>
                </div>
                {quote.deposit_amount && quote.deposit_amount > 0 ? (
                  <div>
                    <span className="text-gray-400">Deposit: </span>
                    <span className="text-gray-200">£{quote.deposit_amount.toFixed(2)} </span>
                    {quote.deposit_paid_amount && quote.deposit_paid_amount > 0 ? (
                      <Badge className="bg-green-900/50 text-green-300 border-green-700 ml-1">Paid</Badge>
                    ) : (
                      <Badge className="bg-orange-900/50 text-orange-300 border-orange-700 ml-1">Awaiting</Badge>
                    )}
                  </div>
                ) : null}
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
                <div className="overflow-x-auto">
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
                </div>
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
                <div className="overflow-x-auto">
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
                </div>
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
                <div className="flex justify-between text-gray-300">
                  <span>Parts Subtotal</span>
                  <span>{fmt(partsSubtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-300 border-t border-gray-700 pt-2">
                  <span>Subtotal</span>
                  <span>{fmt(subtotal)}</span>
                </div>
                {quote.vat_enabled ? (
                  <div className="flex justify-between text-gray-300">
                    <span>VAT ({quote.vat_rate}%)</span>
                    <span>{fmt(vatAmount)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-gray-100 font-bold text-lg border-t border-gray-600 pt-2">
                  <span>Total</span>
                  <span>{fmt(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {quote.notes && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-100 text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm whitespace-pre-line">{quote.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
