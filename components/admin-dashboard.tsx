"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateBookingStatus, deleteBooking, updateBookingDateTime, createCustomerFromBooking } from "@/app/actions/bookings"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Calendar, Phone, Mail, Car, Clock, RefreshCw, Hash, Trash2, ChevronLeft, ChevronRight, CheckCircle, UserPlus, UserCheck, FileText } from "lucide-react"
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, parseISO } from "date-fns"

type Booking = {
  id: number
  name: string
  phone: string
  email: string
  vehicle: string
  vehicle_reg: string | null
  vehicle_year: string | null
  issue: string
  preferred_date: string | null
  preferred_time: string | null
  status: string
  created_at: string
  confirmed_date: string | null
  confirmed_time: string | null
  customer_id: number | null
}

type Invoice = {
  id: number
  invoice_number: string
  customer_name: string
  customer_email: string
  status: string
  created_at: string
  invoice_date: string | null
  labour_items: string
  parts_items: string
  vat_enabled: number
  vat_rate: number
}

type AdminDashboardProps = {
  bookings: Booking[]
  invoices: Invoice[]
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-900/50 text-yellow-300 border-yellow-700",
  confirmed: "bg-blue-900/50 text-blue-300 border-blue-700",
  completed: "bg-green-900/50 text-green-300 border-green-700",
  cancelled: "bg-red-900/50 text-red-300 border-red-700",
}

const TIME_SLOTS = ["09:00","11:00","13:00","15:00"]

