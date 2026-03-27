"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import Image from "next/image"

const NAV_LINKS = [
  { label: "Services",        href: "/#services",       highlight: false },
  { label: "Pricing",         href: "/pricing",          highlight: false },
  { label: "Our Work",        href: "/#portfolio",       highlight: false },
  { label: "Reviews",         href: "/#reviews",         highlight: false },
  { label: "What to Expect",  href: "/what-to-expect",   highlight: false },
  { label: "FAQ",             href: "/faq",              highlight: false },
  { label: "Blog",            href: "/blog",             highlight: false },
  { label: "Contact",         href: "/#contact",         highlight: false },
]

export default function SiteNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  if (pathname.startsWith("/admin")) return null

  return (
    <header className="bg-blue-950 text-white sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">

          {/* Brand */}
          <a href="/" className="flex-shrink-0 hover:opacity-85 transition-opacity">
            <Image
              src="/images/Logo.png"
              alt="Jamie's Auto Care"
              width={140}
              height={48}
              className="h-10 w-auto"
              priority
            />
          </a>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <a
                key={link.href}
                href={link.href}
                className={
                  link.highlight
                    ? "px-3 py-1.5 text-sm rounded font-semibold text-red-300 hover:text-red-200 hover:bg-red-900/40 transition-colors whitespace-nowrap flex items-center gap-1"
                    : "px-3 py-1.5 text-sm rounded hover:text-orange-300 hover:bg-blue-900 transition-colors whitespace-nowrap"
                }
              >
                {link.highlight && <AlertTriangle className="h-3.5 w-3.5" />}
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <a
              href="/#booking"
              className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded font-medium text-sm transition-colors whitespace-nowrap"
            >
              Book Now
            </a>
            {/* Mobile hamburger */}
            <button
              onClick={() => setOpen(v => !v)}
              className="lg:hidden p-2 rounded hover:bg-blue-900 transition-colors"
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="lg:hidden border-t border-blue-900 bg-blue-950">
          <nav className="container mx-auto px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map(link => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={
                  link.highlight
                    ? "px-3 py-2.5 text-sm rounded font-semibold text-red-300 hover:text-red-200 hover:bg-red-900/40 transition-colors flex items-center gap-1.5"
                    : "px-3 py-2.5 text-sm rounded hover:text-orange-300 hover:bg-blue-900 transition-colors"
                }
              >
                {link.highlight && <AlertTriangle className="h-3.5 w-3.5" />}
                {link.label}
              </a>
            ))}
            <a
              href="/#booking"
              onClick={() => setOpen(false)}
              className="mt-2 bg-orange-600 hover:bg-orange-700 px-4 py-2.5 rounded font-medium text-sm text-center transition-colors"
            >
              Book Now
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
