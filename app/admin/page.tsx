import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AdminWarningBanner } from "@/components/admin-warning-banner"
import Link from "next/link"
import { Calendar, Settings, BarChart3, Users, Car, Clock, CheckCircle, XCircle } from "lucide-react"

export default function AdminDashboardPage() {
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
              <div className="flex items-start space-x-4 border-b pb-4">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Clock className="h-5 w-5 text-blue-700" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-medium">John Smith</h4>
                    <span className="text-sm text-gray-500">Today</span>
                  </div>
                  <p className="text-sm text-gray-600">Ford Focus 2018 - Engine noise</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Pending</span>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/admin/bookings">View</Link>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4 border-b pb-4">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Clock className="h-5 w-5 text-blue-700" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-medium">Sarah Johnson</h4>
                    <span className="text-sm text-gray-500">Yesterday</span>
                  </div>
                  <p className="text-sm text-gray-600">Audi A4 2020 - Brake pads</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Confirmed</span>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/admin/bookings">View</Link>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Clock className="h-5 w-5 text-blue-700" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-medium">Michael Brown</h4>
                    <span className="text-sm text-gray-500">2 days ago</span>
                  </div>
                  <p className="text-sm text-gray-600">Toyota Corolla 2017 - Battery issues</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Completed</span>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/admin/bookings">View</Link>
                    </Button>
                  </div>
                </div>
              </div>
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
                <span className="font-bold">24</span>
              </div>

              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center space-x-2">
                  <Car className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-600">Jobs This Month</span>
                </div>
                <span className="font-bold">18</span>
              </div>

              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-600">Completion Rate</span>
                </div>
                <span className="font-bold">92%</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-600">Cancellation Rate</span>
                </div>
                <span className="font-bold">8%</span>
              </div>
            </div>

            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Most Popular Services</h4>
              <ol className="list-decimal list-inside text-gray-700 space-y-1">
                <li>Oil Change (32%)</li>
                <li>Brake Repair (24%)</li>
                <li>Battery Replacement (18%)</li>
                <li>Tire Services (14%)</li>
                <li>Engine Diagnostics (12%)</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
