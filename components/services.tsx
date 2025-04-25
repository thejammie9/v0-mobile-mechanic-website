import { Wrench, AlertTriangle, Car, Cog, Battery, Disc, FuelIcon as Oil } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const services = [
  {
    title: "Engine Repair",
    description: "Comprehensive engine diagnostics and repairs for all makes and models.",
    icon: <Wrench className="h-10 w-10 text-blue-800" />,
  },
  {
    title: "Brake Servicing",
    description: "Complete brake system inspection, repair and replacement.",
    icon: <Disc className="h-10 w-10 text-blue-800" />, // Changed from Gauge to Disc
  },
  {
    title: "Diagnostics",
    description: "Advanced computer diagnostics to identify issues quickly and accurately.",
    icon: <AlertTriangle className="h-10 w-10 text-blue-800" />,
  },
  {
    title: "Battery Replacement",
    description: "On-the-spot battery testing and replacement services.",
    icon: <Battery className="h-10 w-10 text-blue-800" />, // Using the correct Battery icon
  },
  {
    title: "MOT Preparation",
    description: "Pre-MOT checks and necessary repairs to ensure your vehicle passes.",
    icon: <AlertTriangle className="h-10 w-10 text-blue-800" />,
  },
  {
    title: "Oil Changes",
    description: "Quick and clean oil and filter changes using quality products.",
    icon: <Oil className="h-10 w-10 text-blue-800" />, // Changed to Oil icon
  },
  {
    title: "Electrical Systems",
    description: "Troubleshooting and repair of all vehicle electrical systems.",
    icon: <Cog className="h-10 w-10 text-blue-800" />,
  },
  {
    title: "Mobile Servicing",
    description: "Full vehicle servicing performed at your home or workplace.",
    icon: <Car className="h-10 w-10 text-blue-800" />,
  },
]

export default function Services() {
  return (
    <section className="py-16 bg-white" id="services">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-blue-900">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <Card key={index} className="border-gray-200 hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-col items-center pb-2">
                {service.icon}
                <CardTitle className="mt-4 text-xl text-center">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600">{service.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
