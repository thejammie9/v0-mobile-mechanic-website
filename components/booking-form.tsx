"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { submitBooking } from "@/app/actions/booking-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, CheckCircle, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

// Define booking schema for validation
const bookingSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  phone: z.string().min(5, { message: "Please enter a valid phone number" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  vehicle: z.string().min(2, { message: "Please enter your vehicle details" }),
  vehicleReg: z.string().optional(),
  issue: z.string().min(10, { message: "Please describe the issue in more detail" }),
  date: z.string().min(1, { message: "Please select a date" }),
  timeSlot: z.string().min(1, { message: "Please select a time slot" }),
  address: z.string().optional(),
  postcode: z.string().optional(),
  serviceType: z.string().optional(),
})

export default function BookingForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    vehicle: "",
    vehicleReg: "",
    issue: "",
    date: "",
    timeSlot: "",
    address: "",
    postcode: "",
    serviceType: "",
  })
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

  // Available time slots
  const timeSlots = ["09:00 - 12:30", "13:30 - 17:30", "Weekend (10:30 - 13:30)"]

  // Service types
  const serviceTypes = [
    "Oil Change",
    "Brake Repair",
    "Battery Replacement",
    "Engine Diagnostic",
    "Tire Replacement",
    "General Service",
    "Other",
  ]

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date) {
      setFormData((prev) => ({ ...prev, date: format(date, "yyyy-MM-dd") }))

      // Clear error for date field if it exists
      if (errors.date) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors.date
          return newErrors
        })
      }
    }
  }

  // Handle time slot selection
  const handleTimeSlotSelect = (value: string) => {
    setFormData((prev) => ({ ...prev, timeSlot: value }))

    // Clear error for timeSlot field if it exists
    if (errors.timeSlot) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.timeSlot
        return newErrors
      })
    }
  }

  // Handle service type selection
  const handleServiceTypeSelect = (value: string) => {
    setFormData((prev) => ({ ...prev, serviceType: value }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    try {
      // Validate form data
      const validatedData = bookingSchema.parse(formData)

      // Create FormData object for server action
      const formDataObj = new FormData()
      Object.entries(validatedData).forEach(([key, value]) => {
        if (value) formDataObj.append(key, value)
      })

      // Log the data being sent
      console.log("Booking data:", validatedData)

      // Submit booking
      const result = await submitBooking(formDataObj)

      if (result.success) {
        setIsSuccess(true)
        // Redirect to success page with booking reference
        setTimeout(() => {
          router.push(
            `/bookings?reference=${result.bookingId || "REF-" + Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          )
        }, 2000)
      } else {
        // Handle validation errors from server
        if (result.errors) {
          const fieldErrors: Record<string, string> = {}
          result.errors.forEach((error: any) => {
            if (error.path && error.path[0]) {
              fieldErrors[error.path[0]] = error.message
            }
          })
          setErrors(fieldErrors)
        } else {
          // General error
          setErrors({ form: result.message || "Failed to submit booking. Please try again." })
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle client-side validation errors
        const fieldErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path && err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message
          }
        })
        setErrors(fieldErrors)
      } else {
        // Handle other errors
        setErrors({ form: "An unexpected error occurred. Please try again." })
        console.error("Booking form error:", error)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Disable dates in the past
  const disabledDates = {
    before: new Date(),
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Book a Mobile Mechanic</CardTitle>
        <CardDescription>Fill out the form below to schedule a service</CardDescription>
      </CardHeader>
      <CardContent>
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold text-center">Booking Successful!</h3>
            <p className="text-center text-gray-500 mt-2">
              Your booking has been submitted successfully. Redirecting to confirmation page...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.form && <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">{errors.form}</div>}

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Smith"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="07123456789"
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle">Vehicle Details</Label>
              <Input
                id="vehicle"
                name="vehicle"
                value={formData.vehicle}
                onChange={handleChange}
                placeholder="Make, Model, Year (e.g. Ford Focus 2018)"
                className={errors.vehicle ? "border-red-500" : ""}
              />
              {errors.vehicle && <p className="text-red-500 text-sm">{errors.vehicle}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleReg">Vehicle Registration (Optional)</Label>
              <Input
                id="vehicleReg"
                name="vehicleReg"
                value={formData.vehicleReg}
                onChange={handleChange}
                placeholder="AB12 XYZ"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceType">Service Type (Optional)</Label>
              <Select value={formData.serviceType} onValueChange={handleServiceTypeSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((service) => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="issue">Describe the Issue</Label>
              <Textarea
                id="issue"
                name="issue"
                value={formData.issue}
                onChange={handleChange}
                placeholder="Please describe the problem with your vehicle in detail"
                className={cn("min-h-[100px]", errors.issue ? "border-red-500" : "")}
              />
              {errors.issue && <p className="text-red-500 text-sm">{errors.issue}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Preferred Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-gray-400",
                        errors.date && "border-red-500",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Select a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      disabled={disabledDates}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeSlot">Preferred Time</Label>
                <Select value={formData.timeSlot} onValueChange={handleTimeSlotSelect}>
                  <SelectTrigger className={errors.timeSlot ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.timeSlot && <p className="text-red-500 text-sm">{errors.timeSlot}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address (Optional)</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 Main Street"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postcode">Postcode (Optional)</Label>
                <Input
                  id="postcode"
                  name="postcode"
                  value={formData.postcode}
                  onChange={handleChange}
                  placeholder="AB12 3CD"
                />
              </div>
            </div>
          </form>
        )}
      </CardContent>
      {!isSuccess && (
        <CardFooter>
          <Button className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Book Now"
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
