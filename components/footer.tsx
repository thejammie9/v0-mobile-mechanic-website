import { Facebook, Twitter, Instagram } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-blue-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Jamie's Auto Care</h3>
            <p className="text-gray-300 mb-4">Quality vehicle repairs and servicing at your doorstep.</p>
            <div className="flex space-x-4">
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">
                <Facebook className="h-6 w-6" />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">
                <Twitter className="h-6 w-6" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">
                <Instagram className="h-6 w-6" />
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#services" className="text-gray-300 hover:text-white">
                  Services
                </a>
              </li>
              <li>
                <a href="#gallery" className="text-gray-300 hover:text-white">
                  Gallery
                </a>
              </li>
              <li>
                <a href="#reviews" className="text-gray-300 hover:text-white">
                  Reviews
                </a>
              </li>
              <li>
                <a href="#booking" className="text-gray-300 hover:text-white">
                  Book Now
                </a>
              </li>
              <li>
                <a href="#contact" className="text-gray-300 hover:text-white">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Newsletter</h3>
            <p className="text-gray-300 mb-4">Subscribe to our newsletter for tips, news and special offers.</p>
            <form className="space-y-2">
              <input type="email" placeholder="Your email address" className="w-full px-3 py-2 rounded text-gray-800" />
              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-blue-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Jamie's Auto Care. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
