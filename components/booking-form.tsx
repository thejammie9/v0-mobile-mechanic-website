"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Clock, AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2 } from "lucide-react"
import { createBooking } from "@/app/actions/bookings"

type SlotAvailability = {
  time: string
  available: boolean
  count: number
}

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

type AvailConfig = {
  available_days: number[]   // 0=Sun … 6=Sat
  closed_dates: string[]     // "YYYY-MM-DD"
  advance_days: number
}

export default function BookingForm() {
  const [date, setDate] = useState<Date>()
  const [timeSlot, setTimeSlot] = useState<string>("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [slotAvailability, setSlotAvailability] = useState<SlotAvailability[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [bookingType, setBookingType] = useState<"book" | "callback" | "quote">("book")
  const confirmationRef = useRef<HTMLDivElement>(null)
  const [availConfig, setAvailConfig] = useState<AvailConfig>({ available_days: [1,2,3,4,5], closed_dates: [], advance_days: 1 })
  const formLoadTime = useRef(Date.now())
  const [vehicleReg, setVehicleReg] = useState("")
  const [vehicleMake, setVehicleMake] = useState("")
  const [vehicleYear, setVehicleYear] = useState("")

  // Load availability config once on mount so calendar can disable off-days
  useEffect(() => {
    fetch("/api/availability-config")
      .then(r => r.json())
      .then(d => setAvailConfig({ available_days: d.available_days, closed_dates: d.closed_dates, advance_days: d.advance_days }))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!date) {
      setSlotAvailability([])
      setTimeSlot("")
      return
    }

    const dateStr = format(date, "yyyy-MM-dd")
    setSlotsLoading(true)
    setTimeSlot("")

    fetch(`/api/slot-availability?date=${dateStr}`)
      .then(res => res.json())
      .then(data => {
        if (data.availability) {
          setSlotAvailability(data.availability)
        }
      })
      .catch(() => {
        // On error, show all slots as available
        const slots = ["09:00","11:00","13:00","15:00"]
        setSlotAvailability(slots.map(time => ({ time, available: true, count: 0 })))
      })
      .finally(() => setSlotsLoading(false))
  }, [date])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    const addressLine = (formData.get("address_line") as string || "").trim()
    const postcode    = (formData.get("postcode") as string || "").trim()
    const address     = [addressLine, postcode].filter(Boolean).join(", ") || null

    const result = await createBooking({
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      vehicle: formData.get("vehicle") as string,
      vehicleReg: (formData.get("vehicle_reg") as string) || null,
      vehicleYear: (formData.get("vehicle_year") as string) || null,
      issue: formData.get("issue") as string,
      preferredDate: bookingType === "book" ? (date ? format(date, "yyyy-MM-dd") : null) : null,
      preferredTime: bookingType === "book" ? (timeSlot || null) : null,
      address,
      requestCallback: bookingType === "callback",
      requestQuote: bookingType === "quote",
      _hp: formData.get("_hp") as string,
      _t: formLoadTime.current,
    })

    setLoading(false)

    if (!result.success) {
      setError(result.error || "Something went wrong. Please try again.")
      return
    }

    setSubmitted(true)
    setTimeout(() => confirmationRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50)
    // Reset form after 5 seconds
    setTimeout(() => {
      setSubmitted(false)
      setDate(undefined)
      setTimeSlot("")
    }, 5000)
  }

  return (
    <section className="py-16 bg-gray-900" id="booking">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-blue-300">Book Your Repair</h2>

        {submitted ? (
          <Alert ref={confirmationRef} className="max-w-2xl mx-auto bg-green-900/30 border-green-700">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            <AlertTitle className="text-green-300">
              {bookingType === "callback" ? "Callback Request Received!" : bookingType === "quote" ? "Quote Request Received!" : "Booking Received!"}
            </AlertTitle>
            <AlertDescription className="text-green-400">
              {bookingType === "callback"
                ? "Thanks — Jamie will give you a call to go over the job and arrange a suitable time."
                : bookingType === "quote"
                  ? "Thanks — Jamie will get back to you with pricing for your vehicle as soon as possible."
                  : "Thank you for your booking request. We'll contact you shortly to confirm your appointment."}
            </AlertDescription>
          </Alert>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="max-w-2xl mx-auto bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-700"
          >
            {error && (
              <Alert className="mb-6 bg-red-900/30 border-red-700">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <AlertTitle className="text-red-300">Error</AlertTitle>
                <AlertDescription className="text-red-400">{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" placeholder="John Smith" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" type="tel" placeholder="07123 456789" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" placeholder="john@example.com" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicle_reg">Registration Plate</Label>
                <Input
                  id="vehicle_reg"
                  name="vehicle_reg"
                  placeholder="AB12 CDE"
                  value={vehicleReg}
                  onChange={(e) => setVehicleReg(e.target.value.toUpperCase())}
                  className="font-mono tracking-widest uppercase"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicle">Vehicle Make/Model</Label>
                <Input
                  id="vehicle"
                  name="vehicle"
                  placeholder="Ford Focus"
                  required
                  value={vehicleMake}
                  onChange={(e) => setVehicleMake(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicle_year">Vehicle Year</Label>
                <Input
                  id="vehicle_year"
                  name="vehicle_year"
                  placeholder="2018"
                  maxLength={4}
                  value={vehicleYear}
                  onChange={(e) => setVehicleYear(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address_line">Address <span className="text-gray-400 font-normal text-xs">(optional)</span></Label>
                <Input id="address_line" name="address_line" placeholder="12 Main Street, Edinburgh" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postcode">Postcode <span className="text-gray-400 font-normal text-xs">(optional)</span></Label>
                <Input id="postcode" name="postcode" placeholder="EH1 1AA" />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="issue">
                  {bookingType === "quote"
                    ? "What would you like priced up?"
                    : bookingType === "callback"
                    ? "What's it regarding?"
                    : "How can we help?"}
                </Label>
                <Textarea
                  id="issue"
                  name="issue"
                  placeholder={
                    bookingType === "quote"
                      ? "e.g. Full service, front and rear brake pads, new battery — just looking for a rough idea of cost before I commit."
                      : bookingType === "callback"
                      ? "e.g. Not sure what's wrong with the car but there's a knocking noise — would like to talk through what it could be before booking anything in."
                      : "e.g. Oil and filter service overdue. Also getting a warning light on the dash and a slight judder when braking — would like both looked at."
                  }
                  className="min-h-[110px]"
                  required
                />
              </div>

              {/* Booking type selector */}
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-300 mb-3">How would you like to proceed?</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Book appointment */}
                  <label className={`flex items-start gap-3 cursor-pointer rounded-lg px-4 py-3 border transition-colors ${bookingType === "book" ? "bg-blue-900/30 border-blue-600" : "bg-gray-700/30 border-gray-600 hover:border-gray-500"}`}>
                    <input type="radio" name="booking_type" value="book" checked={bookingType === "book"}
                      onChange={() => setBookingType("book")}
                      className="mt-0.5 h-4 w-4 flex-shrink-0 border-gray-500 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800 cursor-pointer" />
                    <span className="text-sm leading-relaxed">
                      <span className={`font-semibold block ${bookingType === "book" ? "text-blue-300" : "text-gray-200"}`}>Book an Appointment</span>
                      <span className="text-gray-400 text-xs mt-0.5 block">Pick a date and time slot online.</span>
                    </span>
                  </label>
                  {/* Request a quote */}
                  <label className={`flex items-start gap-3 cursor-pointer rounded-lg px-4 py-3 border transition-colors ${bookingType === "quote" ? "bg-green-900/30 border-green-600" : "bg-gray-700/30 border-gray-600 hover:border-gray-500"}`}>
                    <input type="radio" name="booking_type" value="quote" checked={bookingType === "quote"}
                      onChange={() => { setBookingType("quote"); setDate(undefined); setTimeSlot("") }}
                      className="mt-0.5 h-4 w-4 flex-shrink-0 border-gray-500 bg-gray-700 text-green-600 focus:ring-green-500 focus:ring-offset-gray-800 cursor-pointer" />
                    <span className="text-sm leading-relaxed">
                      <span className={`font-semibold block ${bookingType === "quote" ? "text-green-300" : "text-gray-200"}`}>Request a Price</span>
                      <span className="text-gray-400 text-xs mt-0.5 block">Get a quote before committing to anything.</span>
                    </span>
                  </label>
                  {/* Callback */}
                  <label className={`flex items-start gap-3 cursor-pointer rounded-lg px-4 py-3 border transition-colors ${bookingType === "callback" ? "bg-orange-900/30 border-orange-600" : "bg-gray-700/30 border-gray-600 hover:border-gray-500"}`}>
                    <input type="radio" name="booking_type" value="callback" checked={bookingType === "callback"}
                      onChange={() => { setBookingType("callback"); setDate(undefined); setTimeSlot("") }}
                      className="mt-0.5 h-4 w-4 flex-shrink-0 border-gray-500 bg-gray-700 text-orange-600 focus:ring-orange-500 focus:ring-offset-gray-800 cursor-pointer" />
                    <span className="text-sm leading-relaxed">
                      <span className={`font-semibold block ${bookingType === "callback" ? "text-orange-300" : "text-gray-200"}`}>Request a Callback</span>
                      <span className="text-gray-400 text-xs mt-0.5 block">I'll call you to discuss and arrange a time.</span>
                    </span>
                  </label>
                </div>
              </div>

              {bookingType === "book" && (
                <>
                  <div className="space-y-2">
                    <Label>Preferred Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : <span>Select date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                          disabled={(d) => {
                            // Enforce minimum advance booking days
                            const cutoff = new Date()
                            cutoff.setHours(0, 0, 0, 0)
                            cutoff.setDate(cutoff.getDate() + availConfig.advance_days - 1)
                            if (d <= cutoff) return true
                            // Disable days of the week we don't work
                            if (!availConfig.available_days.includes(d.getDay())) return true
                            // Disable specific closed dates
                            const iso = format(d, "yyyy-MM-dd")
                            if (availConfig.closed_dates.includes(iso)) return true
                            return false
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Preferred Time
                    </Label>
                    {!date ? (
                      <p className="text-sm text-gray-500 italic pt-2">Select a date first to see available slots</p>
                    ) : slotsLoading ? (
                      <div className="flex items-center gap-2 text-sm text-gray-400 pt-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading availability...
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {slotAvailability.map((slot) => (
                          <button
                            key={slot.time}
                            type="button"
                            disabled={!slot.available}
                            onClick={() => setTimeSlot(slot.available ? slot.time : timeSlot)}
                            className={cn(
                              "px-3 py-2 rounded-md text-sm font-medium border transition-colors text-left",
                              slot.available
                                ? timeSlot === slot.time
                                  ? "bg-orange-600 border-orange-500 text-white"
                                  : "bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600 hover:border-gray-500 cursor-pointer"
                                : "bg-gray-800 border-gray-700 text-gray-600 cursor-not-allowed opacity-60"
                            )}
                          >
                            {formatTime(slot.time)}
                            {!slot.available && <span className="ml-1 text-xs">(Full)</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="gdpr_consent"
                  required
                  className="mt-1 h-4 w-4 flex-shrink-0 rounded border-gray-500 bg-gray-700 text-orange-600 focus:ring-orange-500 focus:ring-offset-gray-800 cursor-pointer"
                />
                <span className="text-sm text-gray-300 leading-relaxed">
                  I consent to Jamie&apos;s Auto Care storing my personal information (name, contact details, vehicle details) for the purpose of processing my booking and maintaining service records as required by HMRC.{" "}
                  <a href="/privacy" className="text-orange-400 hover:text-orange-300 underline">
                    Privacy Policy
                  </a>
                  <span className="text-red-400 ml-1">*</span>
                </span>
              </label>
            </div>

            {/* Honeypot — hidden from real users, bots fill it in */}
            <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }} aria-hidden="true" tabIndex={-1}>
              <label htmlFor="_hp">Leave this blank</label>
              <input id="_hp" name="_hp" type="text" autoComplete="off" tabIndex={-1} />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : bookingType === "callback" ? (
                "Request a Callback"
              ) : bookingType === "quote" ? (
                "Request a Price"
              ) : (
                "Submit Booking Request"
              )}
            </Button>
          </form>
        )}
      </div>
    </section>
  )
}
