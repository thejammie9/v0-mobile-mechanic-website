"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

type BookingData = {
  id: string
  name: string
  email: string
  date: string
  timeSlot: string
  vehicle: string
  status: string
}

export default function CancelBookingPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [booking, setBooking] = useState<BookingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const id = searchParams.get("id")
  const token = searchParams.get("token")

  useEffect(() => {
    async function fetchBooking() {
      if (!id || !token) {
        setError("Invalid cancellation link. Missing booking ID or token.")
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/bookings/${id}?token=${token}`)
        const data = await response.json()

        if (data.success) {
          setBooking(data.booking)
        } else {
          setError(data.message || "Invalid cancellation link.")
        }
      } catch (error) {
        setError("An error occurred while fetching booking details.")
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [id, token])

  const handleCancel = async () => {
    if (!id || !token) return

    setCancelling(true)
    setError(null)

    try {
      const response = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, token }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
      } else {
        setError(data.message || "Failed to cancel booking.")
      }
    } catch (error) {
      setError("An error occurred while cancelling the booking.")
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Cancel Booking</CardTitle>
          <CardDescription>
            {loading
              ? "Loading booking details..."
              : success
                ? "Your booking has been cancelled."
                : "Review and confirm cancellation of your booking."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : success ? (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <AlertTitle className="text-green-800">Booking Cancelled</AlertTitle>
              <AlertDescription className="text-green-700">
                Your booking has been successfully cancelled. A confirmation email has been sent to your registered
                email address.
              </AlertDescription>
            </Alert>
          ) : booking ? (
            <div className="space-y-4">
              <p>
                Are you sure you want to cancel your booking for <strong>{booking.vehicle}</strong> on{" "}
                <strong>{booking.date}</strong> at <strong>{booking.timeSlot}</strong>?
              </p>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Please Note</AlertTitle>
                <AlertDescription>
                  This action cannot be undone. If you wish to book again, you will need to create a new booking.
                </AlertDescription>
              </Alert>
            </div>
          ) : null}
        </CardContent>
        {!loading && !error && !success && booking && (
          <CardFooter className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => router.push("/")}>
              Keep Booking
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={cancelling}>
              {cancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Booking"
              )}
            </Button>
          </CardFooter>
        )}
        {(success || error) && (
          <CardFooter>
            <Button onClick={() => router.push("/")} className="w-full">
              Return to Homepage
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
