"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { logoutAdmin } from "./actions"

const TIMEOUT_MS = 30 * 60 * 1000   // 30 minutes
const WARNING_MS =  2 * 60 * 1000   // warn 2 minutes before logout

export function InactivityGuard() {
  const router  = useRouter()
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [showWarning, setShowWarning] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearAll = () => {
    if (timerRef.current)   clearTimeout(timerRef.current)
    if (warningRef.current) clearTimeout(warningRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)
  }

  const doLogout = useCallback(async () => {
    clearAll()
    await logoutAdmin()
    router.push("/admin/login")
  }, [router])

  const resetTimer = useCallback(() => {
    clearAll()
    setShowWarning(false)

    warningRef.current = setTimeout(() => {
      setShowWarning(true)
      setSecondsLeft(WARNING_MS / 1000)
      countdownRef.current = setInterval(() => {
        setSecondsLeft(s => {
          if (s <= 1) {
            clearInterval(countdownRef.current!)
            return 0
          }
          return s - 1
        })
      }, 1000)
    }, TIMEOUT_MS - WARNING_MS)

    timerRef.current = setTimeout(doLogout, TIMEOUT_MS)
  }, [doLogout])

  useEffect(() => {
    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"]
    const handler = () => resetTimer()
    events.forEach(e => window.addEventListener(e, handler, { passive: true }))
    resetTimer()
    return () => {
      clearAll()
      events.forEach(e => window.removeEventListener(e, handler))
    }
  }, [resetTimer])

  if (!showWarning) return null

  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-yellow-900 border border-yellow-600 text-yellow-100 rounded-lg shadow-xl px-5 py-4 max-w-sm">
      <p className="font-semibold text-sm mb-1">Session expiring soon</p>
      <p className="text-xs text-yellow-300 mb-3">
        You&apos;ll be logged out in {mins > 0 ? `${mins}m ` : ""}{String(secs).padStart(2, "0")}s due to inactivity.
      </p>
      <div className="flex gap-2">
        <button
          onClick={resetTimer}
          className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-medium py-1.5 rounded transition-colors"
        >
          Stay logged in
        </button>
        <button
          onClick={doLogout}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs font-medium py-1.5 rounded transition-colors"
        >
          Log out now
        </button>
      </div>
    </div>
  )
}
