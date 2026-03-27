import { MapPin } from "lucide-react"

const areas = [
  "Edinburgh",
  "Gorebridge",
  "Dalkeith",
  "Penicuik",
  "Bonnyrigg",
  "Loanhead",
  "Lasswade",
  "Musselburgh",
  "Newtongrange",
  "Eskbank",
  "Roslin",
  "Pathhead",
]

export default function ServiceArea() {
  return (
    <section className="py-10 bg-blue-950/60 border-y border-blue-900/40">
      <div className="container mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <MapPin className="h-5 w-5 text-orange-400 flex-shrink-0" />
          <h2 className="text-lg font-semibold text-blue-200">Areas Covered</h2>
        </div>
        <p className="text-gray-400 text-sm mb-4 max-w-2xl mx-auto">
          Based in Midlothian, Jamie covers Edinburgh and the surrounding Lothians. If you&apos;re not sure whether
          you&apos;re in range, just get in touch — most areas within 20 miles of Edinburgh are covered.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {areas.map((area) => (
            <span
              key={area}
              className="inline-flex items-center gap-1 bg-gray-800 border border-gray-700 text-gray-300 text-sm px-3 py-1 rounded-full"
            >
              <MapPin className="h-3 w-3 text-orange-400" />
              {area}
            </span>
          ))}
          <span className="inline-flex items-center gap-1 bg-gray-800 border border-gray-700 text-gray-400 text-sm px-3 py-1 rounded-full italic">
            &amp; surrounding areas
          </span>
        </div>
      </div>
    </section>
  )
}
