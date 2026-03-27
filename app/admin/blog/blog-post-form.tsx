"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { saveBlogPost } from "@/app/actions/blog"
import type { BlogPost } from "@/lib/db"

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export default function BlogPostForm({ post }: { post?: BlogPost }) {
  const router = useRouter()
  const [title, setTitle] = useState(post?.title ?? "")
  const [slug, setSlug] = useState(post?.slug ?? "")
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "")
  const [content, setContent] = useState(post?.content ?? "")
  const [published, setPublished] = useState(post?.published === 1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  function handleTitleChange(v: string) {
    setTitle(v)
    if (!post) {
      setSlug(slugify(v))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !slug.trim() || !excerpt.trim() || !content.trim()) {
      setError("All fields are required.")
      return
    }
    setSaving(true)
    setError("")
    try {
      const result = await saveBlogPost({
        id: post?.id,
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        published: published ? 1 : 0,
      })
      if (result.success) {
        router.push("/admin/blog")
        router.refresh()
      } else {
        setError("Failed to save post. Please check the slug is unique.")
      }
    } catch {
      setError("An unexpected error occurred.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
          placeholder="Post title..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Slug <span className="text-gray-500 font-normal">(URL: /blog/your-slug)</span>
        </label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-mono text-sm"
          placeholder="post-slug"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Excerpt <span className="text-gray-500 font-normal">(max 200 chars)</span>
        </label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          maxLength={200}
          rows={3}
          className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 resize-none"
          placeholder="Brief description shown in post listings..."
          required
        />
        <p className="text-gray-500 text-xs mt-1">{excerpt.length}/200 characters</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Content <span className="text-gray-500 font-normal">(HTML or plain text; double newlines create paragraphs)</span>
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={18}
          className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 resize-y font-mono text-sm"
          placeholder="Write your post content here..."
          required
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setPublished((v) => !v)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
            published ? "bg-orange-600" : "bg-gray-600"
          }`}
          role="switch"
          aria-checked={published}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              published ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <label className="text-sm text-gray-300">
          {published ? "Published" : "Draft (not visible on site)"}
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          {saving ? "Saving..." : post ? "Save Changes" : "Create Post"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/blog")}
          className="bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
