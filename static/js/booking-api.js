/**
 * Booking API Client
 * This file contains functions to interact with the booking API
 */

// Base URL for API endpoints
const API_BASE_URL = "/api"

/**
 * Create a new booking
 * @param {Object} bookingData - The booking data
 * @returns {Promise<Object>} - The API response
 */
async function createBooking(bookingData) {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/create.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    })

    return await response.json()
  } catch (error) {
    console.error("Error creating booking:", error)
    return {
      success: false,
      message: "An error occurred while creating the booking. Please try again.",
    }
  }
}

/**
 * Get all bookings (admin only)
 * @param {string} token - Admin authentication token
 * @param {Object} options - Query options (status, limit, offset)
 * @returns {Promise<Object>} - The API response
 */
async function getBookings(token, options = {}) {
  try {
    // Build query string
    const queryParams = new URLSearchParams()
    if (options.status) queryParams.append("status", options.status)
    if (options.limit) queryParams.append("limit", options.limit)
    if (options.offset) queryParams.append("offset", options.offset)

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""

    const response = await fetch(`${API_BASE_URL}/bookings/index.php${queryString}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return await response.json()
  } catch (error) {
    console.error("Error getting bookings:", error)
    return {
      success: false,
      message: "An error occurred while fetching bookings. Please try again.",
    }
  }
}

/**
 * Get a single booking
 * @param {string} id - Booking ID
 * @param {string} token - Admin authentication token or cancellation token
 * @param {boolean} isAdmin - Whether the token is an admin token
 * @returns {Promise<Object>} - The API response
 */
async function getBooking(id, token, isAdmin = true) {
  try {
    let url = `${API_BASE_URL}/bookings/get.php?id=${id}`

    // If not admin, add token as query parameter
    if (!isAdmin) {
      url += `&token=${token}`
    }

    const headers = isAdmin ? { Authorization: `Bearer ${token}` } : {}

    const response = await fetch(url, {
      method: "GET",
      headers,
    })

    return await response.json()
  } catch (error) {
    console.error("Error getting booking:", error)
    return {
      success: false,
      message: "An error occurred while fetching the booking. Please try again.",
    }
  }
}

/**
 * Update booking status (admin only)
 * @param {string} id - Booking ID
 * @param {string} status - New status
 * @param {string} token - Admin authentication token
 * @returns {Promise<Object>} - The API response
 */
async function updateBookingStatus(id, status, token) {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/update-status.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id, status }),
    })

    return await response.json()
  } catch (error) {
    console.error("Error updating booking status:", error)
    return {
      success: false,
      message: "An error occurred while updating the booking status. Please try again.",
    }
  }
}

/**
 * Cancel a booking
 * @param {string} id - Booking ID
 * @param {string} token - Cancellation token
 * @returns {Promise<Object>} - The API response
 */
async function cancelBooking(id, token) {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/cancel.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, token }),
    })

    return await response.json()
  } catch (error) {
    console.error("Error cancelling booking:", error)
    return {
      success: false,
      message: "An error occurred while cancelling the booking. Please try again.",
    }
  }
}
