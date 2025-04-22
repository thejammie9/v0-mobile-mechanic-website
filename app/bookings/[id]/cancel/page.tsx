"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, Loader2, Calendar, Clock, Car } from "lucide-react"
import { getBookingByIdAndToken, cancelBooking } from "@/app/actions/booking-actions"
import Link from "next/link"

export default function CancelBookingPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { token: string }
}) {
  const router = useRouter()
  const { id } = params
  const token = searchParams.token || ""

  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [cancelling, setCancelling] = useState(false)
  const [cancelled, setCancelled] = useState(false)

  useEffect(() => {
    async function fetchBooking() {
      try {
        const data = await getBookingByIdAndToken(id, token)
        if (data) {
          setBooking(data)
        } else {
          setError("Invalid booking or cancellation link")
        }
      } catch (err) {
        setError("Failed to load booking information")
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [id, token])

  const handleCancel = async () => {
    setCancelling(true)
    try {
      const result = await cancelBooking(id, token)
      if (result.success) {
        setCancelled(true)
      } else {
        setError(result.message || "Failed to cancel booking")
      }
    } catch (err) {
      setError("An error occurred while cancelling your booking")
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-900 mb-4" />
        <h1 className="text-xl font-medium">Loading booking information...</h1>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button asChild className="mt-4">
          <Link href="/">Return to Homepage</Link>
        </Button>
      </div>
    )
  }

  if (cancelled) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center text-green-700">Booking Cancelled</CardTitle>
            <CardDescription className="text-center">Your booking has been successfully cancelled</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link href="/">Return to Homepage</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (booking?.status === "cancelled") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center">Booking Already Cancelled</CardTitle>
            <CardDescription className="text-center">This booking has already been cancelled</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link href="/">Return to Homepage</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Cancel Your Booking</CardTitle>
          <CardDescription>Please review your booking details before cancelling</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Date: {booking?.date}</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-2" />
              <span>Time: {booking?.timeSlot}</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Car className="h-4 w-4 mr-2" />
              <span>Vehicle: {booking?.vehicle}</span>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Are you sure?</AlertTitle>
            <AlertDescription>
              Once cancelled, your booking will be removed from our schedule and you'll need to make a new booking if
              you change your mind.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/">Keep Booking</Link>
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
      </Card>
    </div>
  )
}
