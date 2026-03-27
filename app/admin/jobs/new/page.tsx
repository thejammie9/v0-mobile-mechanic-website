"use client"

import { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createAdminBooking, getAvailabilityForDate } from "@/app/actions/bookings"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, AlertTriangle, CheckCircle, Clock, FileText } from "lucide-react"
import { CustomerNameAutocomplete, type CustomerResult } from "@/components/customer-name-autocomplete"
import Link from "next/link"

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

type AvailInfo = {
  slots: string[]
  available_days: number[]
  closed_dates: string[]
  slotCounts: Record<string, number>
  isDayOff: boolean
  isClosed: boolean
}

export default function NewJobPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [vehicle, setVehicle] = useState("")
  const [vehicleReg, setVehicleReg] = useState("")
  const [vehicleYear, setVehicleYear] = useState("")
  const [issue, setIssue] = useState("")
  const [confirmedDate, setConfirmedDate] = useState("")
  const [confirmedTime, setConfirmedTime] = useState("")
  const [address, setAddress] = useState("")

  // Track if a customer was selected so we can show their vehicles
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerResult | null>(null)

  const [avail, setAvail] = useState<AvailInfo | null>(null)
  const [loadingAvail, setLoadingAvail] = useState(false)

  // Quote linking
  type QuoteSummary = { id: number; quote_number: string; vehicle: string | null; labour_items: string; parts_items: string; notes: string | null; created_at: string }
  const [customerQuotes, setCustomerQuotes] = useState<QuoteSummary[]>([])
  const [selectedQuoteId, setSelectedQuoteId] = useState<number | null>(null)

  function handleCustomerSelect(c: CustomerResult) {
    setSelectedCustomer(c)
    setName(c.name)
    setPhone(c.phone || "")
    setEmail(c.email || "")
    setAddress(c.address || "")
    // Fetch their existing quotes
    setCustomerQuotes([])
    setSelectedQuoteId(null)
    if (c.email) {
      fetch(`/api/quotes/by-customer?email=${encodeURIComponent(c.email)}`)
        .then(r => r.json())
        .then(setCustomerQuotes)
        .catch(() => {})
    }
    // Auto-fill vehicle if they only have one
    if (c.vehicles.length === 1) {
      setVehicle(c.vehicles[0].make_model)
      setVehicleReg(c.vehicles[0].reg || "")
      setVehicleYear(c.vehicles[0].year || "")
    } else {
      setVehicle("")
      setVehicleReg("")
      setVehicleYear("")
    }
  }

  function selectVehicle(v: CustomerResult["vehicles"][0]) {
    setVehicle(v.make_model)
    setVehicleReg(v.reg || "")
    setVehicleYear(v.year || "")
  }

  useEffect(() => {
    if (!confirmedDate) { setAvail(null); setConfirmedTime(""); return }
    setLoadingAvail(true)
    setConfirmedTime("")
    getAvailabilityForDate(confirmedDate).then(a => {
      setAvail(a)
      setLoadingAvail(false)
    })
  }, [confirmedDate])

  const handleSubmit = () => {
    setError(null)
    if (!name.trim()) { setError("Name is required"); return }
    if (!phone.trim()) { setError("Phone is required"); return }
    if (!vehicle.trim()) { setError("Vehicle is required"); return }
    if (!issue.trim()) { setError("Job description is required"); return }

    startTransition(async () => {
      const result = await createAdminBooking({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        vehicle: vehicle.trim(),
        vehicle_reg: vehicleReg.trim() || null,
        vehicle_year: vehicleYear.trim() || null,
        issue: issue.trim(),
        confirmed_date: confirmedDate || null,
        confirmed_time: confirmedTime || null,
        address: address.trim() || null,
        quote_id: selectedQuoteId,
      })
      if (!result.success) { setError(result.error || "Failed to create booking"); return }
      router.push("/admin/jobs")
    })
  }

  const availableDayNames = avail
    ? avail.available_days.map(d => DAY_NAMES[d]).join(", ")
    : null

  function formatQuotePreview(q: QuoteSummary): string {
    const labour: { description: string }[] = JSON.parse(q.labour_items || "[]")
    const parts: { description: string }[] = JSON.parse(q.parts_items || "[]")
    const lines: string[] = []
    if (labour.length) lines.push("Labour: " + labour.filter(l => l.description).map(l => l.description).join(", "))
    if (parts.length) lines.push("Parts: " + parts.filter(p => p.description).map(p => p.description).join(", "))
    if (q.notes) lines.push("Notes: " + q.notes)
    return lines.join("\n") || "No line items"
  }

  function applyQuote(q: QuoteSummary) {
    setSelectedQuoteId(q.id)
    setIssue(formatQuotePreview(q))
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Link
          href="/admin/jobs"
          className="inline-flex items-center gap-1 text-gray-400 hover:text-gray-200 mb-6 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Job Sheet
        </Link>

        <h1 className="text-2xl font-bold text-gray-100 mb-6">Book a Job Manually</h1>

        {error && (
          <div className="mb-6 bg-red-900/40 border border-red-700 text-red-300 rounded-md px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Customer Details */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100 text-lg">Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-gray-300">Name <span className="text-red-400">*</span></Label>
                  <CustomerNameAutocomplete
                    value={name}
                    onChange={v => { setName(v); if (!v) setSelectedCustomer(null) }}
                    onCustomerSelect={handleCustomerSelect}
                    placeholder="Start typing a name, phone or email..."
                    className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500">
                    Type to search existing customers, or just fill in the details below for a new one.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Phone <span className="text-red-400">*</span></Label>
                  <Input
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="07700 900000"
                    className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="john@example.com (optional)"
                    className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Address</Label>
                <Textarea
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder={"123 Main Street\nEdinburgh\nEH1 1AA"}
                  rows={3}
                  className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-blue-500 resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Vehicle */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100 text-lg">Vehicle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* If returning customer with multiple vehicles, show picker */}
              {selectedCustomer && selectedCustomer.vehicles.length > 1 && (
                <div className="space-y-2">
                  <Label className="text-gray-300">Select vehicle</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedCustomer.vehicles.map(v => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => selectVehicle(v)}
                        className={`text-left px-3 py-2.5 rounded-md border text-sm transition-colors ${
                          vehicle === v.make_model && vehicleReg === (v.reg || "")
                            ? "bg-orange-500/20 border-orange-500 text-orange-300"
                            : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                        }`}
                      >
                        <span className="font-medium">{v.make_model}</span>
                        {v.reg && <span className="ml-2 font-mono text-orange-400">{v.reg}</span>}
                        {v.year && <span className="ml-2 text-gray-500">({v.year})</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2 sm:col-span-3">
                  <Label className="text-gray-300">Make &amp; Model <span className="text-red-400">*</span></Label>
                  <Input
                    value={vehicle}
                    onChange={e => setVehicle(e.target.value)}
                    placeholder="2019 Ford Focus 1.5 TDCi"
                    className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Reg</Label>
                  <Input
                    value={vehicleReg}
                    onChange={e => setVehicleReg(e.target.value)}
                    placeholder="AB12 CDE"
                    className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-blue-500 font-mono uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Year</Label>
                  <Input
                    value={vehicleYear}
                    onChange={e => setVehicleYear(e.target.value)}
                    placeholder="2019"
                    className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Details */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100 text-lg">Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Description / Work Required <span className="text-red-400">*</span></Label>
                <Textarea
                  value={issue}
                  onChange={e => setIssue(e.target.value)}
                  placeholder="e.g. Oil and filter service, check brakes, customer reports knocking from front right..."
                  rows={4}
                  className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-blue-500 resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Appointment Date</Label>
                <Input
                  type="date"
                  value={confirmedDate}
                  onChange={e => setConfirmedDate(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500"
                />
              </div>

              {confirmedDate && (
                <div>
                  {loadingAvail ? (
                    <p className="text-xs text-gray-500 flex items-center gap-1.5">
                      <Clock className="h-3 w-3 animate-spin" /> Checking availability...
                    </p>
                  ) : avail ? (
                    <div className="space-y-3">
                      {(avail.isDayOff || avail.isClosed) && (
                        <div className="flex items-start gap-2 bg-yellow-900/30 border border-yellow-700/50 rounded-md px-3 py-2.5 text-sm text-yellow-300">
                          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                          <span>
                            {avail.isClosed
                              ? "This date is marked as closed in your availability settings."
                              : `This day (${DAY_NAMES[new Date(confirmedDate + "T00:00:00").getDay()]}) is not a working day — your schedule runs ${availableDayNames}.`}
                            {" "}You can still book it as admin.
                          </span>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label className="text-gray-300">Time Slot</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {avail.slots.map(slot => {
                            const count = avail.slotCounts[slot] || 0
                            const isBusy = count > 0
                            const isSelected = confirmedTime === slot
                            return (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => setConfirmedTime(isSelected ? "" : slot)}
                                className={`flex items-center justify-between px-3 py-2 rounded-md border text-sm transition-colors ${
                                  isSelected
                                    ? "bg-orange-500 border-orange-400 text-white"
                                    : isBusy
                                    ? "bg-yellow-900/20 border-yellow-700/50 text-yellow-300 hover:bg-yellow-900/40"
                                    : "bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600 hover:border-gray-500"
                                }`}
                              >
                                <span className="font-medium">{slot}</span>
                                {isBusy ? (
                                  <span className={`text-xs ml-2 ${isSelected ? "text-orange-200" : "text-yellow-400"}`}>
                                    {count} booked
                                  </span>
                                ) : (
                                  <CheckCircle className={`h-3.5 w-3.5 ml-2 ${isSelected ? "text-orange-200" : "text-green-500"}`} />
                                )}
                              </button>
                            )
                          })}
                          <button
                            type="button"
                            onClick={() => setConfirmedTime("custom")}
                            className={`flex items-center justify-center px-3 py-2 rounded-md border text-sm transition-colors ${
                              confirmedTime === "custom" || (confirmedTime && !avail.slots.includes(confirmedTime))
                                ? "bg-blue-700 border-blue-500 text-white"
                                : "bg-gray-700 border-gray-600 border-dashed text-gray-400 hover:bg-gray-600"
                            }`}
                          >
                            Custom time
                          </button>
                        </div>

                        {(confirmedTime === "custom" || (confirmedTime && !avail.slots.includes(confirmedTime) && confirmedTime !== "")) && (
                          <Input
                            type="time"
                            value={confirmedTime === "custom" ? "" : confirmedTime}
                            onChange={e => setConfirmedTime(e.target.value)}
                            placeholder="e.g. 10:30"
                            className="bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500 max-w-[160px]"
                          />
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              {!confirmedDate && (
                <p className="text-xs text-gray-500">Select a date to see available time slots.</p>
              )}
            </CardContent>
          </Card>

          {/* Quote linker — shown when customer has existing quotes */}
          {customerQuotes.length > 0 && (
            <Card className="bg-gray-800 border-blue-800/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-gray-100 text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-400" />
                  Link to an Existing Quote
                </CardTitle>
                <p className="text-sm text-gray-400">Select a quote to pull the job description in automatically.</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {customerQuotes.map(q => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => selectedQuoteId === q.id ? (setSelectedQuoteId(null), setIssue("")) : applyQuote(q)}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                      selectedQuoteId === q.id
                        ? "bg-blue-900/40 border-blue-500 text-blue-100"
                        : "bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-sm font-semibold">{q.quote_number}</span>
                      <span className="text-xs text-gray-500">{new Date(q.created_at).toLocaleDateString("en-GB")}</span>
                    </div>
                    {q.vehicle && <p className="text-xs text-orange-400 mb-1">{q.vehicle}</p>}
                    <p className="text-xs text-gray-400 whitespace-pre-line line-clamp-2">{formatQuotePreview(q)}</p>
                    {selectedQuoteId === q.id && (
                      <p className="text-xs text-blue-400 mt-1 font-medium">✓ Linked — click to unlink</p>
                    )}
                  </button>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-end pb-8">
            <Link href="/admin/jobs">
              <Button type="button" variant="outline" className="w-full sm:w-auto border-gray-600 text-gray-300 hover:bg-gray-700">
                Cancel
              </Button>
            </Link>
            <Button
              type="button"
              disabled={isPending}
              onClick={handleSubmit}
              className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isPending ? "Saving..." : "Book Job"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
