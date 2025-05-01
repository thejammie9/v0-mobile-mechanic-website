"use client"

import { Calendar } from "@/components/ui/calendar"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, User, Phone, Mail, Car, FileText, XCircle } from "lucide-react"
import { AdminWarningBanner } from "@/components/admin-warning-banner"

// Mock customer data
const mockCustomers = [
  {
    id: "cust_1001",
    name: "John Smith",
    email: "john@example.com",
    phone: "07463451967",
    address: "123 Main St, Edinburgh, EH1 1AA",
    vehicles: [
      { make: "Ford", model: "Focus", year: "2018", registration: "AB18 XYZ" },
      { make: "Vauxhall", model: "Corsa", year: "2015", registration: "CD15 ABC" },
    ],
    bookingHistory: [
      {
        id: "booking_1651234567",
        date: "2025-05-15",
        service: "Engine repair",
        status: "completed",
        cost: "£120",
      },
      {
        id: "booking_1651234570",
        date: "2025-04-10",
        service: "Oil change",
        status: "completed",
        cost: "£45",
      },
    ],
    notes: "Prefers morning appointments. Always pays on time.",
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "cust_1002",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    phone: "07712345678",
    address: "456 High Street, Edinburgh, EH2 2BB",
    vehicles: [{ make: "Audi", model: "A4", year: "2020", registration: "EF20 DEF" }],
    bookingHistory: [
      {
        id: "booking_1651234568",
        date: "2025-05-16",
        service: "Brake pad replacement",
        status: "confirmed",
        cost: "",
      },
    ],
    notes: "New customer. Referred by John Smith.",
    createdAt: "2024-03-20T14:15:00Z",
  },
  {
    id: "cust_1003",
    name: "Michael Brown",
    email: "michael@example.com",
    phone: "07987654321",
    address: "789 Low Road, Edinburgh, EH3 3CC",
    vehicles: [{ make: "Toyota", model: "Corolla", year: "2017", registration: "GH17 GHI" }],
    bookingHistory: [
      {
        id: "booking_1651234569",
        date: "2025-05-14",
        service: "Battery replacement",
        status: "completed",
        cost: "£85",
      },
    ],
    notes: "",
    createdAt: "2024-02-05T09:45:00Z",
  },
  {
    id: "cust_1004",
    name: "Emma Wilson",
    email: "emma@example.com",
    phone: "07123456789",
    address: "101 New Avenue, Edinburgh, EH4 4DD",
    vehicles: [{ make: "Volkswagen", model: "Golf", year: "2019", registration: "JK19 JKL" }],
    bookingHistory: [
      {
        id: "booking_1651234571",
        date: "2025-05-13",
        service: "Full service",
        status: "completed",
        cost: "£95",
      },
    ],
    notes: "Prefers afternoon appointments.",
    createdAt: "2024-01-30T11:20:00Z",
  },
  {
    id: "cust_1005",
    name: "David Taylor",
    email: "david@example.com",
    phone: "07654321987",
    address: "202 Old Lane, Edinburgh, EH5 5EE",
    vehicles: [{ make: "BMW", model: "3 Series", year: "2021", registration: "LM21 MNO" }],
    bookingHistory: [
      {
        id: "booking_1651234572",
        date: "2025-05-17",
        service: "Engine diagnostic",
        status: "cancelled",
        cost: "",
      },
    ],
    notes: "Has complained about pricing in the past.",
    createdAt: "2024-04-10T16:30:00Z",
  },
]

