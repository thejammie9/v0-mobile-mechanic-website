"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { StarIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2 } from "lucide-react"

export default function Reviews() {
  const [submitted, setSubmitted] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real implementation, you would send this data to your server
    setSubmitted(true)

    // Reset form after 5 seconds
    setTimeout(() => {
      setSubmitted(false)
      setRating(0)
      const form = e.target as HTMLFormElement
      form.reset()
    }, 5000)
  }

  return (
    <section className="py-16 bg-white" id="reviews">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-900">Customer Reviews</h2>

        <div className="mb-12">
          <div className="flex justify-center mb-8">
            {/* Trustpilot Widget - Replace with your actual Trustpilot widget script */}
            <div
              className="trustpilot-widget"
              data-locale="en-GB"
              data-template-id="53aa8807dec7e10d38f59f32"
              data-businessunit-id="YOUR_BUSINESS_UNIT_ID"
              data-style-height="150px"
              data-style-width="100%"
              data-theme="light"
            >
              <a href="https://uk.trustpilot.com/review/jamiesautocare.com" target="_blank" rel="noreferrer noopener">
                Trustpilot
              </a>
            </div>

            {/* Fallback for when Trustpilot script is not loaded */}
            <div className="text-center">
              <a
                href="https://uk.trustpilot.com/review/jamiesautocare.com"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-block bg-[#00b67a] text-white px-4 py-2 rounded font-bold"
              >
                See our reviews on Trustpilot
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-6">Leave a Review</h3>

          {submitted ? (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <AlertTitle className="text-green-800">Thank You!</AlertTitle>
              <AlertDescription className="text-green-700">
                Your review has been submitted. We appreciate your feedback!
              </AlertDescription>
            </Alert>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input id="name" name="name" required />
                  </div>

                  <div className="space-y-2">
                    <Label>Your Rating</Label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          className="focus:outline-none"
                        >
                          <StarIcon
                            className={`h-8 w-8 ${
                              star <= (hoveredRating || rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="review">Your Review</Label>
                    <Textarea id="review" name="review" rows={4} required />
                  </div>

                  <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                    Submit Review
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  )
}
