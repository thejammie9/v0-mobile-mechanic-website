"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Edit, Trash, XCircle, AlertTriangle } from "lucide-react"
import { AdminWarningBanner } from "@/components/admin-warning-banner"

// Mock data for parts
const mockParts = [
  {
    id: "part_001",
    name: "Oil Filter",
    price: 15,
    cost: 8,
    stock: 12,
    minStock: 5,
    category: "Filters",
    isVehicleSpecific: false,
  },
  {
    id: "part_002",
    name: "Air Filter",
    price: 12,
    cost: 6,
    stock: 8,
    minStock: 4,
    category: "Filters",
    isVehicleSpecific: false,
  },
  {
    id: "part_003",
    name: "Brake Pads (Front)",
    price: 45,
    cost: 25,
    stock: 6,
    minStock: 2,
    category: "Brakes",
    isVehicleSpecific: true,
  },
  {
    id: "part_004",
    name: "Brake Pads (Rear)",
    price: 40,
    cost: 22,
    stock: 4,
    minStock: 2,
    category: "Brakes",
    isVehicleSpecific: true,
  },
  {
    id: "part_005",
    name: "Battery",
    price: 85,
    cost: 50,
    stock: 3,
    minStock: 2,
    category: "Electrical",
    isVehicleSpecific: false,
  },
  {
    id: "part_006",
    name: "Spark Plugs (set of 4)",
    price: 28,
    cost: 15,
    stock: 10,
    minStock: 4,
    category: "Engine",
    isVehicleSpecific: false,
  },
  {
    id: "part_007",
    name: "Wiper Blades (pair)",
    price: 25,
    cost: 12,
    stock: 15,
    minStock: 5,
    category: "Exterior",
    isVehicleSpecific: false,
  },
  {
    id: "part_008",
    name: "Engine Oil (5L)",
    price: 35,
    cost: 20,
    stock: 20,
    minStock: 8,
    category: "Fluids",
    isVehicleSpecific: false,
  },
  {
    id: "part_009",
    name: "Coolant (2L)",
    price: 18,
    cost: 9,
    stock: 14,
    minStock: 6,
    category: "Fluids",
    isVehicleSpecific: false,
  },
  {
    id: "part_010",
    name: "Timing Belt Kit",
    price: 120,
    cost: 75,
    stock: 2,
    minStock: 1,
    category: "Engine",
    isVehicleSpecific: true,
  },
  {
    id: "part_011",
    name: "Vehicle-Specific Part",
    price: 0,
    cost: 0,
    stock: 999,
    minStock: 0,
    category: "Vehicle-Specific",
    isVehicleSpecific: true,
  },
]

