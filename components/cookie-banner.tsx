"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"

const CONSENT_KEY = "cookie_consent"

function injectGA(gaId: string) {
  if (document.getElementById("ga4-script")) return
  const s1 = document.createElement("script")
  s1.id = "ga4-script"
  s1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
  s1.async = true
  document.head.appendChild(s1)

  const s2 = document.createElement("script")
  s2.id = "ga4-init"
  s2.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`
  document.head.appendChild(s2)
}

export default function CookieBanner({ gaId }: { gaId?: string }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(CONSENT_KEY)
    if (saved === "accepted" && gaId) {
      injectGA(gaId)
    } else if (!saved) {
      setVisible(true)
    }
  }, [gaId])

  const accept = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, "accepted")
    setVisible(false)
    if (gaId) injectGA(gaId)
  }, [gaId])

  const decline = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, "declined")
    setVisible(false)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-blue-950 border-t border-blue-800 shadow-2xl">
      <div className="container mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-sm text-gray-300 max-w-2xl">
          We use cookies to analyse site traffic and improve your experience. Your data is never
          sold.{" "}
          <Link href="/privacy" className="text-orange-400 hover:text-orange-300 underline">
            Privacy Policy
          </Link>
        </p>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={decline}
            className="px-4 py-2 text-sm rounded border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 text-sm rounded bg-orange-600 hover:bg-orange-700 text-white font-medium transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
