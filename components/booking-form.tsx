"use client"

import type React from "react"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Clock, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle } from "lucide-react"
import { submitBooking } from "@/app/actions/booking-actions"

export default function BookingForm() {
  const [date, setDate] = useState<Date>()
  const [timeSlot, setTimeSlot] = useState<string>("")
  const [formStatus, setFormStatus] = useState<{
    success?: boolean
    message?: string
  }>({})
  const [isPending, startTransition] = useTransition()

  // Updated time slots as requested
 const timeSlots = ["Morning (09:30 - 12:30)", "Afternoon (13:30 - 17:30)", "Weekend Sat/Sun (10:30 - 13:30)"]

  const disabledDays = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Calculate minimum date (today + 1 day) - changed from 2 days to 1 day
    const minDate = new Date(today)
    minDate.setDate(today.getDate() + 1)

    // Return true for dates that should be disabled (before minDate)
    return date < minDate
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const form = e.currentTarget
    const formData = new FormData(form)

    // Add formatted date to form data
    if (date) {
      formData.set("date", format(date, "PPP"))
    }

    // Add selected time slot to form data
    formData.set("timeSlot", timeSlot)

    startTransition(async () => {
      const result = await submitBooking(formData)
      setFormStatus(result)

      if (result.success) {
        form.reset()
        setDate(undefined)
        setTimeSlot("")

        // Reset form status after 5 seconds
        setTimeout(() => {
          setFormStatus({})
        }, 5000)
      }
    })
  }

  return (
    <section className="py-16 bg-white" id="booking">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-blue-900">Book Your Repair</h2>

        {formStatus.success ? (
          <Alert className="max-w-2xl mx-auto bg-green-50 border-green-200">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <AlertTitle className="text-green-800">Booking Received!</AlertTitle>
            <AlertDescription className="text-green-700">
              Thank you for your booking request. We'll contact you shortly to confirm your appointment. A confirmation
              email has been sent to your email address.
            </AlertDescription>
          </Alert>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="max-w-2xl mx-auto bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200"
          >
            {formStatus.message && !formStatus.success && (
              <Alert className="mb-6 bg-red-50 border-red-200">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <AlertTitle className="text-red-800">Error</AlertTitle>
                <AlertDescription className="text-red-700">{formStatus.message}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" placeholder="John Smith" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" type="tel" placeholder="07463451967" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" placeholder="john@example.com" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicle">Vehicle Make/Model</Label>
                <Input id="vehicle" name="vehicle" placeholder="Ford Focus 2018" required />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="issue">Issue Description</Label>
                <Textarea
                  id="issue"
                  name="issue"
                  placeholder="Please describe the problem with your vehicle..."
                  className="min-h-[100px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Preferred Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Select date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={setDate} disabled={disabledDays} initialFocus />
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground mt-1">
                  Please note: Appointments require at least 1 day advance notice.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Preferred Time</Label>
                <Select onValueChange={setTimeSlot} value={timeSlot}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select time slot">
                      {timeSlot ? (
                        <span>{timeSlot}</span>
                      ) : (
                        <span className="flex items-center text-muted-foreground">
                          <Clock className="mr-2 h-4 w-4" />
                          Select time slot
                        </span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              disabled={isPending || !date || !timeSlot}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
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