function formatHour(hour: number, minute: string): string {
  const ampm = hour >= 12 ? "PM" : "AM"
  const h = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${h}:${minute} ${ampm}`
}

function formatTime(time: string): string {
  const [hourStr, minute] = time.split(":")
  const hour = parseInt(hourStr, 10)
  return `${formatHour(hour, minute)} – ${formatHour(hour + 2, minute)}`
}

function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
}

function isMorningSlot(time: string): boolean {
  const hour = parseInt(time.split(":")[0], 10)
  return hour < 12
}

function calcInvoiceTotal(invoice: Invoice): number {
  let total = 0
  try {
    const labour: { hours: number; rate: number }[] = JSON.parse(invoice.labour_items)
    const parts: { qty: number; unitPrice: number }[] = JSON.parse(invoice.parts_items)
    const labourTotal = labour.reduce((s, i) => s + i.hours * i.rate, 0)
    const partsTotal = parts.reduce((s, i) => s + i.qty * i.unitPrice, 0)
    const subtotal = labourTotal + partsTotal
    total = invoice.vat_enabled ? subtotal * (1 + invoice.vat_rate / 100) : subtotal
  } catch {}
  return total
}

function daysSince(dateStr: string): number {
  const d = new Date(dateStr)
  const now = new Date()
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
}

export default function AdminDashboard({ bookings: initialBookings, invoices }: AdminDashboardProps) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<"bookings" | "schedule">("bookings")
  const [scheduleWeekStart, setScheduleWeekStart] = useState<Date>(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  )
  // Schedule date/time form state
  const [scheduleDate, setScheduleDate] = useState("")
  const [scheduleTime, setScheduleTime] = useState("")
  const [scheduling, setScheduling] = useState(false)
  // Create customer from booking
  const [creatingCustomer, setCreatingCustomer] = useState(false)
  const [customerResult, setCustomerResult] = useState<{ customerId: number; existing: boolean } | null>(null)
  const router = useRouter()

  const handleStatusChange = async (bookingId: number, newStatus: string) => {
    const result = await updateBookingStatus(bookingId, newStatus)

    if (result.success) {
      setBookings(bookings.map(b =>
        b.id === bookingId ? { ...b, status: newStatus } : b
      ))
      if (selectedBooking?.id === bookingId) {
        setSelectedBooking({ ...selectedBooking, status: newStatus })
      }
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    router.refresh()
    setTimeout(() => setRefreshing(false), 500)
  }

  const handleDelete = async (bookingId: number) => {
    if (!confirm("Delete this booking? This cannot be undone.")) return
    const result = await deleteBooking(bookingId)
    if (result.success) {
      setBookings(bookings.filter(b => b.id !== bookingId))
      if (selectedBooking?.id === bookingId) {
        setSelectedBooking(null)
      }
    }
  }

  const handleOpenBooking = (booking: Booking) => {
    setSelectedBooking(booking)
    setScheduleDate(booking.confirmed_date ?? booking.preferred_date ?? "")
    setScheduleTime(booking.confirmed_time ?? booking.preferred_time ?? "")
    setCustomerResult(booking.customer_id ? { customerId: booking.customer_id, existing: true } : null)
  }

  const handleCreateCustomer = async () => {
    if (!selectedBooking) return
    setCreatingCustomer(true)
    const result = await createCustomerFromBooking(selectedBooking.id)
    if (result.success && result.customerId) {
      setCustomerResult({ customerId: result.customerId, existing: result.existing ?? false })
      // Update local booking state so button doesn't reappear
      const updated = { ...selectedBooking, customer_id: result.customerId }
      setSelectedBooking(updated)
      setBookings(bookings.map(b => b.id === selectedBooking.id ? updated : b))
    }
    setCreatingCustomer(false)
  }

  const handleSchedule = async () => {
    if (!selectedBooking || !scheduleDate || !scheduleTime) return
    setScheduling(true)

    // Confirm status and set date/time
    await updateBookingStatus(selectedBooking.id, "confirmed")
    const dtResult = await updateBookingDateTime(selectedBooking.id, scheduleDate, scheduleTime)

    if (dtResult.success) {
      const updated: Booking = {
        ...selectedBooking,
        status: "confirmed",
        confirmed_date: scheduleDate,
        confirmed_time: scheduleTime,
      }
      setBookings(bookings.map(b => b.id === selectedBooking.id ? updated : b))
      setSelectedBooking(updated)
    }

    setScheduling(false)
  }

  const pendingCount = bookings.filter(b => b.status === "pending").length
  const confirmedCount = bookings.filter(b => b.status === "confirmed").length
  const completedCount = bookings.filter(b => b.status === "completed").length

  // Week view helpers
  const weekDays = getWeekDays(scheduleWeekStart)
  const weekStart = scheduleWeekStart
  const weekEnd = addDays(scheduleWeekStart, 6)
  const weekStartStr = format(weekStart, "yyyy-MM-dd")
  const weekEndStr = format(weekEnd, "yyyy-MM-dd")

  const confirmedBookingsThisWeek = bookings.filter(b => {
    if (b.status !== "confirmed" || !b.confirmed_date) return false
    return b.confirmed_date >= weekStartStr && b.confirmed_date <= weekEndStr
  })

  const today = new Date()

  const outstandingInvoices = invoices.filter(inv => inv.status === "sent")
  const outstandingTotal = outstandingInvoices.reduce((sum, inv) => sum + calcInvoiceTotal(inv), 0)

  return (
    <div className="min-h-screen bg-gray-900">
      <main className="container mx-auto px-4 py-8">
        {/* Outstanding Invoices */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-gray-100 flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-400" />
                Outstanding Invoices
              </CardTitle>
              <CardDescription className="text-gray-400">Sent but not yet paid</CardDescription>
            </div>
            {outstandingInvoices.length > 0 && (
              <div className="text-right">
                <p className="text-xs text-gray-400">Total outstanding</p>
                <p className="text-xl font-bold text-orange-400">£{outstandingTotal.toFixed(2)}</p>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {outstandingInvoices.length === 0 ? (
              <div className="flex items-center gap-2 text-green-400 text-sm py-2">
                <CheckCircle className="h-4 w-4" />
                All invoices paid — no outstanding balances
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-400">Invoice #</TableHead>
                      <TableHead className="text-gray-400">Customer</TableHead>
                      <TableHead className="text-gray-400 text-right">Amount</TableHead>
                      <TableHead className="text-gray-400">Days Overdue</TableHead>
                      <TableHead className="text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {outstandingInvoices.map(inv => {
                      const total = calcInvoiceTotal(inv)
                      const issuedDate = inv.invoice_date || inv.created_at
                      const days = daysSince(issuedDate)
                      return (
                        <TableRow key={inv.id} className="border-gray-700 hover:bg-gray-700/40">
                          <TableCell className="font-mono text-gray-200 font-medium">{inv.invoice_number}</TableCell>
                          <TableCell>
                            <div className="text-gray-100 font-medium">{inv.customer_name}</div>
                            <div className="text-xs text-gray-400">{inv.customer_email}</div>
                          </TableCell>
                          <TableCell className="text-right text-gray-100 font-semibold">£{total.toFixed(2)}</TableCell>
                          <TableCell>
                            <span className={`text-sm font-medium ${days > 30 ? "text-red-400" : days > 14 ? "text-yellow-400" : "text-gray-300"}`}>
                              {days} day{days !== 1 ? "s" : ""}
                            </span>
                          </TableCell>
                          <TableCell>
                            <a href={`/admin/invoices/${inv.id}`}>
                              <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                                View
                              </Button>
                            </a>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-400">Total Bookings</CardDescription>
              <CardTitle className="text-3xl text-gray-100">{bookings.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-400">Pending</CardDescription>
              <CardTitle className="text-3xl text-yellow-400">{pendingCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-400">Confirmed</CardDescription>
              <CardTitle className="text-3xl text-blue-400">{confirmedCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-400">Completed</CardDescription>
              <CardTitle className="text-3xl text-green-400">{completedCount}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab("bookings")}
            className={`px-6 py-3 text-sm font-medium rounded-t-md transition-colors ${
              activeTab === "bookings"
                ? "bg-gray-800 text-gray-100 border border-b-0 border-gray-700"
                : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
            }`}
          >
            <Calendar className="inline h-4 w-4 mr-2" />
            Bookings
          </button>
          <button
            onClick={() => setActiveTab("schedule")}
            className={`px-6 py-3 text-sm font-medium rounded-t-md transition-colors ${
              activeTab === "schedule"
                ? "bg-gray-800 text-gray-100 border border-b-0 border-gray-700"
                : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
            }`}
          >
            <Clock className="inline h-4 w-4 mr-2" />
            Schedule
          </button>
        </div>

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-gray-100">Bookings</CardTitle>
                <CardDescription className="text-gray-400">Manage your customer booking requests</CardDescription>
              </div>
              <Button variant="outline" onClick={handleRefresh} disabled={refreshing} className="border-gray-600 text-gray-300 hover:bg-gray-700">
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No bookings yet</p>
                  <p className="text-sm">Bookings will appear here when customers submit requests</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700 hover:bg-gray-700/50">
                        <TableHead className="text-gray-400">Date</TableHead>
                        <TableHead className="text-gray-400">Customer</TableHead>
                        <TableHead className="text-gray-400">Vehicle</TableHead>
                        <TableHead className="text-gray-400">Issue</TableHead>
                        <TableHead className="text-gray-400">Preferred Date</TableHead>
                        <TableHead className="text-gray-400">Confirmed Slot</TableHead>
                        <TableHead className="text-gray-400">Status</TableHead>
                        <TableHead className="text-gray-400">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow
                          key={booking.id}
                          className="border-gray-700 cursor-pointer hover:bg-gray-700/50"
                          onClick={() => handleOpenBooking(booking)}
                        >
                          <TableCell className="text-sm text-gray-400">
                            {format(new Date(booking.created_at), "dd/MM/yyyy")}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-gray-100">{booking.name}</div>
                            <div className="text-sm text-gray-400">{booking.email}</div>
                          </TableCell>
                          <TableCell className="text-gray-200">
                            <div>{booking.vehicle}{booking.vehicle_year ? ` (${booking.vehicle_year})` : ""}</div>
                            {booking.vehicle_reg && <div className="text-sm text-gray-400 font-mono uppercase">{booking.vehicle_reg}</div>}
                          </TableCell>
                          <TableCell className="text-gray-300 max-w-[200px]">
                            <p className="truncate">{booking.issue}</p>
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {booking.preferred_date
                              ? format(new Date(booking.preferred_date), "dd/MM/yyyy")
                              : "-"}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {booking.confirmed_date && booking.confirmed_time ? (
                              <span className="text-blue-300 text-sm">
                                {format(parseISO(booking.confirmed_date), "dd/MM/yy")} {formatTime(booking.confirmed_time)}
                              </span>
                            ) : (
                              <span className="text-gray-600 text-sm">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[booking.status] || statusColors.pending}>
                              {booking.status}
                            </Badge>
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-2">
                              <Select
                                value={booking.status}
                                onValueChange={(value) => handleStatusChange(booking.id, value)}
                              >
                                <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-gray-200">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-gray-700">
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="confirmed">Confirmed</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(booking.id)}
                                className="border-red-800 text-red-400 hover:bg-red-900/30"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Schedule Tab — Week View */}
        {activeTab === "schedule" && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-gray-100">Week Schedule</CardTitle>
                  <CardDescription className="text-gray-400">
                    {format(weekStart, "dd MMM")} – {format(weekEnd, "dd MMM yyyy")}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setScheduleWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setScheduleWeekStart(subWeeks(scheduleWeekStart, 1))}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 h-8 w-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setScheduleWeekStart(addWeeks(scheduleWeekStart, 1))}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 h-8 w-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 min-h-[400px]">
                {weekDays.map((day) => {
                  const dayStr = format(day, "yyyy-MM-dd")
                  const isToday = isSameDay(day, today)
                  const dayBookings = confirmedBookingsThisWeek
                    .filter(b => b.confirmed_date === dayStr)
                    .sort((a, b) => (a.confirmed_time ?? "").localeCompare(b.confirmed_time ?? ""))

                  return (
                    <div
                      key={dayStr}
                      className={`rounded-lg border p-2 flex flex-col gap-2 ${
                        isToday
                          ? "border-orange-500 bg-orange-950/20"
                          : "border-gray-700 bg-gray-850"
                      }`}
                    >
                      {/* Day header */}
                      <div className={`text-center pb-1 border-b ${isToday ? "border-orange-600" : "border-gray-700"}`}>
                        <div className={`text-xs font-medium uppercase ${isToday ? "text-orange-400" : "text-gray-400"}`}>
                          {format(day, "EEE")}
                        </div>
                        <div className={`text-lg font-bold ${isToday ? "text-orange-300" : "text-gray-200"}`}>
                          {format(day, "d")}
                        </div>
                      </div>

                      {/* Bookings for this day */}
                      {dayBookings.length === 0 ? (
                        <p className="text-xs text-gray-600 text-center italic mt-2">No appts</p>
                      ) : (
                        <div className="flex flex-col gap-1">
                          {dayBookings.map(b => {
                            const isMorning = b.confirmed_time ? isMorningSlot(b.confirmed_time) : false
                            return (
                              <button
                                key={b.id}
                                onClick={() => { handleOpenBooking(b); }}
                                className={`w-full text-left rounded p-1.5 text-xs border transition-colors ${
                                  isMorning
                                    ? "bg-blue-900/40 border-blue-700/50 text-blue-200 hover:bg-blue-900/60"
                                    : "bg-orange-900/40 border-orange-700/50 text-orange-200 hover:bg-orange-900/60"
                                }`}
                              >
                                <div className="font-semibold truncate">{b.confirmed_time ? formatTime(b.confirmed_time) : ""}</div>
                                <div className="truncate text-xs opacity-90">{b.name}</div>
                                <div className="truncate text-xs opacity-70">{b.vehicle}</div>
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded bg-blue-700 border border-blue-600"></span>
                  Morning (before 12 PM)
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded bg-orange-700 border border-orange-600"></span>
                  Afternoon (12 PM+)
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Booking Detail Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={(open) => { if (!open) setSelectedBooking(null) }}>
        <DialogContent className="max-w-lg bg-gray-800 border-gray-700 text-gray-100">
          <DialogHeader>
            <DialogTitle className="text-gray-100">Booking Details</DialogTitle>
            <DialogDescription className="text-gray-400">
              Submitted on {selectedBooking && format(new Date(selectedBooking.created_at), "PPP 'at' p")}
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-400 flex items-center gap-1">
                    <Phone className="h-3 w-3" /> Phone
                  </p>
                  <p className="font-medium text-gray-100">{selectedBooking.phone}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-400 flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Email
                  </p>
                  <p className="font-medium text-gray-100">{selectedBooking.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-400 flex items-center gap-1">
                    <Car className="h-3 w-3" /> Vehicle
                  </p>
                  <p className="font-medium text-gray-100">
                    {selectedBooking.vehicle}
                    {selectedBooking.vehicle_year ? ` (${selectedBooking.vehicle_year})` : ""}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-400 flex items-center gap-1">
                    <Hash className="h-3 w-3" /> Registration
                  </p>
                  <p className="font-medium text-gray-100 font-mono uppercase">
                    {selectedBooking.vehicle_reg || "Not provided"}
                  </p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-sm text-gray-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Customer&apos;s Preferred Time
                  </p>
                  <p className="font-medium text-gray-100">
                    {selectedBooking.preferred_date
                      ? format(new Date(selectedBooking.preferred_date), "dd/MM/yyyy")
                      : "Not specified"}
                    {selectedBooking.preferred_time && ` at ${formatTime(selectedBooking.preferred_time)}`}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-400">Issue Description</p>
                <p className="bg-gray-700 border border-gray-600 p-3 rounded-md text-gray-200">{selectedBooking.issue}</p>
              </div>

              {/* Schedule Appointment Section */}
              <div className="border border-gray-600 rounded-lg p-4 space-y-3 bg-gray-750">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-400" />
                  <h3 className="text-sm font-semibold text-gray-200">Schedule Appointment</h3>
                </div>

                {selectedBooking.confirmed_date && selectedBooking.confirmed_time && (
                  <div className="text-sm text-blue-300 bg-blue-900/30 border border-blue-800 rounded px-3 py-2">
                    Currently scheduled: {format(parseISO(selectedBooking.confirmed_date), "dd/MM/yyyy")} at {formatTime(selectedBooking.confirmed_time)}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Date</label>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={e => setScheduleDate(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Time Slot</label>
                    <select
                      value={scheduleTime}
                      onChange={e => setScheduleTime(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select time...</option>
                      {TIME_SLOTS.map(slot => (
                        <option key={slot} value={slot}>{formatTime(slot)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <Button
                  onClick={handleSchedule}
                  disabled={scheduling || !scheduleDate || !scheduleTime}
                  className="w-full bg-blue-700 hover:bg-blue-600 text-white"
                >
                  {scheduling ? "Saving..." : "Confirm & Schedule"}
                </Button>
              </div>

              {/* Create Customer */}
              <div className="border border-gray-600 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-green-400" />
                  <h3 className="text-sm font-semibold text-gray-200">Customer Record</h3>
                </div>
                {customerResult ? (
                  <div className="flex items-center gap-2 text-sm text-green-300 bg-green-900/30 border border-green-800 rounded px-3 py-2">
                    <UserCheck className="h-4 w-4 flex-shrink-0" />
                    <span>
                      {customerResult.existing ? "Linked to existing customer — " : "Customer created — "}
                      <a
                        href={`/admin/customers/${customerResult.customerId}`}
                        className="underline hover:text-green-200"
                      >
                        View profile
                      </a>
                    </span>
                  </div>
                ) : (
                  <Button
                    onClick={handleCreateCustomer}
                    disabled={creatingCustomer}
                    className="w-full bg-green-700 hover:bg-green-600 text-white"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {creatingCustomer ? "Creating..." : "Create Customer from Booking"}
                  </Button>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Status:</span>
                  <Badge className={statusColors[selectedBooking.status] || statusColors.pending}>
                    {selectedBooking.status}
                  </Badge>
                </div>
                <Select
                  value={selectedBooking.status}
                  onValueChange={(value) => handleStatusChange(selectedBooking.id, value)}
                >
                  <SelectTrigger className="w-40 bg-gray-700 border-gray-600 text-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
