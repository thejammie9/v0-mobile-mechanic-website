import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ShieldCheck, Award, ScanLine, Settings2, FileText, Cpu } from "lucide-react"

export const metadata: Metadata = {
  title: "Qualifications & Certificates",
  description:
    "View the IMI qualifications and industry certificates held by Jamie's Auto Care — Edinburgh's trusted mobile mechanic.",
  alternates: { canonical: "https://jamiesautocare.com/qualifications" },
}

// ─── Add / edit your certificates here ───────────────────────────────────────
const certificates = [
  {
    title: "IMI Award in Automotive Diagnostic Techniques",
    issuer: "Institute of the Motor Industry (IMI)",
    // date: "January 2024",   // uncomment and fill in when ready
    // level: "Level 3",
    description:
      "Covers the use of diagnostic equipment and techniques to identify faults across vehicle systems including engine management, ABS, and airbag systems.",
  },
  {
    title: "IMI Award in Light Vehicle Maintenance & Repair",
    issuer: "Institute of the Motor Industry (IMI)",
    description:
      "Demonstrates competency in servicing, maintaining, and repairing light vehicles to industry standards.",
  },
  // Add more certificates here as needed
]
// ─────────────────────────────────────────────────────────────────────────────

export default function QualificationsPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-200">

      {/* Hero */}
      <div className="bg-blue-950 border-b border-blue-900">
        <div className="container mx-auto px-4 py-14 max-w-4xl text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="/images/imi-badge.png"
              alt="IMI Accredited"
              width={120}
              height={120}
              className="object-contain"
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Qualifications &amp; Certificates
          </h1>
          <p className="text-gray-300 max-w-xl mx-auto text-lg">
            All work carried out by Jamie&apos;s Auto Care is backed by recognised industry
            qualifications from the Institute of the Motor Industry (IMI) — the UK&apos;s
            leading professional body for the automotive industry.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-14 max-w-4xl">

        {/* What is IMI */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-10 flex gap-5 items-start">
          <ShieldCheck className="h-8 w-8 text-orange-400 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-lg font-semibold text-white mb-2">What is the IMI?</h2>
            <p className="text-gray-400 leading-relaxed">
              The Institute of the Motor Industry (IMI) is the UK&apos;s professional association
              for people working in the automotive industry. IMI qualifications are nationally
              recognised and ensure that technicians meet rigorous standards of knowledge and
              practical skill. Choosing an IMI-accredited mechanic gives you confidence that the
              person working on your vehicle is properly trained.
            </p>
          </div>
        </div>

        {/* Certificates grid */}
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Award className="h-5 w-5 text-orange-400" />
          My Certificates
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-14">
          {certificates.map((cert, i) => (
            <div
              key={i}
              className="bg-gray-900 border border-gray-700 rounded-xl p-6 flex flex-col gap-3 hover:border-orange-500/50 transition-colors"
            >
              {/* Top row */}
              <div className="flex items-start gap-3">
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-2 flex-shrink-0">
                  <Award className="h-5 w-5 text-orange-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white leading-snug">{cert.title}</h3>
                  <p className="text-orange-400 text-sm mt-0.5">{cert.issuer}</p>
                </div>
              </div>

              {/* Meta */}
              {(cert as any).level || (cert as any).date ? (
                <div className="flex gap-3 flex-wrap">
                  {(cert as any).level && (
                    <span className="text-xs bg-blue-900/50 text-blue-300 border border-blue-700 rounded-full px-2.5 py-0.5">
                      {(cert as any).level}
                    </span>
                  )}
                  {(cert as any).date && (
                    <span className="text-xs text-gray-500">{(cert as any).date}</span>
                  )}
                </div>
              ) : null}

              {/* Description */}
              <p className="text-gray-400 text-sm leading-relaxed">{cert.description}</p>
            </div>
          ))}
        </div>

        {/* Professional Equipment */}
        <div className="mb-14">
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <ScanLine className="h-5 w-5 text-orange-400" />
            Professional Diagnostic Equipment
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            The right tools make the difference. Jamie&apos;s Auto Care uses <strong className="text-white">Launch professional diagnostic equipment</strong> — a leading brand trusted by independent garages and technicians across the UK.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 hover:border-orange-500/50 transition-colors">
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-2 w-fit mb-3">
                <FileText className="h-5 w-5 text-orange-400" />
              </div>
              <h3 className="font-semibold text-white mb-1">Full System Scan & Reports</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Complete multi-system diagnostic scans covering engine, transmission, ABS, airbag, body control, and more. Detailed reports provided so you know exactly what&apos;s been found.
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 hover:border-orange-500/50 transition-colors">
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-2 w-fit mb-3">
                <Cpu className="h-5 w-5 text-orange-400" />
              </div>
              <h3 className="font-semibold text-white mb-1">ECU Programming</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Module programming and coding for replacement components — including ECUs, instrument clusters, and control modules — without a main dealer visit.
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 hover:border-orange-500/50 transition-colors">
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-2 w-fit mb-3">
                <Settings2 className="h-5 w-5 text-orange-400" />
              </div>
              <h3 className="font-semibold text-white mb-1">Component Matching & Adaptations</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Throttle body relearns, injector coding, TPMS sensor matching, steering angle resets, and other adaptations required after fitting new parts.
              </p>
            </div>
          </div>

          <div className="bg-blue-950/40 border border-blue-800/50 rounded-xl p-5 text-sm text-blue-200">
            <strong className="text-white">Why does this matter?</strong> Many mobile mechanics carry only a basic code reader. Launch equipment gives access to live data streams, bi-directional controls, and advanced diagnostic functions — meaning more faults can be diagnosed and resolved on-site.
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gray-900 border border-gray-800 rounded-xl p-8">
          <h2 className="text-xl font-bold text-white mb-3">Ready to book?</h2>
          <p className="text-gray-400 mb-6">
            Get professional, qualified vehicle care at your door — no garage visit needed.
          </p>
          <Link
            href="/#booking"
            className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Book Now
          </Link>
        </div>

      </div>
    </div>
  )
}
