import { redirect } from "next/navigation"
import Link from "next/link"
import { isAdminAuthenticated } from "@/app/admin/actions"
import { ChevronLeft } from "lucide-react"
import BlogPostForm from "../blog-post-form"

export const dynamic = "force-dynamic"

export default async function NewBlogPostPage() {
  const isAuthenticated = await isAdminAuthenticated()
  if (!isAuthenticated) redirect("/admin/login")

  return (
    <div className="min-h-screen bg-gray-900">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/admin/blog"
            className="flex items-center gap-1 text-gray-400 hover:text-gray-200 text-sm transition-colors mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Blog
          </Link>
          <h1 className="text-2xl font-bold text-gray-100">New Blog Post</h1>
        </div>
        <BlogPostForm />
      </main>
    </div>
  )
}
