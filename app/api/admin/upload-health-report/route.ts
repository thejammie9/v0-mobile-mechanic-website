import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { getDb } from "@/lib/db"
import { isAdminAuthenticated } from "@/app/admin/actions"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  const isAuthenticated = await isAdminAuthenticated()
  if (!isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const invoiceId = formData.get("invoiceId") as string | null

    if (!file || !invoiceId) {
      return NextResponse.json({ error: "Missing file or invoiceId" }, { status: 400 })
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are accepted" }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 })
    }

    const dir = path.join(process.cwd(), "data", "health-reports")
    await mkdir(dir, { recursive: true })

    const filename = `hr_${invoiceId}.pdf`
    const filePath = path.join(dir, filename)
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)

    // Update invoice record
    const db = getDb()
    db.prepare("UPDATE invoices SET health_report = ? WHERE id = ?").run(filename, parseInt(invoiceId, 10))

    return NextResponse.json({ success: true, filename })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const isAuthenticated = await isAdminAuthenticated()
  if (!isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { invoiceId } = await req.json()
    if (!invoiceId) return NextResponse.json({ error: "Missing invoiceId" }, { status: 400 })

    const db = getDb()
    db.prepare("UPDATE invoices SET health_report = NULL WHERE id = ?").run(parseInt(invoiceId, 10))

    // Also delete the file
    const { unlink } = require("fs/promises")
    const filePath = path.join(process.cwd(), "data", "health-reports", `hr_${invoiceId}.pdf`)
    try { await unlink(filePath) } catch {}

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
