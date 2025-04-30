// This will be loaded by the static HTML page
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("booking-form")
  const statusMessage = document.getElementById("form-status")

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault()

      // Show loading state
      const submitButton = form.querySelector('button[type="submit"]')
      const originalButtonText = submitButton.innerHTML
      submitButton.disabled = true
      submitButton.innerHTML = '<span class="spinner"></span> Processing...'

      // Collect form data
      const formData = new FormData(form)
      const data = {}
      formData.forEach((value, key) => {
        data[key] = value
      })

      try {
        // Submit to PHP API
        const response = await fetch("/api/submit-booking.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })

        const result = await response.json()

        if (result.success) {
          // Show success message
          statusMessage.innerHTML = `
            <div class="success-message">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              <div>
                <h3>Booking Received!</h3>
                <p>Thank you for your booking request. We'll contact you shortly to confirm your appointment. A confirmation email has been sent to your email address.</p>
              </div>
            </div>
          `
          form.reset()
        } else {
          // Show error message
          statusMessage.innerHTML = `
            <div class="error-message">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <div>
                <h3>Error</h3>
                <p>${result.message || "Failed to submit booking. Please try again."}</p>
              </div>
            </div>
          `
        }
      } catch (error) {
        // Show error message
        statusMessage.innerHTML = `
          <div class="error-message">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <div>
              <h3>Error</h3>
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
