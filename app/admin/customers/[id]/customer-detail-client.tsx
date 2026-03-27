"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  updateCustomer,
  deleteCustomer,
  addVehicle,
  deleteVehicle,
  linkBookingToCustomer,
  linkInvoiceToCustomer,
  setServiceReminder,
  setLastServiceOverride,
  sendReviewRequest,
} from "@/app/actions/customers"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Users,
  ArrowLeft,
  Car,
  Trash2,
  Plus,
  Link as LinkIcon,
  Edit,
  Save,
  X,
  Bell,
  BellOff,
  Star,
  FileText,
  ClipboardList,
} from "lucide-react"
import { format } from "date-fns"
import type { Customer, CustomerVehicle, Booking, Invoice } from "@/lib/db"

const bookingStatusColors: Record<string, string> = {
  pending: "bg-yellow-900/50 text-yellow-300 border-yellow-700",
  confirmed: "bg-blue-900/50 text-blue-300 border-blue-700",
  completed: "bg-green-900/50 text-green-300 border-green-700",
  cancelled: "bg-red-900/50 text-red-300 border-red-700",
}

const invoiceStatusColors: Record<string, string> = {
  draft: "bg-gray-700/60 text-gray-300 border-gray-600",
  sent: "bg-blue-900/50 text-blue-300 border-blue-700",
  paid: "bg-green-900/50 text-green-300 border-green-700",
}

type Props = {
  customer: Customer
  vehicles: CustomerVehicle[]
  bookings: Booking[]
  invoices: Invoice[]
  unlinkedBookings: Booking[]
  unlinkedInvoices: Invoice[]
}

