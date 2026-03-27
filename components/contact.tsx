import { Phone, Mail, MapPin } from "lucide-react"

// TODO: Update with your actual contact details
const CONTACT_INFO = {
  phone: "07463 451967", // e.g., "07463 451967"
  email: "contact@jamiesautocare.com", // e.g., "contact@jamiesautocare.com"
  serviceArea: "Lothians & Borders",
}

export default function Contact() {
  return (
    <section className="py-16 bg-gray-900" id="contact">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-blue-300">Contact Us</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <div className="bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-700">
              <h3 className="text-xl font-bold mb-4 text-blue-300">Get In Touch</h3>

              <div className="space-y-4">
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-orange-500 mt-1 mr-3" />
                  <div>
                    <p className="font-medium text-gray-200">Phone</p>
                    <p className="text-gray-400">
                      {CONTACT_INFO.phone || <span className="text-gray-500 italic">Add phone number</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-orange-500 mt-1 mr-3" />
                  <div>
                    <p className="font-medium text-gray-200">Email</p>
                    <p className="text-gray-400">
                      {CONTACT_INFO.email || <span className="text-gray-500 italic">Add email address</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-orange-500 mt-1 mr-3" />
                  <div>
                    <p className="font-medium text-gray-200">Service Area</p>
                    <p className="text-gray-400">{CONTACT_INFO.serviceArea}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-700">
              <h3 className="text-xl font-bold mb-4 text-blue-300">Business Hours</h3>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-200">Monday - Friday</span>
                  <span className="text-gray-400">9:00 AM – 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-200">Saturday</span>
                  <span className="text-gray-400">10:00 AM – 2:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-200">Sunday</span>
                  <span className="text-gray-400">Closed</span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-[400px] rounded-lg overflow-hidden shadow-sm border border-gray-700">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d170000!2d-2.787097!3d55.5501248!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6c0e8e0c50b95821%3A0xc491f6ec975f002!2sJamie%27s%20Auto%20Care!5e0!3m2!1sen!2suk!4v1742745600000!5m2!1sen!2suk"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Jamie's Auto Care service area map"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  )
}
