/**
 * Admin Login Handler
 * This file contains the code to handle the admin login form
 */

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("admin-login-form")
  const errorMessage = document.getElementById("error-message")

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      // Show loading state
      const submitButton = loginForm.querySelector('button[type="submit"]')
      const originalButtonText = submitButton.innerHTML
      submitButton.disabled = true
      submitButton.innerHTML = '<span class="spinner"></span> Logging in...'

      // Hide error message
      if (errorMessage) {
        errorMessage.style.display = "none"
      }

      // Get password
      const password = document.getElementById("password").value

      // For static export, we'll use a simple client-side check
      // In production, you would use a more secure method
      if (password === "admin123") {
        // Replace with your actual admin password
        // Set a session storage item to indicate logged in status
        sessionStorage.setItem("admin_auth", password)

        // Redirect to admin dashboard
        window.location.href = "/admin/bookings"
      } else {
        // Show error message
        if (errorMessage) {
          errorMessage.textContent = "Invalid password"
          errorMessage.style.display = "block"
        }

        // Restore button state
        submitButton.disabled = false
        submitButton.innerHTML = originalButtonText
      }
    })
  }
})
