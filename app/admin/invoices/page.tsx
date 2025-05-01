"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, FileText, Printer, Download, XCircle, Trash } from "lucide-react"
import { AdminWarningBanner } from "@/components/admin-warning-banner"

// Mock data for customers
const mockCustomers = [
  { id: "cust_1001", name: "John Smith", email: "john@example.com", phone: "07463451967" },
  { id: "cust_1002", name: "Sarah Johnson", email: "sarah@example.com", phone: "07712345678" },
  { id: "cust_1003", name: "Michael Brown", email: "michael@example.com", phone: "07987654321" },
  { id: "cust_1004", name: "Emma Wilson", email: "emma@example.com", phone: "07123456789" },
  { id: "cust_1005", name: "David Taylor", email: "david@example.com", phone: "07654321987" },
]

// Mock data for parts
const mockParts = [
  { id: "part_001", name: "Oil Filter", price: 15 },
  { id: "part_002", name: "Air Filter", price: 12 },
  { id: "part_003", name: "Brake Pads (Front)", price: 45 },
  { id: "part_004", name: "Brake Pads (Rear)", price: 40 },
  { id: "part_005", name: "Battery", price: 85 },
  { id: "part_006", name: "Spark Plugs (set of 4)", price: 28 },
  { id: "part_007", name: "Wiper Blades (pair)", price: 25 },
  { id: "part_008", name: "Engine Oil (5L)", price: 35 },
  { id: "part_009", name: "Coolant (2L)", price: 18 },
  { id: "part_010", name: "Timing Belt Kit", price: 120 },
]

// Mock data for invoices - updated structure with separate labor and parts
const mockInvoices = [
  {
    id: "INV-2025-001",
    customerId: "cust_1001",
    customerName: "John Smith",
    date: "2025-05-15",
    dueDate: "2025-05-29",
    labor: [
      { description: "Engine repair", hours: 3, hourlyRate: 45, total: 135 },
      { description: "Oil change", hours: 0.5, hourlyRate: 45, total: 22.5 },
    ],
    parts: [
      { name: "Oil Filter", quantity: 1, price: 15, total: 15 },
      { name: "Engine Oil (5L)", quantity: 1, price: 35, total: 35 },
      { name: "Gasket", quantity: 2, price: 12.5, total: 25 },
    ],
    subtotal: 232.5,
    tax: 46.5,
    total: 279,
    status: "paid",
    paidDate: "2025-05-20",
  },
  {
    id: "INV-2025-002",
    customerId: "cust_1002",
    customerName: "Sarah Johnson",
    date: "2025-05-16",
    dueDate: "2025-05-30",
    labor: [{ description: "Brake pad replacement", hours: 1.5, hourlyRate: 45, total: 67.5 }],
    parts: [
      { name: "Brake Pads (Front)", quantity: 1, price: 45, total: 45 },
      { name: "Brake Fluid", quantity: 1, price: 12, total: 12 },
    ],
    subtotal: 124.5,
    tax: 24.9,
    total: 149.4,
    status: "pending",
    paidDate: null,
  },
  {
    id: "INV-2025-003",
    customerId: "cust_1003",
    customerName: "Michael Brown",
    date: "2025-05-14",
    dueDate: "2025-05-28",
    labor: [
      { description: "Battery replacement", hours: 0.5, hourlyRate: 45, total: 22.5 },
      { description: "Electrical system check", hours: 1, hourlyRate: 45, total: 45 },
    ],
    parts: [{ name: "Battery", quantity: 1, price: 85, total: 85 }],
    subtotal: 152.5,
    tax: 30.5,
    total: 183,
    status: "paid",
    paidDate: "2025-05-18",
  },
  {
    id: "INV-2025-004",
    customerId: "cust_1004",
    customerName: "Emma Wilson",
    date: "2025-05-13",
    dueDate: "2025-05-27",
    labor: [
      { description: "Full service", hours: 2, hourlyRate: 45, total: 90 },
      { description: "Air filter replacement", hours: 0.25, hourlyRate: 45, total: 11.25 },
    ],
    parts: [
      { name: "Oil Filter", quantity: 1, price: 15, total: 15 },
      { name: "Air Filter", quantity: 1, price: 12, total: 12 },
      { name: "Engine Oil (5L)", quantity: 1, price: 35, total: 35 },
      { name: "Cabin Filter", quantity: 1, price: 18, total: 18 },
    ],
    subtotal: 181.25,
    tax: 36.25,
    total: 217.5,
    status: "overdue",
    paidDate: null,
  },
]

