"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Calendar, CheckCircle, Clock, Filter, Search, XCircle, AlertCircle, BarChart3, Car, Users } from "lucide-react"
import { AdminWarningBanner } from "@/components/admin-warning-banner"

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [completionDetails, setCompletionDetails] = useState({
    servicePerformed: "",
    cost: "",
    notes: "",
  })

  // Dashboard statistics
  const [dashboardStats, setDashboardStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    revenueThisMonth: "£0",
    averageJobValue: "£0",
    mostCommonService: "None",
  })

  // Fetch bookings from API
  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/bookings")
      const data = await response.json()

      if (data.success) {
        console.log("Fetched bookings:", data.bookings)
        setBookings(data.bookings)

        // Calculate dashboard statistics
        const stats = {
          totalBookings: data.bookings.length,
          pendingBookings: data.bookings.filter((b) => b.status === "pending").length,
          confirmedBookings: data.bookings.filter((b) => b.status === "confirmed").length,
          completedBookings: data.bookings.filter((b) => b.status === "completed").length,
          cancelledBookings: data.bookings.filter((b) => b.status === "cancelled").length,
          revenueThisMonth: "£0",
          averageJobValue: "£0",
          mostCommonService: "None",
        }

        // Calculate revenue if there are completed bookings with cost
        const completedWithCost = data.bookings.filter((b) => b.status === "completed" && b.cost)
        if (completedWithCost.length > 0) {
          const totalRevenue = completedWithCost.reduce((sum, booking) => {
            const cost = Number.parseFloat(booking.cost.replace(/[^0-9.]/g, "")) || 0
            return sum + cost
          }, 0)

          stats.revenueThisMonth = `£${totalRevenue.toFixed(2)}`
          stats.averageJobValue = `£${(totalRevenue / completedWithCost.length).toFixed(2)}`
        }

        // Find most common service
        const serviceTypes = data.bookings.filter((b) => b.serviceType).map((b) => b.serviceType)

        if (serviceTypes.length > 0) {
          const serviceCounts = serviceTypes.reduce((acc, service) => {
            acc[service] = (acc[service] || 0) + 1
            return acc
          }, {})

          stats.mostCommonService = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0][0]
        }

        setDashboardStats(stats)
      } else {
        console.error("Failed to fetch bookings:", data.message)
        setBookings([])
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)
      setBookings([])
    } finally {
      setIsLoading(false)
    }
  }

  // Filter bookings based on active tab, search term, and filters
  const filteredBookings = bookings.filter((booking) => {
    // Filter by tab
    if (activeTab !== "all" && booking.status !== activeTab) {
      return false
    }

    // Filter by search term
    if (
      searchTerm &&
      !booking.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !booking.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !booking.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false
    }

    // Filter by status
    if (statusFilter && booking.status !== statusFilter) {
      return false
    }

    // Filter by date
    if (dateFilter && booking.date !== dateFilter) {
      return false
    }

    return true
  })

  // Handle status change
  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (data.success) {
        // Update local state
        setBookings(bookings.map((booking) => (booking.id === bookingId ? { ...booking, status: newStatus } : booking)))

        // Refresh dashboard stats
        fetchBookings()
      } else {
        console.error("Failed to update booking status:", data.message)
        alert("Failed to update booking status. Please try again.")
      }
    } catch (error) {
      console.error("Error updating booking status:", error)
      alert("An error occurred while updating the booking status.")
    }
  }

  // Handle marking a booking as complete
  const handleCompleteBooking = (booking) => {
    setSelectedBooking(booking)
    setCompletionDetails({
      servicePerformed: booking.serviceType || "",
      cost: "",
      notes: booking.notes || "",
    })
    setIsCompleteModalOpen(true)
  }

  // Submit completion details
  const submitCompletionDetails = async () => {
    if (selectedBooking) {
      try {
        const response = await fetch(`/api/bookings/${selectedBooking.id}/complete`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            servicePerformed: completionDetails.servicePerformed,
            cost: completionDetails.cost,
            notes: completionDetails.notes,
          }),
        })

        const data = await response.json()

        if (data.success) {
          // Update local state
          const updatedBookings = bookings.map((booking) =>
            booking.id === selectedBooking.id
              ? {
                  ...booking,
                  status: "completed",
                  completedAt: new Date().toISOString(),
                  servicePerformed: completionDetails.servicePerformed,
                  cost: completionDetails.cost,
                  notes: completionDetails.notes,
                }
              : booking,
          )

          setBookings(updatedBookings)
          setIsCompleteModalOpen(false)
          setCompletionDetails({ servicePerformed: "", cost: "", notes: "" })

          // Refresh dashboard stats
          fetchBookings()
        } else {
          console.error("Failed to complete booking:", data.message)
          alert("Failed to complete booking. Please try again.")
        }
      } catch (error) {
        console.error("Error completing booking:", error)
        alert("An error occurred while completing the booking.")
      }
    }
  }

  // View booking details
  const viewBookingDetails = (booking) => {
    setSelectedBooking(booking)
    setIsViewModalOpen(true)
  }

  // Get status badge
  const getStatusBadge = (status) => {
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

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  // Format time
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      <AdminWarningBanner />

      {/* Dashboard Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Overview</CardTitle>
          <CardDescription>Summary of your booking activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Calendar className="h-6 w-6 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Bookings</p>
                  <h3 className="text-2xl font-bold">{dashboardStats.totalBookings}</h3>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center space-x-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Completed Jobs</p>
                  <h3 className="text-2xl font-bold">{dashboardStats.completedBookings}</h3>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center space-x-4">
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-yellow-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pending/Confirmed</p>
                  <h3 className="text-2xl font-bold">
                    {dashboardStats.pendingBookings + dashboardStats.confirmedBookings}
                  </h3>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center space-x-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <BarChart3 className="h-6 w-6 text-purple-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Revenue (Month)</p>
                  <h3 className="text-2xl font-bold">{dashboardStats.revenueThisMonth}</h3>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Car className="h-5 w-5 text-gray-500" />
                    <p className="text-sm text-gray-500">Average Job Value</p>
                  </div>
                  <p className="font-semibold">{dashboardStats.averageJobValue}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-gray-500" />
                    <p className="text-sm text-gray-500">Most Common Service</p>
                  </div>
                  <p className="font-semibold">{dashboardStats.mostCommonService}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-gray-500" />
                    <p className="text-sm text-gray-500">Cancellation Rate</p>
                  </div>
                  <p className="font-semibold">
                    {dashboardStats.totalBookings > 0
                      ? Math.round((dashboardStats.cancelledBookings / dashboardStats.totalBookings) * 100)
                      : 0}
                    %
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Management */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Management</CardTitle>
          <CardDescription>View and manage all your booking requests</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or vehicle"
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <span>{statusFilter || "Status"}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="date"
                className="w-[150px]"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("")
                  setDateFilter("")
                }}
              >
                Clear
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <BookingsList
                  bookings={filteredBookings}
                  onStatusChange={handleStatusChange}
                  onViewDetails={viewBookingDetails}
                  onCompleteBooking={handleCompleteBooking}
                  getStatusBadge={getStatusBadge}
                  formatDate={formatDate}
                />
              )}
            </TabsContent>

            <TabsContent value="pending" className="mt-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <BookingsList
                  bookings={filteredBookings}
                  onStatusChange={handleStatusChange}
                  onViewDetails={viewBookingDetails}
                  onCompleteBooking={handleCompleteBooking}
                  getStatusBadge={getStatusBadge}
                  formatDate={formatDate}
                />
              )}
            </TabsContent>

            <TabsContent value="confirmed" className="mt-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <BookingsList
                  bookings={filteredBookings}
                  onStatusChange={handleStatusChange}
                  onViewDetails={viewBookingDetails}
                  onCompleteBooking={handleCompleteBooking}
                  getStatusBadge={getStatusBadge}
                  formatDate={formatDate}
                />
              )}
            </TabsContent>

            <TabsContent value="completed" className="mt-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <CompletedBookingsList
                  bookings={filteredBookings}
                  onViewDetails={viewBookingDetails}
                  getStatusBadge={getStatusBadge}
                  formatDate={formatDate}
                />
              )}
            </TabsContent>

            <TabsContent value="cancelled" className="mt-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <BookingsList
                  bookings={filteredBookings}
                  onStatusChange={handleStatusChange}
                  onViewDetails={viewBookingDetails}
                  onCompleteBooking={handleCompleteBooking}
                  getStatusBadge={getStatusBadge}
                  formatDate={formatDate}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* View Booking Modal */}
      {isViewModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Booking Details</h2>
                <button onClick={() => setIsViewModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="font-semibold text-gray-700">Customer Information</h3>
                  <p className="mt-2">
                    <span className="font-medium">Name:</span> {selectedBooking.name}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {selectedBooking.email}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span> {selectedBooking.phone}
                  </p>
                  {selectedBooking.address && (
                    <p>
                      <span className="font-medium">Address:</span> {selectedBooking.address}
                      {selectedBooking.postcode && `, ${selectedBooking.postcode}`}
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700">Booking Information</h3>
                  <p className="mt-2">
                    <span className="font-medium">ID:</span> {selectedBooking.id}
                  </p>
                  <p>
                    <span className="font-medium">Date:</span> {formatDate(selectedBooking.date)}
                  </p>
                  <p>
                    <span className="font-medium">Time Slot:</span> {selectedBooking.timeSlot}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span> {getStatusBadge(selectedBooking.status)}
                  </p>
                  <p>
                    <span className="font-medium">Created:</span> {formatDate(selectedBooking.createdAt)} at{" "}
                    {formatTime(selectedBooking.createdAt)}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold text-gray-700">Vehicle & Issue</h3>
                <p className="mt-2">
                  <span className="font-medium">Vehicle:</span> {selectedBooking.vehicle}
                </p>
                {selectedBooking.vehicle_reg && (
                  <p>
                    <span className="font-medium">Registration:</span> {selectedBooking.vehicle_reg}
                  </p>
                )}
                <p>
                  <span className="font-medium">Issue:</span> {selectedBooking.issue}
                </p>
                {selectedBooking.serviceType && (
                  <p>
                    <span className="font-medium">Service Type:</span> {selectedBooking.serviceType}
                  </p>
                )}
              </div>

              {selectedBooking.status === "completed" && (
                <div className="mb-4 bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-700">Completion Details</h3>
                  <p className="mt-2">
                    <span className="font-medium">Completed On:</span> {formatDate(selectedBooking.completedAt)} at{" "}
                    {formatTime(selectedBooking.completedAt)}
                  </p>
                  <p>
                    <span className="font-medium">Service Performed:</span> {selectedBooking.servicePerformed}
                  </p>
                  <p>
                    <span className="font-medium">Cost:</span> {selectedBooking.cost}
                  </p>
                </div>
              )}

              <div className="mb-4">
                <h3 className="font-semibold text-gray-700">Notes</h3>
                <p className="mt-2">{selectedBooking.notes || "No notes available"}</p>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                  Close
                </Button>

                {selectedBooking.status === "pending" && (
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                      handleStatusChange(selectedBooking.id, "confirmed")
                      setIsViewModalOpen(false)
                    }}
                  >
                    Confirm Booking
                  </Button>
                )}

                {selectedBooking.status === "confirmed" && (
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => {
                      setIsViewModalOpen(false)
                      handleCompleteBooking(selectedBooking)
                    }}
                  >
                    Mark as Completed
                  </Button>
                )}

                {(selectedBooking.status === "pending" || selectedBooking.status === "confirmed") && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleStatusChange(selectedBooking.id, "cancelled")
                      setIsViewModalOpen(false)
                    }}
                  >
                    Cancel Booking
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complete Booking Modal */}
      {isCompleteModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Complete Booking</h2>
                <button onClick={() => setIsCompleteModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Performed</label>
                  <Input
                    value={completionDetails.servicePerformed}
                    onChange={(e) => setCompletionDetails({ ...completionDetails, servicePerformed: e.target.value })}
                    placeholder="e.g. Oil change, brake replacement"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
                  <Input
                    value={completionDetails.cost}
                    onChange={(e) => setCompletionDetails({ ...completionDetails, cost: e.target.value })}
                    placeholder="e.g. £95"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    value={completionDetails.notes}
                    onChange={(e) => setCompletionDetails({ ...completionDetails, notes: e.target.value })}
                    placeholder="Additional notes about the service"
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setIsCompleteModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={submitCompletionDetails}
                  disabled={!completionDetails.servicePerformed || !completionDetails.cost}
                >
                  Complete Booking
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Regular Bookings List Component
function BookingsList({ bookings, onStatusChange, onViewDetails, onCompleteBooking, getStatusBadge, formatDate }) {
  if (bookings.length === 0) {
    return <div className="text-center py-8 text-gray-500">No bookings found</div>
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vehicle
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date & Time
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {bookings.map((booking) => (
            <tr key={booking.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{booking.name}</div>
                <div className="text-xs text-gray-500">{booking.email}</div>
                <div className="text-xs text-gray-500">{booking.phone}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">{booking.vehicle}</div>
                <div className="text-xs text-gray-500 line-clamp-1">{booking.issue}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{formatDate(booking.date)}</div>
                <div className="text-xs text-gray-500">{booking.timeSlot}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(booking.status)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Button variant="ghost" size="sm" onClick={() => onViewDetails(booking)}>
                  View
                </Button>

                {booking.status === "pending" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-800"
                    onClick={() => onStatusChange(booking.id, "confirmed")}
                  >
                    Confirm
                  </Button>
                )}

                {booking.status === "confirmed" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-green-600 hover:text-green-800"
                    onClick={() => onCompleteBooking(booking)}
                  >
                    Complete
                  </Button>
                )}

                {(booking.status === "pending" || booking.status === "confirmed") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-800"
                    onClick={() => onStatusChange(booking.id, "cancelled")}
                  >
                    Cancel
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Completed Bookings List Component
function CompletedBookingsList({ bookings, onViewDetails, getStatusBadge, formatDate }) {
  if (bookings.length === 0) {
    return <div className="text-center py-8 text-gray-500">No completed bookings found</div>
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vehicle
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date Completed
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Service Details
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cost
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {bookings.map((booking) => (
            <tr key={booking.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{booking.name}</div>
                <div className="text-xs text-gray-500">{booking.email}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">{booking.vehicle}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{formatDate(booking.completedAt || booking.date)}</div>
                <div className="text-xs text-gray-500">{booking.timeSlot}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  {booking.servicePerformed || booking.serviceType || "Not specified"}
                </div>
                <div className="text-xs text-gray-500 line-clamp-1">{booking.notes || "No notes"}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{booking.cost || "Not specified"}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Button variant="ghost" size="sm" onClick={() => onViewDetails(booking)}>
                  View
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => window.print()}
                >
                  Print
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
