import { getSiteSetting } from "@/lib/db"

// Add your Trustpilot reviews here
const reviews: {
  name: string
  date: string
  rating: number
  title: string
  body: string
}[] = []

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-5 h-5 ${star <= rating ? "text-[#00b67a]" : "text-gray-600"}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}

// Trustpilot star SVG
const TrustpilotStar = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 126.8 120" className={className} fill="#00b67a">
    <path d="M63.4 0L80.3 51.6H126.8L88.7 78.5L103.1 120L63.4 94.5L23.7 120L38.1 78.5L0 51.6H46.5L63.4 0Z" />
  </svg>
)

// Google G SVG
const GoogleG = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

export default function Reviews() {
  const trustpilotLink = getSiteSetting("trustpilot_review_link") || "https://ie.trustpilot.com/evaluate/jamiesautocare.com"
  const googleLink     = getSiteSetting("google_review_link") || ""

  return (
    <section className="py-16 bg-gray-900" id="reviews">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-12">
          <div className="flex items-center gap-3 mb-3">
            <TrustpilotStar className="h-8 w-8" />
            <h2 className="text-3xl font-bold text-gray-100">Customer Reviews</h2>
          </div>
          <p className="text-gray-400">Rated by verified customers — leave a review and help others find us</p>
        </div>

        {/* Review platform buttons — side by side on desktop, scrollable row on mobile */}
        <div className="flex gap-3 justify-center mb-10 overflow-x-auto pb-1 px-1 snap-x">
          <a
            href={trustpilotLink}
            target="_blank"
            rel="noopener noreferrer"
            className="snap-start shrink-0 inline-flex items-center gap-2.5 bg-[#00b67a] hover:bg-[#00a06b] text-white font-semibold px-5 py-3 rounded-lg transition-colors text-sm whitespace-nowrap shadow"
          >
            <TrustpilotStar className="h-5 w-5 flex-shrink-0" style={{ fill: "white" }} />
            Review on Trustpilot
          </a>

          {googleLink && (
            <a
              href={googleLink}
              target="_blank"
              rel="noopener noreferrer"
              className="snap-start shrink-0 inline-flex items-center gap-2.5 bg-white hover:bg-gray-100 text-gray-800 font-semibold px-5 py-3 rounded-lg transition-colors text-sm whitespace-nowrap shadow border border-gray-200"
            >
              <GoogleG className="h-5 w-5 flex-shrink-0" />
              Review on Google
            </a>
          )}
        </div>

        {reviews.length === 0 ? (
          <div className="max-w-2xl mx-auto text-center bg-gray-800 border border-gray-700 rounded-xl p-10">
            <TrustpilotStar className="h-12 w-12 mx-auto mb-4 opacity-40" />
            <h3 className="text-lg font-semibold text-gray-200 mb-2">Had work done with us?</h3>
            <p className="text-gray-400 text-sm">
              Reviews help other customers know what to expect and help us grow. Every review makes a real difference — thank you.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review, index) => (
              <div key={index} className="bg-gray-800 border border-gray-700 rounded-xl p-6 flex flex-col gap-3">
                <Stars rating={review.rating} />
                <h4 className="font-semibold text-gray-100">{review.title}</h4>
                <p className="text-gray-400 text-sm leading-relaxed flex-1">"{review.body}"</p>
                <div className="pt-2 border-t border-gray-700 flex justify-between items-center">
                  <span className="text-gray-300 font-medium text-sm">{review.name}</span>
                  <span className="text-gray-500 text-xs">{review.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
