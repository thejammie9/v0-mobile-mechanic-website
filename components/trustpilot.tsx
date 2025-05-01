export default function TrustpilotWidget() {
  return (
    <section className="py-16 bg-white" id="reviews">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-blue-900">Customer Reviews</h2>

        <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          {/* Trustpilot Widget */}
          <div className="text-center mb-8">
            <a
              href="https://uk.trustpilot.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#00b67a] text-white px-4 py-2 rounded font-bold"
            >
              See our reviews on Trustpilot
            </a>
          </div>

          {/* Review Form */}
          <div id="review-form-container">
            <h3 className="text-2xl font-bold text-center mb-6">Leave a Review</h3>

            <form id="review-form" className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="block font-medium">
                  Your Name
                </label>
                <input id="name" name="name" className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
              </div>

              <div className="space-y-2">
                <label className="block font-medium">Your Rating</label>
                <div className="flex space-x-1">
                  <button type="button" className="star-rating" data-rating="1">
                    ★
                  </button>
                  <button type="button" className="star-rating" data-rating="2">
                    ★
                  </button>
                  <button type="button" className="star-rating" data-rating="3">
                    ★
                  </button>
                  <button type="button" className="star-rating" data-rating="4">
                    ★
                  </button>
                  <button type="button" className="star-rating" data-rating="5">
                    ★
                  </button>
                </div>
                <input type="hidden" id="rating" name="rating" value="0" />
              </div>

              <div className="space-y-2">
                <label htmlFor="review" className="block font-medium">
                  Your Review
                </label>
                <textarea
                  id="review"
                  name="review"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded"
              >
                Submit Review
              </button>
            </form>
          </div>

          <div id="review-success" className="hidden">
            <div className="bg-green-50 border-green-200 border p-4 rounded-md">
              <div className="flex">
                <svg className="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h4 className="text-green-800 font-bold">Thank You!</h4>
                  <p className="text-green-700">Your review has been submitted. We appreciate your feedback!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
