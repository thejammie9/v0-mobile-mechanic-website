import { Phone, Mail, MapPin, Facebook, Instagram } from "lucide-react"
import Link from "next/link"
import { getSiteSetting } from "@/lib/db"

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const googleReviewLink = getSiteSetting("google_review_link")
  const trustpilotLink   = getSiteSetting("trustpilot_review_link")
  const facebookUrl      = getSiteSetting("facebook_url")
  const instagramUrl     = getSiteSetting("instagram_url")
  const tiktokUrl        = getSiteSetting("tiktok_url")
  const whatsappNumber   = getSiteSetting("whatsapp_number")
  const yellUrl          = getSiteSetting("yell_url")
  const checkatradeUrl   = getSiteSetting("checkatrade_url")
  const mybuilderUrl     = getSiteSetting("mybuilder_url")

  return (
    <footer className="bg-blue-950 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          <div>
            <h3 className="text-xl font-bold mb-4">Jamie&apos;s Auto Care</h3>
            <p className="text-gray-300 mb-4">Quality vehicle repairs and servicing at your doorstep across the Lothians &amp; Borders.</p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-300">
              <li><Link href="/#services" className="hover:text-white transition-colors">Services</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/gallery" className="hover:text-white transition-colors">Our Work</Link></li>
              <li><Link href="/areas" className="hover:text-white transition-colors">Areas Covered</Link></li>
              <li><Link href="/#booking" className="hover:text-white transition-colors">Book Now</Link></li>
              <li><Link href="/#contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Information</h3>
            <ul className="space-y-2 text-gray-300">
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/what-to-expect" className="hover:text-white transition-colors">What to Expect</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms &amp; Conditions</Link></li>
            </ul>

            {/* Review links */}
            {(googleReviewLink || trustpilotLink) && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-200">Leave a review</p>
                {googleReviewLink && (
                  <a
                    href={googleReviewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google Reviews
                  </a>
                )}
                {trustpilotLink && (
                  <a
                    href={trustpilotLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    <svg viewBox="0 0 126.8 120" className="h-4 w-4 flex-shrink-0" fill="#00b67a">
                      <path d="M63.4 0L80.3 51.6H126.8L88.7 78.5L103.1 120L63.4 94.5L23.7 120L38.1 78.5L0 51.6H46.5L63.4 0Z" />
                    </svg>
                    Trustpilot
                  </a>
                )}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-orange-500 flex-shrink-0" />
                <a href="tel:07463451967" className="hover:text-white transition-colors">07463 451967</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-orange-500 flex-shrink-0" />
                <a href="mailto:contact@jamiesautocare.com" className="hover:text-white transition-colors">contact@jamiesautocare.com</a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                <span>Lothians &amp; Borders</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Social media & directory links — managed via Admin > Settings > Social & Directories */}
        {(facebookUrl || instagramUrl || tiktokUrl || whatsappNumber || yellUrl || checkatradeUrl || mybuilderUrl) && (
          <div className="flex justify-center gap-5 mt-8 flex-wrap">
            {whatsappNumber && (
              <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer"
                className="text-gray-400 hover:text-green-400 transition-colors" aria-label="WhatsApp">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
            )}
            {facebookUrl && (
              <a href={facebookUrl} target="_blank" rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400 transition-colors" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
            )}
            {instagramUrl && (
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer"
                className="text-gray-400 hover:text-pink-400 transition-colors" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
            )}
            {tiktokUrl && (
              <a href={tiktokUrl} target="_blank" rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors" aria-label="TikTok">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
                </svg>
              </a>
            )}
            {yellUrl && (
              <a href={yellUrl} target="_blank" rel="noopener noreferrer"
                className="text-gray-400 hover:text-red-400 transition-colors" aria-label="Yell">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
                </svg>
              </a>
            )}
            {checkatradeUrl && (
              <a href={checkatradeUrl} target="_blank" rel="noopener noreferrer"
                className="text-gray-400 hover:text-green-400 transition-colors" aria-label="Checkatrade">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </a>
            )}
            {mybuilderUrl && (
              <a href={mybuilderUrl} target="_blank" rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-300 transition-colors" aria-label="MyBuilder">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                  <path d="M20 6h-2.18c.07-.44.18-.86.18-1a3 3 0 00-6 0c0 .14.11.56.18 1H10c0-.14.02-.28.02-.42A5 5 0 005 1a5 5 0 00-5 5c0 2.76 2.24 5 5 5h1v8a2 2 0 002 2h8a2 2 0 002-2v-8h2a2 2 0 002-2V8a2 2 0 00-2-2z"/>
                </svg>
              </a>
            )}
          </div>
        )}

        <div className="border-t border-blue-800 mt-6 pt-6 text-center text-gray-400 text-sm">
          <p>&copy; {currentYear} Jamie&apos;s Auto Care. All rights reserved.</p>
          <p className="mt-1 text-xs text-gray-500">
            Registered in Scotland &middot; Mobile Mechanic &middot; Lothians &amp; Borders
          </p>
        </div>
      </div>
    </footer>
  )
}
