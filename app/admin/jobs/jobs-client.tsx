"use client"

import { useState, useRef } from "react"
import { saveWorkDone } from "@/app/actions/jobs"
import { updateBookingStatus, sendApprovalEmail } from "@/app/actions/bookings"
import { createInvoiceFromBooking, toggleInvoicePaid } from "@/app/actions/invoices"
import { linkBookingToCustomer } from "@/app/actions/customers"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ClipboardCheck, ChevronDown, ChevronUp, Save, FileText, Link as LinkIcon, ExternalLink, Receipt, Pencil, MessageCircle, CheckCircle2, Camera, X as XIcon, Upload, Loader2, Banknote } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { Booking, CustomerWithCounts, Quote, Invoice } from "@/lib/db"

const statusColors: Record<string, string> = {
  pending: "bg-yellow-900/50 text-yellow-300 border-yellow-700",
  confirmed: "bg-blue-900/50 text-blue-300 border-blue-700",
  completed: "bg-green-900/50 text-green-300 border-green-700",
  cancelled: "bg-red-900/50 text-red-300 border-red-700",
}

function JobRow({
  booking,
  customers,
  quote,
  invoice,
}: {
  booking: Booking
  customers: CustomerWithCounts[]
  quote?: Quote
  invoice?: Invoice
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [notes, setNotes] = useState(booking.work_done || "")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [status, setStatus] = useState(booking.status)
  const [actioning, setActioning] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState("")
  const [linking, setLinking] = useState(false)
  const [linkedCustomerId, setLinkedCustomerId] = useState(booking.customer_id ?? null)
  const [invoiceStatus, setInvoiceStatus] = useState(invoice?.status ?? null)
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">(
    (invoice?.payment_method as "cash" | "card") ?? "cash"
  )
  const [photos, setPhotos] = useState<string[]>(JSON.parse(booking.photos || "[]"))
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)

  const whatsappPhone = booking.phone.replace(/\D/g, "").replace(/^0/, "44")
  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(`Hi ${booking.name}, this is Jamie from Jamie's Auto Care regarding your ${booking.vehicle}.`)}`

  const date = booking.confirmed_date || booking.preferred_date
  const displayDate = date
    ? new Date(date + "T00:00:00").toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "No date"

  // Strip known prefixes for display
  const issueDisplay = booking.issue
    .replace(/^\[CALLBACK REQUESTED\]\s*/i, "")
    .replace(/^\[QUOTE REQUESTED\]\s*/i, "")

  async function handleSave() {
    setSaving(true)
    await saveWorkDone(booking.id, notes)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleStatus(newStatus: string) {
    setActioning(true)
    await updateBookingStatus(booking.id, newStatus)
    setStatus(newStatus)
    setActioning(false)
    router.refresh()
  }

  async function handleCreateInvoice() {
    setActioning(true)
    const result = await createInvoiceFromBooking(booking.id)
    setActioning(false)
    if (result.success && result.invoiceId) {
      router.push(`/admin/invoices/${result.invoiceId}/edit`)
    }
  }

  async function handleSendApproval() {
    setActioning(true)
    const result = await sendApprovalEmail(booking.id)
    setActioning(false)
    if (!result.success) alert(result.error || "Failed to send email")
    else router.refresh()
  }

  async function handleTogglePaid() {
    if (!invoice) return
    setActioning(true)
    const result = await toggleInvoicePaid(invoice.id, invoiceStatus !== "paid" ? paymentMethod : undefined)
    if (result.success) setInvoiceStatus(result.newStatus)
    setActioning(false)
  }

  async function handleLinkCustomer() {
    if (!selectedCustomerId) return
    setLinking(true)
    await linkBookingToCustomer(booking.id, Number(selectedCustomerId))
    setLinkedCustomerId(Number(selectedCustomerId))
    setLinking(false)
    router.refresh()
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploadingPhoto(true)
    for (const file of files) {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("bookingId", String(booking.id))
      const res = await fetch("/api/admin/upload-job-photo", { method: "POST", body: fd })
      if (res.ok) {
        const { path } = await res.json()
        setPhotos((prev) => [...prev, path])
      }
    }
    setUploadingPhoto(false)
    if (photoInputRef.current) photoInputRef.current.value = ""
  }

  async function handleDeletePhoto(photoPath: string) {
    if (!confirm("Remove this photo?")) return
    const res = await fetch("/api/admin/job-photo", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId: booking.id, photoPath }),
    })
    if (res.ok) setPhotos((prev) => prev.filter((p) => p !== photoPath))
  }

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      {/* Collapsed row */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          {/* Left: customer + vehicle + issue */}
          <button
            className="flex-1 text-left min-w-0"
            onClick={() => setOpen((v) => !v)}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-gray-100">{booking.name}</span>
              <span className="text-gray-400 text-sm">
                {booking.vehicle}
                {booking.vehicle_reg && (
                  <span className="ml-1.5 text-orange-400 font-mono">{booking.vehicle_reg}</span>
                )}
              </span>
            </div>
            <p className="text-sm text-gray-300 mt-0.5 line-clamp-2 leading-snug">
              {issueDisplay || <span className="text-gray-500 italic">No job description</span>}
            </p>
            {quote && (() => {
              const labour: { description: string; hours: number; rate: number }[] = (() => { try { return JSON.parse(quote.labour_items || "[]") } catch { return [] } })()
              const parts: { description: string; qty: number; unitPrice: number }[] = (() => { try { return JSON.parse(quote.parts_items || "[]") } catch { return [] } })()
              const totalHours = labour.reduce((s, r) => s + (r.hours || 0), 0)
              const labourTotal = labour.reduce((s, r) => s + (r.hours || 0) * (r.rate || 0), 0)
              const partsTotal = parts.reduce((s, r) => s + (r.qty || 0) * (r.unitPrice || 0), 0)
              if (labourTotal === 0 && partsTotal === 0) return null
              return (
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  {labourTotal > 0 && (
                    <span className="text-xs text-purple-300 bg-purple-900/30 border border-purple-800/50 px-2 py-0.5 rounded-full">
                      Labour: {totalHours}h · £{labourTotal.toFixed(2)}
                    </span>
                  )}
                  {partsTotal > 0 && (
                    <span className="text-xs text-orange-300 bg-orange-900/30 border border-orange-800/50 px-2 py-0.5 rounded-full">
                      Parts: £{partsTotal.toFixed(2)}
                    </span>
                  )}
                </div>
              )
            })()}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-xs text-gray-500">{displayDate}</span>
              {booking.confirmed_time && (
                <span className="text-xs text-gray-500">{booking.confirmed_time}</span>
              )}
            </div>
          </button>

          {/* Right: status + quick-action buttons + chevron */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge className={`capitalize text-xs ${statusColors[status] || statusColors.pending}`}>
              {status}
            </Badge>
            {booking.work_done && (
              <ClipboardCheck className="h-4 w-4 text-green-400" title="Work recorded" />
            )}

            {/* Quick-access links */}
            {quote && (
              <Link href={`/admin/quotes/${quote.id}`} title="View Quote">
                <Button size="sm" variant="outline" className="h-7 px-2 border-blue-700 text-blue-300 hover:bg-blue-900/30 text-xs">
                  <FileText className="h-3.5 w-3.5 mr-1" />
                  Quote
                </Button>
              </Link>
            )}
            {invoice && (
              <Link href={`/admin/invoices/${invoice.id}`} title="View Invoice">
                <Button size="sm" variant="outline" className="h-7 px-2 border-green-700 text-green-300 hover:bg-green-900/30 text-xs">
                  <Receipt className="h-3.5 w-3.5 mr-1" />
                  Invoice
                </Button>
              </Link>
            )}
            <Link href={`/admin/jobs/${booking.id}/edit`} title="Edit job">
              <Button size="sm" variant="outline" className="h-7 px-2 border-gray-600 text-gray-300 hover:bg-gray-700 text-xs">
                <Pencil className="h-3.5 w-3.5 mr-1" />
                Edit
              </Button>
            </Link>

            <button onClick={() => setOpen((v) => !v)}>
              {open ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded detail panel */}
      {open && (
        <div className="border-t border-gray-700 p-4 bg-gray-800/50 space-y-4">
          {/* Job details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-400">Date: </span>
              <span className="text-gray-200">{displayDate}{booking.confirmed_time ? ` at ${booking.confirmed_time}` : ""}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Phone: </span>
              <span className="text-gray-200">{booking.phone}</span>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Message on WhatsApp"
                className="inline-flex items-center gap-1 bg-green-700/20 hover:bg-green-700/40 text-green-400 text-xs px-2 py-0.5 rounded-full transition-colors border border-green-700/50"
              >
                <MessageCircle className="h-3 w-3" />
                WhatsApp
              </a>
            </div>
            {booking.address && (
              <div className="sm:col-span-2">
                <span className="text-gray-400">Address: </span>
                <span className="text-gray-200">{booking.address}</span>
              </div>
            )}
            <div className="sm:col-span-2">
              <span className="text-gray-400">Reported issue: </span>
              <span className="text-gray-200">{booking.issue}</span>
            </div>
          </div>

          {/* Linked quote summary */}
          {quote && (() => {
            const labour: { description: string; hours: number; rate: number }[] = JSON.parse(quote.labour_items || "[]")
            const parts: { description: string; qty: number; unitPrice: number }[] = JSON.parse(quote.parts_items || "[]")
            const labourTotal = labour.reduce((s, r) => s + (r.hours || 0) * (r.rate || 0), 0)
            const partsTotal = parts.reduce((s, r) => s + (r.qty || 0) * (r.unitPrice || 0), 0)
            const subtotal = labourTotal + partsTotal
            const vat = quote.vat_enabled ? subtotal * (quote.vat_rate / 100) : 0
            const total = subtotal + vat
            return (
              <div className="bg-blue-950/40 border border-blue-800/50 rounded-lg p-3 text-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-blue-300 font-semibold flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    Quoted Work — {quote.quote_number}
                  </span>
                  <Link href={`/admin/quotes/${quote.id}`} className="text-xs text-blue-400 hover:text-blue-300 underline">
                    View Quote
                  </Link>
                </div>
                {labour.filter(r => r.description).map((r, i) => (
                  <div key={i} className="flex justify-between text-gray-300">
                    <span>{r.description}</span>
                    <span className="text-gray-400 ml-4">{r.hours}h @ £{r.rate}/hr = £{(r.hours * r.rate).toFixed(2)}</span>
                  </div>
                ))}
                {parts.filter(r => r.description).map((r, i) => (
                  <div key={i} className="flex justify-between text-gray-300">
                    <span>{r.description} ×{r.qty}</span>
                    <span className="text-gray-400 ml-4">£{(r.qty * r.unitPrice).toFixed(2)}</span>
                  </div>
                ))}
                {quote.notes && <p className="text-gray-400 text-xs italic">{quote.notes}</p>}
                <div className="flex justify-end pt-1 border-t border-blue-800/50 font-semibold text-blue-200">
                  Quoted Total: £{total.toFixed(2)}{quote.vat_enabled ? " inc. VAT" : ""}
                </div>
              </div>
            )
          })()}

          {/* Linked invoice summary */}
          {invoice && (
            <div className="bg-green-950/40 border border-green-800/50 rounded-lg p-3 text-sm">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-green-300 font-semibold flex items-center gap-1.5">
                  <Receipt className="h-3.5 w-3.5" />
                  Invoice — {invoice.invoice_number}
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={`capitalize text-xs ${invoiceStatus === "paid" ? "bg-green-900/50 text-green-300 border-green-700" : "bg-yellow-900/50 text-yellow-300 border-yellow-700"}`}>
                    {invoiceStatus}
                    {invoiceStatus === "paid" && invoice.payment_method && (
                      <span className="ml-1 opacity-70">· {invoice.payment_method}</span>
                    )}
                  </Badge>
                  {invoiceStatus !== "paid" && (
                    <div className="flex rounded-md overflow-hidden border border-gray-600 text-xs">
                      <button
                        onClick={() => setPaymentMethod("cash")}
                        className={`px-2 py-1 transition-colors ${paymentMethod === "cash" ? "bg-gray-500 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
                      >
                        Cash
                      </button>
                      <button
                        onClick={() => setPaymentMethod("card")}
                        className={`px-2 py-1 transition-colors border-l border-gray-600 ${paymentMethod === "card" ? "bg-gray-500 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
                      >
                        Card
                      </button>
                    </div>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={actioning}
                    onClick={handleTogglePaid}
                    className={`h-7 px-2 text-xs ${invoiceStatus === "paid" ? "border-yellow-700 text-yellow-300 hover:bg-yellow-900/30" : "border-green-700 text-green-300 hover:bg-green-900/30"}`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    {invoiceStatus === "paid" ? "Mark Unpaid" : `Mark Paid (${paymentMethod})`}
                  </Button>
                  <Link href={`/admin/invoices/${invoice.id}`} className="text-xs text-green-400 hover:text-green-300 underline">
                    View Invoice
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Quick status actions */}
          <div className="flex flex-wrap gap-2 items-center">
            {booking.customer_confirmed ? (
              <span className="text-xs text-green-400 font-medium">✓ Customer confirmed</span>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {status === "pending" && (
              <Button size="sm" disabled={actioning} onClick={() => handleStatus("confirmed")}
                className="bg-blue-700 hover:bg-blue-600 text-white">
                Confirm Booking
              </Button>
            )}
            {status !== "completed" && status !== "cancelled" && (
              <Button size="sm" disabled={actioning} onClick={() => handleStatus("completed")}
                className="bg-green-700 hover:bg-green-600 text-white">
                Mark Complete
              </Button>
            )}
            {!invoice && (
              <Button size="sm" disabled={actioning} onClick={handleCreateInvoice}
                className="bg-orange-600 hover:bg-orange-500 text-white">
                <FileText className="h-3.5 w-3.5 mr-1.5" />
                Create Invoice
              </Button>
            )}
            {invoice && (
              <Link href={`/admin/invoices/${invoice.id}`}>
                <Button size="sm" variant="outline" className="border-green-700 text-green-300 hover:bg-green-900/30">
                  <Receipt className="h-3.5 w-3.5 mr-1.5" />
                  View Invoice
                </Button>
              </Link>
            )}
            {quote && (
              <Link href={`/admin/quotes/${quote.id}`}>
                <Button size="sm" variant="outline" className="border-blue-700 text-blue-300 hover:bg-blue-900/30">
                  <FileText className="h-3.5 w-3.5 mr-1.5" />
                  View Quote
                </Button>
              </Link>
            )}
            {!quote && (
              <Link href={`/admin/quotes/new?name=${encodeURIComponent(booking.name)}&email=${encodeURIComponent(booking.email)}&phone=${encodeURIComponent(booking.phone)}&vehicle=${encodeURIComponent([booking.vehicle, booking.vehicle_reg].filter(Boolean).join(" "))}`}>
                <Button size="sm" variant="outline"
                  className="border-blue-700 text-blue-300 hover:bg-blue-900/30">
                  <Receipt className="h-3.5 w-3.5 mr-1.5" />
                  Send Quote
                </Button>
              </Link>
            )}
            <Link href={`/admin/collect-deposit?name=${encodeURIComponent(booking.name)}&phone=${encodeURIComponent(booking.phone)}&email=${encodeURIComponent(booking.email)}&description=${encodeURIComponent([booking.vehicle, booking.vehicle_reg].filter(Boolean).join(" ") || booking.issue)}`}>
              <Button size="sm" variant="outline" className="border-yellow-700 text-yellow-300 hover:bg-yellow-900/30">
                <Banknote className="h-3.5 w-3.5 mr-1.5" />
                Collect Deposit
              </Button>
            </Link>
            {status !== "cancelled" && status !== "completed" && (
              <Button size="sm" variant="outline" disabled={actioning} onClick={() => handleStatus("cancelled")}
                className="border-red-800 text-red-400 hover:bg-red-900/30">
                Cancel
              </Button>
            )}
            {booking.confirmed_date && (
              <Button size="sm" variant="outline" disabled={actioning} onClick={handleSendApproval}
                className="border-blue-700 text-blue-300 hover:bg-blue-900/40">
                {booking.customer_confirmed ? "Re-send Confirmation" : "Send Confirmation Email"}
              </Button>
            )}
          </div>

          {/* Link to customer */}
          <div className="flex flex-wrap items-center gap-2">
            {linkedCustomerId ? (
              <Link
                href={`/admin/customers/${linkedCustomerId}`}
                className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1 transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                View Customer Profile
              </Link>
            ) : (
              <>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="text-xs bg-gray-900 border border-gray-600 text-gray-200 rounded px-2 py-1.5"
                >
                  <option value="">— Link to existing customer —</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
                <Button size="sm" variant="outline" disabled={!selectedCustomerId || linking} onClick={handleLinkCustomer}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 text-xs h-7">
                  <LinkIcon className="h-3 w-3 mr-1" />
                  {linking ? "Linking..." : "Link"}
                </Button>
              </>
            )}
          </div>

          {/* Work done */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Work Done / Job Notes
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What was found and fixed, parts replaced, labour notes..."
              className="bg-gray-900 border-gray-600 text-gray-100 placeholder-gray-500 min-h-[120px]"
            />
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-gray-500">
                These notes are internal only and not shown to the customer.
              </p>
              <Button
                onClick={handleSave}
                disabled={saving}
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : saved ? "Saved!" : "Save Notes"}
              </Button>
            </div>
          </div>

          {/* Job Photos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                <Camera className="h-4 w-4 text-gray-400" />
                Job Photos
                {photos.length > 0 && <span className="text-gray-500 font-normal">({photos.length})</span>}
              </label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={uploadingPhoto}
                onClick={() => photoInputRef.current?.click()}
                className="border-gray-600 text-gray-300 hover:bg-gray-700 text-xs h-7"
              >
                {uploadingPhoto
                  ? <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />Uploading...</>
                  : <><Upload className="h-3.5 w-3.5 mr-1" />Add Photos</>}
              </Button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </div>
            {photos.length === 0 ? (
              <p className="text-xs text-gray-500 italic">No photos added yet — tap Add Photos to upload before/after images.</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {photos.map((src) => (
                  <div key={src} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-900 border border-gray-700">
                    <img src={src} alt="Job photo" className="w-full h-full object-cover" />
                    <button
                      onClick={() => handleDeletePhoto(src)}
                      className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove photo"
                    >
                      <XIcon className="h-3.5 w-3.5" />
                    </button>
                    <a
                      href={src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

type Filter = "all" | "pending" | "confirmed" | "completed"

export default function JobsClient({
  bookings,
  customers,
  quotes,
  invoices,
}: {
  bookings: Booking[]
  customers: CustomerWithCounts[]
  quotes: Quote[]
  invoices: Invoice[]
}) {
  const [filter, setFilter] = useState<Filter>("confirmed")
  const quotesById = Object.fromEntries(quotes.map(q => [q.id, q]))
  const invoicesByBookingId = Object.fromEntries(
    invoices.filter(i => i.booking_id != null).map(i => [i.booking_id!, i])
  )

  const filtered =
    filter === "all" ? bookings : bookings.filter((b) => b.status === filter)

  const tabs: { key: Filter; label: string }[] = [
    { key: "confirmed", label: "Confirmed" },
    { key: "pending", label: "Pending" },
    { key: "completed", label: "Completed" },
    { key: "all", label: "All" },
  ]

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === t.key
                ? "bg-orange-500 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {t.label}
            <span className="ml-2 text-xs opacity-70">
              ({t.key === "all" ? bookings.length : bookings.filter((b) => b.status === t.key).length})
            </span>
          </button>
        ))}
      </div>

      {/* Job list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <ClipboardCheck className="h-12 w-12 mx-auto mb-4 opacity-40" />
          <p>No jobs in this filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => (
            <JobRow
              key={b.id}
              booking={b}
              customers={customers}
              quote={b.quote_id ? quotesById[b.quote_id] : undefined}
              invoice={invoicesByBookingId[b.id]}
            />
          ))}
        </div>
      )}
    </div>
  )
}
