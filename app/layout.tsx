import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Jamie's Auto Care - Mobile Mechanic Services",
  description:
    "Jamie's Auto Care provides quality mobile mechanic services in Edinburgh, Dalkeith and surrounding areas. Book repairs and servicing at your doorstep.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <header className="bg-blue-950 text-white py-4 sticky top-0 z-50 shadow-md">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <div className="font-bold text-xl">Jamie's Auto Care</div>
            <nav className="hidden md:flex space-x-6">
              <a href="#services" className="hover:text-orange-300">
                Services
              </a>
              <a href="#gallery" className="hover:text-orange-300">
                Gallery
              </a>
              <a href="#reviews" className="hover:text-orange-300">
                Reviews
              </a>
              <a href="#booking" className="hover:text-orange-300">
                Book Now
              </a>
              <a href="#contact" className="hover:text-orange-300">
                Contact
              </a>
            </nav>
            <a href="#booking" className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded font-medium">
              Book Now
            </a>
          </div>
        </header>
        {children}

        {/* Trustpilot Script */}
        <script
          type="text/javascript"
          src="//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"
          async
        ></script>
      </body>
    </html>
  )
}