export function CustomerDetailClient({
  customer: initialCustomer,
  vehicles: initialVehicles,
  bookings: initialBookings,
  invoices: initialInvoices,
  unlinkedBookings,
  unlinkedInvoices,
}: Props) {
  const router = useRouter()

  // Customer edit state
  const [customer, setCustomer] = useState(initialCustomer)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: initialCustomer.name,
    email: initialCustomer.email,
    phone: initialCustomer.phone || "",
    address: initialCustomer.address || "",
    notes: initialCustomer.notes || "",
  })
  const [savingEdit, setSavingEdit] = useState(false)

  // Vehicles state
  const [vehicles, setVehicles] = useState(initialVehicles)
  const [showAddVehicle, setShowAddVehicle] = useState(false)
  const [vehicleForm, setVehicleForm] = useState({
    make_model: "",
    reg: "",
    year: "",
    notes: "",
  })
  const [savingVehicle, setSavingVehicle] = useState(false)

  // Service reminder toggle
  const [reminderEnabled, setReminderEnabled] = useState(!!initialCustomer.service_reminder)
  const [togglingReminder, setTogglingReminder] = useState(false)

  // Last service override
  const [overrideDate, setOverrideDate] = useState(initialCustomer.last_service_override || "")
  const [savingOverride, setSavingOverride] = useState(false)
  const [showOverrideInput, setShowOverrideInput] = useState(false)

  async function handleSaveOverride() {
    setSavingOverride(true)
    await setLastServiceOverride(customer.id, overrideDate || null)
    setSavingOverride(false)
    setShowOverrideInput(false)
    router.refresh()
  }

  async function handleClearOverride() {
    setSavingOverride(true)
    await setLastServiceOverride(customer.id, null)
    setOverrideDate("")
    setSavingOverride(false)
    setShowOverrideInput(false)
    router.refresh()
  }

  // Review request
  const [sendingReview, setSendingReview] = useState(false)
  const [reviewMessage, setReviewMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  async function handleSendReviewRequest() {
    setSendingReview(true)
    setReviewMessage(null)
    const result = await sendReviewRequest(customer.id)
    setSendingReview(false)
    if (result.success) {
      setReviewMessage({ type: "success", text: "Review request sent successfully!" })
    } else {
      setReviewMessage({ type: "error", text: "Failed to send review request." })
    }
    setTimeout(() => setReviewMessage(null), 4000)
  }

  async function handleToggleReminder() {
    setTogglingReminder(true)
    const next = !reminderEnabled
    const result = await setServiceReminder(customer.id, next)
    if (result.success) setReminderEnabled(next)
    setTogglingReminder(false)
  }

  // Bookings/invoices state
  const [bookings, setBookings] = useState(initialBookings)
  const [invoices, setInvoices] = useState(initialInvoices)
  const [availableBookings, setAvailableBookings] = useState(unlinkedBookings)
  const [availableInvoices, setAvailableInvoices] = useState(unlinkedInvoices)
  const [selectedBookingId, setSelectedBookingId] = useState("")
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("")
  const [linkingBooking, setLinkingBooking] = useState(false)
  const [linkingInvoice, setLinkingInvoice] = useState(false)

  // ── Edit customer ──────────────────────────────────────────────────────────

  async function handleSaveEdit() {
    setSavingEdit(true)
    const result = await updateCustomer(customer.id, {
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone || null,
      address: editForm.address || null,
      notes: editForm.notes || null,
    })
    if (result.success) {
      setCustomer({
        ...customer,
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone || null,
        address: editForm.address || null,
        notes: editForm.notes || null,
      })
      setEditing(false)
    }
    setSavingEdit(false)
  }

  async function handleDeleteCustomer() {
    if (!confirm(`Delete customer "${customer.name}"? This cannot be undone.`)) return
    const result = await deleteCustomer(customer.id)
    if (result.success) {
      router.push("/admin/customers")
    }
  }

  // ── Vehicles ───────────────────────────────────────────────────────────────

  async function handleAddVehicle(e: React.FormEvent) {
    e.preventDefault()
    if (!vehicleForm.make_model.trim()) return
    setSavingVehicle(true)
    const result = await addVehicle(customer.id, {
      make_model: vehicleForm.make_model.trim(),
      reg: vehicleForm.reg.trim() || null,
      year: vehicleForm.year.trim() || null,
      notes: vehicleForm.notes.trim() || null,
    })
    if (result.success && result.vehicle) {
      setVehicles([...vehicles, result.vehicle])
      setVehicleForm({ make_model: "", reg: "", year: "", notes: "" })
      setShowAddVehicle(false)
    }
    setSavingVehicle(false)
  }

  async function handleDeleteVehicle(id: number) {
    if (!confirm("Remove this vehicle?")) return
    const result = await deleteVehicle(id)
    if (result.success) {
      setVehicles(vehicles.filter((v) => v.id !== id))
    }
  }

  // ── Link booking ───────────────────────────────────────────────────────────

  async function handleLinkBooking() {
    if (!selectedBookingId) return
    setLinkingBooking(true)
    const bId = parseInt(selectedBookingId, 10)
    const result = await linkBookingToCustomer(bId, customer.id)
    if (result.success) {
      const linked = availableBookings.find((b) => b.id === bId)
      if (linked) {
        setBookings([linked, ...bookings])
        setAvailableBookings(availableBookings.filter((b) => b.id !== bId))
        setSelectedBookingId("")
      }
    }
    setLinkingBooking(false)
  }

  // ── Link invoice ───────────────────────────────────────────────────────────

  async function handleLinkInvoice() {
    if (!selectedInvoiceId) return
    setLinkingInvoice(true)
    const iId = parseInt(selectedInvoiceId, 10)
    const result = await linkInvoiceToCustomer(iId, customer.id)
    if (result.success) {
      const linked = availableInvoices.find((i) => i.id === iId)
      if (linked) {
        setInvoices([linked, ...invoices])
        setAvailableInvoices(availableInvoices.filter((i) => i.id !== iId))
        setSelectedInvoiceId("")
      }
    }
    setLinkingInvoice(false)
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-blue-950 text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Users className="h-7 w-7 text-orange-500" />
          <h1 className="text-xl font-bold">{customer.name}</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        {/* Back link */}
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-1 text-gray-400 hover:text-gray-200 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Customers
        </Link>

        {/* ── Customer Details ─────────────────────────────────────────────── */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-gray-100">Customer Details</CardTitle>
              <CardDescription className="text-gray-400">
                Added {format(new Date(customer.created_at), "dd MMM yyyy")}
              </CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              {!editing && (
                <>
                  <Link
                    href={`/admin/invoices/new?name=${encodeURIComponent(customer.name)}&email=${encodeURIComponent(customer.email)}&phone=${encodeURIComponent(customer.phone || "")}&address=${encodeURIComponent(customer.address || "")}`}
                  >
                    <Button size="sm" className="bg-orange-600 hover:bg-orange-500 text-white">
                      <FileText className="h-4 w-4 mr-1" />
                      New Invoice
                    </Button>
                  </Link>
                  <Link
                    href={`/admin/quotes/new?name=${encodeURIComponent(customer.name)}&email=${encodeURIComponent(customer.email)}&phone=${encodeURIComponent(customer.phone || "")}&address=${encodeURIComponent(customer.address || "")}`}
                  >
                    <Button size="sm" className="bg-blue-700 hover:bg-blue-600 text-white">
                      <ClipboardList className="h-4 w-4 mr-1" />
                      New Quote
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    onClick={handleSendReviewRequest}
                    disabled={sendingReview}
                    className="bg-green-700 hover:bg-green-600 text-white"
                  >
                    <Star className="h-4 w-4 mr-1" />
                    {sendingReview ? "Sending..." : "Request Review"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditForm({
                        name: customer.name,
                        email: customer.email,
                        phone: customer.phone || "",
                        address: customer.address || "",
                        notes: customer.notes || "",
                      })
                      setEditing(true)
                    }}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDeleteCustomer}
                    className="border-red-800 text-red-400 hover:bg-red-900/30"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </>
              )}
            </div>
            {reviewMessage && (
              <div className={`mt-2 text-sm px-3 py-1.5 rounded-md ${reviewMessage.type === "success" ? "bg-green-900/40 text-green-300 border border-green-700" : "bg-red-900/40 text-red-300 border border-red-700"}`}>
                {reviewMessage.text}
              </div>
            )}
          </CardHeader>
          <CardContent>
            {editing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                    <input
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Address</label>
                  <textarea
                    rows={2}
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
                  <textarea
                    rows={2}
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveEdit}
                    disabled={savingEdit}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    {savingEdit ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditing(false)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Email</p>
                  <p className="text-gray-200">{customer.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Phone</p>
                  <p className="text-gray-200">{customer.phone || <span className="text-gray-600">—</span>}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Address</p>
                  <p className="text-gray-200 whitespace-pre-wrap">
                    {customer.address || <span className="text-gray-600">—</span>}
                  </p>
                </div>
                {customer.notes && (
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Notes</p>
                    <p className="text-gray-200 whitespace-pre-wrap">{customer.notes}</p>
                  </div>
                )}
                <div className="md:col-span-2 pt-2 border-t border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-200 flex items-center gap-1.5">
                        {reminderEnabled
                          ? <Bell className="h-4 w-4 text-orange-400" />
                          : <BellOff className="h-4 w-4 text-gray-500" />}
                        Annual Service Reminder
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {reminderEnabled
                          ? "Reminder email will be sent ~10 months after their last service"
                          : "Customer will not receive automatic service reminders"}
                      </p>
                    </div>
                    <button
                      onClick={handleToggleReminder}
                      disabled={togglingReminder}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
                        reminderEnabled ? "bg-orange-500" : "bg-gray-600"
                      }`}
                      aria-label="Toggle service reminder"
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        reminderEnabled ? "translate-x-6" : "translate-x-1"
                      }`} />
                    </button>
                  </div>
                </div>

                {/* Last service override — for pre-existing customers */}
                {reminderEnabled && (
                  <div className="md:col-span-2 pt-3 border-t border-gray-700/50">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-300">Last Service Date Override</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {overrideDate
                            ? `Set to ${new Date(overrideDate + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} — reminder will use this date instead of last invoice/booking.`
                            : "Set a manual last service date for customers not yet in the system."}
                        </p>
                      </div>
                      {!showOverrideInput && (
                        <button
                          type="button"
                          onClick={() => setShowOverrideInput(true)}
                          className="text-xs text-orange-400 hover:text-orange-300 shrink-0 mt-0.5"
                        >
                          {overrideDate ? "Change" : "Set date"}
                        </button>
                      )}
                    </div>
                    {showOverrideInput && (
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="date"
                          value={overrideDate}
                          onChange={e => setOverrideDate(e.target.value)}
                          className="bg-gray-700 border border-gray-600 rounded-md px-3 py-1.5 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <Button size="sm" disabled={savingOverride} onClick={handleSaveOverride}
                          className="bg-orange-500 hover:bg-orange-600 text-white text-xs">
                          {savingOverride ? "Saving…" : "Save"}
                        </Button>
                        {overrideDate && (
                          <Button size="sm" variant="outline" disabled={savingOverride} onClick={handleClearOverride}
                            className="border-gray-600 text-gray-400 hover:bg-gray-700 text-xs">
                            Clear
                          </Button>
                        )}
                        <button type="button" onClick={() => setShowOverrideInput(false)} className="text-gray-500 hover:text-gray-300">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Vehicles ──────────────────────────────────────────────────────── */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-gray-100 flex items-center gap-2">
                <Car className="h-5 w-5 text-orange-400" />
                Vehicles
              </CardTitle>
              <CardDescription className="text-gray-400">
                Vehicles associated with this customer
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAddVehicle(!showAddVehicle)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Vehicle
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {showAddVehicle && (
              <form
                onSubmit={handleAddVehicle}
                className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 space-y-3"
              >
                <p className="text-sm font-medium text-gray-300">Add Vehicle</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-1">
                    <label className="block text-xs text-gray-400 mb-1">
                      Make / Model <span className="text-red-400">*</span>
                    </label>
                    <input
                      value={vehicleForm.make_model}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, make_model: e.target.value })}
                      required
                      placeholder="e.g. Ford Focus"
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Registration</label>
                    <input
                      value={vehicleForm.reg}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, reg: e.target.value })}
                      placeholder="AB12 CDE"
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-gray-100 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Year</label>
                    <input
                      value={vehicleForm.year}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, year: e.target.value })}
                      placeholder="2020"
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Notes</label>
                  <input
                    value={vehicleForm.notes}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, notes: e.target.value })}
                    placeholder="Optional notes"
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={savingVehicle}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    {savingVehicle ? "Adding..." : "Add Vehicle"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAddVehicle(false)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {vehicles.length === 0 && !showAddVehicle ? (
              <p className="text-gray-500 text-sm py-4 text-center">No vehicles added yet</p>
            ) : (
              <div className="space-y-2">
                {vehicles.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between bg-gray-700/40 border border-gray-700 rounded-lg px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-gray-100">{v.make_model}</p>
                      <p className="text-sm text-gray-400">
                        {[v.reg && <span key="reg" className="font-mono uppercase">{v.reg}</span>, v.year]
                          .filter(Boolean)
                          .reduce<React.ReactNode[]>((acc, el, i) => {
                            if (i > 0) acc.push(" · ")
                            acc.push(el)
                            return acc
                          }, [])}
                        {v.notes && <span className="ml-2 text-gray-500">— {v.notes}</span>}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteVehicle(v.id)}
                      className="border-red-800 text-red-400 hover:bg-red-900/30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Booking History ───────────────────────────────────────────────── */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100">Booking History</CardTitle>
            <CardDescription className="text-gray-400">
              {bookings.length} booking{bookings.length !== 1 ? "s" : ""} linked to this customer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Link booking */}
            {availableBookings.length > 0 && (
              <div className="flex gap-2">
                <select
                  value={selectedBookingId}
                  onChange={(e) => setSelectedBookingId(e.target.value)}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Link an existing booking...</option>
                  {availableBookings.map((b) => (
                    <option key={b.id} value={b.id}>
                      #{b.id} — {b.name} — {b.vehicle} ({b.status})
                    </option>
                  ))}
                </select>
                <Button
                  onClick={handleLinkBooking}
                  disabled={!selectedBookingId || linkingBooking}
                  size="sm"
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 whitespace-nowrap"
                >
                  <LinkIcon className="h-4 w-4 mr-1" />
                  Link
                </Button>
              </div>
            )}

            {bookings.length === 0 ? (
              <p className="text-gray-500 text-sm py-4 text-center">No bookings linked yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-400">ID</TableHead>
                    <TableHead className="text-gray-400">Vehicle</TableHead>
                    <TableHead className="text-gray-400">Issue</TableHead>
                    <TableHead className="text-gray-400">Date</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((b) => (
                    <TableRow key={b.id} className="border-gray-700 hover:bg-gray-700/40">
                      <TableCell className="text-gray-400 text-sm">#{b.id}</TableCell>
                      <TableCell className="text-gray-200">{b.vehicle}</TableCell>
                      <TableCell className="text-gray-300 max-w-[200px]">
                        <p className="truncate">{b.issue}</p>
                      </TableCell>
                      <TableCell className="text-gray-400 text-sm">
                        {b.preferred_date
                          ? format(new Date(b.preferred_date), "dd/MM/yyyy")
                          : format(new Date(b.created_at), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge className={bookingStatusColors[b.status] || bookingStatusColors.pending}>
                          {b.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* ── Invoice History ───────────────────────────────────────────────── */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100">Invoice History</CardTitle>
            <CardDescription className="text-gray-400">
              {invoices.length} invoice{invoices.length !== 1 ? "s" : ""} linked to this customer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Link invoice */}
            {availableInvoices.length > 0 && (
              <div className="flex gap-2">
                <select
                  value={selectedInvoiceId}
                  onChange={(e) => setSelectedInvoiceId(e.target.value)}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Link an existing invoice...</option>
                  {availableInvoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoice_number} — {inv.customer_name} ({inv.status})
                    </option>
                  ))}
                </select>
                <Button
                  onClick={handleLinkInvoice}
                  disabled={!selectedInvoiceId || linkingInvoice}
                  size="sm"
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 whitespace-nowrap"
                >
                  <LinkIcon className="h-4 w-4 mr-1" />
                  Link
                </Button>
              </div>
            )}

            {invoices.length === 0 ? (
              <p className="text-gray-500 text-sm py-4 text-center">No invoices linked yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-400">Invoice #</TableHead>
                    <TableHead className="text-gray-400">Vehicle</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Date</TableHead>
                    <TableHead className="text-gray-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow key={inv.id} className="border-gray-700 hover:bg-gray-700/40">
                      <TableCell className="font-mono text-gray-200 font-medium">
                        {inv.invoice_number}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {inv.vehicle || <span className="text-gray-600">—</span>}
                      </TableCell>
                      <TableCell>
                        <Badge className={invoiceStatusColors[inv.status] || invoiceStatusColors.draft}>
                          {inv.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-400 text-sm">
                        {format(new Date(inv.created_at), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/invoices/${inv.id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          >
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
