import { Phone, Mail, MapPin, Facebook, Twitter, Instagram } from "lucide-react"
import { TikTok } from "./icons/tiktok" // We'll create this custom icon
import Link from "next/link"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  // Replace these with your actual social media URLs
  const socialLinks = {
    facebook: "https://facebook.com/jamiesautocare",
    twitter: "https://twitter.com/jamiesautocare",
    instagram: "https://instagram.com/jamiesautocare",
    tiktok: "https://tiktok.com/@jamiesautocare",
  }

  return (
    <footer className="bg-blue-950 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Jamie's Auto Care</h3>
            <p className="text-gray-300 mb-4">Quality vehicle repairs and servicing at your doorstep.</p>
            <div className="flex space-x-4">
              <Link
                href={socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white"
              >
                <Facebook className="h-6 w-6" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link
                href={socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white"
              >
                <Twitter className="h-6 w-6" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white"
              >
                <Instagram className="h-6 w-6" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link
                href={socialLinks.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white"
              >
                <TikTok className="h-6 w-6" />
                <span className="sr-only">TikTok</span>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/#services" className="text-gray-300 hover:text-white">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/#gallery" className="text-gray-300 hover:text-white">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/#booking" className="text-gray-300 hover:text-white">
                  Book Now
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="text-gray-300 hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Contact Information</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-orange-500 mr-2" />
                <span>07463451967</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-orange-500 mr-2" />
                <span>contact@jamiesautocare.com</span>
              </li>
              <li className="flex items-center">
                <MapPin className="h-5 w-5 text-orange-500 mr-2" />
                <span>Edinburgh, Dalkeith & surrounding areas</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-blue-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {currentYear} Jamie's Auto Care. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
