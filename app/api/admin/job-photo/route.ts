import { NextRequest, NextResponse } from "next/server"
import { unlink } from "fs/promises"
import path from "path"
import { getDb } from "@/lib/db"
import { isAdminAuthenticated } from "@/app/admin/actions"

export const runtime = "nodejs"

export async function DELETE(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { bookingId, photoPath } = await req.json()
  if (!bookingId || !photoPath) {
    return NextResponse.json({ error: "Missing bookingId or photoPath" }, { status: 400 })
  }

  // Validate path to prevent directory traversal
  if (!photoPath.startsWith("/uploads/jobs/") || photoPath.includes("..")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 })
  }

  const db = getDb()
  const booking = db.prepare("SELECT photos FROM bookings WHERE id = ?").get(Number(bookingId)) as { photos: string | null } | null
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const photos: string[] = JSON.parse(booking.photos || "[]")
  const updated = photos.filter((p) => p !== photoPath)
  db.prepare("UPDATE bookings SET photos = ? WHERE id = ?").run(JSON.stringify(updated), Number(bookingId))

  // Delete file from disk
  try {
    await unlink(path.join(process.cwd(), "public", photoPath))
  } catch { /* file might already be gone */ }

  return NextResponse.json({ success: true })
}
