/**
 * Booking Form Handler
 * This file contains the code to handle the booking form submission
 */

// Import the createBooking function (assuming it's in a separate module)
import { createBooking } from "./api.js" // Adjust the path as needed

document.addEventListener("DOMContentLoaded", () => {
  const bookingForm = document.getElementById("booking-form")
  const formStatus = document.getElementById("form-status")

  if (bookingForm) {
    // Set minimum date for booking (1 day from today)
    const dateInput = document.getElementById("date")
    if (dateInput) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      dateInput.min = tomorrow.toISOString().split("T")[0]
    }

    bookingForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      // Show loading state
      const submitButton = bookingForm.querySelector('button[type="submit"]')
      const originalButtonText = submitButton.innerHTML
      submitButton.disabled = true
      submitButton.innerHTML = '<span class="spinner"></span> Processing...'

      // Collect form data
      const formData = new FormData(bookingForm)
      const bookingData = {}

      formData.forEach((value, key) => {
        bookingData[key] = value
      })

      try {
        // Submit booking using the API
        const response = await createBooking(bookingData)

        if (response.success) {
          // Show success message
          formStatus.innerHTML = `
            <div class="success-message">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              <div>
                <h3 class="font-bold">Booking Received!</h3>
                <p>Thank you for your booking request. We'll contact you shortly to confirm your appointment. A confirmation email has been sent to your email address.</p>
              </div>
            </div>
          `
          bookingForm.reset()
        } else {
          // Show error message
          formStatus.innerHTML = `
            <div class="error-message">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <div>
                <h3 class="font-bold">Error</h3>
                <p>${response.message || "Failed to submit booking. Please try again."}</p>
              </div>
            </div>
          `
        }
      } catch (error) {
        // Show error message
        formStatus.innerHTML = `
          <div class="error-message">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <div>
              <h3 class="font-bold">Error</h3>
              <p>Something went wrong. Please try again later.</p>
            </div>
          </div>
        `
      } finally {
        // Restore button state
        submitButton.disabled = false
        submitButton.innerHTML = originalButtonText
      }
    })
  }
})
