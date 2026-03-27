import type { Metadata } from "next"
import GalleryClient from "./gallery-client"
import { getPortfolioItems } from "@/lib/db"

export const metadata: Metadata = {
  title: "Our Work",
  description: "Before and after photos from completed repairs. Real jobs, real results from Jamie's Auto Care mobile mechanic service across the Lothians.",
  alternates: { canonical: "https://jamiesautocare.com/gallery" },
}

export default function GalleryPage() {
  const dbItems = getPortfolioItems(true)

  const items = dbItems.map((item) => ({
    title: item.title,
    vehicle: item.vehicle,
    description: item.description,
    imageBefore: item.image_before,
    imageAfter: item.image_after,
  }))

  return (
    <div className="min-h-screen bg-gray-950">
      <section className="bg-blue-950 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Our Work</h1>
          <p className="text-lg text-blue-200 max-w-2xl mx-auto">
            Real jobs, real results — drag the slider to compare before and after, or click
            &ldquo;View Before / After&rdquo; to see the full image.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <GalleryClient items={items} />
        </div>
      </section>
    </div>
  )
}
