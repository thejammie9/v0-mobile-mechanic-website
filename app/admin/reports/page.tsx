import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AdminWarningBanner } from "@/components/admin-warning-banner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, Calendar, Download } from "lucide-react"

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <AdminWarningBanner />

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <Select defaultValue="thisMonth">
          <SelectTrigger className="w-[180px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="thisWeek">This Week</SelectItem>
            <SelectItem value="thisMonth">This Month</SelectItem>
            <SelectItem value="lastMonth">Last Month</SelectItem>
            <SelectItem value="last3Months">Last 3 Months</SelectItem>
            <SelectItem value="thisYear">This Year</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <BarChart3 className="h-8 w-8 text-blue-600 mb-2" />
                  <h3 className="text-xl font-bold">24</h3>
                  <p className="text-sm text-gray-500">Total Bookings</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <BarChart3 className="h-8 w-8 text-green-600 mb-2" />
                  <h3 className="text-xl font-bold">£2,450</h3>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <BarChart3 className="h-8 w-8 text-purple-600 mb-2" />
                  <h3 className="text-xl font-bold">£105</h3>
                  <p className="text-sm text-gray-500">Average Job Value</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <BarChart3 className="h-8 w-8 text-orange-600 mb-2" />
                  <h3 className="text-xl font-bold">92%</h3>
                  <p className="text-sm text-gray-500">Completion Rate</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Bookings by Status</CardTitle>
                <CardDescription>Distribution of bookings by status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <BarChart3 className="h-16 w-16 mx-auto text-gray-300" />
                    <p className="mt-2">Chart visualization would appear here</p>
                    <p className="text-sm">Showing distribution of bookings by status</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Popular Services</CardTitle>
                <CardDescription>Most requested services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <BarChart3 className="h-16 w-16 mx-auto text-gray-300" />
                    <p className="mt-2">Chart visualization would appear here</p>
                    <p className="text-sm">Showing distribution of services by popularity</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bookings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking Trends</CardTitle>
              <CardDescription>Booking activity over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <BarChart3 className="h-16 w-16 mx-auto text-gray-300" />
                  <p className="mt-2">Chart visualization would appear here</p>
                  <p className="text-sm">Showing booking trends over time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Analysis</CardTitle>
              <CardDescription>Breakdown of services performed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <BarChart3 className="h-16 w-16 mx-auto text-gray-300" />
                  <p className="mt-2">Chart visualization would appear here</p>
                  <p className="text-sm">Showing service type distribution</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analysis</CardTitle>
              <CardDescription>Financial performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <BarChart3 className="h-16 w-16 mx-auto text-gray-300" />
                  <p className="mt-2">Chart visualization would appear here</p>
                  <p className="text-sm">Showing revenue trends over time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
