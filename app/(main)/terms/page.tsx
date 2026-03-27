import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions for Jamie's Auto Care mobile mechanic services.",
  alternates: { canonical: "https://jamiesautocare.com/terms" },
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-200">
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-3xl font-bold text-white mb-2">Terms &amp; Conditions</h1>
        <p className="text-gray-400 text-sm mb-10">Last updated: March 2026</p>

        <div className="space-y-8 text-gray-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. About Us</h2>
            <p>
              Jamie&apos;s Auto Care is a mobile vehicle repair and servicing business operating across
              Edinburgh, the Lothians, and the Scottish Borders. By booking our services or using this
              website, you agree to the following terms and conditions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Bookings</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>All bookings are subject to availability and confirmation by Jamie&apos;s Auto Care.</li>
              <li>A booking is only confirmed once you receive a confirmation email from us.</li>
              <li>
                You must ensure your vehicle is accessible and that a safe, legal working space is
                available at the agreed location.
              </li>
              <li>
                Please inform us of any known hazards or special conditions at the work site when
                booking.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Cancellations &amp; Rescheduling</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                We ask for at least <strong>24 hours&apos; notice</strong> if you need to cancel or
                reschedule your appointment.
              </li>
              <li>
                Late cancellations (under 24 hours) or no-shows may incur a call-out charge to cover
                travel and lost time.
              </li>
              <li>
                We reserve the right to reschedule appointments due to unforeseen circumstances such as
                severe weather or vehicle breakdown. We will contact you as soon as possible to arrange
                an alternative time.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Pricing &amp; Payment</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                All quoted prices are estimates based on the information provided. The final price may
                vary if additional work or parts are required once the vehicle is inspected.
              </li>
              <li>Any changes to the scope of work will be agreed with you before proceeding.</li>
              <li>Payment is due upon completion of the work unless otherwise agreed in writing.</li>
              <li>
                <strong>Vehicle keys will not be returned until full payment has been received</strong> for
                all work carried out. This applies to all jobs regardless of whether the vehicle is at
                the customer&apos;s home, workplace, or any other location.
              </li>
              <li>
                We accept payment by cash or card on the day of the work.
              </li>
              <li>
                Late payments may be subject to a late payment charge in accordance with the Late
                Payment of Commercial Debts Act 1998.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Parts &amp; Labour</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                We use quality parts appropriate for your vehicle. Where possible, we will advise you on
                OEM vs aftermarket options.
              </li>
              <li>
                Parts supplied by Jamie&apos;s Auto Care carry the manufacturer&apos;s warranty. Labour is
                guaranteed for <strong>14 days</strong> from the date of the work. This covers situations
                such as torqued fixings working loose, which we are happy to return and rectify at no
                charge. The guarantee does not apply if the vehicle has been altered or worked on by a
                third party after our visit.
              </li>
              <li>
                If you supply your own parts, we accept no liability for failure caused by those parts
                and the labour guarantee does not apply.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Liability</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                Jamie&apos;s Auto Care carries appropriate public liability insurance. We are not
                responsible for pre-existing faults or damage unrelated to the work carried out.
              </li>
              <li>
                We are not liable for any indirect or consequential loss arising from our services,
                including loss of earnings or vehicle hire costs.
              </li>
              <li>
                Our liability is limited to the cost of the specific repair or service that is the
                subject of any claim.
              </li>
              <li>
                If a vehicle cannot be safely or legally repaired at the agreed location, we reserve the
                right to refuse or halt work without charge.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Your Responsibilities</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>You confirm that you are the registered keeper or have the owner&apos;s authority to have work carried out on the vehicle.</li>
              <li>You must provide accurate information about the vehicle and any known faults when booking.</li>
              <li>Ensure pets, children, and other people are kept away from the work area during the repair.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Data &amp; Privacy</h2>
            <p>
              We collect and process your personal data only as necessary to provide our services. Please
              see our{" "}
              <Link href="/privacy" className="text-orange-400 hover:text-orange-300 underline">
                Privacy Policy
              </Link>{" "}
              for full details on how your data is used and stored.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Governing Law</h2>
            <p>
              These terms are governed by the laws of Scotland. Any disputes shall be subject to the
              exclusive jurisdiction of the Scottish courts.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Contact</h2>
            <p>
              If you have any questions about these terms, please contact us at{" "}
              <a
                href="mailto:contact@jamiesautocare.com"
                className="text-orange-400 hover:text-orange-300 underline"
              >
                contact@jamiesautocare.com
              </a>
              .
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
