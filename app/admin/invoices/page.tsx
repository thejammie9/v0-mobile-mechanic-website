"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, FileText, Printer, Download, XCircle, Trash, Filter } from "lucide-react"
import { AdminWarningBanner } from "@/components/admin-warning-banner"

// Mock data for customers
// const mockCustomers = [
//   { id: "cust_1001", name: "John Smith", email: "john@example.com", phone: "07463451967" },
//   { id: "cust_1002", name: "Sarah Johnson", email: "sarah@example.com", phone: "07712345678" },
//   { id: "cust_1003", name: "Michael Brown", email: "michael@example.com", phone: "07987654321" },
//   { id: "cust_1004", name: "Emma Wilson", email: "emma@example.com", phone: "07123456789" },
//   { id: "cust_1005", name: "David Taylor", email: "david@example.com", phone: "07654321987" },
// ]

// Mock data for invoices - updated structure with separate labor and parts
// const mockInvoices = [
//   {
//     id: "INV-2025-001",
//     customerId: "cust_1001",
//     customerName: "John Smith",
//     date: "2025-05-15",
//     dueDate: "2025-05-29",
//     labor: [
//       { description: "Engine repair", hours: 3, hourlyRate: 45, total: 135 },
//       { description: "Oil change", hours: 0.5, hourlyRate: 45, total: 22.5 },
//     ],
//     parts: [
//       { name: "Oil Filter", quantity: 1, price: 15, total: 15 },
//       { name: "Engine Oil (5L)", quantity: 1, price: 35, total: 35 },
//       { name: "Gasket", quantity: 2, price: 12.5, total: 25 },
//     ],
//     subtotal: 232.5,
//     tax: 46.5,
//     total: 279,
//     status: "paid",
//     paidDate: "2025-05-20",
//   },
//   {
//     id: "INV-2025-002",
//     customerId: "cust_1002",
//     customerName: "Sarah Johnson",
//     date: "2025-05-16",
//     dueDate: "2025-05-30",
//     labor: [{ description: "Brake pad replacement", hours: 1.5, hourlyRate: 45, total: 67.5 }],
//     parts: [
//       { name: "Brake Pads (Front)", quantity: 1, price: 45, total: 45 },
//       { name: "Brake Fluid", quantity: 1, price: 12, total: 12 },
//     ],
//     subtotal: 124.5,
//     tax: 24.9,
//     total: 149.4,
//     status: "pending",
//     paidDate: null,
//   },
//   {
//     id: "INV-2025-003",
//     customerId: "cust_1003",
//     customerName: "Michael Brown",
//     date: "2025-05-14",
//     dueDate: "2025-05-28",
//     labor: [
//       { description: "Battery replacement", hours: 0.5, hourlyRate: 45, total: 22.5 },
//       { description: "Electrical system check", hours: 1, hourlyRate: 45, total: 45 },
//     ],
//     parts: [{ name: "Battery", quantity: 1, price: 85, total: 85 }],
//     subtotal: 152.5,
//     tax: 30.5,
//     total: 183,
//     status: "paid",
//     paidDate: "2025-05-18",
//   },
//   {
//     id: "INV-2025-004",
//     customerId: "cust_1004",
//     customerName: "Emma Wilson",
//     date: "2025-05-13",
//     dueDate: "2025-05-27",
//     labor: [
//       { description: "Full service", hours: 2, hourlyRate: 45, total: 90 },
//       { description: "Air filter replacement", hours: 0.25, hourlyRate: 45, total: 11.25 },
//     ],
//     parts: [
//       { name: "Oil Filter", quantity: 1, price: 15, total: 15 },
//       { name: "Air Filter", quantity: 1, price: 12, total: 12 },
//       { name: "Engine Oil (5L)", quantity: 1, price: 35, total: 35 },
//       { name: "Cabin Filter", quantity: 1, price: 18, total: 18 },
//     ],
//     subtotal: 181.25,
//     tax: 36.25,
//     total: 217.5,
//     status: "overdue",
//     paidDate: null,
//   },
// ]

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
  const [invoices, setInvoices] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [totalInvoices, setTotalInvoices] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" })
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [selectedInvoices, setSelectedInvoices] = useState([])
  const [isBulkActionModalOpen, setIsBulkActionModalOpen] = useState(false)
  const printFrameRef = useRef(null)

  const [newInvoice, setNewInvoice] = useState({
    customerId: "",
    customerName: "",
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

  const [customers, setCustomers] = useState([])

  // Fetch invoices
  useEffect(() => {
    fetchInvoices()
    fetchCustomers()
  }, [activeTab, currentPage, limit])

  const fetchInvoices = async () => {
    setIsLoading(true)
    try {
      const status = activeTab !== "all" ? activeTab : ""
      const offset = (currentPage - 1) * limit

      let url = `/api/invoices/index.php?limit=${limit}&offset=${offset}`
      if (status) url += `&status=${status}`
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`
      if (dateRange.startDate) url += `&startDate=${dateRange.startDate}`
      if (dateRange.endDate) url += `&endDate=${dateRange.endDate}`

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("admin_auth")}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        setInvoices(data.invoices)
        setTotalInvoices(data.total)
      } else {
        console.error("Failed to fetch invoices:", data.message)
      }
    } catch (error) {
      console.error("Error fetching invoices:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers/index.php", {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("admin_auth")}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        setCustomers(data.customers)
      }
    } catch (error) {
      console.error("Error fetching customers:", error)
    }
  }

  // Filter invoices based on active tab and search term
  // const filteredInvoices = invoices.filter((invoice) => {
  //   // Filter by tab
  //   if (activeTab !== "all" && invoice.status !== activeTab) {
  //     return false
  //   }

  //   // Filter by search term
  //   if (
  //     searchTerm &&
  //     !invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) &&
  //     !invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  //   ) {
  //     return false
  //   }

  //   return true
  // })

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1)
    fetchInvoices()
  }

  // Handle filter apply
  const handleApplyFilter = () => {
    setCurrentPage(1)
    setIsFilterModalOpen(false)
    fetchInvoices()
  }

  // Handle view invoice
  const handleViewInvoice = async (invoiceId) => {
    try {
      const response = await fetch(`/api/invoices/get.php?id=${invoiceId}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("admin_auth")}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        setSelectedInvoice(data.invoice)
        setIsViewModalOpen(true)
      } else {
        console.error("Failed to fetch invoice:", data.message)
      }
    } catch (error) {
      console.error("Error fetching invoice:", error)
    }
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
  // const handleAddPart = () => {
  //   const updatedParts = [...newInvoice.parts, { name: "", quantity: 1, price: 0, total: 0 }]

  //   // Recalculate invoice totals
  //   updateInvoiceTotals(newInvoice.labor, updatedParts)
  // }

  // Handle removing a part from the invoice
  // const handleRemovePart = (index) => {
  //   const updatedParts = [...newInvoice.parts]
  //   updatedParts.splice(index, 1)

  //   // Recalculate invoice totals
  //   updateInvoiceTotals(newInvoice.labor, updatedParts)
  // }

  // Handle part quantity change
  // const handlePartQuantityChange = (index, quantity) => {
  //   const updatedParts = [...newInvoice.parts]

  //   updatedParts[index].quantity = quantity
  //   updatedParts[index].total = updatedParts[index].price * quantity

  //   // Recalculate invoice totals
  //   updateInvoiceTotals(newInvoice.labor, updatedParts)
  // }

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

  const submitCreateInvoiceForm = async () => {
    try {
      let customerId = newInvoice.customerId
      let customerName = ""

      // If adding a new customer
      if (isNewCustomer) {
        // Create new customer
        const customerResponse = await fetch("/api/customers/create.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("admin_auth")}`,
          },
          body: JSON.stringify(newCustomer),
        })

        const customerData = await customerResponse.json()

        if (customerData.success) {
          customerId = customerData.customerId
          customerName = newCustomer.name
        } else {
          console.error("Failed to create customer:", customerData.message)
          return
        }
      } else {
        // Find customer name from existing customers
        const customer = customers.find((c) => c.id === customerId)
        customerName = customer ? customer.name : "Unknown Customer"
      }

      // Create invoice data
      const invoiceData = {
        customerId,
        customerName,
        date: newInvoice.date,
        dueDate: newInvoice.dueDate,
        labor: newInvoice.labor,
        parts: newInvoice.parts,
        subtotal: newInvoice.subtotal,
        tax: newInvoice.tax,
        total: newInvoice.total,
        status: "pending",
      }

      // Submit invoice
      const response = await fetch("/api/invoices/create.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("admin_auth")}`,
        },
        body: JSON.stringify(invoiceData),
      })

      const data = await response.json()

      if (data.success) {
        setIsCreateModalOpen(false)

        // Reset form
        setNewInvoice({
          customerId: "",
          customerName: "",
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

        // Refresh invoices list
        fetchInvoices()
      } else {
        console.error("Failed to create invoice:", data.message)
      }
    } catch (error) {
      console.error("Error creating invoice:", error)
    }
  }

  // Mark invoice as paid
  const markAsPaid = async (invoiceId) => {
    try {
      const response = await fetch("/api/invoices/update-status.php", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("admin_auth")}`,
        },
        body: JSON.stringify({
          id: invoiceId,
          status: "paid",
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Refresh invoices list
        fetchInvoices()

        // Update selected invoice if it's the one being marked as paid
        if (selectedInvoice && selectedInvoice.id === invoiceId) {
          setSelectedInvoice({
            ...selectedInvoice,
            status: "paid",
            paid_date: new Date().toISOString().split("T")[0],
          })
        }
      } else {
        console.error("Failed to update invoice status:", data.message)
      }
    } catch (error) {
      console.error("Error updating invoice status:", error)
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
    return `£${Number.parseFloat(amount).toFixed(2)}`
  }

  // Handle bulk download
  const handleBulkDownload = (format) => {
    const ids = selectedInvoices.join(",")
    const status = activeTab !== "all" ? activeTab : ""

    let url = `/api/invoices/bulk-download.php?format=${format}`
    if (ids) url += `&ids=${ids}`
    if (status) url += `&status=${status}`
    if (dateRange.startDate) url += `&startDate=${dateRange.startDate}`
    if (dateRange.endDate) url += `&endDate=${dateRange.endDate}`

    // Add auth token to URL
    url += `&auth=${sessionStorage.getItem("admin_auth")}`

    // Open in new window
    window.open(url, "_blank")

    // Close bulk action modal
    setIsBulkActionModalOpen(false)
  }

  // Handle invoice selection
  const handleInvoiceSelection = (invoiceId) => {
    setSelectedInvoices((prev) => {
      if (prev.includes(invoiceId)) {
        return prev.filter((id) => id !== invoiceId)
      } else {
        return [...prev, invoiceId]
      }
    })
  }

  // Handle select all invoices
  const handleSelectAllInvoices = () => {
    if (selectedInvoices.length === invoices.length) {
      setSelectedInvoices([])
    } else {
      setSelectedInvoices(invoices.map((invoice) => invoice.id))
    }
  }

  // Print invoice
  const printInvoice = () => {
    if (!selectedInvoice) return

    // Create print content
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${selectedInvoice.id}</title>
        <style>
          @page {
            size: A4;
            margin: 1cm;
          }
          body {
            font-family: Arial, sans-serif;
            font-size: 12pt;
            line-height: 1.4;
            color: #333;
          }
          .invoice-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          .company-details {
            width: 50%;
          }
          .invoice-details {
            width: 50%;
            text-align: right;
          }
          .invoice-title {
            font-size: 24pt;
            font-weight: bold;
            margin-bottom: 20px;
            color: #2563eb;
          }
          .customer-details {
            margin-bottom: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th {
            background-color: #f3f4f6;
            text-align: left;
            padding: 10px;
            font-weight: bold;
            border-bottom: 2px solid #ddd;
          }
          td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
          }
          .totals {
            width: 300px;
            margin-left: auto;
          }
          .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
          }
          .totals-row.final {
            font-weight: bold;
            border-top: 2px solid #ddd;
            padding-top: 10px;
          }
          .payment-terms {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
          }
          .section-title {
            font-size: 16pt;
            font-weight: bold;
            margin-bottom: 10px;
            color: #2563eb;
          }
        </style>
      </head>
      <body>
        <div class="invoice-title">INVOICE</div>
        
        <div class="invoice-header">
          <div class="company-details">
            <div style="font-weight: bold; font-size: 14pt;">${companyDetails.name}</div>
            <div>${companyDetails.address}</div>
            <div>${companyDetails.city}, ${companyDetails.postcode}</div>
            <div>Phone: ${companyDetails.phone}</div>
            <div>Email: ${companyDetails.email}</div>
            <div>Company No: ${companyDetails.companyNumber}</div>
            <div>VAT No: ${companyDetails.vatNumber}</div>
          </div>
          
          <div class="invoice-details">
            <div><strong>Invoice Number:</strong> ${selectedInvoice.id}</div>
            <div><strong>Date:</strong> ${formatDate(selectedInvoice.date)}</div>
            <div><strong>Due Date:</strong> ${formatDate(selectedInvoice.due_date)}</div>
            <div><strong>Status:</strong> ${selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1)}</div>
            ${selectedInvoice.paid_date ? `<div><strong>Paid Date:</strong> ${formatDate(selectedInvoice.paid_date)}</div>` : ""}
          </div>
        </div>
        
        <div class="customer-details">
          <div class="section-title">Bill To</div>
          <div style="font-weight: bold;">${selectedInvoice.customer_name}</div>
        </div>
        
        <div class="section-title">Labor</div>
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Hours</th>
              <th>Rate (£/h)</th>
              <th>Total (£)</th>
            </tr>
          </thead>
          <tbody>
            ${selectedInvoice.labor
              .map(
                (item) => `
              <tr>
                <td>${item.description}</td>
                <td>${item.hours}</td>
                <td>${formatCurrency(item.hourlyRate)}</td>
                <td>${formatCurrency(item.total)}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
        
        <div class="section-title">Parts</div>
        <table>
          <thead>
            <tr>
              <th>Part Name</th>
              <th>Quantity</th>
              <th>Price (£)</th>
              <th>Total (£)</th>
            </tr>
          </thead>
          <tbody>
            ${selectedInvoice.parts
              .map(
                (part) => `
              <tr>
                <td>${part.name}</td>
                <td>${part.quantity}</td>
                <td>${formatCurrency(part.price)}</td>
                <td>${formatCurrency(part.total)}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
        
        <div class="totals">
          <div class="totals-row">
            <div>Subtotal:</div>
            <div>${formatCurrency(selectedInvoice.subtotal)}</div>
          </div>
          <div class="totals-row">
            <div>VAT (20%):</div>
            <div>${formatCurrency(selectedInvoice.tax)}</div>
          </div>
          <div class="totals-row final">
            <div>Total:</div>
            <div>${formatCurrency(selectedInvoice.total)}</div>
          </div>
        </div>
        
        <div class="payment-terms">
          <div><strong>Payment Terms:</strong> Payment is due upon receipt.</div>
          <div style="margin-top: 10px;">Thank you for your business!</div>
        </div>
      </body>
      </html>
    `

    // Create iframe for printing
    const printFrame = document.createElement("iframe")
    printFrame.style.position = "absolute"
    printFrame.style.top = "-9999px"
    printFrame.style.left = "-9999px"
    document.body.appendChild(printFrame)

    // Write content to iframe
    printFrame.contentDocument.write(printContent)
    printFrame.contentDocument.close()

    // Wait for content to load
    printFrame.onload = () => {
      // Print
      printFrame.contentWindow.print()

      // Remove iframe after printing
      setTimeout(() => {
        document.body.removeChild(printFrame)
      }, 1000)
    }
  }

  return (
    <div className="space-y-6">
      <AdminWarningBanner />

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Invoice Management</h1>
        <div className="flex space-x-2">
          {selectedInvoices.length > 0 && (
            <Button onClick={() => setIsBulkActionModalOpen(true)}>Bulk Actions ({selectedInvoices.length})</Button>
          )}
          <Button onClick={() => setIsFilterModalOpen(true)}>
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button onClick={handleCreateInvoice}>
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>
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
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8" onClick={handleSearch}>
                Search
              </Button>
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
                  <th className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selectedInvoices.length === invoices.length && invoices.length > 0}
                      onChange={handleSelectAllInvoices}
                      className="rounded border-gray-300"
                    />
                  </th>
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
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                      </div>
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No invoices found
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-3 py-4">
                        <input
                          type="checkbox"
                          checked={selectedInvoices.includes(invoice.id)}
                          onChange={() => handleInvoiceSelection(invoice.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400 mr-2" />
                          <div className="text-sm font-medium text-gray-900">{invoice.id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{invoice.customer_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(invoice.date)}</div>
                        <div className="text-xs text-gray-500">Due: {formatDate(invoice.due_date)}</div>
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
                        <Button variant="ghost" size="sm" onClick={() => handleViewInvoice(invoice.id)}>
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

          {/* Pagination */}
          {totalInvoices > 0 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, totalInvoices)} of{" "}
                {totalInvoices} invoices
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage * limit >= totalInvoices}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
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
                          {customers.map((customer) => (
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

                {/* Parts Items - Manual Entry */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium">Parts</h3>
                    <Button
                      size="sm"
                      onClick={() => {
                        setNewInvoice({
                          ...newInvoice,
                          parts: [...newInvoice.parts, { name: "", quantity: 1, price: 0, total: 0 }],
                        })
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Part
                    </Button>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Part Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price (£)</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total (£)</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"></th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {newInvoice.parts.map((part, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2">
                              <Input
                                value={part.name}
                                onChange={(e) => {
                                  const updatedParts = [...newInvoice.parts]
                                  updatedParts[index].name = e.target.value
                                  setNewInvoice({
                                    ...newInvoice,
                                    parts: updatedParts,
                                  })
                                }}
                                placeholder="Part name"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <Input
                                type="number"
                                min="1"
                                value={part.quantity}
                                onChange={(e) => {
                                  const updatedParts = [...newInvoice.parts]
                                  const quantity = Number.parseInt(e.target.value) || 1
                                  updatedParts[index].quantity = quantity
                                  updatedParts[index].total = quantity * updatedParts[index].price

                                  // Recalculate totals
                                  const laborTotal = newInvoice.labor.reduce((sum, item) => sum + item.total, 0)
                                  const partsTotal = updatedParts.reduce((sum, item) => sum + item.total, 0)
                                  const subtotal = laborTotal + partsTotal
                                  const tax = subtotal * 0.2 // 20% tax

                                  setNewInvoice({
                                    ...newInvoice,
                                    parts: updatedParts,
                                    subtotal,
                                    tax,
                                    total: subtotal + tax,
                                  })
                                }}
                                className="w-20"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={part.price}
                                onChange={(e) => {
                                  const updatedParts = [...newInvoice.parts]
                                  const price = Number.parseFloat(e.target.value) || 0
                                  updatedParts[index].price = price
                                  updatedParts[index].total = updatedParts[index].quantity * price

                                  // Recalculate totals
                                  const laborTotal = newInvoice.labor.reduce((sum, item) => sum + item.total, 0)
                                  const partsTotal = updatedParts.reduce((sum, item) => sum + item.total, 0)
                                  const subtotal = laborTotal + partsTotal
                                  const tax = subtotal * 0.2 // 20% tax

                                  setNewInvoice({
                                    ...newInvoice,
                                    parts: updatedParts,
                                    subtotal,
                                    tax,
                                    total: subtotal + tax,
                                  })
                                }}
                              />
                            </td>
                            <td className="px-4 py-2">
                              <div className="py-2 px-3 bg-gray-50 rounded">{formatCurrency(part.total)}</div>
                            </td>
                            <td className="px-4 py-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const updatedParts = [...newInvoice.parts]
                                  updatedParts.splice(index, 1)

                                  // Recalculate totals
                                  const laborTotal = newInvoice.labor.reduce((sum, item) => sum + item.total, 0)
                                  const partsTotal = updatedParts.reduce((sum, item) => sum + item.total, 0)
                                  const subtotal = laborTotal + partsTotal
                                  const tax = subtotal * 0.2 // 20% tax

                                  setNewInvoice({
                                    ...newInvoice,
                                    parts: updatedParts,
                                    subtotal,
                                    tax,
                                    total: subtotal + tax,
                                  })
                                }}
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
                    newInvoice.parts.some((item) => !item.name) ||
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
                  <Button variant="outline" size="sm" onClick={printInvoice}>
                    <Printer className="h-4 w-4 mr-1" />
                    Print
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open(
                        `/api/invoices/download.php?id=${selectedInvoice.id}&format=pdf&auth=${sessionStorage.getItem("admin_auth")}`,
                        "_blank",
                      )
                    }
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download PDF
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
                    <p className="text-gray-600">Due Date: {formatDate(selectedInvoice.due_date)}</p>
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
                    {selectedInvoice.paid_date && (
                      <p className="text-green-600">Paid on: {formatDate(selectedInvoice.paid_date)}</p>
                    )}
                  </div>
                </div>

                <div className="mt-6 border-t pt-6">
                  <h3 className="text-lg font-bold mb-2">Bill To</h3>
                  <p className="text-gray-800 font-medium">{selectedInvoice.customer_name}</p>
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

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Filter Invoices</h2>
                <button onClick={() => setIsFilterModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                      <Input
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">End Date</label>
                      <Input
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDateRange({ startDate: "", endDate: "" })
                    setCurrentPage(1)
                    setIsFilterModalOpen(false)
                    fetchInvoices()
                  }}
                >
                  Clear Filters
                </Button>
                <Button onClick={handleApplyFilter}>Apply Filters</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions Modal */}
      {isBulkActionModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Bulk Actions</h2>
                <button onClick={() => setIsBulkActionModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <p className="mb-4">Selected {selectedInvoices.length} invoice(s)</p>

              <div className="space-y-2">
                <Button className="w-full" onClick={() => handleBulkDownload("pdf")}>
                  <Download className="h-4 w-4 mr-2" />
                  Download as PDF
                </Button>
                <Button className="w-full" onClick={() => handleBulkDownload("csv")}>
                  <Download className="h-4 w-4 mr-2" />
                  Download as CSV
                </Button>
              </div>

              <div className="flex justify-end mt-6">
                <Button variant="outline" onClick={() => setIsBulkActionModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden iframe for printing */}
      <iframe ref={printFrameRef} style={{ display: "none" }} />
    </div>
  )
}
