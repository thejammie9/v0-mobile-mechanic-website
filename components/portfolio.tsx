import Link from "next/link"
import { Camera } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getPortfolioItems } from "@/lib/db"

export default function Portfolio() {
  const allItems = getPortfolioItems(true) // active only
  const items = allItems.slice(0, 3)

  if (items.length === 0) {
    return (
      <section className="py-16 bg-gray-800" id="portfolio">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-blue-300">Our Recent Work</h2>
          <div className="max-w-2xl mx-auto">
            <Card className="border-dashed border-2 border-gray-600 bg-gray-700/50">
              <CardContent className="py-12">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-700">
                    <Camera className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-200">Portfolio Coming Soon</h3>
                    <p className="text-gray-400 mt-2 max-w-md">
                      Photos and testimonials from completed jobs will be displayed here.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gray-800" id="portfolio">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-blue-300">Our Recent Work</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden bg-gray-700 border-gray-600">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-gray-100">{item.title}</CardTitle>
                {item.vehicle && <CardDescription className="font-medium text-orange-400">{item.vehicle}</CardDescription>}
              </CardHeader>
              <CardContent className="space-y-4">
                {item.description && <p className="text-gray-300">{item.description}</p>}
                {(item.image_before || item.image_after) && (
                  <div className="grid grid-cols-2 gap-2">
                    {item.image_before && (
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Before</p>
                        <img src={item.image_before} alt={`${item.title} before`} className="rounded-md object-cover h-32 w-full" />
                      </div>
                    )}
                    {item.image_after && (
                      <div>
                        <p className="text-xs text-gray-400 mb-1">After</p>
                        <img src={item.image_after} alt={`${item.title} after`} className="rounded-md object-cover h-32 w-full" />
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              {(item.testimonial || item.customer) && (
                <CardFooter className="bg-gray-800 border-t border-gray-600">
                  <div>
                    {item.testimonial && <p className="italic text-sm text-gray-300">"{item.testimonial}"</p>}
                    {item.customer && <p className="text-sm font-medium mt-2 text-gray-200">– {item.customer}</p>}
                  </div>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
        {allItems.length > 3 && (
          <div className="text-center mt-10">
            <Link
              href="/gallery"
              className="inline-block border border-orange-500 hover:bg-orange-500 text-orange-400 hover:text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              View All Work ({allItems.length} jobs) →
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
