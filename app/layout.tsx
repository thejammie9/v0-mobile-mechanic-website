import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import CookieBanner from "@/components/cookie-banner"
import { PageTracker } from "@/components/page-tracker"

const inter = Inter({ subsets: ["latin"] })

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

export const metadata: Metadata = {
  metadataBase: new URL("https://jamiesautocare.com"),
  title: {
    default: "Mobile Mechanic Edinburgh & Lothians | Jamie's Auto Care",
    template: "%s | Jamie's Auto Care",
  },
  icons: {
    icon: "/images/Logo.png",
    apple: "/images/Logo.png",
  },
  description:
    "Mobile mechanic covering Edinburgh, Gorebridge, Dalkeith, Penicuik, Bonnyrigg & Midlothian. Repairs, servicing & diagnostics at your door — no garage needed.",
  keywords: [
    "mobile mechanic Edinburgh",
    "mobile mechanic near me",
    "mobile mechanic Gorebridge",
    "mobile mechanic Dalkeith",
    "mobile mechanic Penicuik",
    "mobile mechanic Bonnyrigg",
    "mobile mechanic Loanhead",
    "mobile mechanic Lasswade",
    "mobile mechanic Midlothian",
    "mobile mechanic Lothians",
    "car repairs Edinburgh",
    "vehicle servicing Edinburgh",
    "mobile car mechanic",
    "MOT preparation Edinburgh",
    "car diagnostics Edinburgh",
    "mechanic at home Edinburgh",
    "Edinburgh mobile mechanic",
    "Midlothian mobile mechanic",
  ],
  openGraph: {
    title: "Mobile Mechanic Edinburgh & Lothians | Jamie's Auto Care",
    description:
      "Mobile mechanic covering Edinburgh, Gorebridge, Dalkeith, Penicuik, Bonnyrigg & Midlothian. Repairs, servicing & diagnostics at your door — no garage needed.",
    url: "https://jamiesautocare.com",
    siteName: "Jamie's Auto Care",
    locale: "en_GB",
    type: "website",
    images: [
      {
        url: "https://jamiesautocare.com/images/Banner.png",
        width: 1200,
        height: 630,
        alt: "Jamie's Auto Care — Mobile Mechanic Edinburgh & Lothians",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mobile Mechanic Edinburgh & Lothians | Jamie's Auto Care",
    description:
      "Mobile mechanic covering Edinburgh, Gorebridge, Dalkeith, Penicuik, Bonnyrigg & Midlothian. Repairs, servicing & diagnostics at your door — no garage needed.",
    images: ["https://jamiesautocare.com/images/Banner.png"],
  },
  other: {
    "HandheldFriendly": "True",
    "MobileOptimized": "320",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-title": "Jamie's Auto Care",
  },
}

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "AutoRepair",
  name: "Jamie's Auto Care",
  description:
    "Mobile mechanic serving Edinburgh, Gorebridge, Dalkeith, Penicuik, Bonnyrigg, Loanhead, Lasswade and all Midlothian areas. Vehicle repairs, servicing, MOT preparation and diagnostics at your home or workplace.",
  url: "https://jamiesautocare.com",
  telephone: "+447463451967",
  email: "contact@jamiesautocare.com",
  areaServed: [
    { "@type": "City", "name": "Edinburgh", "addressCountry": "GB" },
    { "@type": "Place", "name": "Gorebridge", "addressCountry": "GB" },
    { "@type": "Place", "name": "Dalkeith", "addressCountry": "GB" },
    { "@type": "Place", "name": "Penicuik", "addressCountry": "GB" },
    { "@type": "Place", "name": "Bonnyrigg", "addressCountry": "GB" },
    { "@type": "Place", "name": "Loanhead", "addressCountry": "GB" },
    { "@type": "Place", "name": "Lasswade", "addressCountry": "GB" },
    { "@type": "Place", "name": "Musselburgh", "addressCountry": "GB" },
    { "@type": "Place", "name": "Newtongrange", "addressCountry": "GB" },
    { "@type": "AdministrativeArea", "name": "Midlothian" },
    { "@type": "AdministrativeArea", "name": "East Lothian" },
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Edinburgh",
    addressRegion: "Scotland",
    addressCountry: "GB",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 55.9533,
    longitude: -3.1883,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "16:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "10:00",
      closes: "14:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Sunday",
      opens: "00:00",
      closes: "00:00",
    },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Mobile Mechanic Services",
    itemListElement: [
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Mobile Vehicle Servicing" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Engine Diagnostics" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Brake Repair and Replacement" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "MOT Preparation" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Oil and Filter Change" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Battery Replacement" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Electrical Fault Diagnosis" } },
    ],
  },
  priceRange: "££",
  hasMap: "https://maps.google.com/?q=Edinburgh",
  sameAs: [],
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1e3a5f",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth dark">
      <body className={inter.className}>
        <Script
          id="local-business-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <PageTracker />
        {children}
        {/* Cookie banner handles GA4 loading only after user consent */}
        <CookieBanner gaId={GA_ID} />
      </body>
    </html>
  )
}
