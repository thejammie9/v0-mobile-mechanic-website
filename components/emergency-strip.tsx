import { BatteryWarning, Phone } from "lucide-react"
import { getSiteSetting } from "@/lib/db"
import Link from "next/link"

export default function EmergencyStrip() {
  const phone      = getSiteSetting("phone") || "07463 451967"
  const phoneClean = phone.replace(/\s/g, "")

  return (
    <div className="bg-red-900/80 border-y border-red-800/60">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2.5 text-red-100">
            <BatteryWarning className="h-5 w-5 text-red-300 shrink-0" />
            <span className="text-sm font-medium">
              <span className="font-bold text-white">Dead battery or flat tyre?</span>
              {" "}Mobile roadside assistance in Edinburgh &amp; Midlothian.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`tel:${phoneClean}`}
              className="inline-flex items-center gap-1.5 bg-red-700 hover:bg-red-600 text-white font-semibold text-sm px-4 py-1.5 rounded-lg transition-colors"
            >
              <Phone className="h-3.5 w-3.5" />
              Call Now
            </a>
            <Link
              href="/breakdown"
              className="text-red-200 hover:text-white text-sm underline underline-offset-2 transition-colors"
            >
              Find out more
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