export default function CustomersPage() {
  const [customers, setCustomers] = useState(mockCustomers)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [customerForm, setCustomerForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  })
  const [vehicleForm, setVehicleForm] = useState({
    make: "",
    model: "",
    year: "",
    registration: "",
  })

  // Filter customers based on search term
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.vehicles.some((vehicle) =>
        `${vehicle.make} ${vehicle.model} ${vehicle.registration}`.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  )

  // Handle view customer
  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer)
    setIsViewModalOpen(true)
  }

  // Handle edit customer
  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer)
    setCustomerForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      notes: customer.notes,
    })
    setIsEditModalOpen(true)
  }

  // Handle add customer
  const handleAddCustomer = () => {
    setCustomerForm({
      name: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
    })
    setIsAddModalOpen(true)
  }

  // Handle delete customer
  const handleDeleteCustomer = (customer) => {
    setSelectedCustomer(customer)
    setIsDeleteModalOpen(true)
  }

  // Submit add customer form
  const submitAddCustomerForm = () => {
    const newCustomer = {
      id: `cust_${Math.floor(1000 + Math.random() * 9000)}`,
      ...customerForm,
      vehicles: [],
      bookingHistory: [],
      createdAt: new Date().toISOString(),
    }
    setCustomers([...customers, newCustomer])
    setIsAddModalOpen(false)
  }

  // Submit edit customer form
  const submitEditCustomerForm = () => {
    const updatedCustomers = customers.map((customer) =>
      customer.id === selectedCustomer.id
        ? {
            ...customer,
            ...customerForm,
          }
        : customer,
    )
    setCustomers(updatedCustomers)
    setIsEditModalOpen(false)
  }

  // Confirm delete customer
  const confirmDeleteCustomer = () => {
    const updatedCustomers = customers.filter((customer) => customer.id !== selectedCustomer.id)
    setCustomers(updatedCustomers)
    setIsDeleteModalOpen(false)
  }

  // Add vehicle to customer
  const addVehicleToCustomer = () => {
    if (!vehicleForm.make || !vehicleForm.model || !vehicleForm.registration) {
      return
    }

    const updatedCustomers = customers.map((customer) =>
      customer.id === selectedCustomer.id
        ? {
            ...customer,
            vehicles: [...customer.vehicles, vehicleForm],
          }
        : customer,
    )
    setCustomers(updatedCustomers)
    setVehicleForm({
      make: "",
      model: "",
      year: "",
      registration: "",
    })

    // Update selected customer
    const updatedCustomer = updatedCustomers.find((customer) => customer.id === selectedCustomer.id)
    setSelectedCustomer(updatedCustomer)
  }

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <AdminWarningBanner />

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Customer Management</h1>
        <Button onClick={handleAddCustomer}>
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customers</CardTitle>
          <CardDescription>View and manage your customer database</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, phone or vehicle"
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Customers Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Customer
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Contact
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Vehicles
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Bookings
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No customers found
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                            <div className="text-sm text-gray-500">Customer since {formatDate(customer.createdAt)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Mail className="h-4 w-4 mr-1 text-gray-400" />
                          {customer.email}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="h-4 w-4 mr-1 text-gray-400" />
                          {customer.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {customer.vehicles.length > 0
                            ? customer.vehicles.map((vehicle, index) => (
                                <div key={index} className="flex items-center mb-1 last:mb-0">
                                  <Car className="h-4 w-4 mr-1 text-gray-400" />
                                  {vehicle.make} {vehicle.model} ({vehicle.year})
                                </div>
                              ))
                            : "No vehicles"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {customer.bookingHistory.length} booking
                          {customer.bookingHistory.length !== 1 ? "s" : ""}
                        </div>
                        <div className="text-sm text-gray-500">
                          {customer.bookingHistory.length > 0
                            ? `Last: ${formatDate(customer.bookingHistory[0].date)}`
                            : "No bookings yet"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button variant="ghost" size="sm" onClick={() => handleViewCustomer(customer)}>
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => handleEditCustomer(customer)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-800"
                          onClick={() => handleDeleteCustomer(customer)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* View Customer Modal */}
      {isViewModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Customer Details</h2>
                <button onClick={() => setIsViewModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Customer Information */}
                <div className="md:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle>Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center text-gray-500 text-sm">
                            <User className="h-4 w-4 mr-2" />
                            Name
                          </div>
                          <div className="font-medium">{selectedCustomer.name}</div>
                        </div>
                        <div>
                          <div className="flex items-center text-gray-500 text-sm">
                            <Mail className="h-4 w-4 mr-2" />
                            Email
                          </div>
                          <div className="font-medium">{selectedCustomer.email}</div>
                        </div>
                        <div>
                          <div className="flex items-center text-gray-500 text-sm">
                            <Phone className="h-4 w-4 mr-2" />
                            Phone
                          </div>
                          <div className="font-medium">{selectedCustomer.phone}</div>
                        </div>
                        <div>
                          <div className="flex items-center text-gray-500 text-sm">
                            <FileText className="h-4 w-4 mr-2" />
                            Address
                          </div>
                          <div className="font-medium">{selectedCustomer.address}</div>
                        </div>
                        <div>
                          <div className="flex items-center text-gray-500 text-sm">
                            <FileText className="h-4 w-4 mr-2" />
                            Notes
                          </div>
                          <div className="font-medium">{selectedCustomer.notes || "No notes available"}</div>
                        </div>
                        <div>
                          <div className="flex items-center text-gray-500 text-sm">
                            <Calendar className="h-4 w-4 mr-2" />
                            Customer Since
                          </div>
                          <div className="font-medium">{formatDate(selectedCustomer.createdAt)}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Vehicles */}
                <div className="md:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle>Vehicles</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedCustomer.vehicles.length === 0 ? (
                        <div className="text-gray-500">No vehicles registered</div>
                      ) : (
                        <div className="space-y-4">
                          {selectedCustomer.vehicles.map((vehicle, index) => (
                            <div key={index} className="border rounded-md p-3">
                              <div className="font-medium flex items-center">
                                <Car className="h-4 w-4 mr-2 text-gray-500" />
                                {vehicle.make} {vehicle.model} ({vehicle.year})
                              </div>
                              <div className="text-sm text-gray-500 mt-1">Registration: {vehicle.registration}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-4 border-t pt-4">
                        <h4 className="font-medium mb-2">Add Vehicle</h4>
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              placeholder="Make"
                              value={vehicleForm.make}
                              onChange={(e) => setVehicleForm({ ...vehicleForm, make: e.target.value })}
                            />
                            <Input
                              placeholder="Model"
                              value={vehicleForm.model}
                              onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              placeholder="Year"
                              value={vehicleForm.year}
                              onChange={(e) => setVehicleForm({ ...vehicleForm, year: e.target.value })}
                            />
                            <Input
                              placeholder="Registration"
                              value={vehicleForm.registration}
                              onChange={(e) => setVehicleForm({ ...vehicleForm, registration: e.target.value })}
                            />
                          </div>
                          <Button
                            className="w-full"
                            size="sm"
                            onClick={addVehicleToCustomer}
                            disabled={!vehicleForm.make || !vehicleForm.model || !vehicleForm.registration}
                          >
                            Add Vehicle
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Booking History */}
                <div className="md:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle>Booking History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedCustomer.bookingHistory.length === 0 ? (
                        <div className="text-gray-500">No booking history</div>
                      ) : (
                        <div className="space-y-4">
                          {selectedCustomer.bookingHistory.map((booking, index) => (
                            <div key={index} className="border rounded-md p-3">
                              <div className="font-medium">{booking.service}</div>
                              <div className="text-sm text-gray-500 mt-1">Date: {formatDate(booking.date)}</div>
                              <div className="flex justify-between items-center mt-2">
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    booking.status === "completed"
                                      ? "bg-green-100 text-green-800"
                                      : booking.status === "confirmed"
                                        ? "bg-blue-100 text-blue-800"
                                        : booking.status === "cancelled"
                                          ? "bg-red-100 text-red-800"
                                          : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                </span>
                                {booking.cost && <span className="font-medium">{booking.cost}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-4">
                        <Button
                          className="w-full"
                          variant="outline"
                          size="sm"
                          onClick={() => setIsViewModalOpen(false)}
                        >
                          Create New Booking
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setIsViewModalOpen(false)
                    handleEditCustomer(selectedCustomer)
                  }}
                >
                  Edit Customer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Add New Customer</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <Input
                    value={customerForm.name}
                    onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                    placeholder="Full Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <Input
                    type="email"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                    placeholder="Email Address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <Input
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    placeholder="Phone Number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <Input
                    value={customerForm.address}
                    onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                    placeholder="Full Address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    value={customerForm.notes}
                    onChange={(e) => setCustomerForm({ ...customerForm, notes: e.target.value })}
                    placeholder="Additional notes about the customer"
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={submitAddCustomerForm}
                  disabled={!customerForm.name || !customerForm.email || !customerForm.phone}
                >
                  Add Customer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {isEditModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Edit Customer</h2>
                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <Input
                    value={customerForm.name}
                    onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                    placeholder="Full Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <Input
                    type="email"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                    placeholder="Email Address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <Input
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    placeholder="Phone Number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <Input
                    value={customerForm.address}
                    onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                    placeholder="Full Address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    value={customerForm.notes}
                    onChange={(e) => setCustomerForm({ ...customerForm, notes: e.target.value })}
                    placeholder="Additional notes about the customer"
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={submitEditCustomerForm}
                  disabled={!customerForm.name || !customerForm.email || !customerForm.phone}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Customer Modal */}
      {isDeleteModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Delete Customer</h2>
                <button onClick={() => setIsDeleteModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-700">
                  Are you sure you want to delete <span className="font-bold">{selectedCustomer.name}</span>? This
                  action cannot be undone.
                </p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDeleteCustomer}>
                  Delete Customer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
