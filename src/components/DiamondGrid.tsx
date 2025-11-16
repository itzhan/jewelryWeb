"use client"

import { useState } from "react"
import type { StoneFilters } from "@/types/stone-filters"

interface DiamondGridProps {
  stoneType: "natural" | "labGrown"
  selectedShape: string
  filters: StoneFilters
}

const sampleDiamonds = [
  {
    id: 1,
    shape: "Radiant",
    carat: 0.5,
    color: "E",
    clarity: "VS1",
    ratio: 1.35,
    price: 850,
    settingPrice: 2200,
  },
  {
    id: 2,
    shape: "Radiant",
    carat: 0.8,
    color: "J",
    clarity: "VS1",
    ratio: 1.21,
    price: 1120,
    settingPrice: 2470,
  },
  {
    id: 3,
    shape: "Radiant",
    carat: 0.5,
    color: "D",
    clarity: "VVS1",
    ratio: 1.34,
    price: 1220,
    settingPrice: 2570,
  },
  {
    id: 4,
    shape: "Radiant",
    carat: 0.86,
    color: "I",
    clarity: "VS2",
    ratio: 1.25,
    price: 1260,
    settingPrice: 2610,
  },
  {
    id: 5,
    shape: "Radiant",
    carat: 0.7,
    color: "H",
    clarity: "VS1",
    ratio: 1.35,
    price: 1280,
    settingPrice: 2630,
  },
  {
    id: 6,
    shape: "Radiant",
    carat: 0.7,
    color: "F",
    clarity: "SI1",
    ratio: 1.38,
    price: 1340,
    settingPrice: 2690,
  },
  {
    id: 7,
    shape: "Radiant",
    carat: 0.71,
    color: "D",
    clarity: "VS2",
    ratio: 1.26,
    price: 1360,
    settingPrice: 2710,
  },
  {
    id: 8,
    shape: "Radiant",
    carat: 0.7,
    color: "E",
    clarity: "VVS1",
    ratio: 1.31,
    price: 1430,
    settingPrice: 2780,
  },
]

export default function DiamondGrid({ stoneType, selectedShape, filters }: DiamondGridProps) {
  const [favorites, setFavorites] = useState<number[]>([])

  const toggleFavorite = (id: number) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    )
  }

  return (
    <div className="CustomGridContainer mx-auto grid max-w-8xl grid-cols-1 gap-5 px-4 md:grid-cols-2 xl:grid-cols-4">
      {sampleDiamonds.map((diamond) => {
        const installment = (diamond.price / 12).toFixed(2)
        const isFavorite = favorites.includes(diamond.id)

        return (
          <div
            key={diamond.id}
            className="group relative flex cursor-pointer flex-col overflow-visible rounded-[1.75rem] border border-gray-100 bg-white/95 p-3 shadow-[0_18px_40px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_25px_60px_rgba(15,23,42,0.18)] hover:z-20"
          >
            <div className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-[#e8f0fb] via-white to-[#dfe9ff] p-4">
              <div className="absolute right-4 top-4 z-10">
                <button
                  onClick={(event) => {
                    event.stopPropagation()
                    toggleFavorite(diamond.id)
                  }}
                  aria-pressed={isFavorite}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/90 text-gray-600 shadow-md backdrop-blur transition hover:text-black ${
                    isFavorite ? "text-rose-500" : ""
                  }`}
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill={isFavorite ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path d="M4.5 7.5a4.5 4.5 0 016.364-6.364L12 2.272l1.136-1.136A4.5 4.5 0 1119.5 7.5L12 15z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              <div className="aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-gradient-to-br from-white via-[#f4f8ff] to-[#d9e6ff]">
                <div className="flex h-full items-center justify-center">
                  <svg
                    className="h-[90%] w-[90%] text-[#b3c2d7] opacity-90 transition-transform duration-500 group-hover:scale-105"
                    viewBox="0 0 120 100"
                    fill="currentColor"
                  >
                    <path d="M60 15c10-8 20-12 30-8 10 5 15 16 14 27-1 14-10 26-19 36-6 6-12 11-18 17-2 2-5 2-7 0-6-6-12-11-18-17-9-10-18-22-19-36-1-11 4-22 14-27 10-4 20 0 30 8z" opacity="0.55" />
                    <path d="M60 15c7-6 14-9 20-6s10 10 9 18c-1 9-6 17-12 24-4 4-8 8-12 12-1 1-3 1-4 0-4-4-8-8-12-12-6-7-11-15-12-24-1-8 3-15 9-18s13 0 20 6z" opacity="0.9" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex flex-1 flex-col px-4 pb-4 pt-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-semibold text-gray-900">{diamond.shape}</p>
                  <p className="text-sm text-gray-500">
                    With setting: ${diamond.settingPrice.toLocaleString()}
                  </p>
                </div>
                <p className="text-xl font-semibold text-gray-900">
                  ${diamond.price.toLocaleString()}
                </p>
              </div>

              <div className="relative mt-4">
                <div className="grid grid-cols-4 gap-2 rounded-2xl border border-gray-100 bg-gray-50/60 px-3 py-3 text-center">
                  <div>
                    <p className="text-base font-semibold text-gray-900">{diamond.carat.toFixed(2)}</p>
                    <p className="text-xs uppercase tracking-wide text-gray-400">Carat</p>
                  </div>
                  <div>
                    <p className="text-base font-semibold text-gray-900">{diamond.color}</p>
                    <p className="text-xs uppercase tracking-wide text-gray-400">Color</p>
                  </div>
                  <div>
                    <p className="text-base font-semibold text-gray-900">{diamond.clarity}</p>
                    <p className="text-xs uppercase tracking-wide text-gray-400">Clarity</p>
                  </div>
                  <div>
                    <p className="text-base font-semibold text-gray-900">{diamond.ratio.toFixed(2)}</p>
                    <p className="text-xs uppercase tracking-wide text-gray-400">Ratio</p>
                  </div>
                </div>

                <div className="max-h-0 overflow-hidden border-t border-transparent transition-[max-height,_padding-top] duration-300 group-hover:max-h-48 group-hover:border-gray-100/80 group-hover:pt-4">
                  <div className="flex gap-2">
                    <button className="flex-1 rounded-full border border-gray-900/80 py-1 text-xs font-semibold text-gray-900 transition hover:bg-gray-100">
                      More Info
                    </button>
                    <button className="flex-1 rounded-full bg-gray-900 py-1 text-xs font-semibold text-white transition hover:bg-black">
                      <span className="inline-flex items-center justify-center gap-1">
                        Complete pendant
                        <svg
                          className="h-3 w-3"
                          viewBox="0 0 12 12"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.5}
                          strokeLinecap="round"
                        >
                          <path d="M3 2l5 4-5 4" />
                        </svg>
                      </span>
                    </button>
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-gray-500">
                    Pay in 12 interest-free installments of{" "}
                    <span className="font-semibold text-gray-900">${installment}</span>{" "}
                    <button
                      type="button"
                      className="underline underline-offset-2 transition hover:text-gray-900"
                    >
                      Learn more
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
