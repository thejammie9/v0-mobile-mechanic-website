"use client"

import { useState } from "react"
import Link from "next/link"
import { X, MoveHorizontal, Columns2, SlidersHorizontal } from "lucide-react"

type PortfolioItem = {
  title: string
  vehicle: string
  description: string
  imageBefore: string
  imageAfter: string
}

// ── Slider card ───────────────────────────────────────────────────────────────

function SliderCard({
  item,
  onOpen,
}: {
  item: PortfolioItem
  onOpen: (src: string, alt: string) => void
}) {
  const [pos, setPos] = useState(50)

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
      <div className="p-5 border-b border-gray-800">
        <h2 className="text-xl font-semibold text-gray-100">{item.title}</h2>
        {item.vehicle && (
          <p className="text-orange-400 font-medium text-sm mt-0.5">{item.vehicle}</p>
        )}
        <p className="text-gray-400 text-sm mt-2">{item.description}</p>
      </div>

      <div className="relative h-64 select-none overflow-hidden group">
        <img
          src={item.imageBefore}
          alt={`${item.title} before`}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
        <img
          src={item.imageAfter}
          alt={`${item.title} after`}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
          draggable={false}
        />

        <span className="absolute top-2 left-2 z-10 bg-gray-950/80 text-gray-300 text-xs font-medium px-2 py-1 rounded pointer-events-none">
          Before
        </span>
        <span className="absolute top-2 right-2 z-10 bg-orange-600/90 text-white text-xs font-medium px-2 py-1 rounded pointer-events-none">
          After
        </span>

        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white/80 shadow-lg pointer-events-none z-10"
          style={{ left: `${pos}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 bg-white rounded-full shadow-xl flex items-center justify-center">
            <MoveHorizontal className="w-4 h-4 text-gray-700" />
          </div>
        </div>

        <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-white/60 pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          Drag to compare
        </p>

        <button
          onClick={() => onOpen(item.imageBefore, `${item.title} — Before`)}
          className="absolute bottom-2 left-2 z-20 bg-gray-950/70 hover:bg-gray-950 text-white text-xs px-2.5 py-1 rounded transition-colors"
        >
          View Before
        </button>
        <button
          onClick={() => onOpen(item.imageAfter, `${item.title} — After`)}
          className="absolute bottom-2 right-2 z-20 bg-gray-950/70 hover:bg-gray-950 text-white text-xs px-2.5 py-1 rounded transition-colors"
        >
          View After
        </button>

        <input
          type="range"
          min="0"
          max="100"
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
          aria-label="Compare before and after"
        />
      </div>
    </div>
  )
}

// ── Side-by-side card ─────────────────────────────────────────────────────────

function SideBySideCard({
  item,
  onOpen,
}: {
  item: PortfolioItem
  onOpen: (src: string, alt: string) => void
}) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
      <div className="p-5 border-b border-gray-800">
        <h2 className="text-xl font-semibold text-gray-100">{item.title}</h2>
        {item.vehicle && (
          <p className="text-orange-400 font-medium text-sm mt-0.5">{item.vehicle}</p>
        )}
        <p className="text-gray-400 text-sm mt-2">{item.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-0.5 bg-gray-800">
        {/* Before */}
        <button
          onClick={() => onOpen(item.imageBefore, `${item.title} — Before`)}
          className="relative group overflow-hidden focus:outline-none"
          aria-label={`View ${item.title} before — full size`}
        >
          <img
            src={item.imageBefore}
            alt={`${item.title} before`}
            className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          <span className="absolute top-2 left-2 bg-gray-950/80 text-gray-200 text-xs font-semibold px-2.5 py-1 rounded">
            Before
          </span>
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-gray-950/80 text-white text-xs px-2.5 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Tap to enlarge
          </span>
        </button>

        {/* After */}
        <button
          onClick={() => onOpen(item.imageAfter, `${item.title} — After`)}
          className="relative group overflow-hidden focus:outline-none"
          aria-label={`View ${item.title} after — full size`}
        >
          <img
            src={item.imageAfter}
            alt={`${item.title} after`}
            className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          <span className="absolute top-2 right-2 bg-orange-600/90 text-white text-xs font-semibold px-2.5 py-1 rounded">
            After
          </span>
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-gray-950/80 text-white text-xs px-2.5 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Tap to enlarge
          </span>
        </button>
      </div>
    </div>
  )
}

// ── Lightbox ──────────────────────────────────────────────────────────────────

function Lightbox({
  src,
  alt,
  onClose,
}: {
  src: string
  alt: string
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 bg-gray-800 hover:bg-gray-700 text-white rounded-full p-2 transition-colors z-10"
        onClick={onClose}
        aria-label="Close"
      >
        <X className="h-6 w-6" />
      </button>
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-gray-400 text-sm">{alt}</p>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function GalleryClient({ items }: { items: PortfolioItem[] }) {
  const [viewMode, setViewMode] = useState<"slider" | "sidebyside">("slider")
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null)

  return (
    <>
      {/* View mode toggle */}
      <div className="flex justify-center mb-8">
        <div className="flex gap-1 bg-gray-800 border border-gray-700 rounded-xl p-1">
          <button
            onClick={() => setViewMode("slider")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === "slider"
                ? "bg-gray-700 text-white"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Slider
          </button>
          <button
            onClick={() => setViewMode("sidebyside")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === "sidebyside"
                ? "bg-gray-700 text-white"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Columns2 className="h-4 w-4" />
            Side by Side
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {items.map((item, index) =>
          viewMode === "slider" ? (
            <SliderCard
              key={index}
              item={item}
              onOpen={(src, alt) => setLightbox({ src, alt })}
            />
          ) : (
            <SideBySideCard
              key={index}
              item={item}
              onOpen={(src, alt) => setLightbox({ src, alt })}
            />
          )
        )}
      </div>

      {/* CTA */}
      <div className="text-center mt-14">
        <p className="text-gray-400 mb-4">Want work like this done on your vehicle?</p>
        <Link
          href="/#booking"
          className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
        >
          Book a Free Quote
        </Link>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <Lightbox
          src={lightbox.src}
          alt={lightbox.alt}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  )
}
