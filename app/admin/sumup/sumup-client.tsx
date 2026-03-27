"use client"

import { useState, useCallback } from "react"
import { RefreshCw, CreditCard, CheckCircle, AlertCircle, Link2, Loader2 } from "lucide-react"
import { matchSumUpTransaction } from "@/app/actions/sumup"

type SumUpTransaction = {
  id: string
  transaction_code: string
  amount: number
  currency: string
  timestamp: string
  card_last4: string | null
  card_type: string | null
  product_summary: string | null
}

type UnpaidInvoice = {
  id: number
  invoice_number: string
  customer_name: string
  vehicle: string
  total: number
  created_at: string
  transaction_ref: string | null
}

type Props = {
  unpaidInvoices: UnpaidInvoice[]
  configured: boolean
}

function fmt(n: number) { return `£${n.toFixed(2)}` }
function fmtDate(ts: string) {
  return new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

export default function SumUpClient({ unpaidInvoices: initialInvoices, configured }: Props) {
  const [transactions, setTransactions] = useState<SumUpTransaction[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [matching, setMatching] = useState<number | null>(null)
  const [matched, setMatched] = useState<Record<number, string>>({})
  const [invoices, setInvoices] = useState(initialInvoices)
  const [selectedTx, setSelectedTx] = useState<SumUpTransaction | null>(null)

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/sumup?limit=30")
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to fetch transactions")
      } else {
        setTransactions(data.transactions)
      }
    } catch {
      setError("Network error — check your connection")
    } finally {
      setLoading(false)
    }
  }, [])

  async function handleMatch(invoiceId: number) {
    if (!selectedTx) return
    setMatching(invoiceId)
    const result = await matchSumUpTransaction(invoiceId, selectedTx.transaction_code)
    if (result.success) {
      setMatched(m => ({ ...m, [invoiceId]: selectedTx.transaction_code }))
      setInvoices(inv => inv.filter(i => i.id !== invoiceId))
      setSelectedTx(null)
    }
    setMatching(null)
  }

  if (!configured) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <CreditCard className="h-12 w-12 text-gray-600 mb-4" />
        <h2 className="text-xl font-bold text-gray-300 mb-2">SumUp Not Configured</h2>
        <p className="text-gray-500 max-w-sm">Add your <code className="text-orange-400">SUMUP_API_KEY</code> to <code className="text-orange-400">.env.local</code> then rebuild to enable transaction sync.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CreditCard className="h-7 w-7 text-orange-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-100">SumUp Sync</h1>
            <p className="text-sm text-gray-400">Match card payments to unpaid invoices</p>
          </div>
        </div>
        <button
          onClick={fetchTransactions}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {transactions ? "Refresh" : "Load Transactions"}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-900/30 border border-red-700 rounded-lg px-4 py-3">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Instructions */}
      {transactions && !selectedTx && (
        <div className="bg-blue-950/40 border border-blue-800 rounded-lg px-4 py-3 text-sm text-blue-300">
          <strong>How to match:</strong> Click a SumUp transaction on the left, then click the matching invoice on the right. The invoice will be marked as paid with the transaction reference saved.
        </div>
      )}

      {selectedTx && (
        <div className="bg-orange-950/40 border border-orange-700 rounded-lg px-4 py-3 text-sm text-orange-300 flex items-center justify-between">
          <span>
            <strong>Selected:</strong> {fmt(selectedTx.amount)} · {fmtDate(selectedTx.timestamp)}
            {selectedTx.card_last4 && ` · ****${selectedTx.card_last4}`}
            <span className="text-orange-500"> — now click the invoice to match it</span>
          </span>
          <button onClick={() => setSelectedTx(null)} className="ml-4 text-orange-400 hover:text-orange-300 text-xs underline">cancel</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SumUp transactions */}
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">SumUp Transactions</h2>
          {!transactions && !loading && (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
              <p className="text-gray-500 text-sm">Click "Load Transactions" to fetch your recent SumUp card payments.</p>
            </div>
          )}
          {loading && (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
            </div>
          )}
          {transactions && transactions.length === 0 && (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
              <p className="text-gray-500 text-sm">No successful transactions found.</p>
            </div>
          )}
          {transactions && transactions.length > 0 && (
            <div className="space-y-2">
              {transactions.map(tx => {
                const isSelected = selectedTx?.id === tx.id
                return (
                  <button
                    key={tx.id}
                    onClick={() => setSelectedTx(isSelected ? null : tx)}
                    className={`w-full text-left rounded-xl border px-4 py-3 transition-colors ${
                      isSelected
                        ? "bg-orange-900/30 border-orange-600"
                        : "bg-gray-800 border-gray-700 hover:border-orange-700 hover:bg-gray-750"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-lg font-bold ${isSelected ? "text-orange-300" : "text-green-400"}`}>{fmt(tx.amount)}</span>
                      <span className="text-xs text-gray-500 font-mono">{tx.transaction_code}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-400">{fmtDate(tx.timestamp)}</span>
                      {tx.card_last4 && (
                        <span className="text-xs text-gray-500">
                          {tx.card_type ?? "Card"} ****{tx.card_last4}
                        </span>
                      )}
                    </div>
                    {tx.product_summary && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{tx.product_summary}</p>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Unpaid invoices */}
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Unpaid Invoices</h2>
          {invoices.length === 0 && (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No unpaid invoices — all clear!</p>
            </div>
          )}
          {invoices.length > 0 && (
            <div className="space-y-2">
              {invoices.map(inv => {
                const isMatchable = !!selectedTx
                const isMatching = matching === inv.id
                const wasMatched = !!matched[inv.id]
                const amountMatch = selectedTx && Math.abs(selectedTx.amount - inv.total) < 0.02

                return (
                  <div
                    key={inv.id}
                    onClick={() => isMatchable && !isMatching && handleMatch(inv.id)}
                    className={`rounded-xl border px-4 py-3 transition-colors ${
                      wasMatched
                        ? "bg-green-900/20 border-green-700 opacity-60"
                        : isMatchable
                        ? amountMatch
                          ? "bg-green-900/20 border-green-600 cursor-pointer hover:border-green-400 ring-1 ring-green-700"
                          : "bg-gray-800 border-gray-700 cursor-pointer hover:border-orange-600"
                        : "bg-gray-800 border-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isMatching ? (
                          <Loader2 className="h-4 w-4 animate-spin text-orange-400" />
                        ) : wasMatched ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : isMatchable ? (
                          <Link2 className="h-4 w-4 text-orange-400" />
                        ) : null}
                        <span className="font-mono text-sm text-gray-300">{inv.invoice_number}</span>
                        {amountMatch && isMatchable && (
                          <span className="text-xs bg-green-800 text-green-200 px-1.5 py-0.5 rounded">amount matches</span>
                        )}
                      </div>
                      <span className="font-bold text-gray-100">{fmt(inv.total)}</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-0.5">{inv.customer_name}</p>
                    {inv.vehicle && <p className="text-xs text-gray-500">{inv.vehicle}</p>}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
