import Link from "next/link"
import { CheckCircle2, Clock, Wrench, Car, CreditCard, Phone } from "lucide-react"

export const metadata = {
  title: "What to Expect",
  description: "Find out exactly what happens when you book a mobile mechanic visit with Jamie's Auto Care — from booking to payment.",
  alternates: { canonical: "https://jamiesautocare.com/what-to-expect" },
}

const steps = [
  {
    icon: Phone,
    title: "1. Book Your Appointment",
    body: "Fill in the booking form on our website or call us directly. Let us know your vehicle details, the issue you're experiencing, and your preferred date and time. We'll confirm your slot within a few hours.",
  },
  {
    icon: Clock,
    title: "2. Confirmation",
    body: "Once we confirm your appointment you'll receive an email with the date, time, and a summary of what was requested. If anything changes, you can cancel or reschedule by contacting us directly.",
  },
  {
    icon: Car,
    title: "3. We Come to You",
    body: "On the day, Jamie arrives at your home, workplace, or any safe accessible location across the Lothians & Borders. Please ensure the vehicle is parked on a flat, hard surface with enough room to work safely around it.",
  },
  {
    icon: Wrench,
    title: "4. Diagnosis & Repair",
    body: "Jamie will carry out a thorough inspection and explain the findings to you in plain language before any work begins. You'll always be given a clear quote before we proceed — no surprises.",
  },
  {
    icon: CheckCircle2,
    title: "5. Job Complete",
    body: "Once the work is finished Jamie will walk you through what was done and answer any questions. You'll receive a detailed invoice listing all labour and parts used.",
  },
  {
    icon: CreditCard,
    title: "6. Payment",
    body: "Payment is due on the day of service. We accept cash and card payments on site. If you've already paid by card in advance, your invoice serves as your receipt.",
  },
]

export default function WhatToExpectPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="container mx-auto px-4 py-16 max-w-3xl">

        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-3">What to Expect</h1>
          <p className="text-gray-400 text-lg">
            We want every visit to be straightforward and stress-free. Here&apos;s exactly what happens from the moment you book to the moment we leave.
          </p>
        </div>

        <div className="space-y-6">
          {steps.map((step) => {
            const Icon = step.icon
            return (
              <div key={step.title} className="flex gap-5 bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-10 h-10 rounded-full bg-orange-600/20 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-orange-400" />
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white mb-1">{step.title}</h2>
                  <p className="text-gray-400 leading-relaxed">{step.body}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-10 bg-blue-950 border border-blue-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-2">Before We Arrive — Checklist</h2>
          <ul className="space-y-2 text-gray-300 text-sm">
            {[
              "Park the vehicle on a flat, hard surface (driveway, car park, road)",
              "Make sure there is at least 1 metre of clear space on each side of the vehicle",
              "Have the vehicle keys ready",
              "Leave the locking wheel nut key on the passenger seat",
              "If possible, note any warning lights or unusual sounds to describe to Jamie",
              "Ensure a responsible adult (18+) is present during the visit",
            ].map(item => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-400 mb-4">Ready to book, or have a question first?</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/#booking"
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Book Now
            </Link>
            <Link href="/faq"
              className="bg-gray-800 hover:bg-gray-700 text-gray-200 px-6 py-3 rounded-lg font-medium transition-colors border border-gray-700">
              Read the FAQ
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
