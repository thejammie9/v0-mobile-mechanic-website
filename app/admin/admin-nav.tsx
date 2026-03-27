"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { logoutAdmin } from "@/app/admin/actions"
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Wrench,
  Mail,
  CalendarDays,
  Car,
  Receipt,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Tag,
  ClipboardCheck,
  TrendingUp,
  PoundSterling,
  Hammer,
  CalendarClock,
  BarChart3,
  Search,
  UserCog,
  ImageIcon,
} from "lucide-react"

// Links visible to all roles
const coreLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/calendar", label: "Calendar", icon: CalendarDays, exact: false },
  { href: "/admin/jobs", label: "Jobs", icon: ClipboardCheck, exact: false },
  { href: "/admin/customers", label: "Customers", icon: Users, exact: false },
]

// Links visible to admin only
const adminLinks = [
  { href: "/admin/settings", label: "Settings", icon: Settings, exact: false },
  { href: "/admin/users", label: "Users", icon: UserCog, exact: false },
]

// Grouped submenus (admin only)
const submenus = [
  {
    key: "finance",
    label: "Finance",
    icon: PoundSterling,
    items: [
      { href: "/admin/invoices", label: "Invoices", icon: FileText },
      { href: "/admin/quotes", label: "Quotes", icon: ClipboardList },
      { href: "/admin/reports", label: "Reports", icon: TrendingUp },
      { href: "/admin/expenses", label: "Expenses", icon: Receipt },
      { href: "/admin/mileage", label: "Mileage", icon: Car },
    ],
  },
  {
    key: "tools",
    label: "Tools",
    icon: Hammer,
    items: [
      { href: "/admin/availability", label: "Availability", icon: CalendarClock },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/admin/seo", label: "SEO", icon: Search },
      { href: "/admin/emails", label: "Emails", icon: Mail },
    ],
  },
  {
    key: "content",
    label: "Content",
    icon: BookOpen,
    items: [
      { href: "/admin/blog", label: "Blog", icon: BookOpen },
      { href: "/admin/pricing", label: "Pricing", icon: Tag },
      { href: "/admin/portfolio", label: "Our Work", icon: ImageIcon },
    ],
  },
]

export default function AdminNav({ role }: { role: "admin" | "staff" }) {
  const standaloneLinks = role === "admin" ? [...coreLinks, ...adminLinks] : coreLinks
  const visibleSubmenus = role === "admin" ? submenus : []
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const navRef = useRef<HTMLDivElement>(null)

  // On mobile, auto-expand the relevant group when navigating to a child page
  useEffect(() => {
    for (const sub of visibleSubmenus) {
      if (sub.items.some((item) => pathname.startsWith(item.href))) {
        setMobileExpanded(sub.key)
        return
      }
    }
  }, [pathname, visibleSubmenus])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(href + "/")
  }

  const isSubmenuActive = (sub: (typeof visibleSubmenus)[0]) =>
    sub.items.some((item) => pathname === item.href || pathname.startsWith(item.href + "/"))

  const handleLogout = async () => {
    await logoutAdmin()
    router.push("/admin/login")
    router.refresh()
  }

  const toggleDesktop = (key: string) =>
    setOpenMenu((prev) => (prev === key ? null : key))

  const toggleMobile = (key: string) =>
    setMobileExpanded((prev) => (prev === key ? null : key))

  return (
    <nav className="bg-blue-950 text-white shadow-md sticky top-0 z-50" ref={navRef}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg hover:text-orange-400 transition-colors flex-shrink-0"
          >
            <Wrench className="h-5 w-5 text-orange-500" />
            <span className="hidden sm:inline">Jamie&apos;s Auto Care</span>
            <span className="sm:hidden">JAC</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {/* Standalone links */}
            {standaloneLinks.map((link) => {
              const Icon = link.icon
              const active = isActive(link.href, link.exact)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-2.5 py-2 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? "bg-blue-800 text-white"
                      : "text-blue-200 hover:bg-blue-900 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              )
            })}

            {/* Submenus */}
            {visibleSubmenus.map((sub) => {
              const Icon = sub.icon
              const active = isSubmenuActive(sub)
              const open = openMenu === sub.key
              return (
                <div key={sub.key} className="relative">
                  <button
                    onClick={() => toggleDesktop(sub.key)}
                    className={`flex items-center gap-1.5 px-2.5 py-2 rounded-md text-sm font-medium transition-colors ${
                      active
                        ? "bg-blue-800 text-white"
                        : "text-blue-200 hover:bg-blue-900 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {sub.label}
                    {open ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </button>

                  {open && (
                    <div className="absolute top-full left-0 mt-1 w-44 bg-blue-900 rounded-md shadow-lg border border-blue-800 py-1 z-10">
                      {sub.items.map((item) => {
                        const ItemIcon = item.icon
                        const itemActive = isActive(item.href, false)
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpenMenu(null)}
                            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                              itemActive
                                ? "bg-blue-800 text-white"
                                : "text-blue-200 hover:bg-blue-800 hover:text-white"
                            }`}
                          >
                            <ItemIcon className="h-4 w-4" />
                            {item.label}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Right: logout + hamburger */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-2 rounded-md text-sm font-medium text-blue-200 hover:bg-blue-900 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 rounded-md text-blue-200 hover:bg-blue-900 hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="md:hidden border-t border-blue-900 py-2 pb-3 space-y-0.5">
            {/* Standalone links */}
            {standaloneLinks.map((link) => {
              const Icon = link.icon
              const active = isActive(link.href, link.exact)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? "bg-blue-800 text-white"
                      : "text-blue-200 hover:bg-blue-900 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              )
            })}

            {/* Submenus */}
            {visibleSubmenus.map((sub) => {
              const Icon = sub.icon
              const active = isSubmenuActive(sub)
              const expanded = mobileExpanded === sub.key
              return (
                <div key={sub.key}>
                  <button
                    onClick={() => toggleMobile(sub.key)}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                      active
                        ? "bg-blue-800 text-white"
                        : "text-blue-200 hover:bg-blue-900 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1 text-left">{sub.label}</span>
                    {expanded ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </button>
                  {expanded && (
                    <div className="pl-6 space-y-0.5 mt-0.5">
                      {sub.items.map((item) => {
                        const ItemIcon = item.icon
                        const itemActive = isActive(item.href, false)
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                              itemActive
                                ? "bg-blue-800 text-white"
                                : "text-blue-200 hover:bg-blue-900 hover:text-white"
                            }`}
                          >
                            <ItemIcon className="h-4 w-4" />
                            {item.label}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium text-blue-200 hover:bg-blue-900 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
