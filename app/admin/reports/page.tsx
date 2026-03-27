import { redirect } from "next/navigation"
import { isAdminAuthenticated } from "@/app/admin/actions"
import { getAllInvoices, getExpenses, getSiteSetting } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, PoundSterling, Download, Receipt } from "lucide-react"
import type { Invoice } from "@/lib/db"
import ReportsClient from "./reports-client"

export const dynamic = "force-dynamic"

type LabourItem = { hours: number; rate: number }
type PartsItem = { qty: number; unitPrice: number }

function calcTotal(invoice: Invoice): number {
  let labour: LabourItem[] = []
  let parts: PartsItem[] = []
  try { labour = JSON.parse(invoice.labour_items || "[]") } catch {}
  try { parts = JSON.parse(invoice.parts_items || "[]") } catch {}
  const subtotal =
    labour.reduce((s, i) => s + i.hours * i.rate, 0) +
    parts.reduce((s, i) => s + i.qty * i.unitPrice, 0)
  return subtotal + (invoice.vat_enabled ? (subtotal * invoice.vat_rate) / 100 : 0)
}

function getTaxYear(date: Date): string {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  // Tax year runs April 6 to April 5
  if (month > 4 || (month === 4 && day >= 6)) {
    return `${year}/${year + 1}`
  }
  return `${year - 1}/${year}`
}

function currentTaxYearBounds(): { start: Date; end: Date } {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const day = now.getDate()
  let startYear: number
  if (month > 4 || (month === 4 && day >= 6)) {
    startYear = year
  } else {
    startYear = year - 1
  }
  return {
    start: new Date(`${startYear}-04-06T00:00:00`),
    end: new Date(`${startYear + 1}-04-05T23:59:59`),
  }
}

function fmt(n: number) {
  return `£${n.toFixed(2)}`
}

function monthLabel(ym: string): string {
  const [y, m] = ym.split("-")
  return new Date(parseInt(y), parseInt(m) - 1, 1).toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  })
}

function calcVatTotal(invoice: Invoice): number {
  let labour: LabourItem[] = []
  let parts: PartsItem[] = []
  try { labour = JSON.parse(invoice.labour_items || "[]") } catch {}
  try { parts = JSON.parse(invoice.parts_items || "[]") } catch {}
  const labourSub = labour.reduce((s, i) => s + i.hours * i.rate, 0)
  const discount = invoice.labour_discount ?? 0
  const subtotal = (labourSub * (1 - discount / 100)) + parts.reduce((s, i) => s + i.qty * i.unitPrice, 0)
  return invoice.vat_enabled ? (subtotal * invoice.vat_rate) / 100 : 0
}

// Returns the start of the financial year containing `date`, given a MM-DD year end
function getFinancialYearStart(date: Date, yearEndMD: string): Date {
  const [mm, dd] = yearEndMD.split("-").map(Number)
  const year = date.getFullYear()
  // Year end this calendar year
  const endThisYear = new Date(year, mm - 1, dd, 23, 59, 59)
  if (date <= endThisYear) {
    // We're before this year's end — year started last year
    return new Date(year - 1, mm - 1, dd + 1 > new Date(year - 1, mm, 0).getDate() ? dd : dd)
  }
  return new Date(year, mm - 1, dd + 1 > new Date(year, mm, 0).getDate() ? dd : dd)
}

// Build quarterly VAT periods (3-month quarters) for the last 4 quarters
function buildVatQuarters(refDate: Date): { label: string; start: Date; end: Date }[] {
  const quarters = []
  for (let q = 3; q >= 0; q--) {
    // Work back from current month in 3-month chunks
    const endMonth = refDate.getMonth() - (q * 3)
    const endDate = new Date(refDate.getFullYear(), endMonth + 1, 0, 23, 59, 59) // last day of that month
    const startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 2, 1)
    const label = `${startDate.toLocaleDateString("en-GB", { month: "short", year: "2-digit" })} – ${endDate.toLocaleDateString("en-GB", { month: "short", year: "2-digit" })}`
    quarters.push({ label, start: startDate, end: endDate })
  }
  return quarters
}

