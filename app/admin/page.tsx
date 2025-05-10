import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AdminWarningBanner } from "@/components/admin-warning-banner"
import Link from "next/link"
import { Calendar, Settings, BarChart3, Users, Car, Clock, CheckCircle, XCircle } from "lucide-react"
import { query } from "@/lib/db"

// Function to fetch recent bookings
async function getRecentBookings() {
  try {
    const bookings = await query(`SELECT * FROM bookings ORDER BY created_at DESC LIMIT 3`)
    return bookings || []
  } catch (error) {
    console.error("Error fetching recent bookings:", error)
    return []
  }
}

// Function to fetch booking stats
async function getBookingStats() {
  try {
    const totalCustomers = await query(`SELECT COUNT(DISTINCT email) as count FROM bookings`)

    const jobsThisMonth = await query(
      `SELECT COUNT(*) as count FROM bookings 
       WHERE DATE_FORMAT(STR_TO_DATE(booking_date, '%Y-%m-%d'), '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')`,
    )

    const completedJobs = await query(`SELECT COUNT(*) as count FROM bookings WHERE status = 'completed'`)

    const cancelledJobs = await query(`SELECT COUNT(*) as count FROM bookings WHERE status = 'cancelled'`)

    const totalJobs = await query(`SELECT COUNT(*) as count FROM bookings`)

    // Calculate rates
    const completionRate = totalJobs[0].count > 0 ? Math.round((completedJobs[0].count / totalJobs[0].count) * 100) : 0

    const cancellationRate =
      totalJobs[0].count > 0 ? Math.round((cancelledJobs[0].count / totalJobs[0].count) * 100) : 0

    return {
      totalCustomers: totalCustomers[0].count || 0,
      jobsThisMonth: jobsThisMonth[0].count || 0,
      completionRate: completionRate || 0,
      cancellationRate: cancellationRate || 0,
    }
  } catch (error) {
    console.error("Error fetching booking stats:", error)
    return {
      totalCustomers: 0,
      jobsThisMonth: 0,
      completionRate: 0,
      cancellationRate: 0,
    }
  }
}

// Function to get popular services
async function getPopularServices() {
  try {
    const services = await query(
      `SELECT service_type, COUNT(*) as count 
       FROM bookings 
       WHERE service_type IS NOT NULL AND service_type != ''
       GROUP BY service_type 
       ORDER BY count DESC 
       LIMIT 5`,
    )

    // Calculate percentages
    const totalServices = services.reduce((sum: number, service: any) => sum + service.count, 0)

    return services.map((service: any) => ({
      name: service.service_type,
      percentage: totalServices > 0 ? Math.round((service.count / totalServices) * 100) : 0,
    }))
  } catch (error) {
    console.error("Error fetching popular services:", error)
    return []
  }
}

// Format booking status for display
function formatStatus(status: string) {
  switch (status) {
    case "pending":
      return { text: "Pending", className: "bg-yellow-100 text-yellow-800" }
    case "confirmed":
      return { text: "Confirmed", className: "bg-blue-100 text-blue-800" }
    case "completed":
      return { text: "Completed", className: "bg-green-100 text-green-800" }
    case "cancelled":
      return { text: "Cancelled", className: "bg-red-100 text-red-800" }
    default:
      return { text: status, className: "bg-gray-100 text-gray-800" }
  }
}

// Format date for display
function formatDate(dateString: string) {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`

    return date.toLocaleDateString()
  } catch (e) {
    return dateString
  }
}

export default async function AdminDashboardPage() {
  // Fetch data
  const recentBookings = await getRecentBookings()
  const stats = await getBookingStats()
  const popularServices = await getPopularServices()

  return (
    <div className="space-y-6">
      <AdminWarningBanner />

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex space-x-2">
          <Button asChild>
            <Link href="/admin/bookings">
              <Calendar className="h-4 w-4 mr-2" />
              Manage Bookings
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="bg-blue-100 p-3 rounded-full mb-4">
              <Calendar className="h-8 w-8 text-blue-700" />
            </div>
            <h3 className="text-xl font-bold text-center">Booking Management</h3>
            <p className="text-gray-500 text-center mt-2">View and manage all booking requests</p>
            <Button className="mt-4 w-full" asChild>
              <Link href="/admin/bookings">Go to Bookings</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="bg-green-100 p-3 rounded-full mb-4">
              <CheckCircle className="h-8 w-8 text-green-700" />
            </div>
            <h3 className="text-xl font-bold text-center">Completed Jobs</h3>
            <p className="text-gray-500 text-center mt-2">View all completed service jobs</p>
            <Button className="mt-4 w-full" asChild>
              <Link href="/admin/bookings?tab=completed">View Completed</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="bg-purple-100 p-3 rounded-full mb-4">
              <BarChart3 className="h-8 w-8 text-purple-700" />
            </div>
            <h3 className="text-xl font-bold text-center">Reports & Analytics</h3>
            <p className="text-gray-500 text-center mt-2">View business performance metrics</p>
            <Button className="mt-4 w-full" asChild>
              <Link href="/admin/reports">View Reports</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="bg-gray-100 p-3 rounded-full mb-4">
              <Settings className="h-8 w-8 text-gray-700" />
            </div>
            <h3 className="text-xl font-bold text-center">Settings</h3>
            <p className="text-gray-500 text-center mt-2">Configure your business settings</p>
            <Button className="mt-4 w-full" asChild>
              <Link href="/admin/settings">Go to Settings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>Latest booking requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.length > 0 ? (
                recentBookings.map((booking: any) => (
                  <div key={booking.id} className="flex items-start space-x-4 border-b pb-4">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Clock className="h-5 w-5 text-blue-700" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-medium">{booking.name}</h4>
                        <span className="text-sm text-gray-500">{formatDate(booking.created_at)}</span>
                      </div>
                      <p className="text-sm text-gray-600">{booking.vehicle}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${formatStatus(booking.status).className}`}>
                          {formatStatus(booking.status).text}
                        </span>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/bookings?id=${booking.id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">No recent bookings found</p>
              )}
            </div>

            <div className="mt-4 text-center">
              <Button variant="outline" asChild>
                <Link href="/admin/bookings">View All Bookings</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Business Overview</CardTitle>
            <CardDescription>Key performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-600">Total Customers</span>
                </div>
                <span className="font-bold">{stats.totalCustomers}</span>
              </div>

              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center space-x-2">
                  <Car className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-600">Jobs This Month</span>
                </div>
                <span className="font-bold">{stats.jobsThisMonth}</span>
              </div>

              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-600">Completion Rate</span>
                </div>
                <span className="font-bold">{stats.completionRate}%</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-600">Cancellation Rate</span>
                </div>
                <span className="font-bold">{stats.cancellationRate}%</span>
              </div>
            </div>

            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Most Popular Services</h4>
              <ol className="list-decimal list-inside text-gray-700 space-y-1">
                {popularServices.length > 0 ? (
                  popularServices.map((service: any, index: number) => (
                    <li key={index}>
                      {service.name} ({service.percentage}%)
                    </li>
                  ))
                ) : (
                  <li>No service data available</li>
                )}
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
