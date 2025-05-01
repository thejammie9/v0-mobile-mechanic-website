"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface PortfolioItem {
  id: string
  title: string
  vehicle: string
  description: string
  image_before: string
  image_after: string
  testimonial: string | null
  customer: string | null
}

export default function Portfolio() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPortfolioItems() {
      try {
        const response = await fetch("/api/portfolio?featured=true")
        if (!response.ok) {
          throw new Error("Failed to fetch portfolio items")
        }
        const data = await response.json()
        setPortfolioItems(data)
      } catch (error) {
        console.error("Error fetching portfolio items:", error)
        // Fallback to default items if API fails
        setPortfolioItems([
          {
            id: "1",
            title: "Engine Overhaul",
            vehicle: "2018 VW Golf",
            description: "Complete engine rebuild after catastrophic timing belt failure.",
            image_before: "/damaged-engine.png",
            image_after: "/repaired-engine.png",
            testimonial:
              "John saved my Golf when other garages quoted me thousands. Fast, professional service right on my driveway!",
            customer: "Michael S.",
          },
          {
            id: "2",
            title: "Brake System Replacement",
            vehicle: "2020 Ford Focus",
            description: "Full brake system overhaul including discs, pads and calipers.",
            image_before: "/placeholder.svg?key=3220w",
            image_after: "/new-brake-system.png",
            testimonial: "Incredible service! Same-day brake replacement at my office car park. Couldn't be happier.",
            customer: "Sarah T.",
          },
          {
            id: "3",
            title: "Electrical Fault Diagnosis",
            vehicle: "2019 Audi A4",
            description: "Complex electrical issue diagnosed and repaired without dealership costs.",
            image_before: "/placeholder.svg?key=0saz1",
            image_after: "/fixed-car-electronics.png",
            testimonial:
              "After weeks of frustration with my Audi's electrical gremlins, the problem was solved in hours. Brilliant service!",
            customer: "David M.",
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchPortfolioItems()
  }, [])

  if (loading) {
    return (
      <section className="py-16 bg-gray-100" id="portfolio">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-blue-900">Our Recent Work</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Skeleton className="h-4 w-16 mb-1" />
                      <Skeleton className="h-32 w-full rounded-md" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-16 mb-1" />
                      <Skeleton className="h-32 w-full rounded-md" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t">
                  <div className="w-full">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gray-100" id="portfolio">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-blue-900">Our Recent Work</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {portfolioItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">{item.title}</CardTitle>
                <CardDescription className="font-medium text-orange-600">{item.vehicle}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">{item.description}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Before</p>
                    <Image
                      src={item.image_before || "/placeholder.svg"}
                      alt={`${item.title} before`}
                      width={400}
                      height={300}
                      className="rounded-md object-cover h-32 w-full"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">After</p>
                    <Image
                      src={item.image_after || "/placeholder.svg"}
                      alt={`${item.title} after`}
                      width={400}
                      height={300}
                      className="rounded-md object-cover h-32 w-full"
                    />
                  </div>
                </div>
              </CardContent>
              {item.testimonial && item.customer && (
                <CardFooter className="bg-gray-50 border-t">
                  <div>
                    <p className="italic text-sm text-gray-600">"{item.testimonial}"</p>
                    <p className="text-sm font-medium mt-2">— {item.customer}</p>
                  </div>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
