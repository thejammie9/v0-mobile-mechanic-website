"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Plus, Trash2, Pencil, Check, X, Wrench, Package,
  Globe, MapPin, Save, Eye, EyeOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { getPresets, createPreset, updatePreset, deletePreset } from "@/app/actions/presets"
import {
  saveSiteSettings,
  createAreaAction,
  updateAreaAction,
  toggleAreaAction,
  deleteAreaAction,
} from "@/app/actions/site-settings"
import type { ServicePreset, SiteSetting, ServiceArea } from "@/lib/db"

// ── Types ──────────────────────────────────────────────────────────────────────

type PresetFormData = {
  name: string; description: string; hours: string; rate: string
  qty: string; unit_price: string; sort_order: string
}

const emptyForm = (): PresetFormData => ({
  name: "", description: "", hours: "1", rate: "60", qty: "1", unit_price: "0", sort_order: "0",
})

function presetToForm(p: ServicePreset): PresetFormData {
  return {
    name: p.name, description: p.description,
    hours: String(p.hours), rate: String(p.rate),
    qty: String(p.qty), unit_price: String(p.unit_price),
    sort_order: String(p.sort_order),
  }
}

const inputCls = "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-orange-500"
const textareaCls = "w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"

const COUNTIES = ["Edinburgh", "East Lothian", "Midlothian", "West Lothian", "Scottish Borders", "Other"]
const countyColours: Record<string, string> = {
  "Edinburgh": "bg-blue-900/60 text-blue-300 border-blue-700",
  "East Lothian": "bg-green-900/60 text-green-300 border-green-700",
  "Midlothian": "bg-purple-900/60 text-purple-300 border-purple-700",
  "West Lothian": "bg-orange-900/60 text-orange-300 border-orange-700",
  "Scottish Borders": "bg-teal-900/60 text-teal-300 border-teal-700",
}

// ── Preset sub-components (unchanged from before) ─────────────────────────────

function LabourAddForm({ form, setForm, saving, onAdd, onCancel }: {
  form: PresetFormData
  setForm: React.Dispatch<React.SetStateAction<PresetFormData>>
  saving: boolean; onAdd: () => void; onCancel: () => void
}) {
  return (
    <div className="bg-gray-750 border border-gray-600 rounded-lg p-4 space-y-3 mt-3">
      <p className="text-sm font-medium text-gray-300">New Labour Preset</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-gray-400 text-xs">Name</Label>
          <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Full Service" className={inputCls} />
        </div>
        <div className="space-y-1">
          <Label className="text-gray-400 text-xs">Description (invoice line)</Label>
          <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="e.g. Carry out full vehicle service" className={inputCls} />
        </div>
        <div className="space-y-1">
          <Label className="text-gray-400 text-xs">Hours</Label>
          <Input inputMode="decimal" value={form.hours}
            onChange={e => setForm(f => ({ ...f, hours: e.target.value }))} placeholder="1.5" className={inputCls} />
        </div>
        <div className="space-y-1">
          <Label className="text-gray-400 text-xs">Rate £/hr</Label>
          <Input inputMode="decimal" value={form.rate}
            onChange={e => setForm(f => ({ ...f, rate: e.target.value }))} placeholder="60.00" className={inputCls} />
        </div>
        <div className="space-y-1">
          <Label className="text-gray-400 text-xs">Sort Order</Label>
          <Input inputMode="numeric" value={form.sort_order}
            onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} placeholder="0" className={inputCls} />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <Button size="sm" disabled={saving || !form.name.trim()} onClick={onAdd}
          className="bg-orange-500 hover:bg-orange-600 text-white">
          <Check className="h-4 w-4 mr-1" />{saving ? "Saving..." : "Add Preset"}
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel} className="border-gray-600 text-gray-300 hover:bg-gray-700">
          <X className="h-4 w-4 mr-1" /> Cancel
        </Button>
      </div>
    </div>
  )
}

