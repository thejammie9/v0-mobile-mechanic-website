import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { getBlogPostBySlug } from "@/lib/db"
import { format } from "date-fns"
import { Phone, Calendar } from "lucide-react"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPostBySlug(slug)
  if (!post || post.published !== 1) return {}
  return {
    title: `${post.title} | Jamie's Auto Care`,
    description: post.excerpt,
    alternates: { canonical: `https://jamiesautocare.com/blog/${slug}` },
  }
}

function renderContent(content: string): string {
  // If the content already contains <p> tags, render as-is
  if (content.includes("<p>")) return content
  // Otherwise convert double newlines to paragraph tags
  const paragraphs = content.split(/\n\n+/).filter(Boolean)
  return paragraphs.map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`).join("\n")
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getBlogPostBySlug(slug)

  if (!post || post.published !== 1) notFound()

  const publishedDate = post.published_at
    ? format(new Date(post.published_at), "d MMMM yyyy")
    : format(new Date(post.created_at), "d MMMM yyyy")

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.published_at ?? post.created_at,
    dateModified: post.updated_at,
    author: {
      "@type": "Person",
      name: "Jamie",
    },
    publisher: {
      "@type": "Organization",
      name: "Jamie's Auto Care",
      url: "https://jamiesautocare.com",
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-gray-950">
        {/* Hero */}
        <section className="bg-blue-950 py-14">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="flex items-center gap-2 text-blue-300 text-sm mb-3">
              <Calendar className="h-4 w-4" />
              {publishedDate}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">{post.title}</h1>
            <p className="text-blue-200 mt-4 text-lg">{post.excerpt}</p>
          </div>
        </section>

        {/* Content */}
        <section className="py-14">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-5xl mx-auto">
              {/* Article */}
              <article className="lg:col-span-2">
                <div
                  className="prose prose-invert prose-orange max-w-none text-gray-300 leading-relaxed
                    [&_p]:mb-4 [&_p]:text-gray-300 [&_strong]:text-gray-100 [&_h2]:text-gray-100
                    [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3
                    [&_ul]:space-y-2 [&_ul]:my-4 [&_li]:text-gray-300"
                  dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}
                />
              </article>

              {/* Sidebar */}
              <aside className="lg:col-span-1">
                <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 sticky top-20">
                  <h3 className="text-lg font-bold text-gray-100 mb-2">Need a mechanic?</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Jamie&apos;s Auto Care provides professional mobile mechanic services across the Lothians.
                    We come to you.
                  </p>
                  <Link
                    href="/#booking"
                    className="flex items-center justify-center gap-2 w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-3 rounded-lg transition-colors text-sm"
                  >
                    <Phone className="h-4 w-4" />
                    Book Now
                  </Link>
                  <Link
                    href="/pricing"
                    className="flex items-center justify-center w-full mt-2 border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-gray-100 font-medium px-4 py-2.5 rounded-lg transition-colors text-sm"
                  >
                    View Pricing
                  </Link>
                </div>
              </aside>
            </div>

            {/* Back link */}
            <div className="max-w-5xl mx-auto mt-12 pt-8 border-t border-gray-800">
              <Link
                href="/blog"
                className="text-orange-500 hover:text-orange-400 text-sm font-medium transition-colors"
              >
                ← Back to Blog
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
