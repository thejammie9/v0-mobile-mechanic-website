import Link from "next/link"
import { getSiteSetting } from "@/lib/db"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "FAQ",
  description: "Frequently asked questions about Jamie's Auto Care mobile mechanic service in Edinburgh, Lothians & Borders.",
  alternates: { canonical: "https://jamiesautocare.com/faq" },
}

export default function FAQPage() {
  const phone = getSiteSetting("phone") || "07463 451967"
  const email = getSiteSetting("email") || "contact@jamiesautocare.com"
  const coverageText = getSiteSetting("faq_coverage_text") || "Edinburgh and the wider Lothians & Borders region"
  const labourGuarantee = getSiteSetting("labour_guarantee") || "3 months or 3,000 miles (whichever comes first)"
  const calloutNote = getSiteSetting("callout_fee_note") || "A call-out / travel charge may apply depending on location. This will always be made clear before your appointment is confirmed and will appear as a line item on your invoice."
  const paymentMethods = getSiteSetting("payment_methods") || "We accept cash and card payments on the day. Payment is due once the work is complete. We do not offer credit or payment plans at this time."

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "What areas do you cover?", acceptedAnswer: { "@type": "Answer", text: `We cover ${coverageText}. If you're unsure whether we reach your area, just give us a call or drop us an email and we'll confirm.` } },
      { "@type": "Question", name: "What vehicles do you work on?", acceptedAnswer: { "@type": "Answer", text: "We work on most petrol and diesel cars and light vans. We do not currently work on electric vehicles, motorcycles, or heavy commercial vehicles." } },
      { "@type": "Question", name: "Do I need to be home for the appointment?", acceptedAnswer: { "@type": "Answer", text: "A responsible adult (18+) must be present during the visit. We cannot carry out work with no one in attendance, as we need to discuss findings and gain approval before starting repairs." } },
      { "@type": "Question", name: "What if you find something else wrong during the visit?", acceptedAnswer: { "@type": "Answer", text: "We'll always tell you about any additional issues we spot. We won't carry out extra work without your approval, and we'll give you a clear price before proceeding with anything beyond the original booking." } },
      { "@type": "Question", name: "Do you supply parts, or do I need to source them?", acceptedAnswer: { "@type": "Answer", text: "We can source and supply parts on your behalf — the cost will be itemised on your invoice. If you already have parts you'd like us to fit, just let us know when booking." } },
      { "@type": "Question", name: "How long will the work take?", acceptedAnswer: { "@type": "Answer", text: "It depends on the job. Simple tasks like an oil change or brake pad replacement typically take 1–2 hours. More involved work may take longer. We'll give you a realistic time estimate when confirming your appointment." } },
      { "@type": "Question", name: "What payment methods do you accept?", acceptedAnswer: { "@type": "Answer", text: paymentMethods } },
      { "@type": "Question", name: "Is the work guaranteed?", acceptedAnswer: { "@type": "Answer", text: `Yes. All labour is guaranteed for ${labourGuarantee}. Parts supplied by us carry the manufacturer's warranty. If an issue re-occurs within the guarantee period, contact us and we'll investigate.` } },
      { "@type": "Question", name: "What if you can't fix my vehicle on the day?", acceptedAnswer: { "@type": "Answer", text: "If the repair requires specialist equipment or parts that need to be ordered, we'll let you know and arrange a follow-up visit. You'll only be charged for any diagnostics or work already completed." } },
      { "@type": "Question", name: "How do I cancel or reschedule?", acceptedAnswer: { "@type": "Answer", text: "You can cancel or reschedule by contacting us directly by phone or email. Please give us as much notice as possible — ideally 24 hours — so we can offer your slot to another customer." } },
      { "@type": "Question", name: "Do you offer a call-out fee?", acceptedAnswer: { "@type": "Answer", text: calloutNote } },
      { "@type": "Question", name: "Can I get a quote before booking?", acceptedAnswer: { "@type": "Answer", text: "Yes. Contact us with details of the work required and we can provide an estimate. For accurate pricing on diagnostic work, a visit is usually needed first." } },
    ],
  }

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="container mx-auto px-4 py-16 max-w-3xl">

        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-3">Frequently Asked Questions</h1>
          <p className="text-gray-400 text-lg">
            Can&apos;t find the answer you&apos;re looking for? Call us on{" "}
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="text-orange-400 hover:text-orange-300">{phone}</a>{" "}
            or email{" "}
            <a href={`mailto:${email}`} className="text-orange-400 hover:text-orange-300">{email}</a>.
          </p>
        </div>

        <div className="space-y-4">

          {/* Coverage — links to /areas */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-base font-semibold text-white mb-2">What areas do you cover?</h2>
            <p className="text-gray-400 leading-relaxed text-sm">
              We cover {coverageText}. If you&apos;re unsure whether we reach your area, just give us a call or drop us an email and we&apos;ll confirm.
            </p>
            <Link
              href="/areas"
              className="inline-block mt-3 text-sm text-orange-400 hover:text-orange-300 underline underline-offset-2"
            >
              View all areas we cover →
            </Link>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-base font-semibold text-white mb-2">What vehicles do you work on?</h2>
            <p className="text-gray-400 leading-relaxed text-sm">We work on most petrol and diesel cars and light vans. We do not currently work on electric vehicles, motorcycles, or heavy commercial vehicles.</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-base font-semibold text-white mb-2">Do I need to be home for the appointment?</h2>
            <p className="text-gray-400 leading-relaxed text-sm">A responsible adult (18+) must be present during the visit. We cannot carry out work with no one in attendance, as we need to discuss findings and gain approval before starting repairs.</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-base font-semibold text-white mb-2">What if you find something else wrong during the visit?</h2>
            <p className="text-gray-400 leading-relaxed text-sm">We&apos;ll always tell you about any additional issues we spot. We won&apos;t carry out extra work without your approval, and we&apos;ll give you a clear price before proceeding with anything beyond the original booking.</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-base font-semibold text-white mb-2">Do you supply parts, or do I need to source them?</h2>
            <p className="text-gray-400 leading-relaxed text-sm">We can source and supply parts on your behalf — the cost will be itemised on your invoice. If you already have parts you&apos;d like us to fit, just let us know when booking.</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-base font-semibold text-white mb-2">How long will the work take?</h2>
            <p className="text-gray-400 leading-relaxed text-sm">It depends on the job. Simple tasks like an oil change or brake pad replacement typically take 1–2 hours. More involved work may take longer. We&apos;ll give you a realistic time estimate when confirming your appointment.</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-base font-semibold text-white mb-2">What payment methods do you accept?</h2>
            <p className="text-gray-400 leading-relaxed text-sm">{paymentMethods}</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-base font-semibold text-white mb-2">Is the work guaranteed?</h2>
            <p className="text-gray-400 leading-relaxed text-sm">Yes. All labour is guaranteed for {labourGuarantee}. Parts supplied by us carry the manufacturer&apos;s warranty. If an issue re-occurs within the guarantee period, contact us and we&apos;ll investigate.</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-base font-semibold text-white mb-2">What if you can&apos;t fix my vehicle on the day?</h2>
            <p className="text-gray-400 leading-relaxed text-sm">If the repair requires specialist equipment or parts that need to be ordered, we&apos;ll let you know and arrange a follow-up visit. You&apos;ll only be charged for any diagnostics or work already completed.</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-base font-semibold text-white mb-2">How do I cancel or reschedule?</h2>
            <p className="text-gray-400 leading-relaxed text-sm">You can cancel or reschedule by contacting us directly by phone or email. Please give us as much notice as possible — ideally 24 hours — so we can offer your slot to another customer.</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-base font-semibold text-white mb-2">Do you offer a call-out fee?</h2>
            <p className="text-gray-400 leading-relaxed text-sm">{calloutNote}</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-base font-semibold text-white mb-2">Can I get a quote before booking?</h2>
            <p className="text-gray-400 leading-relaxed text-sm">Yes. Contact us with details of the work required and we can provide an estimate. For accurate pricing on diagnostic work, a visit is usually needed first.</p>
          </div>

        </div>

        <div className="mt-10 text-center">
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/#booking"
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Book Now
            </Link>
            <Link href="/areas"
              className="bg-gray-800 hover:bg-gray-700 text-gray-200 px-6 py-3 rounded-lg font-medium transition-colors border border-gray-700">
              Areas We Cover
            </Link>
            <Link href="/what-to-expect"
              className="bg-gray-800 hover:bg-gray-700 text-gray-200 px-6 py-3 rounded-lg font-medium transition-colors border border-gray-700">
              What to Expect
            </Link>
          </div>
        </div>

      </div>
    </div>
    </>
  )
}
