import { redirect } from "next/navigation"
import Link from "next/link"
import { isAdminAuthenticated } from "@/app/admin/actions"
import { getAllBlogPosts } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, BookOpen } from "lucide-react"
import { format } from "date-fns"
import BlogPostActions from "./blog-post-actions"

export const dynamic = "force-dynamic"

export default async function AdminBlogPage() {
  const isAuthenticated = await isAdminAuthenticated()
  if (!isAuthenticated) redirect("/admin/login")

  const posts = getAllBlogPosts()

  return (
    <div className="min-h-screen bg-gray-900">
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-100">Blog Posts</h1>
          <Link
            href="/admin/blog/new"
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
          >
            <PlusCircle className="h-4 w-4" />
            New Post
          </Link>
        </div>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100">All Posts</CardTitle>
          </CardHeader>
          <CardContent>
            {posts.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p className="text-lg mb-1">No blog posts yet</p>
                <p className="text-sm">Create your first post using the button above.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700 text-gray-400 text-left">
                      <th className="pb-3 font-medium">Title</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Created</th>
                      <th className="pb-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post) => (
                      <tr key={post.id} className="border-b border-gray-700/50 last:border-0 hover:bg-gray-700/30">
                        <td className="py-4 pr-4">
                          <p className="font-medium text-gray-100">{post.title}</p>
                          <p className="text-gray-500 text-xs mt-0.5 font-mono">/blog/{post.slug}</p>
                        </td>
                        <td className="py-4 pr-4">
                          {post.published === 1 ? (
                            <Badge className="bg-green-900/50 text-green-300 border-green-700 text-xs">Published</Badge>
                          ) : (
                            <Badge className="bg-gray-700 text-gray-400 border-gray-600 text-xs">Draft</Badge>
                          )}
                        </td>
                        <td className="py-4 pr-4 text-gray-400">
                          {format(new Date(post.created_at), "dd/MM/yyyy")}
                        </td>
                        <td className="py-4">
                          <BlogPostActions post={post} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