export default function PartsPage() {
  const [parts, setParts] = useState(mockParts)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedPart, setSelectedPart] = useState(null)
  const [typeFilter, setTypeFilter] = useState("")
  const [partForm, setPartForm] = useState({
    name: "",
    price: 0,
    cost: 0,
    stock: 0,
    minStock: 0,
    category: "",
    isVehicleSpecific: false,
  })

  // Get unique categories
  const categories = [...new Set(parts.map((part) => part.category))].sort()

  // Filter parts based on search term, category, and type
  const filteredParts = parts.filter((part) => {
    // Filter by search term
    if (
      searchTerm &&
      !part.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !part.category.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false
    }

    // Filter by category
    if (categoryFilter && part.category !== categoryFilter) {
      return false
    }

    // Filter by type
    if (typeFilter === "standard" && part.isVehicleSpecific) {
      return false
    }
    if (typeFilter === "vehicle-specific" && !part.isVehicleSpecific) {
      return false
    }

    return true
  })

  // Handle add part
  const handleAddPart = () => {
    setPartForm({
      name: "",
      price: 0,
      cost: 0,
      stock: 0,
      minStock: 0,
      category: "",
      isVehicleSpecific: false,
    })
    setIsAddModalOpen(true)
  }

  // Handle edit part
  const handleEditPart = (part) => {
    setSelectedPart(part)
    setPartForm({
      name: part.name,
      price: part.price,
      cost: part.cost,
      stock: part.stock,
      minStock: part.minStock,
      category: part.category,
      isVehicleSpecific: part.isVehicleSpecific,
    })
    setIsEditModalOpen(true)
  }

  // Handle delete part
  const handleDeletePart = (part) => {
    setSelectedPart(part)
    setIsDeleteModalOpen(true)
  }

  // Submit add part form
  const submitAddPartForm = () => {
    const newPart = {
      id: `part_${Math.floor(1000 + Math.random() * 9000)}`,
      ...partForm,
    }
    setParts([...parts, newPart])
    setIsAddModalOpen(false)
  }

  // Submit edit part form
  const submitEditPartForm = () => {
    const updatedParts = parts.map((part) =>
      part.id === selectedPart.id
        ? {
            ...part,
            ...partForm,
          }
        : part,
    )
    setParts(updatedParts)
    setIsEditModalOpen(false)
  }

  // Confirm delete part
  const confirmDeletePart = () => {
    const updatedParts = parts.filter((part) => part.id !== selectedPart.id)
    setParts(updatedParts)
    setIsDeleteModalOpen(false)
  }

  // Format currency
  const formatCurrency = (amount) => {
    return `£${amount.toFixed(2)}`
  }

  return (
    <div className="space-y-6">
      <AdminWarningBanner />

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Parts Inventory</h1>
        <Button onClick={handleAddPart}>
          <Plus className="h-4 w-4 mr-2" />
          Add Part
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Parts Catalog</CardTitle>
            <CardDescription>Manage your parts inventory and pricing</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search parts by name or category"
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                className="h-10 rounded-md border border-input bg-background px-3 py-2"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <select
                className="h-10 rounded-md border border-input bg-background px-3 py-2"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="standard">Standard</option>
                <option value="vehicle-specific">Vehicle-Specific</option>
              </select>
            </div>

            {/* Parts Table */}
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Part Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Category
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Price
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Cost
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Stock
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Type
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
                  {filteredParts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        No parts found
                      </td>
                    </tr>
                  ) : (
                    filteredParts.map((part) => (
                      <tr key={part.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{part.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{part.category}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 group relative">
                            {part.isVehicleSpecific ? "Variable" : formatCurrency(part.price)}
                            <button
                              className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation()
                                const newPrice = prompt("Enter new price:", part.price.toString())
                                if (newPrice !== null) {
                                  const updatedParts = parts.map((p) =>
                                    p.id === part.id ? { ...p, price: Number.parseFloat(newPrice) || p.price } : p,
                                  )
                                  setParts(updatedParts)
                                }
                              }}
                            >
                              <Edit className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatCurrency(part.cost)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className={`text-sm font-medium ${
                              part.stock <= part.minStock ? "text-red-600" : "text-gray-900"
                            }`}
                          >
                            {part.stock}{" "}
                            {part.stock <= part.minStock && (
                              <AlertTriangle className="h-4 w-4 inline ml-1 text-red-600" />
                            )}
                          </div>
                          <div className="text-xs text-gray-500">Min: {part.minStock}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {part.isVehicleSpecific ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                Vehicle-Specific
                              </span>
                            ) : (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Standard
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => handleEditPart(part)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-800"
                            onClick={() => handleDeletePart(part)}
                          >
                            <Trash className="h-4 w-4 mr-1" />
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

        <Card>
          <CardHeader>
            <CardTitle>Inventory Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Total Parts</h3>
                <p className="text-2xl font-bold">{parts.length}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Total Value</h3>
                <p className="text-2xl font-bold">
                  {formatCurrency(parts.reduce((sum, part) => sum + part.price * part.stock, 0))}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Low Stock Items</h3>
                <p className="text-2xl font-bold">{parts.filter((part) => part.stock <= part.minStock).length}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Categories</h3>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Low Stock Alert</h3>
              {parts.filter((part) => part.stock <= part.minStock).length === 0 ? (
                <p className="text-sm text-gray-600">No parts are low on stock</p>
              ) : (
                <div className="space-y-2">
                  {parts
                    .filter((part) => part.stock <= part.minStock)
                    .map((part) => (
                      <div key={part.id} className="flex items-center justify-between bg-red-50 p-2 rounded">
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                          <span className="text-sm">{part.name}</span>
                        </div>
                        <span className="text-sm font-medium">
                          {part.stock}/{part.minStock}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Part Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Add New Part</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Part Name</label>
                  <Input
                    value={partForm.name}
                    onChange={(e) => setPartForm({ ...partForm, name: e.target.value })}
                    placeholder="Part name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <Input
                    value={partForm.category}
                    onChange={(e) => setPartForm({ ...partForm, category: e.target.value })}
                    placeholder="Category"
                    list="categories"
                  />
                  <datalist id="categories">
                    {categories.map((category) => (
                      <option key={category} value={category} />
                    ))}
                  </datalist>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price (£)</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={partForm.price}
                      onChange={(e) => setPartForm({ ...partForm, price: Number.parseFloat(e.target.value) })}
                      disabled={partForm.isVehicleSpecific}
                    />
                    {partForm.isVehicleSpecific && (
                      <p className="text-xs text-gray-500 mt-1">Price will be set per vehicle</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price (£)</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={partForm.cost}
                      onChange={(e) => setPartForm({ ...partForm, cost: Number.parseFloat(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Stock</label>
                    <Input
                      type="number"
                      min="0"
                      value={partForm.stock}
                      onChange={(e) => setPartForm({ ...partForm, stock: Number.parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Stock</label>
                    <Input
                      type="number"
                      min="0"
                      value={partForm.minStock}
                      onChange={(e) => setPartForm({ ...partForm, minStock: Number.parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isVehicleSpecific"
                    checked={partForm.isVehicleSpecific}
                    onChange={(e) => setPartForm({ ...partForm, isVehicleSpecific: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isVehicleSpecific" className="ml-2 block text-sm text-gray-900">
                    Vehicle-specific part (price varies by vehicle)
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={submitAddPartForm}
                  disabled={
                    !partForm.name || !partForm.category || (!partForm.isVehicleSpecific && partForm.price <= 0)
                  }
                >
                  Add Part
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Part Modal */}
      {isEditModalOpen && selectedPart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Edit Part</h2>
                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Part Name</label>
                  <Input
                    value={partForm.name}
                    onChange={(e) => setPartForm({ ...partForm, name: e.target.value })}
                    placeholder="Part name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <Input
                    value={partForm.category}
                    onChange={(e) => setPartForm({ ...partForm, category: e.target.value })}
                    placeholder="Category"
                    list="edit-categories"
                  />
                  <datalist id="edit-categories">
                    {categories.map((category) => (
                      <option key={category} value={category} />
                    ))}
                  </datalist>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price (£)</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={partForm.price}
                      onChange={(e) => setPartForm({ ...partForm, price: Number.parseFloat(e.target.value) })}
                      disabled={partForm.isVehicleSpecific}
                    />
                    {partForm.isVehicleSpecific && (
                      <p className="text-xs text-gray-500 mt-1">Price will be set per vehicle</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price (£)</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={partForm.cost}
                      onChange={(e) => setPartForm({ ...partForm, cost: Number.parseFloat(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Stock</label>
                    <Input
                      type="number"
                      min="0"
                      value={partForm.stock}
                      onChange={(e) => setPartForm({ ...partForm, stock: Number.parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Stock</label>
                    <Input
                      type="number"
                      min="0"
                      value={partForm.minStock}
                      onChange={(e) => setPartForm({ ...partForm, minStock: Number.parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="editIsVehicleSpecific"
                    checked={partForm.isVehicleSpecific}
                    onChange={(e) => setPartForm({ ...partForm, isVehicleSpecific: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="editIsVehicleSpecific" className="ml-2 block text-sm text-gray-900">
                    Vehicle-specific part (price varies by vehicle)
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={submitEditPartForm}
                  disabled={
                    !partForm.name || !partForm.category || (!partForm.isVehicleSpecific && partForm.price <= 0)
                  }
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Part Modal */}
      {isDeleteModalOpen && selectedPart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Delete Part</h2>
                <button onClick={() => setIsDeleteModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-700">
                  Are you sure you want to delete <span className="font-bold">{selectedPart.name}</span>? This action
                  cannot be undone.
                </p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDeletePart}>
                  Delete Part
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
