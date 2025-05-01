/**
 * Admin Bookings Handler
 * This file contains the code to handle the admin bookings page
 */

document.addEventListener("DOMContentLoaded", () => {
  // Check if user is authenticated
  const token = sessionStorage.getItem("admin_auth")
  if (!token) {
    window.location.href = "/admin/login"
    return
  }

  const bookingsContainer = document.getElementById("bookings-container")
  const loadingIndicator = document.getElementById("loading-indicator")
  const refreshButton = document.getElementById("refresh-button")
  const statusFilter = document.getElementById("status-filter")

  // Load bookings on page load
  loadBookings()

  // Add event listener to refresh button
  if (refreshButton) {
    refreshButton.addEventListener("click", loadBookings)
  }

  // Add event listener to status filter
  if (statusFilter) {
    statusFilter.addEventListener("change", loadBookings)
  }

  // Mock functions for getBookings and updateBookingStatus
  // Replace these with your actual API call functions
  async function getBookings(token, filters) {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // Example data
        const bookings = [
          {
            id: 1,
            date: "2024-01-01",
            createdAt: "2024-01-01T10:00:00",
            name: "John Doe",
            email: "john.doe@example.com",
            phone: "123-456-7890",
            vehicle: "Toyota Camry",
            timeSlot: "9:00 AM",
            status: "pending",
          },
          {
            id: 2,
            date: "2024-01-05",
            createdAt: "2024-01-03T14:00:00",
            name: "Jane Smith",
            email: "jane.smith@example.com",
            phone: "987-654-3210",
            vehicle: "Honda Civic",
            timeSlot: "10:00 AM",
            status: "confirmed",
          },
        ]

        const filteredBookings = bookings.filter((booking) => {
          if (!filters.status) return true
          return booking.status === filters.status
        })

        resolve({ success: true, bookings: filteredBookings })
      }, 500)
    })
  }

  async function updateBookingStatus(bookingId, status, token) {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: "Booking status updated successfully" })
      }, 500)
    })
  }

  // Function to load bookings
  async function loadBookings() {
    if (loadingIndicator) {
      loadingIndicator.style.display = "flex"
    }

    if (bookingsContainer) {
      bookingsContainer.innerHTML = ""
    }

    try {
      // Get status filter value
      const status = statusFilter ? statusFilter.value : ""

      // Get bookings from API
      const response = await getBookings(token, { status })

      if (response.success) {
        renderBookings(response.bookings)
      } else {
        showError(response.message || "Failed to load bookings")
      }
    } catch (error) {
      showError("An error occurred while loading bookings")
    } finally {
      if (loadingIndicator) {
        loadingIndicator.style.display = "none"
      }
    }
  }

  // Function to render bookings
  function renderBookings(bookings) {
    if (!bookingsContainer) return

    if (bookings.length === 0) {
      bookingsContainer.innerHTML = '<div class="text-center py-8 text-gray-500">No bookings found</div>'
      return
    }

    // Create table
    const table = document.createElement("table")
    table.className = "min-w-full bg-white"

    // Create table header
    const thead = document.createElement("thead")
    thead.innerHTML = `
      <tr class="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
        <th class="py-3 px-6 text-left">Date</th>
        <th class="py-3 px-6 text-left">Customer</th>
        <th class="py-3 px-6 text-left">Vehicle</th>
        <th class="py-3 px-6 text-left">Time Slot</th>
        <th class="py-3 px-6 text-left">Status</th>
        <th class="py-3 px-6 text-left">Actions</th>
      </tr>
    `
    table.appendChild(thead)

    // Create table body
    const tbody = document.createElement("tbody")
    tbody.className = "text-gray-600 text-sm"

    bookings.forEach((booking) => {
      const tr = document.createElement("tr")
      tr.className = "border-b border-gray-200 hover:bg-gray-50"

      // Format date
      const date = new Date(booking.date)
      const formattedDate = date.toLocaleDateString()

      // Format created at
      const createdAt = new Date(booking.createdAt)
      const formattedCreatedAt = createdAt.toLocaleString()

      // Get status badge
      const statusBadge = getStatusBadge(booking.status)

      tr.innerHTML = `
        <td class="py-3 px-6">
          <div class="font-medium">${formattedDate}</div>
          <div class="text-xs text-gray-500">Created: ${formattedCreatedAt}</div>
        </td>
        <td class="py-3 px-6">
          <div>${booking.name}</div>
          <div class="text-xs text-gray-500">${booking.email}</div>
          <div class="text-xs text-gray-500">${booking.phone}</div>
        </td>
        <td class="py-3 px-6">${booking.vehicle}</td>
        <td class="py-3 px-6">${booking.timeSlot}</td>
        <td class="py-3 px-6">${statusBadge}</td>
        <td class="py-3 px-6">
          <div class="flex items-center">
            <select class="status-select mr-2 border border-gray-300 rounded-md px-2 py-1 text-sm" data-booking-id="${booking.id}">
              <option value="pending" ${booking.status === "pending" ? "selected" : ""}>Pending</option>
              <option value="confirmed" ${booking.status === "confirmed" ? "selected" : ""}>Confirmed</option>
              <option value="completed" ${booking.status === "completed" ? "selected" : ""}>Completed</option>
              <option value="cancelled" ${booking.status === "cancelled" ? "selected" : ""}>Cancelled</option>
            </select>
            <button class="update-status-btn bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded" data-booking-id="${booking.id}">
              Update
            </button>
          </div>
        </td>
      `

      tbody.appendChild(tr)
    })

    table.appendChild(tbody)
    bookingsContainer.appendChild(table)

    // Add event listeners to update status buttons
    const updateButtons = document.querySelectorAll(".update-status-btn")
    updateButtons.forEach((button) => {
      button.addEventListener("click", async (e) => {
        const bookingId = e.target.dataset.bookingId
        const select = document.querySelector(`.status-select[data-booking-id="${bookingId}"]`)
        const status = select.value

        // Disable button and select
        button.disabled = true
        select.disabled = true
        button.innerHTML = '<span class="spinner"></span>'

        try {
          // Update booking status
          const response = await updateBookingStatus(bookingId, status, token)

          if (response.success) {
            // Reload bookings
            loadBookings()
          } else {
            alert(response.message || "Failed to update booking status")
          }
        } catch (error) {
          alert("An error occurred while updating booking status")
        } finally {
          // Re-enable button and select
          button.disabled = false
          select.disabled = false
          button.innerHTML = "Update"
        }
      })
    })
  }

  // Function to get status badge HTML
  function getStatusBadge(status) {
    let badgeClass = ""
    const badgeText = status.charAt(0).toUpperCase() + status.slice(1)

    switch (status) {
      case "pending":
        badgeClass = "status-pending"
        break
      case "confirmed":
        badgeClass = "status-confirmed"
        break
      case "completed":
        badgeClass = "status-completed"
        break
      case "cancelled":
        badgeClass = "status-cancelled"
        break
    }

    return `<span class="status-badge ${badgeClass}">${badgeText}</span>`
  }

  // Function to show error
  function showError(message) {
    if (!bookingsContainer) return

    bookingsContainer.innerHTML = `
      <div class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
        <div class="flex">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>${message}</span>
        </div>
      </div>
    `
  }
})
