"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw } from "lucide-react"

// Define the booking data type
type BookingData = {
  id: string
  name: string
  email: string
  phone: string
  vehicle: string
  issue: string
  date: string
  timeSlot: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  createdAt: string
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingData[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("")

  // Load bookings on component mount
  useEffect(() => {
    loadBookings()
  }, [statusFilter])

  const loadBookings = async () => {
    setLoading(true)
    try {
      // Build query string
      let url = "/api/bookings"
      if (statusFilter) {
        url += `?status=${statusFilter}`
      }

      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setBookings(data.bookings)
      } else {
        console.error("Error loading bookings:", data.message)
      }
    } catch (error) {
      console.error("Error loading bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id: string, status: BookingData["status"]) => {
    setUpdating(id)

    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      const data = await response.json()

      if (data.success) {
        // Update the booking in the state
        setBookings((prev) => prev.map((booking) => (booking.id === id ? { ...booking, status } : booking)))
      } else {
        console.error("Error updating booking status:", data.message)
      }
    } catch (error) {
      console.error("Error updating booking status:", error)
    } finally {
      setUpdating(null)
    }
  }

  const getStatusBadge = (status: BookingData["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pending
          </Badge>
        )
      case "confirmed":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Confirmed
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Completed
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString()
    } catch (e) {
      return dateString
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Booking Requests</h1>
        <div className="flex items-center space-x-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={loadBookings} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="ml-2">Refresh</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>View and manage all booking requests</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No bookings found</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Time Slot</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div className="font-medium">{booking.date}</div>
                        <div className="text-xs text-gray-500">Created: {formatDate(booking.createdAt)}</div>
                      </TableCell>
                      <TableCell>
                        <div>{booking.name}</div>
                        <div className="text-xs text-gray-500">{booking.email}</div>
                        <div className="text-xs text-gray-500">{booking.phone}</div>
                      </TableCell>
                      <TableCell>{booking.vehicle}</TableCell>
                      <TableCell>{booking.timeSlot}</TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell>
                        <Select
                          value={booking.status}
                          onValueChange={(value) => handleStatusChange(booking.id, value as BookingData["status"])}
                          disabled={updating === booking.id}
                        >
                          <SelectTrigger className="w-[130px]">
                            {updating === booking.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            ) : (
                              <span>Set Status</span>
                            )}
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
