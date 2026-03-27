import { redirect } from "next/navigation"
import Link from "next/link"
import { isAdminAuthenticated } from "@/app/admin/actions"
import { getQuotes } from "@/app/actions/quotes"
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
import { PlusCircle } from "lucide-react"
import type { Quote } from "@/lib/db"

export const dynamic = "force-dynamic"

const statusColors: Record<string, string> = {
  draft: "bg-gray-700/60 text-gray-300 border-gray-600",
  sent: "bg-blue-900/50 text-blue-300 border-blue-700",
  accepted: "bg-green-900/50 text-green-300 border-green-700",
  declined: "bg-red-900/50 text-red-300 border-red-700",
  converted: "bg-purple-900/50 text-purple-300 border-purple-700",
}

function calcTotal(quote: Quote): number {
  let labourItems: { hours: number; rate: number }[] = []
  let partsItems: { qty: number; unitPrice: number }[] = []
  try { labourItems = JSON.parse(quote.labour_items || "[]") } catch {}
  try { partsItems = JSON.parse(quote.parts_items || "[]") } catch {}
  const subtotal =
    labourItems.reduce((s, i) => s + i.hours * i.rate, 0) +
    partsItems.reduce((s, i) => s + i.qty * i.unitPrice, 0)
  const vat = quote.vat_enabled ? (subtotal * quote.vat_rate) / 100 : 0
  return subtotal + vat
}

export default async function QuotesPage() {
  const isAuthenticated = await isAdminAuthenticated()
  if (!isAuthenticated) {
    redirect("/admin/login")
  }

  const quotes = await getQuotes()

  return (
    <div className="min-h-screen bg-gray-900">
      <main className="container mx-auto px-4 py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-100">Quotes</h1>
          <Link href="/admin/quotes/new">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              <PlusCircle className="h-4 w-4 mr-2" />
              New Quote
            </Button>
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-400">Total</CardDescription>
              <CardTitle className="text-3xl text-gray-100">{quotes.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-400">Draft</CardDescription>
              <CardTitle className="text-3xl text-gray-400">
                {quotes.filter(q => q.status === "draft").length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-400">Sent</CardDescription>
              <CardTitle className="text-3xl text-blue-400">
                {quotes.filter(q => q.status === "sent").length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-400">Converted</CardDescription>
              <CardTitle className="text-3xl text-purple-400">
                {quotes.filter(q => q.status === "converted").length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Quotes table */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100">All Quotes</CardTitle>
            <CardDescription className="text-gray-400">Manage customer quotes</CardDescription>
          </CardHeader>
          <CardContent>
            {quotes.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <p className="text-lg mb-1">No quotes yet</p>
                <p className="text-sm mb-6">Create your first quote to get started.</p>
                <Link href="/admin/quotes/new">
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    New Quote
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700 hover:bg-gray-700/50">
                      <TableHead className="text-gray-400">Quote #</TableHead>
                      <TableHead className="text-gray-400">Customer</TableHead>
                      <TableHead className="text-gray-400">Vehicle</TableHead>
                      <TableHead className="text-gray-400">Total</TableHead>
                      <TableHead className="text-gray-400">Status</TableHead>
                      <TableHead className="text-gray-400">Date</TableHead>
                      <TableHead className="text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotes.map((quote) => {
                      const total = calcTotal(quote)
                      const date = new Date(quote.created_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                      return (
                        <TableRow key={quote.id} className="border-gray-700 hover:bg-gray-700/40">
                          <TableCell className="font-mono text-gray-200 font-medium">
                            {quote.quote_number}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-gray-100">{quote.customer_name}</div>
                            <div className="text-sm text-gray-400">{quote.customer_email}</div>
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {quote.vehicle || <span className="text-gray-600">—</span>}
                          </TableCell>
                          <TableCell className="text-gray-100 font-medium">
                            £{total.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge className={`capitalize ${statusColors[quote.status] || statusColors.draft}`}>
                              {quote.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-400 text-sm">{date}</TableCell>
                          <TableCell>
                            <Link href={`/admin/quotes/${quote.id}`}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-gray-100"
                              >
                                View
                              </Button>
                            </Link>
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
