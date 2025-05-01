export default function AdminSettingsPage() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Settings</h1>

      <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-md mb-6">
        <p>
          <strong>Test Mode:</strong> This is a placeholder for the admin settings page. In a real application, this
          would allow you to configure various settings for your website.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Business Information</h2>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="business-name" className="block text-sm font-medium text-gray-700">
                Business Name
              </label>
              <input
                type="text"
                id="business-name"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                defaultValue="Jamie's Auto Care"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="text"
                id="phone"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                defaultValue="(123) 456-7890"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                defaultValue="info@jamiesautocare.com"
              />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Business Address
              </label>
              <input
                type="text"
                id="address"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                defaultValue="123 Main St, Edinburgh, UK"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium text-gray-900">Business Hours</h2>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="weekday-hours" className="block text-sm font-medium text-gray-700">
                Weekday Hours
              </label>
              <input
                type="text"
                id="weekday-hours"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                defaultValue="9:00 AM - 5:30 PM"
              />
            </div>
            <div>
              <label htmlFor="weekend-hours" className="block text-sm font-medium text-gray-700">
                Weekend Hours
              </label>
              <input
                type="text"
                id="weekend-hours"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                defaultValue="10:30 AM - 1:30 PM"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium text-gray-900">Admin Account</h2>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                type="password"
                id="new-password"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirm-password"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
          </div>
        </div>

        <div className="pt-5">
          <div className="flex justify-end">
            <button
              type="button"
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
