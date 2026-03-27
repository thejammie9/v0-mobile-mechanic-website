import { NextRequest, NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import path from "path"
import { getDb } from "@/lib/db"
import { isAdminAuthenticated } from "@/app/admin/actions"
import { randomBytes } from "crypto"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  const bookingId = formData.get("bookingId") as string | null

  if (!file || !bookingId) {
    return NextResponse.json({ error: "Missing file or bookingId" }, { status: 400 })
  }

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/heic"]
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: "Only JPEG, PNG, WebP or HEIC images are accepted" }, { status: 400 })
  }

  if (file.size > 15 * 1024 * 1024) {
    return NextResponse.json({ error: "Max file size is 15MB" }, { status: 400 })
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
  const filename = `${randomBytes(16).toString("hex")}.${ext}`
  const uploadDir = path.join(process.cwd(), "public", "uploads", "jobs")
  const filePath = path.join(uploadDir, filename)

  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(filePath, buffer)

  const relativePath = `/uploads/jobs/${filename}`

  // Add to booking's photos JSON array
  const db = getDb()
  const booking = db.prepare("SELECT photos FROM bookings WHERE id = ?").get(Number(bookingId)) as { photos: string | null } | null
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 })

  const photos: string[] = JSON.parse(booking.photos || "[]")
  photos.push(relativePath)
  db.prepare("UPDATE bookings SET photos = ? WHERE id = ?").run(JSON.stringify(photos), Number(bookingId))

  return NextResponse.json({ path: relativePath })
}
