"use client"

import { ChangeEvent } from "react"
import { Slider } from "@/components/ui/slider"

interface Filters {
  clarity: string[]
  color: string[]
  carat: { min: number; max: number }
  budget: { min: number; max: number }
  certificate: string[]
}

interface FilterPanelProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  selectedShape: string
  setSelectedShape: (shape: string) => void
  filters: Filters
  setFilters: (filters: Filters) => void
}

const shapes = [
  { name: "Round", icon: "○" },
  { name: "Emerald", icon: "⬡" },
  { name: "Heart", icon: "♡" },
  { name: "Marquise", icon: "◇" },
  { name: "Oval", icon: "⬭" },
  { name: "Pear", icon: "💧" },
  { name: "Princess", icon: "◻" },
  { name: "Radiant", icon: "◆" },
  { name: "Cushion", icon: "▢" },
]

const clarityOptions = ["SI1", "VS2", "VS1", "VVS2", "VVS1", "IF", "FL"]
const colorOptions = ["D", "E", "F", "G", "H", "I", "J"]

const clampCaratValue = (value: number) => Math.min(11, Math.max(0.5, value))

export default function FilterPanel({
  isOpen,
  setIsOpen,
  selectedShape,
  setSelectedShape,
  filters,
  setFilters,
}: FilterPanelProps) {
  const handleClarityToggle = (clarity: string) => {
    const newClarity = filters.clarity.includes(clarity)
      ? filters.clarity.filter((c: string) => c !== clarity)
      : [...filters.clarity, clarity]
    setFilters({ ...filters, clarity: newClarity })
  }

  const handleColorToggle = (color: string) => {
    const newColor = filters.color.includes(color)
      ? filters.color.filter((c: string) => c !== color)
      : [...filters.color, color]
    setFilters({ ...filters, color: newColor })
  }

  const handleCaratInputChange =
    (type: "min" | "max") => (event: ChangeEvent<HTMLInputElement>) => {
      const parsed = Number(event.target.value)
      if (Number.isNaN(parsed)) return

      if (type === "min") {
        const nextMin = Math.min(clampCaratValue(parsed), filters.carat.max)
        setFilters({
          ...filters,
          carat: {
            ...filters.carat,
            min: nextMin,
          },
        })
      } else {
        const nextMax = Math.max(clampCaratValue(parsed), filters.carat.min)
        setFilters({
          ...filters,
          carat: {
            ...filters.carat,
            max: nextMax,
          },
        })
      }
    }

  return (
    <div>
      {/* Mobile Filter Button */}
      <div className="md:hidden px-4 mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full py-3 px-4 bg-black text-white rounded-lg font-medium flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
        </button>
      </div>

      {/* Filter Panel */}
      <div className={`fixed inset-0 flex items-end z-50 md:opacity-100 md:visible md:relative md:z-30 md:block transition-all duration-500 ease-in-out pt-12 md:pt-0 ${
        isOpen ? "visible opacity-100" : "invisible opacity-0 md:visible md:opacity-100"
      }`}>
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>

        {/* Panel Content */}
        <div className={`relative bg-white w-full md:max-w-none rounded-t-2xl md:rounded-none shadow-xl md:shadow-none transition-transform duration-500 ${
          isOpen ? "translate-y-0" : "translate-y-full md:translate-y-0"
        }`}>
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Filters</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="max-h-[80vh] md:max-h-none overflow-y-auto md:overflow-visible">
            <div className="max-w-6xl mx-auto px-4 py-6">
              {/* Shape Selection */}
              <div className="mb-8">
                <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {shapes.map((shape) => (
                    <button
                      key={shape.name}
                      onClick={() => setSelectedShape(shape.name)}
                      className={`flex flex-col items-center gap-2 p-3 min-w-[80px] rounded-lg transition-all ${
                        selectedShape === shape.name
                          ? "bg-black text-white scale-105"
                          : "bg-white border-2 border-gray-200 hover:border-gray-400 hover:scale-105"
                      }`}
                    >
                      <span className="text-2xl">{shape.icon}</span>
                      <span className="text-xs font-medium whitespace-nowrap">{shape.name}</span>
                    </button>
                  ))}
                </div>
                <div className="text-center mt-4">
                  <button
                    onClick={() => setSelectedShape("")}
                    className="text-sm text-gray-500 hover:text-gray-900 underline"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 md:p-6 rounded-lg">
                {/* Clarity */}
                <div>
                  <label className="block text-sm font-semibold mb-3">
                    Clarity
                    <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-400 text-white text-xs cursor-help">
                      ?
                    </span>
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {clarityOptions.map((clarity) => (
                      <button
                        key={clarity}
                        onClick={() => handleClarityToggle(clarity)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                          filters.clarity.includes(clarity)
                            ? "bg-white border-2 border-black text-black scale-105"
                            : "bg-white border border-gray-300 text-gray-600 hover:border-gray-400"
                        }`}
                      >
                        {clarity}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-semibold mb-3">Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleColorToggle(color)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                          filters.color.includes(color)
                            ? "bg-white border-2 border-black text-black scale-105"
                            : "bg-white border border-gray-300 text-gray-600 hover:border-gray-400"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Carat */}
                <div>
                  <label className="block text-sm font-semibold mb-3">Carat</label>
                  <div className="flex gap-3 mb-3">
                    <div className="flex-1">
                      <span className="text-xs text-gray-500">Minimum (ct)</span>
                      <input
                        type="number"
                        min={0.5}
                        max={11}
                        step={0.01}
                        value={filters.carat.min}
                        onChange={handleCaratInputChange("min")}
                        className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </div>
                    <div className="flex-1">
                      <span className="text-xs text-gray-500">Maximum (ct)</span>
                      <input
                        type="number"
                        min={0.5}
                        max={11}
                        step={0.01}
                        value={filters.carat.max}
                        onChange={handleCaratInputChange("max")}
                        className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </div>
                  </div>
                  <Slider
                    min={0.5}
                    max={11}
                    step={0.1}
                    value={[filters.carat.min, filters.carat.max]}
                    onValueChange={(value: number[]) =>
                      setFilters({ ...filters, carat: { min: value[0], max: value[1] } })
                    }
                    className="mb-4"
                  />
                  <div className="flex justify-between text-sm">
                    <div>
                      <span className="text-gray-500">Minimum</span>
                      <p className="font-medium">{filters.carat.min} ct</p>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-500">Maximum</span>
                      <p className="font-medium">{filters.carat.max} ct</p>
                    </div>
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-sm font-semibold mb-3">Budget</label>
                  <div className="flex justify-between text-sm mb-4">
                    <div>
                      <span className="text-gray-500">Minimum</span>
                      <p className="font-medium">$ {filters.budget.min.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-500">Maximum</span>
                      <p className="font-medium">$ {filters.budget.max.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Certificate */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-3">Certificate</label>
                  <div className="flex gap-2">
                    <button className="flex-1 px-4 py-2 rounded-md text-sm font-medium bg-white border border-gray-300 text-gray-600 hover:border-gray-400 transition-all">
                      IGI
                    </button>
                    <button className="flex-1 px-4 py-2 rounded-md text-sm font-medium bg-white border border-gray-300 text-gray-600 hover:border-gray-400 transition-all">
                      GIA
                    </button>
                  </div>
                </div>
              </div>

              <div className="text-center mt-6">
                <button className="text-sm text-gray-600 hover:text-gray-900 underline transition-colors">
                  Advanced Quality Specs +
                </button>
              </div>

              {/* Results Counter */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-8 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">Showing 1-14 of 401</span>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
                <select className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:border-gray-400 transition-colors cursor-pointer">
                  <option>Price (low-to-high)</option>
                  <option>Price (high-to-low)</option>
                  <option>Carat (low-to-high)</option>
                  <option>Carat (high-to-low)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
