import { redirect } from "next/navigation"
import Link from "next/link"
import { isAdminAuthenticated } from "@/app/admin/actions"
import { getAllCustomers } from "@/app/actions/customers"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserPlus, Eye, Download } from "lucide-react"
import { format } from "date-fns"

export const dynamic = "force-dynamic"

export default async function CustomersPage() {
  const isAuthenticated = await isAdminAuthenticated()
  if (!isAuthenticated) {
    redirect("/admin/login")
  }

  const customers = await getAllCustomers()

  return (
    <div className="min-h-screen bg-gray-900">
      <main className="container mx-auto px-4 py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-100">Customers</h1>
          <div className="flex gap-2">
            <a href="/api/admin/export/customers">
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-gray-100">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </a>
            <Link href="/admin/customers/new">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-400">Total Customers</CardDescription>
              <CardTitle className="text-3xl text-gray-100">{customers.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-400">Total Bookings</CardDescription>
              <CardTitle className="text-3xl text-blue-400">
                {customers.reduce((s, c) => s + c.booking_count, 0)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-400">Total Invoices</CardDescription>
              <CardTitle className="text-3xl text-green-400">
                {customers.reduce((s, c) => s + c.invoice_count, 0)}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Customers Table */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100">All Customers</CardTitle>
            <CardDescription className="text-gray-400">
              Manage your customer accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {customers.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p className="text-lg mb-1">No customers yet</p>
                <p className="text-sm mb-6">Add your first customer to get started.</p>
                <Link href="/admin/customers/new">
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Customer
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700 hover:bg-gray-700/50">
                      <TableHead className="text-gray-400">Name</TableHead>
                      <TableHead className="text-gray-400">Email</TableHead>
                      <TableHead className="text-gray-400">Phone</TableHead>
                      <TableHead className="text-gray-400">Bookings</TableHead>
                      <TableHead className="text-gray-400">Invoices</TableHead>
                      <TableHead className="text-gray-400">Created</TableHead>
                      <TableHead className="text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow
                        key={customer.id}
                        className="border-gray-700 hover:bg-gray-700/40"
                      >
                        <TableCell className="font-medium text-gray-100">
                          {customer.name}
                        </TableCell>
                        <TableCell className="text-gray-300">{customer.email}</TableCell>
                        <TableCell className="text-gray-300">
                          {customer.phone || <span className="text-gray-600">—</span>}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-blue-900/50 text-blue-300 border-blue-700">
                            {customer.booking_count}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-900/50 text-green-300 border-green-700">
                            {customer.invoice_count}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-400 text-sm">
                          {format(new Date(customer.created_at), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell>
                          <Link href={`/admin/customers/${customer.id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-gray-100"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </Link>
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
    </div>
  )
}
