import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin - Bookings | Jamie's Auto Care",
  description: "Manage booking requests for Jamie's Auto Care",
}

export default function AdminBookingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Booking Requests</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">John Smith</div>
                  <div className="text-sm text-gray-500">john@example.com</div>
                  <div className="text-sm text-gray-500">07463451967</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">Ford Focus 2018</div>
                  <div className="text-sm text-gray-500">Engine making strange noise</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">15 Jun 2023</div>
                  <div className="text-sm text-gray-500">Morning (09:00 - 12:30)</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="status-badge status-pending">Pending</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                  <button className="text-green-600 hover:text-green-900 mr-3">Confirm</button>
                  <button className="text-red-600 hover:text-red-900">Cancel</button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">Sarah Johnson</div>
                  <div className="text-sm text-gray-500">sarah@example.com</div>
                  <div className="text-sm text-gray-500">07712345678</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">Audi A4 2020</div>
                  <div className="text-sm text-gray-500">Brake pads need replacing</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">16 Jun 2023</div>
                  <div className="text-sm text-gray-500">Afternoon (13:30 - 17:30)</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="status-badge status-confirmed">Confirmed</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                  <button className="text-green-600 hover:text-green-900 mr-3">Complete</button>
                  <button className="text-red-600 hover:text-red-900">Cancel</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