function PartAddForm({ form, setForm, saving, onAdd, onCancel }: {
  form: PresetFormData
  setForm: React.Dispatch<React.SetStateAction<PresetFormData>>
  saving: boolean; onAdd: () => void; onCancel: () => void
}) {
  return (
    <div className="bg-gray-750 border border-gray-600 rounded-lg p-4 space-y-3 mt-3">
      <p className="text-sm font-medium text-gray-300">New Part / Material Preset</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-gray-400 text-xs">Name</Label>
          <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Engine Oil 5W-30 5L" className={inputCls} />
        </div>
        <div className="space-y-1">
          <Label className="text-gray-400 text-xs">Description (invoice line)</Label>
          <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="e.g. Engine oil 5W-30 5L" className={inputCls} />
        </div>
        <div className="space-y-1">
          <Label className="text-gray-400 text-xs">Default Qty</Label>
          <Input inputMode="numeric" value={form.qty}
            onChange={e => setForm(f => ({ ...f, qty: e.target.value }))} placeholder="1" className={inputCls} />
        </div>
        <div className="space-y-1">
          <Label className="text-gray-400 text-xs">Unit Price £</Label>
          <Input inputMode="decimal" value={form.unit_price}
            onChange={e => setForm(f => ({ ...f, unit_price: e.target.value }))} placeholder="25.00" className={inputCls} />
        </div>
        <div className="space-y-1">
          <Label className="text-gray-400 text-xs">Sort Order</Label>
          <Input inputMode="numeric" value={form.sort_order}
            onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} placeholder="0" className={inputCls} />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <Button size="sm" disabled={saving || !form.name.trim()} onClick={onAdd}
          className="bg-orange-500 hover:bg-orange-600 text-white">
          <Check className="h-4 w-4 mr-1" />{saving ? "Saving..." : "Add Preset"}
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel} className="border-gray-600 text-gray-300 hover:bg-gray-700">
          <X className="h-4 w-4 mr-1" /> Cancel
        </Button>
      </div>
    </div>
  )
}

