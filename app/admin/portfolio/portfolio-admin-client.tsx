"use client"

import { useState, useRef, useTransition } from "react"
import { useRouter } from "next/navigation"
import { savePortfolioItem, removePortfolioItem, reorderPortfolioItems } from "@/app/actions/portfolio"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Plus, Pencil, Trash2, Eye, EyeOff, Upload, Loader2,
  ChevronUp, ChevronDown, X, Check, GripVertical, ImagePlus
} from "lucide-react"
import type { PortfolioItem } from "@/lib/db"

const BLANK: Omit<PortfolioItem, "id" | "created_at"> = {
  title: "", vehicle: "", description: "",
  image_before: "", image_after: "",
  testimonial: "", customer: "",
  active: 1, sort_order: 0,
}

function ImageUpload({
  label, value, onChange,
}: { label: string; value: string; onChange: (path: string) => void }) {
  const [uploading, setUploading] = useState(false)
  const ref = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append("file", file)
    const res = await fetch("/api/admin/upload-portfolio-image", { method: "POST", body: fd })
    if (res.ok) {
      const { path } = await res.json()
      onChange(path)
    }
    setUploading(false)
    if (ref.current) ref.current.value = ""
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-gray-300">{label}</Label>
      <div className="flex gap-2 items-start">
        {value ? (
          <div className="relative group w-24 h-24 shrink-0 rounded-lg overflow-hidden border border-gray-600 bg-gray-900">
            <img src={value} alt={label} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-0.5 right-0.5 bg-black/70 hover:bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => ref.current?.click()}
            className="w-24 h-24 shrink-0 rounded-lg border-2 border-dashed border-gray-600 hover:border-orange-500 bg-gray-800 flex flex-col items-center justify-center cursor-pointer text-gray-500 hover:text-orange-400 transition-colors"
          >
            <ImagePlus className="h-6 w-6 mb-1" />
            <span className="text-xs">Upload</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <Input
            placeholder="or paste image URL / path"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="bg-gray-700 border-gray-600 text-gray-200 text-sm"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={uploading}
            onClick={() => ref.current?.click()}
            className="mt-1.5 border-gray-600 text-gray-400 hover:bg-gray-700 text-xs h-7"
          >
            {uploading ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" />Uploading…</> : <><Upload className="h-3 w-3 mr-1" />Choose file</>}
          </Button>
        </div>
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  )
}

function ItemForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Partial<PortfolioItem>
  onSave: (data: Omit<PortfolioItem, "id" | "created_at"> & { id?: number }) => Promise<void>
  onCancel: () => void
}) {
  const [form, setForm] = useState({
    title: initial.title ?? "",
    vehicle: initial.vehicle ?? "",
    description: initial.description ?? "",
    image_before: initial.image_before ?? "",
    image_after: initial.image_after ?? "",
    testimonial: initial.testimonial ?? "",
    customer: initial.customer ?? "",
    active: initial.active ?? 1,
    sort_order: initial.sort_order ?? 0,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (k: keyof typeof form, v: string | number) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    await onSave({ ...(initial.id ? { id: initial.id } : {}), ...form })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-800 border border-orange-600/40 rounded-xl p-5">
      <h3 className="font-semibold text-orange-400">{initial.id ? "Edit Entry" : "New Entry"}</h3>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Job Title <span className="text-red-400">*</span></Label>
          <Input value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Brake Disc & Pad Replacement" required className="bg-gray-700 border-gray-600 text-gray-100" />
        </div>
        <div className="space-y-1">
          <Label>Vehicle <span className="text-gray-500 font-normal text-xs">(optional)</span></Label>
          <Input value={form.vehicle} onChange={e => set("vehicle", e.target.value)} placeholder="e.g. Ford Focus 2019" className="bg-gray-700 border-gray-600 text-gray-100" />
        </div>
        <div className="sm:col-span-2 space-y-1">
          <Label>Description</Label>
          <Textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="What was done, what was found, outcome..." className="bg-gray-700 border-gray-600 text-gray-100 min-h-[80px]" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ImageUpload label="Before Photo" value={form.image_before} onChange={v => set("image_before", v)} />
        <ImageUpload label="After Photo" value={form.image_after} onChange={v => set("image_after", v)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Customer Quote <span className="text-gray-500 font-normal text-xs">(optional)</span></Label>
          <Textarea value={form.testimonial} onChange={e => set("testimonial", e.target.value)} placeholder={`"Great service, very professional..."`} className="bg-gray-700 border-gray-600 text-gray-100 min-h-[70px]" />
        </div>
        <div className="space-y-1">
          <Label>Customer Name <span className="text-gray-500 font-normal text-xs">(optional)</span></Label>
          <Input value={form.customer} onChange={e => set("customer", e.target.value)} placeholder="e.g. Sarah M." className="bg-gray-700 border-gray-600 text-gray-100" />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" disabled={saving} className="bg-orange-600 hover:bg-orange-700">
          {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : <><Check className="h-4 w-4 mr-2" />Save</>}
        </Button>
        <Button type="button" variant="outline" className="border-gray-600 text-gray-300" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

export default function PortfolioAdminClient({ items: initialItems }: { items: PortfolioItem[] }) {
  const router = useRouter()
  const [items, setItems] = useState(initialItems)
  const [editingId, setEditingId] = useState<number | "new" | null>(null)
  const [isPending, startTransition] = useTransition()

  const refresh = () => router.refresh()

  const handleSave = async (data: Omit<PortfolioItem, "id" | "created_at"> & { id?: number }) => {
    const result = await savePortfolioItem(data)
    if (!result.success) return
    refresh()
    setEditingId(null)
  }

  const handleDelete = (item: PortfolioItem) => {
    if (!confirm(`Delete "${item.title}"? This cannot be undone.`)) return
    startTransition(async () => {
      await removePortfolioItem(item.id, item.image_before, item.image_after)
      refresh()
    })
  }

  const handleToggleActive = (item: PortfolioItem) => {
    startTransition(async () => {
      await savePortfolioItem({ ...item, active: item.active ? 0 : 1 })
      refresh()
    })
  }

  const move = (index: number, dir: -1 | 1) => {
    const newItems = [...items]
    const swap = index + dir
    if (swap < 0 || swap >= newItems.length) return
    ;[newItems[index], newItems[swap]] = [newItems[swap], newItems[index]]
    setItems(newItems)
    startTransition(async () => {
      await reorderPortfolioItems(newItems.map(i => i.id))
      refresh()
    })
  }

  return (
    <div className="space-y-4">
      {/* Add button */}
      {editingId !== "new" && (
        <Button onClick={() => setEditingId("new")} className="bg-orange-600 hover:bg-orange-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Portfolio Entry
        </Button>
      )}

      {/* New item form */}
      {editingId === "new" && (
        <ItemForm
          initial={BLANK}
          onSave={handleSave}
          onCancel={() => setEditingId(null)}
        />
      )}

      {/* Existing items */}
      {items.length === 0 && editingId !== "new" && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="py-10 text-center text-gray-400">
            No portfolio entries yet. Click "Add Portfolio Entry" to get started.
          </CardContent>
        </Card>
      )}

      {items.map((item, index) => (
        <div key={item.id}>
          {editingId === item.id ? (
            <ItemForm
              initial={item}
              onSave={handleSave}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <Card className={`bg-gray-800 border-gray-700 ${!item.active ? "opacity-60" : ""}`}>
              <CardContent className="p-4">
                <div className="flex gap-3 items-start">
                  {/* Before/after thumbnails */}
                  <div className="hidden sm:flex gap-1 shrink-0">
                    {[item.image_before, item.image_after].map((src, i) => (
                      <div key={i} className="w-16 h-16 rounded overflow-hidden bg-gray-900 border border-gray-700">
                        {src ? (
                          <img src={src} alt={i === 0 ? "Before" : "After"} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">{i === 0 ? "B" : "A"}</div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-100">{item.title}</span>
                      {item.vehicle && <span className="text-orange-400 text-sm">{item.vehicle}</span>}
                      {!item.active && <Badge variant="outline" className="text-xs border-gray-600 text-gray-500">Hidden</Badge>}
                    </div>
                    {item.description && <p className="text-gray-400 text-sm mt-0.5 line-clamp-2">{item.description}</p>}
                    {item.testimonial && (
                      <p className="text-gray-500 text-xs mt-1 italic line-clamp-1">"{item.testimonial}"</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Reorder */}
                    <div className="flex flex-col gap-0.5">
                      <button onClick={() => move(index, -1)} disabled={index === 0 || isPending} className="p-0.5 text-gray-500 hover:text-gray-300 disabled:opacity-30">
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => move(index, 1)} disabled={index === items.length - 1 || isPending} className="p-0.5 text-gray-500 hover:text-gray-300 disabled:opacity-30">
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <Button size="sm" variant="outline" className="h-8 w-8 p-0 border-gray-600 text-gray-400 hover:bg-gray-700" onClick={() => handleToggleActive(item)} title={item.active ? "Hide from website" : "Show on website"}>
                      {item.active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0 border-gray-600 text-gray-400 hover:bg-gray-700" onClick={() => setEditingId(item.id)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0 border-red-900 text-red-400 hover:bg-red-900/30" onClick={() => handleDelete(item)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ))}
    </div>
  )
}
