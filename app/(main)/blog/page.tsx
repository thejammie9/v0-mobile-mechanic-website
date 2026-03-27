import type { Metadata } from "next"
import Link from "next/link"
import { BookOpen } from "lucide-react"
import { getAllBlogPosts } from "@/lib/db"
import { format } from "date-fns"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Blog",
  description: "Vehicle maintenance tips, advice, and news from Jamie's Auto Care mobile mechanic service in the Lothians.",
  alternates: { canonical: "https://jamiesautocare.com/blog" },
}

export default function BlogPage() {
  const posts = getAllBlogPosts(true)

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero */}
      <section className="bg-blue-950 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Blog</h1>
          <p className="text-lg text-blue-200 max-w-xl mx-auto">
            Vehicle advice, maintenance tips, and useful guides from Jamie&apos;s Auto Care.
          </p>
        </div>
      </section>

      {/* Posts */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-400 mb-2">Coming Soon</h2>
              <p className="text-gray-500">Blog posts will appear here shortly. Check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map((post) => (
                <article key={post.id} className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden hover:border-orange-500/50 transition-colors group">
                  <div className="p-6">
                    <p className="text-orange-500 text-xs font-medium mb-2">
                      {post.published_at
                        ? format(new Date(post.published_at), "d MMMM yyyy")
                        : format(new Date(post.created_at), "d MMMM yyyy")}
                    </p>
                    <h2 className="text-xl font-bold text-gray-100 mb-3 group-hover:text-orange-400 transition-colors leading-snug">
                      {post.title}
                    </h2>
                    <p className="text-gray-400 text-sm leading-relaxed mb-4">{post.excerpt}</p>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-orange-500 hover:text-orange-400 text-sm font-medium transition-colors"
                    >
                      Read More →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
