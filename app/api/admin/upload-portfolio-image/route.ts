import { NextRequest, NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import path from "path"
import { isAdminAuthenticated } from "@/app/admin/actions"
import { randomBytes } from "crypto"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get("file") as File | null

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/heic"]
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: "Only JPEG, PNG, WebP or HEIC accepted" }, { status: 400 })
  }
  if (file.size > 15 * 1024 * 1024) {
    return NextResponse.json({ error: "Max 15MB" }, { status: 400 })
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
  const filename = `${randomBytes(16).toString("hex")}.${ext}`
  const uploadDir = path.join(process.cwd(), "public", "uploads", "portfolio")
  await writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()))

  return NextResponse.json({ path: `/uploads/portfolio/${filename}` })
}