export default async function ReportsPage() {
  const isAuthenticated = await isAdminAuthenticated()
  if (!isAuthenticated) redirect("/admin/login")

  const allInvoices = getAllInvoices()
  const allExpenses = getExpenses()
  const financialYearEnd = getSiteSetting("financial_year_end") || "03-31"
  const companyNumber = getSiteSetting("company_number") || ""
  const vatNumber = getSiteSetting("vat_number") || ""

  const { start: taxStart, end: taxEnd } = currentTaxYearBounds()

  // Financial year bounds
  const now = new Date()
  const fyStart = getFinancialYearStart(now, financialYearEnd)
  const [fyMM, fyDD] = financialYearEnd.split("-").map(Number)
  const fyEndYear = fyStart.getFullYear() + 1
  const fyEnd = new Date(fyEndYear, fyMM - 1, fyDD, 23, 59, 59)
  const fyLabel = `${fyStart.getFullYear()}/${fyEndYear}`

  // Paid invoices
  const paidInvoices = allInvoices.filter((i) => i.status === "paid")

  // Group revenue by month (use paid_at or created_at)
  const revenueByMonth: Record<string, number> = {}
  for (const inv of paidInvoices) {
    const dateStr = inv.paid_at || inv.created_at
    const ym = dateStr.slice(0, 7) // YYYY-MM
    revenueByMonth[ym] = (revenueByMonth[ym] || 0) + calcTotal(inv)
  }

  // Group expenses by month
  const expensesByMonth: Record<string, number> = {}
  for (const exp of allExpenses) {
    const ym = exp.date.slice(0, 7)
    expensesByMonth[ym] = (expensesByMonth[ym] || 0) + exp.amount
  }

  // All months that have any activity
  const allMonths = Array.from(
    new Set([...Object.keys(revenueByMonth), ...Object.keys(expensesByMonth)])
  ).sort((a, b) => b.localeCompare(a)) // most recent first

  // Last 12 months
  const months12 = allMonths.slice(0, 12)

  // Tax year totals
  const taxRevenue = paidInvoices
    .filter((i) => {
      const d = new Date(i.paid_at || i.created_at)
      return d >= taxStart && d <= taxEnd
    })
    .reduce((s, i) => s + calcTotal(i), 0)

  const taxExpenses = allExpenses
    .filter((e) => {
      const d = new Date(e.date)
      return d >= taxStart && d <= taxEnd
    })
    .reduce((s, e) => s + e.amount, 0)

  const taxProfit = taxRevenue - taxExpenses

  // Financial year totals
  const fyRevenue = paidInvoices
    .filter(i => { const d = new Date(i.paid_at || i.created_at); return d >= fyStart && d <= fyEnd })
    .reduce((s, i) => s + calcTotal(i), 0)
  const fyExpenses = allExpenses
    .filter(e => { const d = new Date(e.date); return d >= fyStart && d <= fyEnd })
    .reduce((s, e) => s + e.amount, 0)
  const fyProfit = fyRevenue - fyExpenses

  // VAT quarters — output VAT (from invoices) and input VAT (from expenses)
  const vatQuarters = buildVatQuarters(now).map(q => {
    const outputVat = paidInvoices
      .filter(i => { const d = new Date(i.paid_at || i.created_at); return d >= q.start && d <= q.end })
      .reduce((s, i) => s + calcVatTotal(i), 0)
    const inputVat = allExpenses
      .filter(e => { const d = new Date(e.date); return d >= q.start && d <= q.end })
      .reduce((s, e) => s + (e.vat_amount || 0), 0)
    return { label: q.label, outputVat, inputVat, net: outputVat - inputVat }
  })

  const hasVatNumber = !!vatNumber

  // Current month
  const nowYM = new Date().toISOString().slice(0, 7)
  const monthRevenue = revenueByMonth[nowYM] || 0
  const monthExpenses = expensesByMonth[nowYM] || 0
  const monthProfit = monthRevenue - monthExpenses

  // Outstanding (sent invoices not yet paid)
  const outstanding = allInvoices
    .filter((i) => i.status === "sent" || i.status === "draft")
    .reduce((s, i) => s + calcTotal(i), 0)

  const taxYearLabel = getTaxYear(new Date())

  return (
    <div className="min-h-screen bg-gray-900">
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <PoundSterling className="h-7 w-7 text-orange-500" />
          <h1 className="text-2xl font-bold text-gray-100">Profit &amp; Loss</h1>
        </div>

        {/* Top stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-400">This Month Revenue</CardDescription>
              <CardTitle className="text-2xl text-green-400">{fmt(monthRevenue)}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-400">This Month Expenses</CardDescription>
              <CardTitle className="text-2xl text-red-400">{fmt(monthExpenses)}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-400">This Month Profit</CardDescription>
              <CardTitle className={`text-2xl ${monthProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                {fmt(monthProfit)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-400">Outstanding (unpaid)</CardDescription>
              <CardTitle className="text-2xl text-yellow-400">{fmt(outstanding)}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Financial year summary */}
        <Card className="bg-gray-800 border-gray-700 mb-4">
          <CardHeader>
            <CardTitle className="text-gray-100">Company Financial Year {fyLabel}</CardTitle>
            <CardDescription className="text-gray-400">
              {fyStart.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} — {fyEnd.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              {companyNumber && <span className="ml-3 text-gray-500">Co. No. {companyNumber}</span>}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-green-400 flex-shrink-0" />
                <div><p className="text-gray-400 text-sm">Revenue</p><p className="text-2xl font-bold text-green-400">{fmt(fyRevenue)}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <TrendingDown className="h-8 w-8 text-red-400 flex-shrink-0" />
                <div><p className="text-gray-400 text-sm">Expenses</p><p className="text-2xl font-bold text-red-400">{fmt(fyExpenses)}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <PoundSterling className="h-8 w-8 text-orange-400 flex-shrink-0" />
                <div><p className="text-gray-400 text-sm">Net Profit</p><p className={`text-2xl font-bold ${fyProfit >= 0 ? "text-orange-400" : "text-red-400"}`}>{fmt(fyProfit)}</p></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* VAT return summary */}
        <Card className="bg-gray-800 border-gray-700 mb-4">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-blue-400" />
              <CardTitle className="text-gray-100">VAT Summary</CardTitle>
            </div>
            <CardDescription className="text-gray-400">
              {hasVatNumber ? `VAT No. ${vatNumber} · Quarterly breakdown` : "Quarterly breakdown · Add your VAT number in Settings once registered"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700 text-gray-400">
                    <th className="text-left pb-3 font-medium">Quarter</th>
                    <th className="text-right pb-3 font-medium">Output VAT (charged)</th>
                    <th className="text-right pb-3 font-medium">Input VAT (paid)</th>
                    <th className="text-right pb-3 font-medium">Net VAT Due</th>
                  </tr>
                </thead>
                <tbody>
                  {vatQuarters.map((q) => (
                    <tr key={q.label} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                      <td className="py-3 text-gray-300">{q.label}</td>
                      <td className="py-3 text-right text-blue-400">{fmt(q.outputVat)}</td>
                      <td className="py-3 text-right text-green-400">−{fmt(q.inputVat)}</td>
                      <td className={`py-3 text-right font-semibold ${q.net > 0 ? "text-orange-400" : "text-green-400"}`}>{fmt(q.net)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-600 mt-3">Output VAT = VAT charged on paid invoices. Input VAT = VAT paid on expenses (enter when logging expenses). Net = amount payable to HMRC.</p>
          </CardContent>
        </Card>

        {/* HMRC tax year summary */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-gray-100">HMRC Tax Year {taxYearLabel}</CardTitle>
            <CardDescription className="text-gray-400">6 April to 5 April</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-green-400 flex-shrink-0" />
                <div>
                  <p className="text-gray-400 text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-400">{fmt(taxRevenue)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <TrendingDown className="h-8 w-8 text-red-400 flex-shrink-0" />
                <div>
                  <p className="text-gray-400 text-sm">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-400">{fmt(taxExpenses)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <PoundSterling className="h-8 w-8 text-orange-400 flex-shrink-0" />
                <div>
                  <p className="text-gray-400 text-sm">Net Profit</p>
                  <p className={`text-2xl font-bold ${taxProfit >= 0 ? "text-orange-400" : "text-red-400"}`}>
                    {fmt(taxProfit)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly breakdown */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100">Monthly Breakdown</CardTitle>
            <CardDescription className="text-gray-400">
              Revenue from paid invoices vs recorded expenses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {months12.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No data yet. Mark invoices as paid and add expenses to see your P&amp;L.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700 text-gray-400">
                      <th className="text-left pb-3 font-medium">Month</th>
                      <th className="text-right pb-3 font-medium">Revenue</th>
                      <th className="text-right pb-3 font-medium">Expenses</th>
                      <th className="text-right pb-3 font-medium">Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {months12.map((ym) => {
                      const rev = revenueByMonth[ym] || 0
                      const exp = expensesByMonth[ym] || 0
                      const profit = rev - exp
                      return (
                        <tr key={ym} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                          <td className="py-3 text-gray-300">{monthLabel(ym)}</td>
                          <td className="py-3 text-right text-green-400">{fmt(rev)}</td>
                          <td className="py-3 text-right text-red-400">{fmt(exp)}</td>
                          <td className={`py-3 text-right font-semibold ${profit >= 0 ? "text-orange-400" : "text-red-400"}`}>
                            {fmt(profit)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-gray-600 text-xs mt-4">
          Revenue is based on invoices marked as paid. Expenses are from the Expense Tracker. Input VAT must be entered manually on each expense.
        </p>

        <ReportsClient
          expenses={allExpenses}
          paidInvoices={paidInvoices.map(i => ({
            invoice_number: i.invoice_number,
            customer_name: i.customer_name,
            vehicle: i.vehicle || "",
            paid_at: i.paid_at || i.created_at,
            total: calcTotal(i),
            vat: calcVatTotal(i),
            payment_method: i.payment_method || "",
          }))}
        />
      </main>
    </div>
  )
}
