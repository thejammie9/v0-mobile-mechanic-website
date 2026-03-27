"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"

export type CustomerVehicleResult = {
  id: number
  make_model: string
  reg: string | null
  year: string | null
}

export type CustomerResult = {
  id: number
  name: string
  email: string
  phone: string | null
  address: string | null
  vehicles: CustomerVehicleResult[]
}

interface Props {
  value: string
  onChange: (value: string) => void
  onCustomerSelect: (customer: CustomerResult) => void
  placeholder?: string
  className?: string
}

export function CustomerNameAutocomplete({
  value,
  onChange,
  onCustomerSelect,
  placeholder = "John Smith",
  className = "",
}: Props) {
  const [suggestions, setSuggestions] = useState<CustomerResult[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const q = value.trim()
    if (q.length < 1) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/customers/search?q=${encodeURIComponent(q)}`)
        const data = await res.json()
        const results: CustomerResult[] = data.customers || []
        setSuggestions(results)
        setShowDropdown(results.length > 0)
      } catch {}
    }, 200)
    return () => clearTimeout(timer)
  }, [value])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleSelect = (c: CustomerResult) => {
    onCustomerSelect(c)
    setSuggestions([])
    setShowDropdown(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <Input
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => { if (suggestions.length > 0) setShowDropdown(true) }}
        placeholder={placeholder}
        autoComplete="off"
        className={className}
      />
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-xl overflow-hidden">
          {suggestions.map(c => (
            <button
              key={c.id}
              type="button"
              onMouseDown={e => { e.preventDefault(); handleSelect(c) }}
              className="w-full text-left px-4 py-2.5 hover:bg-gray-700 border-b border-gray-700 last:border-0 transition-colors"
            >
              <div className="text-gray-100 text-sm font-medium">{c.name}</div>
              <div className="text-gray-400 text-xs mt-0.5">
                {c.email}
                {c.phone ? ` · ${c.phone}` : ""}
                {c.vehicles.length > 0 && ` · ${c.vehicles.length} vehicle${c.vehicles.length !== 1 ? "s" : ""}`}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function formatVehicleLabel(v: CustomerVehicleResult): string {
  const parts = [v.make_model]
  if (v.reg) parts.push(v.reg)
  if (v.year) parts.push(v.year)
  return parts.join(" · ")
}
