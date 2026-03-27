"use client"

import { useState, useTransition, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { updateQuoteAction, getQuote, sendQuoteEmailAction } from "@/app/actions/quotes"
import { getPresets } from "@/app/actions/presets"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, Trash2, FileText, Send, Wrench, Package } from "lucide-react"
import Link from "next/link"
import type { ServicePreset } from "@/lib/db"
import SendWithMessage from "@/components/send-with-message"

type LabourRow = { id: string; description: string; hours: string; rate: string }
type PartsRow  = { id: string; description: string; qty: string; unitPrice: string }

let rowId = 0
const nextId = () => String(++rowId)

export default function EditQuotePage() {
  const router  = useRouter()
  const params  = useParams()
  const quoteId = parseInt(params.id as string, 10)

  const [loading, setLoading]           = useState(true)
  const [isPending, startTransition]    = useTransition()
  const [submitIntent, setSubmitIntent] = useState<"save" | "send">("save")
  const [showSendPanel, setShowSendPanel] = useState(false)
  const [error, setError]               = useState<string | null>(null)

  // Service presets
  const [presets, setPresets] = useState<ServicePreset[]>([])

  // Customer fields
  const [quoteDate,      setQuoteDate]      = useState("")
  const [customerName,   setCustomerName]   = useState("")
  const [customerEmail,  setCustomerEmail]  = useState("")
  const [customerPhone,  setCustomerPhone]  = useState("")
  const [customerAddress,setCustomerAddress]= useState("")
  const [vehicle,        setVehicle]        = useState("")

  // Labour / parts rows
  const [labourRows, setLabourRows] = useState<LabourRow[]>([])
  const [partsRows,  setPartsRows]  = useState<PartsRow[]>([])

  // Options
  const [vatEnabled, setVatEnabled] = useState(false)
  const vatRate = 20
  const [notes, setNotes] = useState("")

  // Load presets
  useEffect(() => {
    getPresets().then(setPresets)
  }, [])

  const labourPresets = presets.filter(p => p.type === "labour")
  const partPresets = presets.filter(p => p.type === "part")

  // Load existing quote
  useEffect(() => {
    if (isNaN(quoteId)) return
    getQuote(quoteId).then(q => {
      if (!q) { router.push("/admin/quotes"); return }

      const dateStr = q.invoice_date || q.created_at
      setQuoteDate(dateStr ? dateStr.slice(0, 10) : new Date().toISOString().slice(0, 10))
      setCustomerName(q.customer_name)
      setCustomerEmail(q.customer_email)
      setCustomerPhone(q.customer_phone ?? "")
      setCustomerAddress(q.customer_address ?? "")
      setVehicle(q.vehicle ?? "")
      setVatEnabled(!!q.vat_enabled)
      setNotes(q.notes ?? "")

      try {
        const labour = JSON.parse(q.labour_items || "[]") as Array<{description:string;hours:number;rate:number}>
        setLabourRows(labour.length > 0
          ? labour.map(i => ({ id: nextId(), description: i.description, hours: String(i.hours), rate: String(i.rate) }))
          : [{ id: nextId(), description: "", hours: "", rate: "" }]
        )
      } catch { setLabourRows([{ id: nextId(), description: "", hours: "", rate: "" }]) }

      try {
        const parts = JSON.parse(q.parts_items || "[]") as Array<{description:string;qty:number;unitPrice:number}>
        setPartsRows(parts.length > 0
          ? parts.map(i => ({ id: nextId(), description: i.description, qty: String(i.qty), unitPrice: String(i.unitPrice) }))
          : [{ id: nextId(), description: "", qty: "", unitPrice: "" }]
        )
      } catch { setPartsRows([{ id: nextId(), description: "", qty: "", unitPrice: "" }]) }

      setLoading(false)
    })
  }, [quoteId, router])

  // Calculated totals
  const labourSubtotal = labourRows.reduce((s, r) => s + (parseFloat(r.hours)||0) * (parseFloat(r.rate)||0), 0)
  const partsSubtotal  = partsRows.reduce((s, r)  => s + (parseFloat(r.qty)||0)   * (parseFloat(r.unitPrice)||0), 0)
  const subtotal  = labourSubtotal + partsSubtotal
  const vatAmount = vatEnabled ? (subtotal * vatRate) / 100 : 0
  const total     = subtotal + vatAmount
  const fmt = (n: number) => `£${n.toFixed(2)}`

  // Labour handlers
  const addLabour    = () => setLabourRows(r => [...r, { id: nextId(), description: "", hours: "", rate: "" }])
  const removeLabour = (id: string) => setLabourRows(r => r.length > 1 ? r.filter(x => x.id !== id) : r)
  const updateLabour = (id: string, field: keyof LabourRow, val: string) =>
    setLabourRows(r => r.map(x => x.id === id ? { ...x, [field]: val } : x))

  // Parts handlers
  const addParts    = () => setPartsRows(r => [...r, { id: nextId(), description: "", qty: "", unitPrice: "" }])
  const removeParts = (id: string) => setPartsRows(r => r.length > 1 ? r.filter(x => x.id !== id) : r)
  const updateParts = (id: string, field: keyof PartsRow, val: string) =>
    setPartsRows(r => r.map(x => x.id === id ? { ...x, [field]: val } : x))

  // Preset quick-add handlers
  const addLabourFromPreset = (preset: ServicePreset) => {
    setLabourRows(rows => {
      if (rows.length === 1 && !rows[0].description) {
        return [{ id: rows[0].id, description: preset.description, hours: String(preset.hours), rate: String(preset.rate) }]
      }
      return [...rows, { id: nextId(), description: preset.description, hours: String(preset.hours), rate: String(preset.rate) }]
    })
  }
  const addPartFromPreset = (preset: ServicePreset) => {
    setPartsRows(rows => {
      if (rows.length === 1 && !rows[0].description) {
        return [{ id: rows[0].id, description: preset.description, qty: String(preset.qty), unitPrice: String(preset.unit_price) }]
      }
      return [...rows, { id: nextId(), description: preset.description, qty: String(preset.qty), unitPrice: String(preset.unit_price) }]
    })
  }

  const buildUpdateData = () => {
    const labourItems = labourRows.filter(r => r.description.trim()).map(r => ({
      description: r.description, hours: parseFloat(r.hours) || 0, rate: parseFloat(r.rate) || 0,
    }))
    const partsItems = partsRows.filter(r => r.description.trim()).map(r => ({
      description: r.description, qty: parseFloat(r.qty) || 0, unitPrice: parseFloat(r.unitPrice) || 0,
    }))
    return {
      customer_name: customerName.trim(), customer_email: customerEmail.trim(),
      customer_phone: customerPhone.trim() || null, customer_address: customerAddress.trim() || null,
      vehicle: vehicle.trim() || null, labour_items: JSON.stringify(labourItems),
      parts_items: JSON.stringify(partsItems), notes: notes.trim() || null,
      vat_enabled: vatEnabled ? 1 : 0, vat_rate: vatRate, invoice_date: quoteDate || null,
    }
  }

  const handleSubmit = (intent: "save" | "send") => {
    setError(null)
    if (!customerName.trim())  { setError("Customer name is required.");  return }
    if (!customerEmail.trim()) { setError("Customer email is required."); return }
    if (intent === "send") { setShowSendPanel(true); return }
    setSubmitIntent("save")
    startTransition(async () => {
      const result = await updateQuoteAction(quoteId, buildUpdateData())
      if (!result.success) { setError(result.error || "Failed to save quote"); return }
      router.push(`/admin/quotes/${quoteId}`)
    })
  }

  const handleSendWithMessage = (customMessage: string | null) => {
    setSubmitIntent("send")
    setShowSendPanel(false)
    startTransition(async () => {
      const result = await updateQuoteAction(quoteId, buildUpdateData())
      if (!result.success) { setError(result.error || "Failed to save quote"); return }
      await sendQuoteEmailAction(quoteId, customMessage)
      router.push(`/admin/quotes/${quoteId}`)
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400">Loading quote...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          href={`/admin/quotes/${quoteId}`}
          className="inline-flex items-center gap-1 text-gray-400 hover:text-gray-200 mb-6 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Quote
        </Link>

        <h1 className="text-2xl font-bold text-gray-100 mb-6">Edit Quote</h1>

        {error && (
          <div className="mb-6 bg-red-900/40 border border-red-700 text-red-300 rounded-md px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Quick Add Services */}
          {presets.length > 0 ? (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-gray-100 text-lg">Quick Add Services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {labourPresets.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                      <Wrench className="h-3 w-3" /> Labour
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {labourPresets.map(p => (
                        <button key={p.id} type="button" onClick={() => addLabourFromPreset(p)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600 hover:border-gray-500 transition-colors">
                          <Plus className="h-3 w-3 text-gray-400" />
                          <span className="font-medium">{p.name}</span>
                          <span className="text-gray-400">— {p.hours}h @ £{p.rate} = £{(p.hours * p.rate).toFixed(2)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {partPresets.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                      <Package className="h-3 w-3" /> Parts &amp; Materials
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {partPresets.map(p => (
                        <button key={p.id} type="button" onClick={() => addPartFromPreset(p)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600 hover:border-gray-500 transition-colors">
                          <Plus className="h-3 w-3 text-gray-400" />
                          <span className="font-medium">{p.name}</span>
                          <span className="text-gray-400">— £{p.unit_price}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="text-sm text-gray-500 text-center py-2">
              No service presets configured.{" "}
              <Link href="/admin/settings" className="text-blue-400 hover:text-blue-300 underline">
                Add service presets in Settings
              </Link>
            </div>
          )}

          {/* Customer Details */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100 text-lg">Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Quote Date <span className="text-red-400">*</span></Label>
                  <Input type="date" value={quoteDate} onChange={e => setQuoteDate(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500" />
                </div>
                <div />
                <div className="space-y-2">
                  <Label className="text-gray-300">Name <span className="text-red-400">*</span></Label>
                  <Input value={customerName} onChange={e => setCustomerName(e.target.value)}
                    placeholder="John Smith"
                    className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-blue-500" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Email <span className="text-red-400">*</span></Label>
                  <Input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-blue-500" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Phone</Label>
                  <Input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="07700 900000"
                    className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-blue-500" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Vehicle</Label>
                  <Input value={vehicle} onChange={e => setVehicle(e.target.value)}
                    placeholder="2019 Ford Focus 1.5 TDCi"
                    className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-blue-500" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Address</Label>
                <Textarea value={customerAddress} onChange={e => setCustomerAddress(e.target.value)}
                  placeholder={"123 Main Street\nEdinburgh\nEH1 1AA"}
                  rows={3}
                  className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-blue-500 resize-none" />
              </div>
            </CardContent>
          </Card>

          {/* Labour Items */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-gray-100 text-lg">Labour</CardTitle>
              <Button type="button" size="sm" variant="outline" onClick={addLabour}
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-gray-100">
                <Plus className="h-4 w-4 mr-1" /> Add Row
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-2 text-xs text-gray-500 uppercase tracking-wide px-1">
                  <div className="col-span-5">Description</div>
                  <div className="col-span-2 text-right">Hours</div>
                  <div className="col-span-2 text-right">Rate £/hr</div>
                  <div className="col-span-2 text-right">Amount</div>
                  <div className="col-span-1" />
                </div>
                {labourRows.map(row => {
                  const amount = (parseFloat(row.hours)||0) * (parseFloat(row.rate)||0)
                  return (
                    <div key={row.id} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <Input value={row.description} onChange={e => updateLabour(row.id,"description",e.target.value)}
                          placeholder="e.g. Brake pad replacement"
                          className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 text-sm focus:border-blue-500" />
                      </div>
                      <div className="col-span-2">
                        <Input type="number" min="0" step="0.5" value={row.hours} onChange={e => updateLabour(row.id,"hours",e.target.value)}
                          placeholder="1.5"
                          className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 text-sm text-right focus:border-blue-500" />
                      </div>
                      <div className="col-span-2">
                        <Input type="number" min="0" step="0.01" value={row.rate} onChange={e => updateLabour(row.id,"rate",e.target.value)}
                          placeholder="60.00"
                          className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 text-sm text-right focus:border-blue-500" />
                      </div>
                      <div className="col-span-2 text-right text-gray-300 text-sm font-medium pr-1">
                        {amount > 0 ? fmt(amount) : "—"}
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <button type="button" onClick={() => removeLabour(row.id)} disabled={labourRows.length === 1}
                          className="text-gray-600 hover:text-red-400 disabled:opacity-20 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
                <div className="flex justify-end pt-2 border-t border-gray-700 text-sm font-medium text-gray-300">
                  Labour Subtotal: <span className="ml-2 text-gray-100">{fmt(labourSubtotal)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parts Items */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-gray-100 text-lg">Parts &amp; Materials</CardTitle>
              <Button type="button" size="sm" variant="outline" onClick={addParts}
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-gray-100">
                <Plus className="h-4 w-4 mr-1" /> Add Row
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-2 text-xs text-gray-500 uppercase tracking-wide px-1">
                  <div className="col-span-5">Description</div>
                  <div className="col-span-2 text-right">Qty</div>
                  <div className="col-span-2 text-right">Unit Price £</div>
                  <div className="col-span-2 text-right">Amount</div>
                  <div className="col-span-1" />
                </div>
                {partsRows.map(row => {
                  const amount = (parseFloat(row.qty)||0) * (parseFloat(row.unitPrice)||0)
                  return (
                    <div key={row.id} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <Input value={row.description} onChange={e => updateParts(row.id,"description",e.target.value)}
                          placeholder="e.g. Brake pads set"
                          className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 text-sm focus:border-blue-500" />
                      </div>
                      <div className="col-span-2">
                        <Input type="number" min="0" step="1" value={row.qty} onChange={e => updateParts(row.id,"qty",e.target.value)}
                          placeholder="1"
                          className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 text-sm text-right focus:border-blue-500" />
                      </div>
                      <div className="col-span-2">
                        <Input type="number" min="0" step="0.01" value={row.unitPrice} onChange={e => updateParts(row.id,"unitPrice",e.target.value)}
                          placeholder="25.00"
                          className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 text-sm text-right focus:border-blue-500" />
                      </div>
                      <div className="col-span-2 text-right text-gray-300 text-sm font-medium pr-1">
                        {amount > 0 ? fmt(amount) : "—"}
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <button type="button" onClick={() => removeParts(row.id)} disabled={partsRows.length === 1}
                          className="text-gray-600 hover:text-red-400 disabled:opacity-20 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
                <div className="flex justify-end pt-2 border-t border-gray-700 text-sm font-medium text-gray-300">
                  Parts Subtotal: <span className="ml-2 text-gray-100">{fmt(partsSubtotal)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Options */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100 text-lg">Options &amp; Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <input id="vat" type="checkbox" checked={vatEnabled} onChange={e => setVatEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800 cursor-pointer" />
                <Label htmlFor="vat" className="text-gray-300 cursor-pointer">Apply VAT ({vatRate}%)</Label>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Notes</Label>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Additional information, terms..."
                  rows={3}
                  className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-blue-500 resize-none" />
              </div>
            </CardContent>
          </Card>

          {/* Live Totals */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <div className="space-y-2 max-w-xs ml-auto text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Labour Subtotal</span><span>{fmt(labourSubtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Parts Subtotal</span><span>{fmt(partsSubtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-300 pt-1 border-t border-gray-700">
                  <span>Subtotal</span><span>{fmt(subtotal)}</span>
                </div>
                {vatEnabled && (
                  <div className="flex justify-between text-gray-300">
                    <span>VAT ({vatRate}%)</span><span>{fmt(vatAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-100 font-bold text-lg pt-2 border-t border-gray-600">
                  <span>Total</span><span>{fmt(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          {showSendPanel ? (
            <SendWithMessage
              onSend={handleSendWithMessage}
              onCancel={() => setShowSendPanel(false)}
              isPending={isPending}
              label="Save & Send Quote"
            />
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 justify-end pb-8">
              <Link href={`/admin/quotes/${quoteId}`}>
                <Button type="button" variant="outline" className="w-full sm:w-auto border-gray-600 text-gray-300 hover:bg-gray-700">
                  Cancel
                </Button>
              </Link>
              <Button type="button" variant="outline" disabled={isPending} onClick={() => handleSubmit("save")}
                className="w-full sm:w-auto border-gray-500 text-gray-200 hover:bg-gray-700">
                <FileText className="h-4 w-4 mr-2" />
                {isPending && submitIntent === "save" ? "Saving..." : "Save Changes"}
              </Button>
              <Button type="button" disabled={isPending} onClick={() => handleSubmit("send")}
                className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white">
                <Send className="h-4 w-4 mr-2" />
                Save &amp; Send Quote
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
