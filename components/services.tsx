import { Wrench, StopCircle, Laptop, Battery, ClipboardCheck, Droplets, Zap, Car } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const services = [
  {
    title: "Engine Repair",
    description: "Comprehensive engine diagnostics and repairs for all makes and models.",
    icon: <Wrench className="h-10 w-10 text-blue-400" />,
  },
  {
    title: "Brake Servicing",
    description: "Complete brake system inspection, repair and replacement.",
    icon: <StopCircle className="h-10 w-10 text-blue-400" />,
  },
  {
    title: "Diagnostics",
    description: "Full system diagnostics using Launch professional equipment — fault codes, live data, ECU programming, and component matching.",
    icon: <Laptop className="h-10 w-10 text-blue-400" />,
  },
  {
    title: "Battery Replacement",
    description: "On-the-spot battery testing and replacement services.",
    icon: <Battery className="h-10 w-10 text-blue-400" />,
  },
  {
    title: "MOT Preparation",
    description: "Pre-MOT checks and necessary repairs to ensure your vehicle passes.",
    icon: <ClipboardCheck className="h-10 w-10 text-blue-400" />,
  },
  {
    title: "Oil Changes",
    description: "Quick and clean oil and filter changes using quality products.",
    icon: <Droplets className="h-10 w-10 text-blue-400" />,
  },
  {
    title: "Electrical Systems",
    description: "Troubleshooting and repair of all vehicle electrical systems.",
    icon: <Zap className="h-10 w-10 text-blue-400" />,
  },
  {
    title: "Mobile Servicing",
    description: "Full vehicle servicing performed at your home or workplace.",
    icon: <Car className="h-10 w-10 text-blue-400" />,
  },
]

export default function Services() {
  return (
    <section className="py-16 bg-gray-900" id="services">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-blue-300">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <Card key={index} className="border-gray-700 bg-gray-800 hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-col items-center pb-2">
                {service.icon}
                <CardTitle className="mt-4 text-xl text-center text-gray-100">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-400">{service.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
