"use client"

export function PrintButton() {
  const handlePrint = () => {
    // Hide all nav/header elements before printing
    const toHide = Array.from(
      document.querySelectorAll("header, nav")
    ) as HTMLElement[]
    toHide.forEach(el => {
      el.dataset.printDisplay = el.style.display
      el.style.setProperty("display", "none", "important")
    })

    // Restore them once the print dialog closes
    const restore = () => {
      toHide.forEach(el => {
        el.style.display = el.dataset.printDisplay ?? ""
        delete el.dataset.printDisplay
      })
      window.removeEventListener("afterprint", restore)
    }
    window.addEventListener("afterprint", restore)

    window.print()
  }

  return (
    <button onClick={handlePrint}>
      Print / Save as PDF
    </button>
  )
}
