"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  createExpense,
  createExpenseBatch,
  removeExpense,
  createRecurringExpense,
  toggleRecurring,
  removeRecurringExpense,
} from "@/app/actions/expenses"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Receipt, Plus, Download, X, RefreshCw, PauseCircle, PlayCircle } from "lucide-react"
import type { Expense, RecurringExpense } from "@/lib/db"

const CATEGORIES = [
  "Parts",
  "Tools & Equipment",
  "Fuel",
  "Insurance",
  "Marketing",
  "Training",
  "Clothing/PPE",
  "Phone/Software",
  "Other",
]

const CATEGORY_COLORS: Record<string, string> = {
  "Parts": "bg-blue-900/50 text-blue-300 border-blue-700",
  "Tools & Equipment": "bg-purple-900/50 text-purple-300 border-purple-700",
  "Fuel": "bg-orange-900/50 text-orange-300 border-orange-700",
  "Insurance": "bg-red-900/50 text-red-300 border-red-700",
  "Marketing": "bg-pink-900/50 text-pink-300 border-pink-700",
  "Training": "bg-cyan-900/50 text-cyan-300 border-cyan-700",
  "Clothing/PPE": "bg-yellow-900/50 text-yellow-300 border-yellow-700",
  "Phone/Software": "bg-indigo-900/50 text-indigo-300 border-indigo-700",
  "Other": "bg-gray-700/60 text-gray-300 border-gray-600",
}

type LineItem = {
  id: number
  category: string
  description: string
  amount: string
  notes: string
}

