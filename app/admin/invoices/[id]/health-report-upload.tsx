"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Upload, Trash2, ExternalLink, Send } from "lucide-react"

export function HealthReportUpload({
  invoiceId,
  hasReport,
  customerEmail,
}: {
  invoiceId: number
  hasReport: boolean
  customerEmail: string
}) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== "application/pdf") { setError("Only PDF files are accepted."); return }
    if (file.size > 10 * 1024 * 1024) { setError("File too large (max 10MB)."); return }
    setError("")
    setSent(false)
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("invoiceId", String(invoiceId))
      const res = await fetch("/api/admin/upload-health-report", { method: "POST", body: fd })
      const json = await res.json()
      if (!res.ok) { setError(json.error || "Upload failed"); return }
      router.refresh()
    } catch {
      setError("Upload failed. Please try again.")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  async function handleDelete() {
    if (!confirm("Remove the health report from this invoice?")) return
    setError("")
    setSent(false)
    setDeleting(true)
    try {
      const res = await fetch("/api/admin/upload-health-report", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error || "Delete failed"); return }
      router.refresh()
    } catch {
      setError("Delete failed. Please try again.")
    } finally {
      setDeleting(false)
    }
  }

  async function handleSendWithReport() {
    setSending(true)
    setError("")
    setSent(false)
    try {
      const res = await fetch(`/api/admin/send-invoice-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error || "Failed to send email"); return }
      setSent(true)
      router.refresh()
    } catch {
      setError("Failed to send email. Please try again.")
    } finally {
      setSending(false)
    }
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-100 text-base flex items-center gap-2">
          <FileText className="h-4 w-4 text-orange-400" /> Vehicle Health Report
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && <p className="text-red-400 text-sm">{error}</p>}
        {sent && (
          <p className="text-green-400 text-sm">Invoice email with health report sent to {customerEmail}.</p>
        )}

        {hasReport ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <a
                href={`/api/admin/health-report?invoiceId=${invoiceId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900/40 border border-blue-700 text-blue-300 hover:bg-blue-900/60 rounded-lg text-sm font-medium transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                View / Download PDF
              </a>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Upload className="h-4 w-4 mr-1" />
                {uploading ? "Uploading..." : "Replace"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
                className="border-red-800 text-red-400 hover:bg-red-900/30"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {deleting ? "Removing..." : "Remove"}
              </Button>
            </div>
            <div className="pt-1 border-t border-gray-700">
              <p className="text-xs text-gray-500 mb-2">
                The report PDF is attached automatically whenever you send the invoice email. Use this to send a fresh copy now:
              </p>
              <Button
                type="button"
                onClick={handleSendWithReport}
                disabled={sending}
                className="bg-orange-500 hover:bg-orange-600 text-white"
                size="sm"
              >
                <Send className="h-4 w-4 mr-2" />
                {sending ? "Sending..." : "Send Invoice Email (with report)"}
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-gray-500 text-sm mb-3">
              No health report attached. Upload a PDF from your diagnostic machine — it will be attached automatically when the invoice email is sent.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="border-orange-600/60 text-orange-400 hover:bg-orange-900/20"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "Uploading..." : "Upload Health Report PDF"}
            </Button>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={handleUpload}
        />
      </CardContent>
    </Card>
  )
}
