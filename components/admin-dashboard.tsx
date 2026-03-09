"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { logoutAdmin } from "@/app/admin/actions"
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
import { Wrench, LogOut, Calendar, Phone, Mail, Car, Clock, RefreshCw } from "lucide-react"
import { format } from "date-fns"

type Booking = {
  id: string
  name: string
  phone: string
  email: string
  vehicle: string
  issue: string
  preferred_date: string | null
  preferred_time: string | null
  status: string
  created_at: string
}

type AdminDashboardProps = {
  bookings: Booking[]
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  confirmed: "bg-blue-100 text-blue-800 border-blue-300",
  completed: "bg-green-100 text-green-800 border-green-300",
  cancelled: "bg-red-100 text-red-800 border-red-300",
}

export default function AdminDashboard({ bookings: initialBookings }: AdminDashboardProps) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await logoutAdmin()
    router.push("/admin/login")
    router.refresh()
  }

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", bookingId)

    if (!error) {
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
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false })
    
    if (data) {
      setBookings(data)
    }
    setRefreshing(false)
  }

  const pendingCount = bookings.filter(b => b.status === "pending").length
  const confirmedCount = bookings.filter(b => b.status === "confirmed").length
  const completedCount = bookings.filter(b => b.status === "completed").length

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wrench className="h-8 w-8 text-orange-500" />
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="bg-transparent border-white text-white hover:bg-blue-800"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Bookings</CardDescription>
              <CardTitle className="text-3xl">{bookings.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">{pendingCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Confirmed</CardDescription>
              <CardTitle className="text-3xl text-blue-600">{confirmedCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Completed</CardDescription>
              <CardTitle className="text-3xl text-green-600">{completedCount}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Bookings Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Bookings</CardTitle>
              <CardDescription>Manage your customer booking requests</CardDescription>
            </div>
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
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
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Preferred Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow 
                        key={booking.id} 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => setSelectedBooking(booking)}
                      >
                        <TableCell className="text-sm text-gray-600">
                          {format(new Date(booking.created_at), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{booking.name}</div>
                          <div className="text-sm text-gray-500">{booking.email}</div>
                        </TableCell>
                        <TableCell>{booking.vehicle}</TableCell>
                        <TableCell>
                          {booking.preferred_date 
                            ? format(new Date(booking.preferred_date), "dd/MM/yyyy")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[booking.status] || statusColors.pending}>
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Select
                            value={booking.status}
                            onValueChange={(value) => handleStatusChange(booking.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
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
      </main>

      {/* Booking Detail Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Submitted on {selectedBooking && format(new Date(selectedBooking.created_at), "PPP 'at' p")}
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Phone className="h-3 w-3" /> Phone
                  </p>
                  <p className="font-medium">{selectedBooking.phone}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Email
                  </p>
                  <p className="font-medium">{selectedBooking.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Car className="h-3 w-3" /> Vehicle
                  </p>
                  <p className="font-medium">{selectedBooking.vehicle}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Preferred Time
                  </p>
                  <p className="font-medium">
                    {selectedBooking.preferred_date 
                      ? format(new Date(selectedBooking.preferred_date), "dd/MM/yyyy")
                      : "Not specified"}
                    {selectedBooking.preferred_time && ` - ${selectedBooking.preferred_time}`}
                  </p>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Issue Description</p>
                <p className="bg-gray-50 p-3 rounded-md">{selectedBooking.issue}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Status:</span>
                  <Badge className={statusColors[selectedBooking.status] || statusColors.pending}>
                    {selectedBooking.status}
                  </Badge>
                </div>
                <Select
                  value={selectedBooking.status}
                  onValueChange={(value) => handleStatusChange(selectedBooking.id, value)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