function PresetRow({ preset, editingId, editForm, setEditForm, saving, onStartEdit, onSaveEdit, onCancelEdit, onDelete }: {
  preset: ServicePreset; editingId: number | null; editForm: PresetFormData
  setEditForm: React.Dispatch<React.SetStateAction<PresetFormData>>
  saving: boolean; onStartEdit: (p: ServicePreset) => void
  onSaveEdit: (p: ServicePreset) => void; onCancelEdit: () => void
  onDelete: (id: number, name: string) => void
}) {
  const isEditing = editingId === preset.id
  const isLabour = preset.type === "labour"

  if (isEditing) {
    return (
      <div className="bg-gray-700 border border-orange-600 rounded-lg p-4 space-y-3">
        <p className="text-xs text-orange-400 font-medium uppercase tracking-wide">Editing: {preset.name}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-gray-400 text-xs">Name</Label>
            <Input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className={inputCls} />
          </div>
          <div className="space-y-1">
            <Label className="text-gray-400 text-xs">Description</Label>
            <Input value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} className={inputCls} />
          </div>
          {isLabour ? (
            <>
              <div className="space-y-1">
                <Label className="text-gray-400 text-xs">Hours</Label>
                <Input inputMode="decimal" value={editForm.hours} onChange={e => setEditForm(f => ({ ...f, hours: e.target.value }))} className={inputCls} />
              </div>
              <div className="space-y-1">
                <Label className="text-gray-400 text-xs">Rate £/hr</Label>
                <Input inputMode="decimal" value={editForm.rate} onChange={e => setEditForm(f => ({ ...f, rate: e.target.value }))} className={inputCls} />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <Label className="text-gray-400 text-xs">Qty</Label>
                <Input inputMode="numeric" value={editForm.qty} onChange={e => setEditForm(f => ({ ...f, qty: e.target.value }))} className={inputCls} />
              </div>
              <div className="space-y-1">
                <Label className="text-gray-400 text-xs">Unit Price £</Label>
                <Input inputMode="decimal" value={editForm.unit_price} onChange={e => setEditForm(f => ({ ...f, unit_price: e.target.value }))} className={inputCls} />
              </div>
            </>
          )}
          <div className="space-y-1">
            <Label className="text-gray-400 text-xs">Sort Order</Label>
            <Input inputMode="numeric" value={editForm.sort_order} onChange={e => setEditForm(f => ({ ...f, sort_order: e.target.value }))} className={inputCls} />
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <Button size="sm" disabled={saving} onClick={() => onSaveEdit(preset)} className="bg-green-700 hover:bg-green-600 text-white">
            <Check className="h-4 w-4 mr-1" />{saving ? "Saving..." : "Save"}
          </Button>
          <Button size="sm" variant="outline" onClick={onCancelEdit} className="border-gray-600 text-gray-300 hover:bg-gray-700">
            <X className="h-4 w-4 mr-1" /> Cancel
          </Button>
        </div>
      </div>
    )
  }

  const priceInfo = isLabour
    ? `${preset.hours}h @ £${preset.rate}/hr = £${(preset.hours * preset.rate).toFixed(2)}`
    : `Qty ${preset.qty} @ £${preset.unit_price} = £${(preset.qty * preset.unit_price).toFixed(2)}`

  return (
    <div className="flex items-center gap-3 bg-gray-700 rounded-lg px-4 py-3 group">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-100 truncate">{preset.name}</p>
        <p className="text-xs text-gray-400 truncate">{preset.description}</p>
        <p className="text-xs text-gray-500 mt-0.5">{priceInfo}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onStartEdit(preset)} className="p-1.5 rounded text-gray-400 hover:text-orange-400 hover:bg-gray-600 transition-colors">
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => onDelete(preset.id, preset.name)} className="p-1.5 rounded text-gray-400 hover:text-red-400 hover:bg-gray-600 transition-colors">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

// ── Area form ──────────────────────────────────────────────────────────────────

type AreaFormData = { name: string; slug: string; county: string; description: string; nearby_areas: string; sort_order: string }
const emptyAreaForm = (): AreaFormData => ({ name: "", slug: "", county: "Edinburgh", description: "", nearby_areas: "", sort_order: "0" })

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

function AreaForm({ form, setForm, saving, onSave, onCancel, title }: {
  form: AreaFormData; setForm: React.Dispatch<React.SetStateAction<AreaFormData>>
  saving: boolean; onSave: () => void; onCancel: () => void; title: string
}) {
  return (
    <div className="bg-gray-700/60 border border-gray-600 rounded-lg p-4 space-y-3">
      <p className="text-sm font-medium text-gray-200">{title}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-gray-400 text-xs">Name *</Label>
          <Input value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))}
            placeholder="e.g. Musselburgh" className={inputCls} />
        </div>
        <div className="space-y-1">
          <Label className="text-gray-400 text-xs">Slug (URL) *</Label>
          <Input value={form.slug}
            onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))}
            placeholder="e.g. musselburgh" className={inputCls} />
        </div>
        <div className="space-y-1">
          <Label className="text-gray-400 text-xs">County *</Label>
          <select value={form.county} onChange={e => setForm(f => ({ ...f, county: e.target.value }))}
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
            {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-gray-400 text-xs">Sort Order</Label>
          <Input inputMode="numeric" value={form.sort_order}
            onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} placeholder="0" className={inputCls} />
        </div>
        <div className="sm:col-span-2 space-y-1">
          <Label className="text-gray-400 text-xs">Description *</Label>
          <Input value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="e.g. Covering all of Musselburgh and surrounding streets..." className={inputCls} />
        </div>
        <div className="sm:col-span-2 space-y-1">
          <Label className="text-gray-400 text-xs">Nearby Areas (comma-separated names)</Label>
          <Input value={form.nearby_areas}
            onChange={e => setForm(f => ({ ...f, nearby_areas: e.target.value }))}
            placeholder="e.g. Portobello, Prestonpans, Dalkeith" className={inputCls} />
          <p className="text-xs text-gray-500">Use the exact names of other areas. Linked ones will become clickable on the area page.</p>
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <Button size="sm" disabled={saving || !form.name.trim() || !form.slug.trim()} onClick={onSave}
          className="bg-orange-500 hover:bg-orange-600 text-white">
          <Check className="h-4 w-4 mr-1" />{saving ? "Saving..." : "Save"}
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel} className="border-gray-600 text-gray-300 hover:bg-gray-700">
          <X className="h-4 w-4 mr-1" /> Cancel
        </Button>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