type Props = {
  expenses: Expense[]
  recurringExpenses: RecurringExpense[]
  taxYearStartStr: string
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

let nextId = 1
function newLine(): LineItem {
  return { id: nextId++, category: CATEGORIES[0], description: "", amount: "", notes: "" }
}

// ─── Single entry form ────────────────────────────────────────────────────────
function SingleForm({ onAdded }: { onAdded: (e: Expense) => void }) {
  const [form, setForm] = useState({
    date: today(), category: CATEGORIES[0], description: "", amount: "", receipt_ref: "", notes: "",
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    setError("")
    const amount = parseFloat(form.amount)
    if (!form.description.trim()) return setError("Description is required.")
    if (isNaN(amount) || amount <= 0) return setError("Amount must be a positive number.")
    setSaving(true)
    const result = await createExpense({
      date: form.date, category: form.category,
      description: form.description.trim(), amount,
      receipt_ref: form.receipt_ref.trim() || null,
      notes: form.notes.trim() || null,
    })
    setSaving(false)
    if (result.success && result.expense) {
      onAdded(result.expense)
      setForm({ date: today(), category: CATEGORIES[0], description: "", amount: "", receipt_ref: "", notes: "" })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-md px-4 py-2 text-sm">{error}</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Date *</label>
          <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Category *</label>
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Amount (£) *</label>
          <input type="number" step="0.01" min="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required placeholder="0.00"
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs text-gray-400 mb-1">Description *</label>
          <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required placeholder="e.g. Engine oil 5W-30 5L"
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Receipt Ref</label>
          <input type="text" value={form.receipt_ref} onChange={e => setForm({ ...form, receipt_ref: e.target.value })} placeholder="e.g. ECP-2026-001"
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
        <div className="md:col-span-3">
          <label className="block text-xs text-gray-400 mb-1">Notes</label>
          <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes"
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
      </div>
      <Button type="submit" disabled={saving} className="bg-orange-500 hover:bg-orange-600 text-white">
        {saving ? "Adding..." : "Add Expense"}
      </Button>
    </form>
  )
}

// ─── Batch entry form (multiple parts from one invoice) ───────────────────────
function BatchForm({ onAdded }: { onAdded: (expenses: Expense[]) => void }) {
  const [date, setDate] = useState(today())
  const [supplier, setSupplier] = useState("")
  const [receiptRef, setReceiptRef] = useState("")
  const [lines, setLines] = useState<LineItem[]>([newLine(), newLine()])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  function updateLine(id: number, field: keyof LineItem, value: string) {
    setLines(lines.map(l => l.id === id ? { ...l, [field]: value } : l))
  }

  function addLine() {
    setLines([...lines, newLine()])
  }

  function removeLine(id: number) {
    if (lines.length <= 1) return
    setLines(lines.filter(l => l.id !== id))
  }

  const batchTotal = lines.reduce((sum, l) => {
    const n = parseFloat(l.amount)
    return sum + (isNaN(n) ? 0 : n)
  }, 0)

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    setError("")

    const validLines = lines.filter(l => l.description.trim() && l.amount)
    if (validLines.length === 0) return setError("Add at least one item with a description and amount.")

    for (const l of validLines) {
      const n = parseFloat(l.amount)
      if (isNaN(n) || n <= 0) return setError(`Invalid amount on: ${l.description || "a row"}`)
    }

    setSaving(true)
    const ref = receiptRef.trim() || (supplier.trim() ? `${supplier.trim()} – ${date}` : null)
    const result = await createExpenseBatch(
      validLines.map(l => ({
        date,
        category: l.category,
        description: supplier.trim() ? `${supplier.trim()} – ${l.description.trim()}` : l.description.trim(),
        amount: parseFloat(l.amount),
        receipt_ref: ref,
        notes: l.notes.trim() || null,
      }))
    )
    setSaving(false)

    if (result.success && result.expenses.length > 0) {
      onAdded(result.expenses)
      setDate(today())
      setSupplier("")
      setReceiptRef("")
      setLines([newLine(), newLine()])
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-md px-4 py-2 text-sm">{error}</div>
      )}

      {/* Invoice header — shared across all items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-gray-700">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Invoice Date *</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} required
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Supplier</label>
          <input type="text" value={supplier} onChange={e => setSupplier(e.target.value)} placeholder="e.g. Euro Car Parts"
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Invoice / Receipt Ref</label>
          <input type="text" value={receiptRef} onChange={e => setReceiptRef(e.target.value)} placeholder="e.g. INV-001 or GDrive/Receipts/..."
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
      </div>

      {/* Line items */}
      <div className="space-y-2">
        <div className="hidden md:grid grid-cols-12 gap-2 text-xs text-gray-400 px-1">
          <span className="col-span-3">Category</span>
          <span className="col-span-5">Part / Description</span>
          <span className="col-span-2">Amount (£)</span>
          <span className="col-span-1">Notes</span>
          <span className="col-span-1" />
        </div>

        {lines.map((line, idx) => (
          <div key={line.id} className="grid grid-cols-12 gap-2 items-start">
            <div className="col-span-12 md:col-span-3">
              <select value={line.category} onChange={e => updateLine(line.id, "category", e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-2 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-span-8 md:col-span-5">
              <input type="text" value={line.description} onChange={e => updateLine(line.id, "description", e.target.value)}
                placeholder={`Part ${idx + 1} description`}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-2 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div className="col-span-4 md:col-span-2">
              <input type="number" step="0.01" min="0" value={line.amount} onChange={e => updateLine(line.id, "amount", e.target.value)}
                placeholder="0.00"
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-2 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div className="col-span-11 md:col-span-1">
              <input type="text" value={line.notes} onChange={e => updateLine(line.id, "notes", e.target.value)}
                placeholder="Note"
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-2 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div className="col-span-1 flex justify-end pt-1">
              <button type="button" onClick={() => removeLine(line.id)} disabled={lines.length <= 1}
                className="text-gray-500 hover:text-red-400 disabled:opacity-30 transition-colors p-1">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2">
        <button type="button" onClick={addLine}
          className="flex items-center gap-1.5 text-sm text-orange-400 hover:text-orange-300 transition-colors">
          <Plus className="h-4 w-4" />
          Add another part
        </button>
        {batchTotal > 0 && (
          <span className="text-sm text-gray-400">
            Invoice total: <span className="text-gray-100 font-semibold">£{batchTotal.toFixed(2)}</span>
          </span>
        )}
      </div>

      <Button type="submit" disabled={saving} className="bg-orange-500 hover:bg-orange-600 text-white">
        {saving ? "Saving..." : `Save ${lines.filter(l => l.description.trim()).length || "all"} items`}
      </Button>
    </form>
  )
}

// ─── Batch receipts form (multiple independent expenses at once) ───────────────
type ReceiptLine = {
  id: number
  date: string
  category: string
  description: string
  amount: string
  receipt_ref: string
}

let nextReceiptId = 1
function newReceiptLine(): ReceiptLine {
  return { id: nextReceiptId++, date: today(), category: CATEGORIES[0], description: "", amount: "", receipt_ref: "" }
}

function BatchReceiptsForm({ onAdded }: { onAdded: (expenses: Expense[]) => void }) {
  const [lines, setLines] = useState<ReceiptLine[]>([newReceiptLine(), newReceiptLine()])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  function updateLine(id: number, field: keyof ReceiptLine, value: string) {
    setLines(lines.map(l => l.id === id ? { ...l, [field]: value } : l))
  }

  function addLine() { setLines([...lines, newReceiptLine()]) }
  function removeLine(id: number) {
    if (lines.length <= 1) return
    setLines(lines.filter(l => l.id !== id))
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    setError("")
    const valid = lines.filter(l => l.description.trim() && l.amount && l.date)
    if (valid.length === 0) return setError("Add at least one item with a date, description and amount.")
    for (const l of valid) {
      const n = parseFloat(l.amount)
      if (isNaN(n) || n <= 0) return setError(`Invalid amount on: ${l.description || "a row"}`)
    }
    setSaving(true)
    const result = await createExpenseBatch(
      valid.map(l => ({
        date: l.date,
        category: l.category,
        description: l.description.trim(),
        amount: parseFloat(l.amount),
        receipt_ref: l.receipt_ref.trim() || null,
        notes: null,
      }))
    )
    setSaving(false)
    if (result.success && result.expenses.length > 0) {
      onAdded(result.expenses)
      setLines([newReceiptLine(), newReceiptLine()])
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-md px-4 py-2 text-sm">{error}</div>
      )}
      <div className="space-y-2">
        <div className="hidden md:grid grid-cols-12 gap-2 text-xs text-gray-400 px-1">
          <span className="col-span-2">Date</span>
          <span className="col-span-2">Category</span>
          <span className="col-span-4">Description</span>
          <span className="col-span-2">Amount (£)</span>
          <span className="col-span-1">Receipt Ref</span>
          <span className="col-span-1" />
        </div>
        {lines.map((line, idx) => (
          <div key={line.id} className="grid grid-cols-12 gap-2 items-start">
            <div className="col-span-12 md:col-span-2">
              <input type="date" value={line.date} onChange={e => updateLine(line.id, "date", e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-2 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div className="col-span-12 md:col-span-2">
              <select value={line.category} onChange={e => updateLine(line.id, "category", e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-2 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-span-8 md:col-span-4">
              <input type="text" value={line.description} onChange={e => updateLine(line.id, "description", e.target.value)}
                placeholder={`Expense ${idx + 1}`}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-2 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div className="col-span-4 md:col-span-2">
              <input type="number" step="0.01" min="0" value={line.amount} onChange={e => updateLine(line.id, "amount", e.target.value)}
                placeholder="0.00"
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-2 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div className="col-span-11 md:col-span-1">
              <input type="text" value={line.receipt_ref} onChange={e => updateLine(line.id, "receipt_ref", e.target.value)}
                placeholder="Ref"
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-2 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div className="col-span-1 flex justify-end pt-1">
              <button type="button" onClick={() => removeLine(line.id)} disabled={lines.length <= 1}
                className="text-gray-500 hover:text-red-400 disabled:opacity-30 transition-colors p-1">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between pt-2">
        <button type="button" onClick={addLine}
          className="flex items-center gap-1.5 text-sm text-orange-400 hover:text-orange-300 transition-colors">
          <Plus className="h-4 w-4" />
          Add another receipt
        </button>
        <span className="text-xs text-gray-500">{lines.filter(l => l.description.trim()).length} item(s)</span>
      </div>
      <Button type="submit" disabled={saving} className="bg-orange-500 hover:bg-orange-600 text-white">
        {saving ? "Saving..." : `Save ${lines.filter(l => l.description.trim()).length || "all"} receipts`}
      </Button>
    </form>
  )
}

// ─── Recurring expenses section ───────────────────────────────────────────────
function RecurringSection({
  initialRecurring,
  onExpenseCreated,
}: {
  initialRecurring: RecurringExpense[]
  onExpenseCreated: (e: Expense) => void
}) {
  const router = useRouter()
  const [recurring, setRecurring] = useState(initialRecurring)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    category: CATEGORIES[2], // Fuel default
    description: "",
    amount: "",
    day_of_month: "1",
    receipt_ref: "",
    notes: "",
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleAdd(ev: React.FormEvent) {
    ev.preventDefault()
    setError("")
    const amount = parseFloat(form.amount)
    if (!form.description.trim()) return setError("Description is required.")
    if (isNaN(amount) || amount <= 0) return setError("Amount must be a positive number.")
    const day = parseInt(form.day_of_month, 10)
    if (isNaN(day) || day < 1 || day > 31) return setError("Day of month must be 1–31.")
    setSaving(true)
    const result = await createRecurringExpense({
      category: form.category,
      description: form.description.trim(),
      amount,
      day_of_month: day,
      receipt_ref: form.receipt_ref.trim() || null,
      notes: form.notes.trim() || null,
    })
    setSaving(false)
    if (result.success && result.expense) {
      setRecurring([...recurring, result.expense])
      setForm({ category: CATEGORIES[2], description: "", amount: "", day_of_month: "1", receipt_ref: "", notes: "" })
      setShowForm(false)
      router.refresh()
    }
  }

  async function handleToggle(id: number) {
    await toggleRecurring(id)
    setRecurring(recurring.map(r => r.id === id ? { ...r, active: r.active === 1 ? 0 : 1 } : r))
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this recurring expense?")) return
    await removeRecurringExpense(id)
    setRecurring(recurring.filter(r => r.id !== id))
  }

  const ordinal = (n: number) => {
    const s = ["th","st","nd","rd"], v = n % 100
    return n + (s[(v-20)%10] || s[v] || s[0])
  }

  return (
    <Card className="bg-gray-800 border-gray-700 mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-gray-100 flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-orange-400" />
            Monthly Recurring Expenses
          </CardTitle>
          <Button size="sm" onClick={() => setShowForm(!showForm)}
            className="bg-orange-500 hover:bg-orange-600 text-white">
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
        <CardDescription className="text-gray-400">
          Auto-create expense entries on a set day each month (via cron). Use for van insurance, phone bill, subscriptions, etc.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <form onSubmit={handleAdd} className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 space-y-3 mb-4">
            {error && <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-md px-3 py-2 text-sm">{error}</div>}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Category *</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Amount (£) *</label>
                <input type="number" step="0.01" min="0.01" value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0.00"
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Day of month *</label>
                <input type="number" min="1" max="31" value={form.day_of_month}
                  onChange={e => setForm({ ...form, day_of_month: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-400 mb-1">Description *</label>
                <input type="text" value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })} placeholder="e.g. Van insurance monthly"
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Receipt Ref</label>
                <input type="text" value={form.receipt_ref}
                  onChange={e => setForm({ ...form, receipt_ref: e.target.value })} placeholder="Optional"
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={saving} size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                {saving ? "Saving..." : "Add Recurring"}
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setShowForm(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700">Cancel</Button>
            </div>
          </form>
        )}

        {recurring.length === 0 ? (
          <p className="text-gray-500 text-sm py-4 text-center">No recurring expenses set up yet.</p>
        ) : (
          <div className="space-y-2">
            {recurring.map(r => (
              <div key={r.id} className={`flex items-center justify-between rounded-lg px-4 py-3 border ${r.active ? "bg-gray-700/40 border-gray-700" : "bg-gray-800/40 border-gray-700/50 opacity-60"}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <Badge className={CATEGORY_COLORS[r.category] || CATEGORY_COLORS.Other}>{r.category}</Badge>
                  <div className="min-w-0">
                    <p className="text-gray-100 text-sm font-medium truncate">{r.description}</p>
                    <p className="text-gray-400 text-xs">£{r.amount.toFixed(2)} on the {ordinal(r.day_of_month)} of each month</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <button type="button" onClick={() => handleToggle(r.id)}
                    title={r.active ? "Pause" : "Resume"}
                    className="text-gray-400 hover:text-orange-400 transition-colors p-1">
                    {r.active ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                  </button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(r.id)}
                    className="border-red-800 text-red-400 hover:bg-red-900/30">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function ExpensesClient({ expenses: initialExpenses, recurringExpenses, taxYearStartStr }: Props) {
  const router = useRouter()
  const [expenses, setExpenses] = useState(initialExpenses)
  const [mode, setMode] = useState<"single" | "batch" | "receipts">("single")

  const taxYearExpenses = expenses.filter(e => e.date >= taxYearStartStr)
  const totalThisTaxYear = taxYearExpenses.reduce((sum, e) => sum + e.amount, 0)
  const totalAllTime = expenses.reduce((sum, e) => sum + e.amount, 0)

  const categoryTotals: Record<string, number> = {}
  for (const e of taxYearExpenses) {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount
  }

  function handleAdded(newExpenses: Expense | Expense[]) {
    const arr = Array.isArray(newExpenses) ? newExpenses : [newExpenses]
    setExpenses([...arr, ...expenses])
    router.refresh()
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this expense?")) return
    const result = await removeExpense(id)
    if (result.success) setExpenses(expenses.filter(e => e.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Receipt className="h-7 w-7 text-orange-500" />
            <h1 className="text-2xl font-bold text-gray-100">Expense Tracker</h1>
          </div>
          <a href="/api/admin/export/expenses">
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-gray-100">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-400">Total This Tax Year</CardDescription>
              <CardTitle className="text-2xl text-orange-400">£{totalThisTaxYear.toFixed(2)}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-400">Total All Time</CardDescription>
              <CardTitle className="text-2xl text-gray-100">£{totalAllTime.toFixed(2)}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-400">Categories This Tax Year</CardDescription>
              <CardTitle className="text-2xl text-gray-100">{Object.keys(categoryTotals).length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Category breakdown */}
        {Object.keys(categoryTotals).length > 0 && (
          <Card className="bg-gray-800 border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="text-gray-100 text-base">Spend by Category (This Tax Year)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).map(([cat, total]) => (
                  <div key={cat} className="flex items-center justify-between bg-gray-700/40 border border-gray-700 rounded-lg px-3 py-2">
                    <Badge className={CATEGORY_COLORS[cat] || CATEGORY_COLORS.Other}>{cat}</Badge>
                    <span className="text-gray-100 font-semibold text-sm">£{total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Expense */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-100 flex items-center gap-2">
                <Plus className="h-5 w-5 text-orange-400" />
                Add Expense
              </CardTitle>
              {/* Mode toggle */}
              <div className="flex bg-gray-700 rounded-md p-0.5 text-sm">
                <button
                  type="button"
                  onClick={() => setMode("single")}
                  className={`px-3 py-1 rounded transition-colors ${mode === "single" ? "bg-orange-500 text-white" : "text-gray-400 hover:text-gray-200"}`}
                >
                  Single
                </button>
                <button
                  type="button"
                  onClick={() => setMode("batch")}
                  className={`px-3 py-1 rounded transition-colors ${mode === "batch" ? "bg-orange-500 text-white" : "text-gray-400 hover:text-gray-200"}`}
                >
                  Supplier invoice
                </button>
                <button
                  type="button"
                  onClick={() => setMode("receipts")}
                  className={`px-3 py-1 rounded transition-colors ${mode === "receipts" ? "bg-orange-500 text-white" : "text-gray-400 hover:text-gray-200"}`}
                >
                  Multiple receipts
                </button>
              </div>
            </div>
            {mode === "batch" && (
              <p className="text-xs text-gray-500 mt-1">
                Enter one supplier invoice at a time. Parts are listed individually but share the same invoice reference.
              </p>
            )}
            {mode === "receipts" && (
              <p className="text-xs text-gray-500 mt-1">
                Record multiple separate receipts at once — each with its own date, category and amount (e.g. several fuel receipts).
              </p>
            )}
          </CardHeader>
          <CardContent>
            {mode === "single" && <SingleForm onAdded={(e) => handleAdded(e)} />}
            {mode === "batch" && <BatchForm onAdded={(arr) => handleAdded(arr)} />}
            {mode === "receipts" && <BatchReceiptsForm onAdded={(arr) => handleAdded(arr)} />}
          </CardContent>
        </Card>

        {/* Recurring Expenses */}
        <RecurringSection
          initialRecurring={recurringExpenses}
          onExpenseCreated={(e) => handleAdded(e)}
        />

        {/* Expenses Table */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100">All Expenses</CardTitle>
            <CardDescription className="text-gray-400">{expenses.length} total entries</CardDescription>
          </CardHeader>
          <CardContent>
            {expenses.length === 0 ? (
              <p className="text-gray-500 text-sm py-8 text-center">No expenses yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left text-gray-400 font-medium py-2 pr-4">Date</th>
                      <th className="text-left text-gray-400 font-medium py-2 pr-4">Category</th>
                      <th className="text-left text-gray-400 font-medium py-2 pr-4">Description</th>
                      <th className="text-right text-gray-400 font-medium py-2 pr-4">Amount</th>
                      <th className="text-left text-gray-400 font-medium py-2 pr-4">Receipt</th>
                      <th className="text-right text-gray-400 font-medium py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map(expense => (
                      <tr key={expense.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                        <td className="py-3 pr-4 text-gray-300 whitespace-nowrap">{expense.date}</td>
                        <td className="py-3 pr-4">
                          <Badge className={CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.Other}>
                            {expense.category}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 text-gray-200 max-w-[200px]">
                          <span className="block truncate">{expense.description}</span>
                          {expense.notes && <span className="text-xs text-gray-500">{expense.notes}</span>}
                        </td>
                        <td className="py-3 pr-4 text-right text-gray-100 font-semibold whitespace-nowrap">
                          £{expense.amount.toFixed(2)}
                        </td>
                        <td className="py-3 pr-4 text-gray-400 text-xs">
                          {expense.receipt_ref || <span className="text-gray-600">—</span>}
                        </td>
                        <td className="py-3 text-right">
                          <Button size="sm" variant="outline" onClick={() => handleDelete(expense.id)}
                            className="border-red-800 text-red-400 hover:bg-red-900/30">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-gray-600">
                      <td colSpan={3} className="py-3 text-gray-400 font-medium">Total All Time</td>
                      <td className="py-3 text-right text-orange-400 font-bold">£{totalAllTime.toFixed(2)}</td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
