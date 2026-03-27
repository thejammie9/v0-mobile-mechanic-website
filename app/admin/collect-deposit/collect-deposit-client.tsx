"use client"

import { useState } from "react"
import { Loader2, Link2, Copy, Check, MessageCircle, Send, Mail, FileText, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

type QuoteOption = {
  id: number
  quote_number: string
  customer_name: string
  customer_email: string
  customer_phone: string
  vehicle: string
  parts_items: string
  labour_items: string
  status: string
}

type Props = {
  hasSumUp: boolean
  prefill?: {
    name?: string
    phone?: string
    email?: string
    description?: string
  }
  quotes?: QuoteOption[]
}

function calcTotals(q: QuoteOption) {
  let parts: { qty: number; unitPrice: number }[] = []
  let labour: { hours: number; rate: number }[] = []
  try { parts = JSON.parse(q.parts_items) } catch {}
  try { labour = JSON.parse(q.labour_items) } catch {}
  const partsTotal = parts.reduce((s, r) => s + (r.qty || 0) * (r.unitPrice || 0), 0)
  const labourTotal = labour.reduce((s, r) => s + (r.hours || 0) * (r.rate || 0), 0)
  return { partsTotal, labourTotal }
}

export function CollectDepositClient({ hasSumUp, prefill, quotes = [] }: Props) {
  const [name, setName] = useState(prefill?.name || "")
  const [phone, setPhone] = useState(prefill?.phone || "")
  const [email, setEmail] = useState(prefill?.email || "")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState(prefill?.description || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<{ link: string; amount: number } | null>(null)
  const [copied, setCopied] = useState(false)
  const [emailSending, setEmailSending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [emailError, setEmailError] = useState("")
  const [selectedQuoteId, setSelectedQuoteId] = useState<number | "">("")

  function handleQuoteSelect(id: number | "") {
    setSelectedQuoteId(id)
    if (id === "") return
    const q = quotes.find(q => q.id === id)
    if (!q) return
    const { partsTotal } = calcTotals(q)
    setName(q.customer_name)
    setPhone(q.customer_phone || "")
    setEmail(q.customer_email || "")
    setDescription(`Parts deposit — ${q.vehicle || q.customer_name} (${q.quote_number})`)
    if (partsTotal > 0) setAmount(partsTotal.toFixed(2))
    setResult(null)
    setError("")
  }

  async function handleCreate() {
    const amt = parseFloat(amount)
    if (!name.trim()) { setError("Customer name is required"); return }
    if (isNaN(amt) || amt <= 0) { setError("Enter a valid amount"); return }
    if (!description.trim()) { setError("Description is required"); return }

    setLoading(true)
    setError("")
    setResult(null)

    try {
      const res = await fetch("/api/admin/collect-deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), amount: amt, description: description.trim() }),
      })
      const data = await res.json()
      if (!res.ok || !data.paymentLink) {
        setError(data.error || "Failed to create payment link")
      } else {
        setResult({ link: data.paymentLink, amount: amt })
      }
    } catch {
      setError("Network error — please try again")
    } finally {
      setLoading(false)
    }
  }

  function handleCopy() {
    if (!result) return
    navigator.clipboard.writeText(result.link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleEmailSend() {
    if (!result || !email.trim()) return
    setEmailSending(true)
    setEmailError("")
    try {
      const res = await fetch("/api/admin/send-deposit-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), amount: result.amount, description: description.trim(), paymentLink: result.link }),
      })
      const data = await res.json()
      if (!res.ok) setEmailError(data.error || "Failed to send email")
      else { setEmailSent(true); setTimeout(() => setEmailSent(false), 4000) }
    } catch {
      setEmailError("Network error — please try again")
    } finally {
      setEmailSending(false)
    }
  }

  const whatsappText = result
    ? encodeURIComponent(`Hi ${name}, here's your secure deposit payment link for £${result.amount.toFixed(2)}:\n${result.link}`)
    : ""
  const whatsappUrl = phone
    ? `https://wa.me/${phone.replace(/\D/g, "").replace(/^0/, "44")}?text=${whatsappText}`
    : `https://wa.me/?text=${whatsappText}`

  if (!hasSumUp) {
    return (
      <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 text-yellow-300 text-sm">
        SumUp is not configured. Add your <code className="bg-yellow-900/50 px-1 rounded">SUMUP_API_KEY</code> to .env.local to use this feature.
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {/* Quote picker */}
      {quotes.length > 0 && (
        <div className="bg-blue-950/40 border border-blue-800/50 rounded-xl p-4 space-y-2">
          <label className="flex items-center gap-1.5 text-sm font-medium text-blue-300">
            <FileText className="h-4 w-4" />
            Pre-fill from existing quote
          </label>
          <div className="relative">
            <select
              value={selectedQuoteId}
              onChange={e => handleQuoteSelect(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full appearance-none bg-gray-900 border border-gray-600 rounded-lg pl-3 pr-8 py-2 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Select a quote —</option>
              {quotes.map(q => {
                const { partsTotal, labourTotal } = calcTotals(q)
                const total = partsTotal + labourTotal
                return (
                  <option key={q.id} value={q.id}>
                    {q.quote_number} · {q.customer_name}{q.vehicle ? ` — ${q.vehicle}` : ""}
                    {total > 0 ? ` (£${total.toFixed(2)})` : ""}
                  </option>
                )
              })}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Selected quote summary */}
          {selectedQuoteId !== "" && (() => {
            const q = quotes.find(q => q.id === selectedQuoteId)
            if (!q) return null
            const { partsTotal, labourTotal } = calcTotals(q)
            return (
              <div className="flex flex-wrap gap-3 text-xs text-blue-200 pt-1">
                <span className="capitalize">Status: <span className="text-blue-300 font-medium">{q.status}</span></span>
                {labourTotal > 0 && <span>Labour: <span className="text-purple-300 font-medium">£{labourTotal.toFixed(2)}</span></span>}
                {partsTotal > 0 && <span>Parts: <span className="text-orange-300 font-medium">£{partsTotal.toFixed(2)}</span></span>}
                <a href={`/admin/quotes/${q.id}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline ml-auto">
                  View quote →
                </a>
              </div>
            )
          })()}
        </div>
      )}

      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-4">
        {/* Customer name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Customer Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. John Smith"
            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Phone (optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Phone <span className="text-gray-500 font-normal">(optional — for WhatsApp / SMS share)</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="e.g. 07700 900123"
            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Email (optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Email <span className="text-gray-500 font-normal">(optional — for email share)</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="e.g. customer@example.com"
            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Deposit Amount (£)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="e.g. 50.00"
            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="e.g. Parts deposit — brake pads Ford Focus"
            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        <Button
          onClick={handleCreate}
          disabled={loading}
          className="w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold py-2.5"
        >
          {loading
            ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating link…</>
            : <><Link2 className="h-4 w-4 mr-2" />Generate Payment Link</>
          }
        </Button>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-green-900/30 border border-green-700 rounded-xl p-5 space-y-4">
          <div>
            <p className="text-green-300 font-semibold text-sm mb-1">Payment link ready — £{result.amount.toFixed(2)}</p>
            <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300 font-mono break-all">
              {result.link}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={handleCopy}
              variant="outline"
              className="border-green-700 text-green-300 hover:bg-green-900/40"
            >
              {copied ? <><Check className="h-3.5 w-3.5 mr-1.5" />Copied!</> : <><Copy className="h-3.5 w-3.5 mr-1.5" />Copy Link</>}
            </Button>

            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="bg-green-700 hover:bg-green-600 text-white">
                <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                Send via WhatsApp
              </Button>
            </a>

            <a href={`sms:${phone}?body=${encodeURIComponent(`Hi ${name}, here's your deposit payment link: ${result.link}`)}`}>
              <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                <Send className="h-3.5 w-3.5 mr-1.5" />
                Send via SMS
              </Button>
            </a>

            {email.trim() && (
              <Button
                size="sm"
                onClick={handleEmailSend}
                disabled={emailSending || emailSent}
                className={emailSent ? "bg-green-700 text-white" : "bg-blue-700 hover:bg-blue-600 text-white"}
              >
                {emailSending
                  ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Sending…</>
                  : emailSent
                  ? <><Check className="h-3.5 w-3.5 mr-1.5" />Email Sent!</>
                  : <><Mail className="h-3.5 w-3.5 mr-1.5" />Send via Email</>
                }
              </Button>
            )}
          </div>

          {emailError && <p className="text-red-400 text-xs">{emailError}</p>}

          <button
            onClick={() => { setResult(null); setAmount(""); setDescription(prefill?.description || ""); setEmailSent(false); setEmailError("") }}
            className="text-xs text-gray-500 hover:text-gray-300 underline"
          >
            Create another link
          </button>
        </div>
      )}
    </div>
  )
}
