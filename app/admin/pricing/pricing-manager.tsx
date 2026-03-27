"use client"

import { useState, useTransition } from "react"
import { PricingItem } from "@/lib/db"
import { savePricingItem, removePricingItem, togglePricingActive } from "@/app/actions/pricing"
import { Plus, Pencil, Trash2, X, Check, Tag } from "lucide-react"

type FormState = {
  category: string
  name: string
  price: string
  note: string
  sort_order: number
  active: number
}

const emptyForm = (category = ""): FormState => ({
  category,
  name: "",
  price: "",
  note: "",
  sort_order: 0,
  active: 1,
})

function ItemForm({
  initial,
  onSave,
  onCancel,
  categories,
  fixedCategory,
}: {
  initial: FormState
  onSave: (data: FormState) => void
  onCancel: () => void
  categories: string[]
  fixedCategory?: string
}) {
  const [form, setForm] = useState<FormState>(initial)
  const set = (k: keyof FormState, v: string | number) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-gray-750 rounded-lg border border-gray-600 mt-2">
      {!fixedCategory && (
        <div className="sm:col-span-2">
          <label className="text-xs text-gray-400 mb-1 block">Category</label>
          <input
            type="text"
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            list="category-list"
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-orange-500"
            placeholder="e.g. Servicing"
          />
          <datalist id="category-list">
            {categories.map((c) => <option key={c} value={c} />)}
          </datalist>
        </div>
      )}
      <div>
        <label className="text-xs text-gray-400 mb-1 block">Name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-orange-500"
          placeholder="e.g. Full Service"
        />
      </div>
      <div>
        <label className="text-xs text-gray-400 mb-1 block">Price</label>
        <input
          type="text"
          value={form.price}
          onChange={(e) => set("price", e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-orange-500"
          placeholder="e.g. from £89"
        />
      </div>
      <div>
        <label className="text-xs text-gray-400 mb-1 block">Note (optional)</label>
        <input
          type="text"
          value={form.note}
          onChange={(e) => set("note", e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-orange-500"
          placeholder="e.g. per axle"
        />
      </div>
      <div>
        <label className="text-xs text-gray-400 mb-1 block">Sort Order</label>
        <input
          type="number"
          value={form.sort_order}
          onChange={(e) => set("sort_order", parseInt(e.target.value) || 0)}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-orange-500"
        />
      </div>
      <div className="sm:col-span-2 flex gap-2 justify-end">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm text-gray-300 hover:text-white hover:bg-gray-600 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
          Cancel
        </button>
        <button
          onClick={() => onSave(form)}
          disabled={!form.name.trim() || !form.price.trim() || (!fixedCategory && !form.category.trim())}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded text-sm font-medium bg-orange-600 hover:bg-orange-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check className="h-3.5 w-3.5" />
          Save
        </button>
      </div>
    </div>
  )
}

export default function PricingManager({ initialItems }: { initialItems: PricingItem[] }) {
  const [items, setItems] = useState<PricingItem[]>(initialItems)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [addingCategory, setAddingCategory] = useState<string | null>(null)
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [isPending, startTransition] = useTransition()

  const categories = Array.from(new Set(items.map((i) => i.category)))

  const grouped = categories.reduce<Record<string, PricingItem[]>>((acc, cat) => {
    acc[cat] = items.filter((i) => i.category === cat).sort((a, b) => a.sort_order - b.sort_order)
    return acc
  }, {})

  const handleSave = (id: number | undefined, form: FormState) => {
    const payload = {
      ...(id !== undefined ? { id } : {}),
      category: form.category,
      name: form.name,
      price: form.price,
      note: form.note || null,
      sort_order: form.sort_order,
      active: form.active,
    }

    startTransition(async () => {
      await savePricingItem(payload)
      // Refresh local state optimistically
      if (id !== undefined) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, ...payload }
              : item
          )
        )
        setEditingId(null)
      } else {
        // For new items, re-fetch by reloading
        window.location.reload()
      }
    })
  }

  const handleDelete = (id: number) => {
    if (!confirm("Delete this pricing item?")) return
    startTransition(async () => {
      await removePricingItem(id)
      setItems((prev) => prev.filter((i) => i.id !== id))
    })
  }

  const handleToggle = (id: number) => {
    startTransition(async () => {
      await togglePricingActive(id)
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, active: item.active === 1 ? 0 : 1 } : item
        )
      )
    })
  }

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([category, catItems]) => (
        <div key={category} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-750 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-orange-500" />
              <h2 className="font-semibold text-gray-100">{category}</h2>
              <span className="text-xs text-gray-500 ml-1">({catItems.length} items)</span>
            </div>
            <button
              onClick={() => setAddingCategory(addingCategory === category ? null : category)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded bg-orange-600 hover:bg-orange-700 text-white transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Item
            </button>
          </div>

          <div className="divide-y divide-gray-700">
            {catItems.map((item) => (
              <div key={item.id} className="px-4 py-3">
                {editingId === item.id ? (
                  <ItemForm
                    initial={{
                      category: item.category,
                      name: item.name,
                      price: item.price,
                      note: item.note || "",
                      sort_order: item.sort_order,
                      active: item.active,
                    }}
                    onSave={(form) => handleSave(item.id, form)}
                    onCancel={() => setEditingId(null)}
                    categories={categories}
                    fixedCategory={item.category}
                  />
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium ${item.active ? "text-gray-200" : "text-gray-500 line-through"}`}>
                          {item.name}
                        </p>
                        <span className="text-orange-400 font-semibold text-sm whitespace-nowrap">{item.price}</span>
                      </div>
                      {item.note && (
                        <p className="text-xs text-gray-500 mt-0.5">{item.note}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleToggle(item.id)}
                        disabled={isPending}
                        className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                          item.active
                            ? "bg-green-900 text-green-300 hover:bg-green-800"
                            : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                        }`}
                      >
                        {item.active ? "Active" : "Inactive"}
                      </button>
                      <button
                        onClick={() => setEditingId(item.id)}
                        className="p-1.5 rounded text-gray-400 hover:text-blue-400 hover:bg-gray-700 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={isPending}
                        className="p-1.5 rounded text-gray-400 hover:text-red-400 hover:bg-gray-700 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {addingCategory === category && (
            <div className="px-4 pb-4">
              <ItemForm
                initial={emptyForm(category)}
                onSave={(form) => {
                  setAddingCategory(null)
                  handleSave(undefined, form)
                }}
                onCancel={() => setAddingCategory(null)}
                categories={categories}
                fixedCategory={category}
              />
            </div>
          )}
        </div>
      ))}

      {/* Add New Category */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 border-dashed">
        {showNewCategory ? (
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Add Item in New Category</h3>
            <ItemForm
              initial={emptyForm()}
              onSave={(form) => {
                setShowNewCategory(false)
                handleSave(undefined, form)
              }}
              onCancel={() => setShowNewCategory(false)}
              categories={categories}
            />
          </div>
        ) : (
          <button
            onClick={() => setShowNewCategory(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-4 text-gray-400 hover:text-orange-400 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm font-medium">Add New Category / Item</span>
          </button>
        )}
      </div>
    </div>
  )
}
