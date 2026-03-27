import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import path from "path"
import { isAdminAuthenticated } from "@/app/admin/actions"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  const isAuthenticated = await isAdminAuthenticated()
  if (!isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const invoiceId = req.nextUrl.searchParams.get("invoiceId")
  if (!invoiceId) return NextResponse.json({ error: "Missing invoiceId" }, { status: 400 })

  try {
    const filePath = path.join(process.cwd(), "data", "health-reports", `hr_${invoiceId}.pdf`)
    const buffer = await readFile(filePath)
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="health-report-${invoiceId}.pdf"`,
      },
    })
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 })
  }
}