type Tab = "site" | "areas" | "presets"

export function SettingsClient({
  initialPresets,
  initialSiteSettings,
  initialAreas,
}: {
  initialPresets: ServicePreset[]
  initialSiteSettings: SiteSetting[]
  initialAreas: ServiceArea[]
}) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>("site")
  const [error, setError] = useState<string | null>(null)

  // ── Presets state ──
  const [presets, setPresets] = useState<ServicePreset[]>(initialPresets)
  const [showAddLabour, setShowAddLabour] = useState(false)
  const [showAddPart, setShowAddPart] = useState(false)
  const [addLabourForm, setAddLabourForm] = useState<PresetFormData>(emptyForm())
  const [addPartForm, setAddPartForm] = useState<PresetFormData>(emptyForm())
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<PresetFormData>(emptyForm())
  const [savingPreset, setSavingPreset] = useState(false)

  const labourPresets = presets.filter(p => p.type === "labour")
  const partPresets = presets.filter(p => p.type === "part")

  const refreshPresets = async () => { const f = await getPresets(); setPresets(f) }

  const handleAddLabour = async () => {
    setSavingPreset(true); setError(null)
    const r = await createPreset({ name: addLabourForm.name.trim(), type: "labour", description: addLabourForm.description.trim(), hours: parseFloat(addLabourForm.hours)||1, rate: parseFloat(addLabourForm.rate)||0, qty:1, unit_price:0, sort_order: parseInt(addLabourForm.sort_order)||0 })
    setSavingPreset(false)
    if (r.success) { await refreshPresets(); setShowAddLabour(false); setAddLabourForm(emptyForm()) }
    else setError(r.error || "Failed to add preset")
  }
  const handleAddPart = async () => {
    setSavingPreset(true); setError(null)
    const r = await createPreset({ name: addPartForm.name.trim(), type: "part", description: addPartForm.description.trim(), hours:0, rate:0, qty: parseFloat(addPartForm.qty)||1, unit_price: parseFloat(addPartForm.unit_price)||0, sort_order: parseInt(addPartForm.sort_order)||0 })
    setSavingPreset(false)
    if (r.success) { await refreshPresets(); setShowAddPart(false); setAddPartForm(emptyForm()) }
    else setError(r.error || "Failed to add preset")
  }
  const startEdit = (p: ServicePreset) => { setEditingId(p.id); setEditForm(presetToForm(p)) }
  const cancelEdit = () => setEditingId(null)
  const handleSaveEdit = async (p: ServicePreset) => {
    setSavingPreset(true); setError(null)
    const r = await updatePreset(p.id, { name: editForm.name.trim(), type: p.type, description: editForm.description.trim(), hours: p.type==="labour"?(parseFloat(editForm.hours)||0):0, rate: p.type==="labour"?(parseFloat(editForm.rate)||0):0, qty: p.type==="part"?(parseFloat(editForm.qty)||1):1, unit_price: p.type==="part"?(parseFloat(editForm.unit_price)||0):0, sort_order: parseInt(editForm.sort_order)||0 })
    setSavingPreset(false)
    if (r.success) { await refreshPresets(); setEditingId(null) }
    else setError(r.error || "Failed to update preset")
  }
  const handleDeletePreset = async (id: number, name: string) => {
    if (!confirm(`Delete preset "${name}"?`)) return
    const r = await deletePreset(id)
    if (r.success) await refreshPresets()
    else setError("Failed to delete preset")
  }

  // ── Site settings state ──
  const [settingsValues, setSettingsValues] = useState<Record<string, string>>(
    Object.fromEntries(initialSiteSettings.map(s => [s.key, s.value]))
  )
  const [isPendingSettings, startSettingsTransition] = useTransition()
  const [settingsSaved, setSettingsSaved] = useState(false)

  const settingsByGroup = initialSiteSettings.reduce<Record<string, SiteSetting[]>>((acc, s) => {
    if (!acc[s.group_name]) acc[s.group_name] = []
    acc[s.group_name].push(s)
    return acc
  }, {})

  function handleSaveSettings() {
    setError(null)
    setSettingsSaved(false)
    startSettingsTransition(async () => {
      const r = await saveSiteSettings(settingsValues)
      if (r.success) {
        setSettingsSaved(true)
        router.refresh()
        setTimeout(() => setSettingsSaved(false), 3000)
      } else {
        setError(r.error || "Failed to save settings")
      }
    })
  }

  // ── Areas state ──
  const [areas, setAreas] = useState<ServiceArea[]>(initialAreas)
  const [showAddArea, setShowAddArea] = useState(false)
  const [addAreaForm, setAddAreaForm] = useState<AreaFormData>(emptyAreaForm())
  const [editingAreaId, setEditingAreaId] = useState<number | null>(null)
  const [editAreaForm, setEditAreaForm] = useState<AreaFormData>(emptyAreaForm())
  const [savingArea, setSavingArea] = useState(false)

  function areaToForm(a: ServiceArea): AreaFormData {
    const nearby: string[] = JSON.parse(a.nearby_areas)
    return { name: a.name, slug: a.slug, county: a.county, description: a.description, nearby_areas: nearby.join(", "), sort_order: String(a.sort_order) }
  }

  function formToNearby(s: string): string {
    return JSON.stringify(s.split(",").map(x => x.trim()).filter(Boolean))
  }

  const handleAddArea = async () => {
    setSavingArea(true); setError(null)
    const r = await createAreaAction({ name: addAreaForm.name.trim(), slug: addAreaForm.slug.trim(), county: addAreaForm.county, description: addAreaForm.description.trim(), nearby_areas: formToNearby(addAreaForm.nearby_areas), sort_order: parseInt(addAreaForm.sort_order)||0 })
    setSavingArea(false)
    if (r.success && r.area) { setAreas(prev => [...prev, r.area!]); setShowAddArea(false); setAddAreaForm(emptyAreaForm()); router.refresh() }
    else setError(r.error || "Failed to create area")
  }

  const startEditArea = (a: ServiceArea) => { setEditingAreaId(a.id); setEditAreaForm(areaToForm(a)) }
  const cancelEditArea = () => setEditingAreaId(null)

  const handleSaveArea = async (id: number) => {
    setSavingArea(true); setError(null)
    const r = await updateAreaAction(id, { name: editAreaForm.name.trim(), slug: editAreaForm.slug.trim(), county: editAreaForm.county, description: editAreaForm.description.trim(), nearby_areas: formToNearby(editAreaForm.nearby_areas), sort_order: parseInt(editAreaForm.sort_order)||0 })
    setSavingArea(false)
    if (r.success) {
      setAreas(prev => prev.map(a => a.id===id ? { ...a, name: editAreaForm.name.trim(), slug: editAreaForm.slug.trim(), county: editAreaForm.county, description: editAreaForm.description.trim(), nearby_areas: formToNearby(editAreaForm.nearby_areas), sort_order: parseInt(editAreaForm.sort_order)||0 } : a))
      setEditingAreaId(null); router.refresh()
    } else setError(r.error || "Failed to update area")
  }

  const handleToggleArea = async (id: number) => {
    await toggleAreaAction(id)
    setAreas(prev => prev.map(a => a.id===id ? { ...a, active: a.active===1?0:1 } : a))
    router.refresh()
  }

  const handleDeleteArea = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This will remove the /areas/${areas.find(a=>a.id===id)?.slug} page.`)) return
    const r = await deleteAreaAction(id)
    if (r.success) { setAreas(prev => prev.filter(a => a.id!==id)); router.refresh() }
    else setError("Failed to delete area")
  }

  // ── Render ──
  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "site",    label: "Site Info",      icon: <Globe className="h-4 w-4" /> },
    { key: "areas",   label: "Service Areas",  icon: <MapPin className="h-4 w-4" /> },
    { key: "presets", label: "Presets",        icon: <Wrench className="h-4 w-4" /> },
  ]

  return (
    <div className="min-h-screen bg-gray-900">
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-2xl font-bold text-gray-100 mb-6">Settings</h1>

        {error && (
          <div className="mb-6 bg-red-900/40 border border-red-700 text-red-300 rounded-md px-4 py-3 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300"><X className="h-4 w-4" /></button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-800 p-1 rounded-lg mb-8 w-fit">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab===t.key ? "bg-orange-500 text-white" : "text-gray-400 hover:text-gray-200"}`}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {/* ── Site Info tab ── */}
        {activeTab === "site" && (
          <div className="space-y-6">
            {settingsSaved && (
              <div className="bg-green-900/40 border border-green-700 text-green-300 rounded-md px-4 py-3 text-sm">Settings saved.</div>
            )}
            {Object.entries(settingsByGroup).map(([group, settings]) => (
              <Card key={group} className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-gray-100 text-base">{group}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {settings.map(s => (
                    <div key={s.key}>
                      <label className="block text-sm font-medium text-gray-300 mb-1">{s.label}</label>
                      {s.description && <p className="text-xs text-gray-500 mb-1.5">{s.description}</p>}
                      {s.key === "callout_fee_note" || s.key === "payment_methods" ? (
                        <textarea
                          rows={3}
                          value={settingsValues[s.key] ?? ""}
                          onChange={e => setSettingsValues(v => ({ ...v, [s.key]: e.target.value }))}
                          className={textareaCls}
                        />
                      ) : (
                        <Input
                          value={settingsValues[s.key] ?? ""}
                          onChange={e => setSettingsValues(v => ({ ...v, [s.key]: e.target.value }))}
                          type={s.key === "booking_advance_days" || s.key === "reminder_interval_days" ? "number" : "text"}
                          min={s.key === "booking_advance_days" ? "0" : undefined}
                          className={inputCls}
                        />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
            <Button onClick={handleSaveSettings} disabled={isPendingSettings} className="bg-orange-500 hover:bg-orange-600 text-white px-8">
              <Save className="h-4 w-4 mr-2" />{isPendingSettings ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        )}

        {/* ── Service Areas tab ── */}
        {activeTab === "areas" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-400">
                {areas.filter(a => a.active).length} active area{areas.filter(a=>a.active).length!==1?"s":""} · changes appear immediately on the website
              </p>
              <Button size="sm" onClick={() => setShowAddArea(v => !v)} className="bg-orange-500 hover:bg-orange-600 text-white">
                <Plus className="h-4 w-4 mr-1" /> Add Area
              </Button>
            </div>

            {showAddArea && (
              <AreaForm form={addAreaForm} setForm={setAddAreaForm} saving={savingArea}
                title="New Service Area"
                onSave={handleAddArea}
                onCancel={() => { setShowAddArea(false); setAddAreaForm(emptyAreaForm()) }} />
            )}

            <div className="space-y-2">
              {areas.map(area => (
                <div key={area.id}>
                  {editingAreaId === area.id ? (
                    <AreaForm form={editAreaForm} setForm={setEditAreaForm} saving={savingArea}
                      title={`Editing: ${area.name}`}
                      onSave={() => handleSaveArea(area.id)}
                      onCancel={cancelEditArea} />
                  ) : (
                    <div className={`flex items-center gap-3 rounded-lg px-4 py-3 border group ${area.active ? "bg-gray-800 border-gray-700" : "bg-gray-800/50 border-gray-700/50 opacity-60"}`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-gray-100">{area.name}</span>
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded border ${countyColours[area.county] ?? "bg-gray-700 text-gray-300 border-gray-600"}`}>
                            {area.county}
                          </span>
                          {!area.active && <Badge className="bg-gray-700 text-gray-400 border-gray-600 text-xs">Hidden</Badge>}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">/areas/{area.slug}</p>
                      </div>
                      <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity shrink-0">
                        <button onClick={() => handleToggleArea(area.id)} title={area.active ? "Hide from site" : "Show on site"}
                          className="p-1.5 rounded text-gray-400 hover:text-orange-400 hover:bg-gray-700 transition-colors">
                          {area.active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        </button>
                        <button onClick={() => startEditArea(area)}
                          className="p-1.5 rounded text-gray-400 hover:text-orange-400 hover:bg-gray-700 transition-colors">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleDeleteArea(area.id, area.name)}
                          className="p-1.5 rounded text-gray-400 hover:text-red-400 hover:bg-gray-700 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Presets tab ── */}
        {activeTab === "presets" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-orange-400" />
                    <CardTitle className="text-gray-100 text-lg">Labour Rates</CardTitle>
                  </div>
                  <Button size="sm" variant="outline"
                    onClick={() => { setShowAddLabour(v => !v); setShowAddPart(false) }}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-gray-100">
                    <Plus className="h-4 w-4 mr-1" />Add
                  </Button>
                </CardHeader>
                <CardContent>
                  {showAddLabour && (
                    <LabourAddForm form={addLabourForm} setForm={setAddLabourForm} saving={savingPreset}
                      onAdd={handleAddLabour} onCancel={() => { setShowAddLabour(false); setAddLabourForm(emptyForm()) }} />
                  )}
                  <div className="space-y-2 mt-3">
                    {labourPresets.length === 0
                      ? <p className="text-sm text-gray-500 italic text-center py-4">No labour presets yet.</p>
                      : labourPresets.map(p => (
                          <PresetRow key={p.id} preset={p} editingId={editingId} editForm={editForm}
                            setEditForm={setEditForm} saving={savingPreset}
                            onStartEdit={startEdit} onSaveEdit={handleSaveEdit}
                            onCancelEdit={cancelEdit} onDelete={handleDeletePreset} />
                        ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-orange-400" />
                    <CardTitle className="text-gray-100 text-lg">Parts &amp; Materials</CardTitle>
                  </div>
                  <Button size="sm" variant="outline"
                    onClick={() => { setShowAddPart(v => !v); setShowAddLabour(false) }}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-gray-100">
                    <Plus className="h-4 w-4 mr-1" />Add
                  </Button>
                </CardHeader>
                <CardContent>
                  {showAddPart && (
                    <PartAddForm form={addPartForm} setForm={setAddPartForm} saving={savingPreset}
                      onAdd={handleAddPart} onCancel={() => { setShowAddPart(false); setAddPartForm(emptyForm()) }} />
                  )}
                  <div className="space-y-2 mt-3">
                    {partPresets.length === 0
                      ? <p className="text-sm text-gray-500 italic text-center py-4">No part presets yet.</p>
                      : partPresets.map(p => (
                          <PresetRow key={p.id} preset={p} editingId={editingId} editForm={editForm}
                            setEditForm={setEditForm} saving={savingPreset}
                            onStartEdit={startEdit} onSaveEdit={handleSaveEdit}
                            onCancelEdit={cancelEdit} onDelete={handleDeletePreset} />
                        ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <p className="text-xs text-gray-600 text-center">
              Service presets are used to quickly pre-fill invoice line items when creating or editing invoices and quotes.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
