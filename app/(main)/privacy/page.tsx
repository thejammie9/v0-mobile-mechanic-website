import Link from "next/link"

export const metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Jamie's Auto Care — how we collect, use, and protect your personal data.",
  alternates: { canonical: "https://jamiesautocare.com/privacy" },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="container mx-auto px-4 py-16 max-w-3xl">

        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-3">Privacy Policy</h1>
          <p className="text-gray-400">Last updated: March 2026</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-gray-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Who We Are</h2>
            <p>
              Jamie&apos;s Auto Care is a sole trader mobile mechanic service operating in Edinburgh,
              the Lothians, and the Borders. Our website is{" "}
              <strong className="text-white">jamiesautocare.com</strong>.
            </p>
            <p className="mt-2">
              For any privacy-related questions, contact us at:{" "}
              <a href="mailto:contact@jamiesautocare.com" className="text-orange-400 hover:text-orange-300">
                contact@jamiesautocare.com
              </a>{" "}
              or by phone on{" "}
              <a href="tel:07463451967" className="text-orange-400 hover:text-orange-300">07463 451967</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. What Data We Collect</h2>
            <p>When you submit a booking request or contact us we may collect:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Your full name</li>
              <li>Phone number</li>
              <li>Email address</li>
              <li>Home or work address (if provided)</li>
              <li>Vehicle make, model, registration, and year</li>
              <li>Description of the vehicle issue or service required</li>
              <li>Preferred appointment date and time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. How We Use Your Data</h2>
            <p>We use your personal data to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Process and confirm your booking</li>
              <li>Contact you regarding your appointment</li>
              <li>Send you invoices and service records</li>
              <li>Respond to enquiries</li>
              <li>Maintain records of work carried out on your vehicle</li>
            </ul>
            <p className="mt-3">
              We do not use your data for marketing purposes without your explicit consent.
              We do not sell, rent, or share your personal data with third parties for commercial purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Legal Basis for Processing</h2>
            <p>
              We process your data on the basis of <strong className="text-white">contractual necessity</strong> —
              i.e. to fulfil the service you have requested — and{" "}
              <strong className="text-white">legitimate interests</strong> in running our business and
              maintaining service records.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. How Long We Keep Your Data</h2>
            <p>
              We retain booking and invoice records for up to <strong className="text-white">6 years</strong> in
              line with HMRC requirements for sole trader accounting records. After this period, data is
              securely deleted.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Data Security</h2>
            <p>
              Your data is stored securely on a private server. We take reasonable technical and
              organisational measures to protect it against unauthorised access, loss, or disclosure.
              Booking confirmation emails are sent via an encrypted connection.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Cookies</h2>
            <p>
              Our website does not use tracking or advertising cookies. We use only a session cookie
              for the admin area of our site, which is not accessible to customers and is deleted
              when the browser session ends.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Your Rights</h2>
            <p>Under UK GDPR you have the right to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong className="text-white">Access</strong> the personal data we hold about you</li>
              <li><strong className="text-white">Correct</strong> any inaccurate data</li>
              <li><strong className="text-white">Request deletion</strong> of your data (subject to legal retention obligations)</li>
              <li><strong className="text-white">Object</strong> to or restrict processing in certain circumstances</li>
              <li><strong className="text-white">Data portability</strong> — receive a copy of your data in a machine-readable format</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:contact@jamiesautocare.com" className="text-orange-400 hover:text-orange-300">
                contact@jamiesautocare.com
              </a>. We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Complaints</h2>
            <p>
              If you have concerns about how we handle your data, you have the right to lodge a complaint
              with the UK data protection regulator, the{" "}
              <strong className="text-white">Information Commissioner&apos;s Office (ICO)</strong>:{" "}
              <span className="text-orange-400">ico.org.uk</span> or call{" "}
              <span className="text-orange-400">0303 123 1113</span>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. Any changes will be posted on this page
              with an updated date at the top.
            </p>
          </section>

        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 text-center">
          <Link href="/"
            className="text-gray-400 hover:text-white text-sm transition-colors">
            &larr; Back to Home
          </Link>
        </div>

      </div>
    </div>
  )
}
