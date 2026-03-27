import { getQuoteByConfirmToken } from "@/lib/db"
import { notFound } from "next/navigation"
import QuoteAcceptClient from "./quote-accept-client"

export const dynamic = "force-dynamic"

export default async function QuoteAcceptPage({ params }: { params: { token: string } }) {
  const quote = getQuoteByConfirmToken(params.token)
  if (!quote) notFound()

  // Parse items for display
  let labourItems: { description: string; hours: number; rate: number }[] = []
  let partsItems: { description: string; qty: number; unitPrice: number }[] = []
  try { labourItems = JSON.parse(quote.labour_items || "[]") } catch {}
  try { partsItems = JSON.parse(quote.parts_items || "[]") } catch {}

  const labourSubtotal = labourItems.reduce((s, i) => s + i.hours * i.rate, 0)
  const partsSubtotal = partsItems.reduce((s, i) => s + i.qty * i.unitPrice, 0)
  const subtotal = labourSubtotal + partsSubtotal
  const vatAmount = quote.vat_enabled ? (subtotal * quote.vat_rate) / 100 : 0
  const total = subtotal + vatAmount
  const fmt = (n: number) => `£${n.toFixed(2)}`

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1e3a5f] text-white py-5 px-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Jamie&apos;s Auto Care</h1>
            <p className="text-blue-200 text-sm">Mobile Mechanic — Edinburgh</p>
          </div>
          <div className="text-right text-sm text-blue-200">
            <div className="font-mono font-bold text-white">{quote.quote_number}</div>
            <div>QUOTE</div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {quote.accepted_at ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <div className="text-4xl mb-3">✓</div>
            <h2 className="text-xl font-bold text-green-800 mb-2">Quote Already Accepted</h2>
            <p className="text-green-700">You've already accepted this quote. We'll be in touch to confirm your booking details.</p>
          </div>
        ) : (
          <>
            {/* Quote summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                <h2 className="font-semibold text-gray-800">Quote Summary</h2>
                <p className="text-sm text-gray-500 mt-0.5">Prepared for {quote.customer_name}</p>
              </div>
              <div className="p-6 space-y-4">
                {quote.vehicle && (
                  <p className="text-sm text-gray-600"><span className="font-medium">Vehicle:</span> {quote.vehicle}</p>
                )}

                {labourItems.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Labour</p>
                    <div className="space-y-1">
                      {labourItems.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-gray-700">{item.description}</span>
                          <span className="text-gray-900 font-medium tabular-nums">{fmt(item.hours * item.rate)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {partsItems.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Parts &amp; Materials</p>
                    <div className="space-y-1">
                      {partsItems.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-gray-700">{item.description}</span>
                          <span className="text-gray-900 font-medium tabular-nums">{fmt(item.qty * item.unitPrice)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {quote.notes && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Notes</p>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{quote.notes}</p>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-200 space-y-1">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span><span>{fmt(subtotal)}</span>
                  </div>
                  {quote.vat_enabled ? (
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>VAT ({quote.vat_rate}%)</span><span>{fmt(vatAmount)}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between text-lg font-bold text-[#1e3a5f] pt-1">
                    <span>Total</span><span>{fmt(total)}</span>
                  </div>
                </div>
              </div>
            </div>

            <QuoteAcceptClient token={params.token} customerName={quote.customer_name} />
          </>
        )}
      </main>
    </div>
  )
}
