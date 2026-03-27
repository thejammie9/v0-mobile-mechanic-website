"use server"

import { revalidatePath } from "next/cache"
import {
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  getBlogPostById,
} from "@/lib/db"

export async function saveBlogPost(data: {
  id?: number
  title: string
  slug: string
  excerpt: string
  content: string
  published: number
}) {
  if (data.id) {
    const ok = updateBlogPost(data.id, {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      published: data.published,
    })
    revalidatePath("/blog")
    revalidatePath(`/blog/${data.slug}`)
    revalidatePath("/admin/blog")
    return { success: ok }
  } else {
    const post = createBlogPost({
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      published: data.published,
    })
    revalidatePath("/blog")
    revalidatePath("/admin/blog")
    return { success: true, id: post.id }
  }
}

export async function removeBlogPost(id: number) {
  const ok = deleteBlogPost(id)
  revalidatePath("/blog")
  revalidatePath("/admin/blog")
  return { success: ok }
}

export async function togglePublished(id: number) {
  const post = getBlogPostById(id)
  if (!post) return { success: false }
  const ok = updateBlogPost(id, {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    published: post.published === 1 ? 0 : 1,
  })
  revalidatePath("/blog")
  revalidatePath(`/blog/${post.slug}`)
  revalidatePath("/admin/blog")
  return { success: ok }
}
