"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useEffect } from "react"

export default function TrustpilotWidget() {
  useEffect(() => {
    // This will trigger the Trustpilot script to load the widget
    if (window.Trustpilot) {
      window.Trustpilot.loadFromElement(document.getElementById("trustpilot-widget-container"))
    }
  }, [])

  return (
    <section className="py-16 bg-white" id="reviews">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-blue-900">Customer Reviews</h2>

        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-6">
            {/* Trustpilot Widget */}
            <div
              id="trustpilot-widget-container"
              className="trustpilot-widget"
              data-locale="en-GB"
              data-template-id="53aa8807dec7e10d38f59f32"
              data-businessunit-id="YOUR_BUSINESS_UNIT_ID"
              data-style-height="150px"
              data-style-width="100%"
              data-theme="light"
            >
              <a href="https://uk.trustpilot.com/review/jamiesautocare.com" target="_blank" rel="noopener noreferrer">
                Trustpilot
              </a>
            </div>

            {/* Fallback for when Trustpilot script is not loaded */}
            <div className="text-center mt-4">
              <a
                href="https://uk.trustpilot.com/review/jamiesautocare.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-[#00b67a] text-white px-4 py-2 rounded font-bold"
              >
                See our reviews on Trustpilot
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
