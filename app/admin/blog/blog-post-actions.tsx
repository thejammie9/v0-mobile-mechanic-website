"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { removeBlogPost, togglePublished } from "@/app/actions/blog"
import type { BlogPost } from "@/lib/db"

export default function BlogPostActions({ post }: { post: BlogPost }) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return
    await removeBlogPost(post.id)
    router.refresh()
  }

  async function handleToggle() {
    await togglePublished(post.id)
    router.refresh()
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        href={`/admin/blog/${post.id}/edit`}
        className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-1.5 rounded transition-colors"
      >
        Edit
      </Link>
      <button
        onClick={handleToggle}
        className={`text-xs px-3 py-1.5 rounded transition-colors ${
          post.published === 1
            ? "bg-yellow-900/40 hover:bg-yellow-900/60 text-yellow-300"
            : "bg-green-900/40 hover:bg-green-900/60 text-green-300"
        }`}
      >
        {post.published === 1 ? "Unpublish" : "Publish"}
      </button>
      <button
        onClick={handleDelete}
        className="text-xs bg-red-900/40 hover:bg-red-900/60 text-red-300 px-3 py-1.5 rounded transition-colors"
      >
        Delete
      </button>
    </div>
  )
}