// Company details
const companyDetails = {
  name: "Jamie's Auto Care",
  address: "123 Main Street",
  city: "Edinburgh",
  postcode: "EH1 1AA",
  phone: "07123456789",
  email: "info@jamiesautocare.com",
  companyNumber: "SC123456", // Added company number
  vatNumber: "GB123456789",
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState(mockInvoices)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [newInvoice, setNewInvoice] = useState({
    customerId: "",
    date: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    labor: [{ description: "", hours: 0, hourlyRate: 45, total: 0 }],
    parts: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    status: "pending",
  })

  const [isNewCustomer, setIsNewCustomer] = useState(false)
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  })

  // Filter invoices based on active tab and search term
  const filteredInvoices = invoices.filter((invoice) => {
    // Filter by tab
    if (activeTab !== "all" && invoice.status !== activeTab) {
      return false
    }

    // Filter by search term
    if (
      searchTerm &&
      !invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false
    }

    return true
  })

  // Handle view invoice
  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice)
    setIsViewModalOpen(true)
  }

  // Handle create invoice
  const handleCreateInvoice = () => {
    setIsCreateModalOpen(true)
  }

  // Handle add labor item to invoice
  const handleAddLaborItem = () => {
    setNewInvoice({
      ...newInvoice,
      labor: [...newInvoice.labor, { description: "", hours: 0, hourlyRate: 45, total: 0 }],
    })
  }

  // Handle remove labor item from invoice
  const handleRemoveLaborItem = (index) => {
    const updatedLabor = [...newInvoice.labor]
    updatedLabor.splice(index, 1)

    // Recalculate totals
    updateInvoiceTotals(updatedLabor, newInvoice.parts)
  }

  // Handle labor item change
  const handleLaborItemChange = (index, field, value) => {
    const updatedLabor = [...newInvoice.labor]

    // Update the specific field
    updatedLabor[index][field] = value

    // Recalculate the total for this item
    const hours = Number.parseFloat(updatedLabor[index].hours) || 0
    const hourlyRate = Number.parseFloat(updatedLabor[index].hourlyRate) || 0

    updatedLabor[index].total = hours * hourlyRate

    // Recalculate invoice totals
    updateInvoiceTotals(updatedLabor, newInvoice.parts)
  }

  // Handle adding a part to the invoice
  const handleAddPart = (part) => {
    const updatedParts = [...newInvoice.parts]

    // Check if part already exists in the invoice
    const existingPartIndex = updatedParts.findIndex((p) => p.name === part.name)

    if (existingPartIndex >= 0) {
      // Increment quantity if part already exists
      updatedParts[existingPartIndex].quantity += 1
      updatedParts[existingPartIndex].total =
        updatedParts[existingPartIndex].quantity * updatedParts[existingPartIndex].price
    } else {
      // Add new part if it doesn't exist
      updatedParts.push({
        name: part.name,
        quantity: 1,
        price: part.price,
        total: part.price,
      })
    }

    // Recalculate invoice totals
    updateInvoiceTotals(newInvoice.labor, updatedParts)
  }

  // Handle removing a part from the invoice
  const handleRemovePart = (index) => {
    const updatedParts = [...newInvoice.parts]
    updatedParts.splice(index, 1)

    // Recalculate invoice totals
    updateInvoiceTotals(newInvoice.labor, updatedParts)
  }

  // Handle part quantity change
  const handlePartQuantityChange = (index, quantity) => {
    const updatedParts = [...newInvoice.parts]

    updatedParts[index].quantity = quantity
    updatedParts[index].total = updatedParts[index].price * quantity

    // Recalculate invoice totals
    updateInvoiceTotals(newInvoice.labor, updatedParts)
  }

  // Update invoice totals
  const updateInvoiceTotals = (labor, parts) => {
    const laborTotal = labor.reduce((sum, item) => sum + item.total, 0)
    const partsTotal = parts.reduce((sum, item) => sum + item.total, 0)

    const subtotal = laborTotal + partsTotal
    const tax = subtotal * 0.2 // 20% tax

    setNewInvoice({
      ...newInvoice,
      labor,
      parts,
      subtotal,
      tax,
      total: subtotal + tax,
    })
  }

  const submitCreateInvoiceForm = () => {
    let customerId = newInvoice.customerId
    let customerName = ""

    // If adding a new customer
    if (isNewCustomer) {
      // Generate a new customer ID
      customerId = `cust_${Math.floor(1000 + Math.random() * 9000)}`
      customerName = newCustomer.name

      // Add the new customer to the mockCustomers array
      const newCustomerObj = {
        id: customerId,
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        address: newCustomer.address,
      }

      // In a real application, you would save this to your database
      // For now, we'll just add it to our mock data
      mockCustomers.push(newCustomerObj)
    } else {
      // Find customer name from existing customers
      const customer = mockCustomers.find((c) => c.id === customerId)
      customerName = customer ? customer.name : "Unknown Customer"
    }

    const newInvoiceObj = {
      id: `INV-${new Date().getFullYear()}-${(invoices.length + 1).toString().padStart(3, "0")}`,
      customerId: customerId,
      customerName: customerName,
      date: newInvoice.date,
      dueDate: newInvoice.dueDate,
      labor: newInvoice.labor,
      parts: newInvoice.parts,
      subtotal: newInvoice.subtotal,
      tax: newInvoice.tax,
      total: newInvoice.total,
      status: "pending",
      paidDate: null,
    }

    setInvoices([newInvoiceObj, ...invoices])
    setIsCreateModalOpen(false)

    // Reset form
    setNewInvoice({
      customerId: "",
      date: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      labor: [{ description: "", hours: 0, hourlyRate: 45, total: 0 }],
      parts: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      status: "pending",
    })

    // Reset new customer form
    setNewCustomer({
      name: "",
      email: "",
      phone: "",
      address: "",
    })
    setIsNewCustomer(false)
  }

  // Mark invoice as paid
  const markAsPaid = (invoiceId) => {
    const updatedInvoices = invoices.map((invoice) =>
      invoice.id === invoiceId
        ? {
            ...invoice,
            status: "paid",
            paidDate: new Date().toISOString().split("T")[0],
          }
        : invoice,
    )
    setInvoices(updatedInvoices)

    // Update selected invoice if it's the one being marked as paid
    if (selectedInvoice && selectedInvoice.id === invoiceId) {
      setSelectedInvoice({
        ...selectedInvoice,
        status: "paid",
        paidDate: new Date().toISOString().split("T")[0],
      })
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

  // Format currency
  const formatCurrency = (amount) => {
    return `£${amount.toFixed(2)}`
  }

  return (
    <div className="space-y-6">
      <AdminWarningBanner />

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Invoice Management</h1>
        <Button onClick={handleCreateInvoice}>
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>View and manage your invoices</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Tabs */}
          <div className="mb-6">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by invoice number or customer"
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="paid">Paid</TabsTrigger>
                <TabsTrigger value="overdue">Overdue</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Invoices Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Invoice
                  </th>
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
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Amount
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
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
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No invoices found
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400 mr-2" />
                          <div className="text-sm font-medium text-gray-900">{invoice.id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{invoice.customerName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(invoice.date)}</div>
                        <div className="text-xs text-gray-500">Due: {formatDate(invoice.dueDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(invoice.total)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            invoice.status === "paid"
                              ? "bg-green-100 text-green-800"
                              : invoice.status === "overdue"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button variant="ghost" size="sm" onClick={() => handleViewInvoice(invoice)}>
                          View
                        </Button>
                        {invoice.status === "pending" || invoice.status === "overdue" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-800"
                            onClick={() => markAsPaid(invoice.id)}
                          >
                            Mark Paid
                          </Button>
                        ) : null}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create Invoice Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Create New Invoice</h2>
                <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Customer and Dates */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-gray-700">Customer</label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsNewCustomer(!isNewCustomer)}
                        className="text-xs h-6 px-2"
                      >
                        {isNewCustomer ? "Select Existing" : "Add New Customer"}
                      </Button>
                    </div>

                    {isNewCustomer ? (
                      <div className="space-y-3 border rounded-md p-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                          <Input
                            value={newCustomer.name}
                            onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                            placeholder="Customer name"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                          <Input
                            type="email"
                            value={newCustomer.email}
                            onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                            placeholder="Email address"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                          <Input
                            value={newCustomer.phone}
                            onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                            placeholder="Phone number"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                          <Input
                            value={newCustomer.address}
                            onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                            placeholder="Address"
                          />
                        </div>
                      </div>
                    ) : (
                      <Select
                        value={newInvoice.customerId}
                        onValueChange={(value) => setNewInvoice({ ...newInvoice, customerId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockCustomers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
                    <Input
                      type="date"
                      value={newInvoice.date}
                      onChange={(e) => setNewInvoice({ ...newInvoice, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <Input
                      type="date"
                      value={newInvoice.dueDate}
                      onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                    />
                  </div>
                </div>

                {/* Labor Items */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium">Labor</h3>
                    <Button size="sm" onClick={handleAddLaborItem}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Labor Item
                    </Button>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Description
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Rate (£/h)
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total (£)</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"></th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {newInvoice.labor.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2">
                              <Input
                                value={item.description}
                                onChange={(e) => handleLaborItemChange(index, "description", e.target.value)}
                                placeholder="Labor description"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <Input
                                type="number"
                                min="0"
                                step="0.25"
                                value={item.hours}
                                onChange={(e) =>
                                  handleLaborItemChange(index, "hours", Number.parseFloat(e.target.value))
                                }
                              />
                            </td>
                            <td className="px-4 py-2">
                              <Input
                                type="number"
                                min="0"
                                value={item.hourlyRate}
                                onChange={(e) =>
                                  handleLaborItemChange(index, "hourlyRate", Number.parseFloat(e.target.value))
                                }
                              />
                            </td>
                            <td className="px-4 py-2">
                              <div className="py-2 px-3 bg-gray-50 rounded">{formatCurrency(item.total)}</div>
                            </td>
                            <td className="px-4 py-2">
                              {newInvoice.labor.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveLaborItem(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Parts Section */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium">Parts</h3>
                  </div>

                  {/* Selected Parts Table */}
                  {newInvoice.parts.length > 0 && (
                    <div className="border rounded-lg overflow-hidden mb-4">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Part Name
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Quantity
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Price (£)
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Total (£)
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"></th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {newInvoice.parts.map((part, index) => (
                            <tr key={index}>
                              <td className="px-4 py-2">{part.name}</td>
                              <td className="px-4 py-2">
                                <Input
                                  type="number"
                                  min="1"
                                  value={part.quantity}
                                  onChange={(e) => handlePartQuantityChange(index, Number.parseInt(e.target.value))}
                                  className="w-20"
                                />
                              </td>
                              <td className="px-4 py-2">{formatCurrency(part.price)}</td>
                              <td className="px-4 py-2">{formatCurrency(part.total)}</td>
                              <td className="px-4 py-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemovePart(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Parts Catalog */}
                  <h4 className="text-md font-medium mb-2">Parts Catalog</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {mockParts.map((part) => (
                      <div
                        key={part.id}
                        className="border rounded p-2 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                        onClick={() => handleAddPart(part)}
                      >
                        <span>{part.name}</span>
                        <span className="font-medium">{formatCurrency(part.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Invoice Summary */}
                <div className="border-t pt-4">
                  <div className="flex justify-end">
                    <div className="w-64">
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">{formatCurrency(newInvoice.subtotal)}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">VAT (20%):</span>
                        <span className="font-medium">{formatCurrency(newInvoice.tax)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-t border-gray-200 font-bold">
                        <span>Total:</span>
                        <span>{formatCurrency(newInvoice.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={submitCreateInvoiceForm}
                  disabled={
                    (!isNewCustomer && !newInvoice.customerId) ||
                    (isNewCustomer && !newCustomer.name) ||
                    newInvoice.labor.some((item) => !item.description) ||
                    newInvoice.total === 0
                  }
                >
                  Create Invoice
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Invoice Modal */}
      {isViewModalOpen && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Invoice {selectedInvoice.id}</h2>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => window.print()}>
                    <Printer className="h-4 w-4 mr-1" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  <button onClick={() => setIsViewModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="border rounded-lg p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-bold mb-2">{companyDetails.name}</h3>
                    <p className="text-gray-600">{companyDetails.address}</p>
                    <p className="text-gray-600">
                      {companyDetails.city}, {companyDetails.postcode}
                    </p>
                    <p className="text-gray-600">Phone: {companyDetails.phone}</p>
                    <p className="text-gray-600">Email: {companyDetails.email}</p>
                    <p className="text-gray-600">Company No: {companyDetails.companyNumber}</p>
                    <p className="text-gray-600">VAT No: {companyDetails.vatNumber}</p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-lg font-bold mb-2">Invoice Details</h3>
                    <p className="text-gray-600">Invoice Number: {selectedInvoice.id}</p>
                    <p className="text-gray-600">Date: {formatDate(selectedInvoice.date)}</p>
                    <p className="text-gray-600">Due Date: {formatDate(selectedInvoice.dueDate)}</p>
                    <p
                      className={`font-bold ${
                        selectedInvoice.status === "paid"
                          ? "text-green-600"
                          : selectedInvoice.status === "overdue"
                            ? "text-red-600"
                            : "text-yellow-600"
                      }`}
                    >
                      Status: {selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1)}
                    </p>
                    {selectedInvoice.paidDate && (
                      <p className="text-green-600">Paid on: {formatDate(selectedInvoice.paidDate)}</p>
                    )}
                  </div>
                </div>

                <div className="mt-6 border-t pt-6">
                  <h3 className="text-lg font-bold mb-2">Bill To</h3>
                  <p className="text-gray-800 font-medium">{selectedInvoice.customerName}</p>
                </div>
              </div>

              {/* Labor Section */}
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-2">Labor</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hours
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rate (£/h)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total (£)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedInvoice.labor.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.description}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.hours}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(item.hourlyRate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(item.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Parts Section */}
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-2">Parts</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Part Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price (£)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total (£)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedInvoice.parts.map((part, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{part.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{part.quantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(part.price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(part.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-end">
                  <div className="w-64">
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">{formatCurrency(selectedInvoice.subtotal)}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">VAT (20%):</span>
                      <span className="font-medium">{formatCurrency(selectedInvoice.tax)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-t border-gray-200 font-bold">
                      <span>Total:</span>
                      <span>{formatCurrency(selectedInvoice.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t pt-6">
                <div className="text-gray-600 text-sm">
                  <p className="mb-2">
                    <strong>Payment Terms:</strong> Payment is due upon receipt.
                  </p>
                  <p>Thank you for your business!</p>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                  Close
                </Button>
                {(selectedInvoice.status === "pending" || selectedInvoice.status === "overdue") && (
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => {
                      markAsPaid(selectedInvoice.id)
                      setIsViewModalOpen(false)
                    }}
                  >
                    Mark as Paid
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
