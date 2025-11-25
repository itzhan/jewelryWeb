"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DiamondGrid from "@/components/DiamondGrid";
import { Slider } from "@/components/ui/slider";
import type { StoneFilters, StoneCutGrade } from "@/types/stone-filters";
import type { StepOneProduct } from "./StepOneLanding";
import {
  fetchStoneFilters,
  type StoneFiltersDto,
  type BackendStoneItem,
} from "@/lib/backend";

const defaultClarityOptions = ["SI1", "VS2", "VS1", "VVS2", "VVS1", "IF", "FL"];
const defaultColorOptions = ["J", "I", "H", "G", "F", "E", "D"];
const defaultCertificateOptions = ["IGI", "GIA"];
const defaultCutOptions: Array<{ label: string; value: StoneCutGrade }> = [
  { label: "Good", value: "good" },
  { label: "Very Good", value: "veryGood" },
  { label: "Excellent", value: "excellent" },
];

const colorGradientStops = [
  "#fff9df",
  "#fff4cd",
  "#ffecb7",
  "#ffe19f",
  "#fdd98c",
  "#f7cd75",
  "#f4c465",
];
const BUDGET_STEP = 250;

// Removed local shapes array - now using backend shapes data

export interface RangeSelection {
  start: number;
  end: number;
  anchor: number | null;
}

const createInitialRange = (length: number): RangeSelection => ({
  start: 0,
  end: length - 1,
  anchor: null,
});

export type RangeSelections = {
  color: RangeSelection;
  clarity: RangeSelection;
  cut: RangeSelection;
};

type BandType = "color" | "clarity" | "cut";

const isIndexWithinRange = (range: RangeSelection, index: number) => {
  const start = Math.min(range.start, range.end);
  const end = Math.max(range.start, range.end);
  return index >= start && index <= end;
};

const getRangeMetrics = (range: RangeSelection, total: number) => {
  const start = Math.min(range.start, range.end);
  const end = Math.max(range.start, range.end);
  const width = ((end - start + 1) / total) * 100;
  const left = (start / total) * 100;
  return { left, width };
};

const buildHighlightStyle = (
  range: RangeSelection,
  total: number,
  offsetPx = 0
) => {
  const { left, width } = getRangeMetrics(range, total);
  return {
    left: `calc(${left}% + ${offsetPx}px)`,
    width: `calc(${width}% - ${offsetPx * 2}px)`,
  };
};

const createDefaultFilters = (options?: {
  clarityCodes?: string[];
  colorCodes?: string[];
  cutCodes?: string[];
}): StoneFilters => {
  const clarity = options?.clarityCodes ?? defaultClarityOptions;
  const color = options?.colorCodes ?? defaultColorOptions;
  const allCutsOrder: StoneCutGrade[] = ["good", "veryGood", "excellent"];
  const availableCuts =
    options?.cutCodes && options.cutCodes.length > 0
      ? allCutsOrder.filter((code) => options.cutCodes?.includes(code))
      : allCutsOrder;

  return {
    clarity,
    color,
    cut: availableCuts,
    // 更贴近当前 mock 数据的默认范围
    carat: { min: 0.5, max: 2 },
    budget: { min: 250, max: 5000 },
    certificate: [],
  };
};

const InfoDot = () => (
  <span className="ml-2 inline-flex h-4 w-4 items-center justify-center rounded-full border border-gray-300 text-[10px] leading-none text-gray-500">
    ?
  </span>
);

const ArrowIcon = ({ direction }: { direction: "up" | "down" }) => (
  <svg
    width="10"
    height="10"
    viewBox="0 0 12 12"
    fill="none"
    stroke="currentColor"
    className="text-gray-400"
  >
    {direction === "up" ? (
      <path
        d="M2 8l4-4 4 4"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ) : (
      <path
        d="M2 4l4 4 4-4"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    )}
  </svg>
);

interface SpinnerProps {
  onIncrease?: () => void;
  onDecrease?: () => void;
}

const SpinnerButtons = ({ onIncrease, onDecrease }: SpinnerProps) => (
  <div className="flex flex-col">
    <button
      type="button"
      onClick={onIncrease}
      className="p-1"
      aria-label="Increase"
    >
      <ArrowIcon direction="up" />
    </button>
    <button
      type="button"
      onClick={onDecrease}
      className="p-1"
      aria-label="Decrease"
    >
      <ArrowIcon direction="down" />
    </button>
  </div>
);

interface StoneSelectionSectionProps {
  selectedProduct: StepOneProduct | null;
  selectedStone?: BackendStoneItem | null;
  selectedShapeValue?: string;
  onSelectedShapeChange?: (shape: string) => void;
  filtersValue?: StoneFilters;
  onFiltersChange?: (filters: StoneFilters) => void;
  rangeSelectionsValue?: RangeSelections;
  onRangeSelectionsChange?: (ranges: RangeSelections) => void;
  onMoreInfo?: (stone: BackendStoneItem) => void;
  // 点击「Add pendant」时，把当前石头对象回传给上层，便于步骤三展示真实配置
  onAddPendant?: (stone: BackendStoneItem) => void;
}

export default function StoneSelectionSection({
  selectedProduct,
  selectedStone,
  selectedShapeValue,
  onSelectedShapeChange,
  filtersValue,
  onFiltersChange,
  rangeSelectionsValue,
  onRangeSelectionsChange,
  onMoreInfo,
  onAddPendant,
}: StoneSelectionSectionProps) {
  const stoneType = "labGrown" as const;
  const [backendOptions, setBackendOptions] = useState<StoneFiltersDto | null>(
    null
  );
  const [selectedShape, setSelectedShape] = useState<string>(
    selectedShapeValue ?? "Heart"
  );
  const [filters, setFilters] = useState<StoneFilters>(() =>
    filtersValue ?? createDefaultFilters()
  );
  const [rangeSelections, setRangeSelections] = useState<RangeSelections>(
    () =>
      rangeSelectionsValue ?? {
        color: createInitialRange(defaultColorOptions.length),
        clarity: createInitialRange(defaultClarityOptions.length),
        cut: createInitialRange(defaultCutOptions.length),
      }
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState<"default" | "price_asc" | "price_desc">("default");
  const pageSize = 8;

  const selectedStoneShape = selectedStone?.shape;

  // Reset to page 1 when filters or sorting changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy, selectedShape]);

  const syncJsonEqual = (a: unknown, b: unknown) =>
    JSON.stringify(a) === JSON.stringify(b);

  const updateSelectedShape = useCallback(
    (shape: string, options?: { notifyParent?: boolean }) => {
      setSelectedShape(shape);
      if (options?.notifyParent) {
        // 避免渲染期同步触发父组件 setState，使用微任务延迟
        Promise.resolve().then(() => onSelectedShapeChange?.(shape));
      }
    },
    [onSelectedShapeChange]
  );

  const updateFiltersState = useCallback(
    (next: StoneFilters | ((prev: StoneFilters) => StoneFilters)) => {
      setFilters((prev) => {
        const resolved = typeof next === "function" ? next(prev) : next;
        onFiltersChange?.(resolved);
        return resolved;
      });
    },
    [onFiltersChange]
  );

  const updateRangeSelectionsState = useCallback(
    (next: RangeSelections | ((prev: RangeSelections) => RangeSelections)) => {
      setRangeSelections((prev) => {
        const resolved =
          typeof next === "function"
            ? (next as (prev: RangeSelections) => RangeSelections)(prev)
            : next;
        onRangeSelectionsChange?.(resolved);
        return resolved;
      });
    },
    [onRangeSelectionsChange]
  );

  useEffect(() => {
    if (selectedShapeValue && selectedShapeValue !== selectedShape) {
      setSelectedShape(selectedShapeValue);
    }
  }, [selectedShapeValue, selectedShape]);

  useEffect(() => {
    if (filtersValue && !syncJsonEqual(filtersValue, filters)) {
      setFilters(filtersValue);
    }
  }, [filtersValue, filters]);

  useEffect(() => {
    if (
      rangeSelectionsValue &&
      !syncJsonEqual(rangeSelectionsValue, rangeSelections)
    ) {
      setRangeSelections(rangeSelectionsValue);
    }
  }, [rangeSelectionsValue, rangeSelections]);

  const shapeIconSvgMap = useMemo(() => {
    const map = new Map<string, string | undefined>();
    backendOptions?.shapes.forEach((item) => {
      if (item.iconSvg) {
        map.set(item.label, item.iconSvg);
      }
    });
    return map;
  }, [backendOptions]);

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const data = await fetchStoneFilters();
        setBackendOptions(data);

        const clarityCodes = data.clarities.map((c) => c.code);
        const colorCodes = data.colors.map((c) => c.code);
        const cutCodes = data.cuts.map((c) => c.code);

        if (!filtersValue) {
          updateFiltersState(
            createDefaultFilters({ clarityCodes, colorCodes, cutCodes })
          );
        }
        if (!rangeSelectionsValue) {
          updateRangeSelectionsState({
            color: createInitialRange(colorCodes.length),
            clarity: createInitialRange(clarityCodes.length),
            cut: createInitialRange(cutCodes.length),
          });
        }

        // 选中一个后端实际存在的形状名称
        if (data.shapes.length > 0) {
          const normalizedStoneShape = selectedStoneShape?.toLowerCase();
          const nextShape =
            selectedShapeValue ??
            (normalizedStoneShape
              ? data.shapes.find(
                  (shape) =>
                    shape.code?.toLowerCase() === normalizedStoneShape ||
                    shape.label.toLowerCase() === normalizedStoneShape
                )?.label
              : data.shapes[0].label);
          if (nextShape) {
            updateSelectedShape(nextShape);
          }
        }
      } catch (e) {
        console.error("加载石头筛选枚举失败", e);
      }
    };

    loadFilters();
  }, [
    selectedShapeValue,
    selectedStoneShape,
    filtersValue,
    rangeSelectionsValue,
    updateFiltersState,
    updateRangeSelectionsState,
    updateSelectedShape,
  ]);

  useEffect(() => {
    if (!backendOptions || !selectedStone) return;

    const normalizedShape = selectedStone.shape.toLowerCase();
    const matchedShape = backendOptions.shapes.find(
      (shape) =>
        shape.code?.toLowerCase() === normalizedShape ||
        shape.label.toLowerCase() === normalizedShape
    );

    if (matchedShape?.label) {
      updateSelectedShape(matchedShape.label);
    }
  }, [backendOptions, selectedStone, updateSelectedShape]);

  const colorCodes = useMemo(
    () => backendOptions?.colors.map((c) => c.code) ?? defaultColorOptions,
    [backendOptions]
  );
  const clarityCodes = useMemo(
    () => backendOptions?.clarities.map((c) => c.code) ?? defaultClarityOptions,
    [backendOptions]
  );
  const cutCodes = useMemo(
    () =>
      backendOptions?.cuts.map((c) => c.code as StoneCutGrade) ??
      defaultCutOptions.map((option) => option.value),
    [backendOptions]
  );
  const certificateCodes = useMemo(
    () =>
      backendOptions?.certificates.map((c) => c.code) ??
      defaultCertificateOptions,
    [backendOptions]
  );

  const dynamicCutOptions: Array<{ label: string; value: StoneCutGrade }> =
    useMemo(() => {
      if (!backendOptions) return defaultCutOptions;
      return backendOptions.cuts.map((c) => ({
        label: c.label,
        value: c.code as StoneCutGrade,
      }));
    }, [backendOptions]);

  const toggleCertificate = (value: string) => {
    updateFiltersState((prev) => {
      const exists = prev.certificate.includes(value);
      const nextValues = exists
        ? prev.certificate.filter((item) => item !== value)
        : [...prev.certificate, value];
      return { ...prev, certificate: nextValues };
    });
  };

  const handleBandSelection = (type: BandType, index: number) => {
    updateRangeSelectionsState((prev) => {
      const current = prev[type];
      let nextRange: RangeSelection;

      if (current.anchor === null) {
        nextRange = { start: index, end: index, anchor: index };
      } else if (current.anchor === index) {
        nextRange = { start: index, end: index, anchor: null };
      } else {
        const start = Math.min(current.anchor, index);
        const end = Math.max(current.anchor, index);
        nextRange = { start, end, anchor: null };
      }

      const updatedSelections = { ...prev, [type]: nextRange };
      const activeOptions =
        type === "color"
          ? colorCodes
          : type === "clarity"
          ? clarityCodes
          : cutCodes;
      const normalizedStart = Math.min(nextRange.start, nextRange.end);
      const normalizedEnd = Math.max(nextRange.start, nextRange.end);
      const selectedValues = activeOptions.slice(
        normalizedStart,
        normalizedEnd + 1
      );

      updateFiltersState((prevFilters) => ({
        ...prevFilters,
        [type]: selectedValues,
      }));
      return updatedSelections;
    });
  };

  const handleCaratChange = (value: number[]) => {
    updateFiltersState((prev) => ({
      ...prev,
      carat: {
        min: Number(value[0].toFixed(1)),
        max: Number(value[1].toFixed(1)),
      },
    }));
  };

  const updateBudgetField = (
    field: "min" | "max",
    computeValue: (current: { min: number; max: number }) => number
  ) => {
    updateFiltersState((prev) => {
      const nextBudget = { ...prev.budget };
      const candidate = Math.max(0, computeValue(nextBudget));

      if (field === "min") {
        const upperBound = Math.max(0, nextBudget.max - BUDGET_STEP);
        nextBudget.min = Math.min(candidate, upperBound);
      } else {
        const lowerBound = nextBudget.min + BUDGET_STEP;
        nextBudget.max = Math.max(candidate, lowerBound);
      }

      return { ...prev, budget: nextBudget };
    });
  };

  const adjustBudget = (field: "min" | "max", delta: number) => {
    updateBudgetField(field, (current) =>
      field === "min" ? current.min + delta : current.max + delta
    );
  };

  const handleBudgetInput = (field: "min" | "max", rawValue: string) => {
    const numericString = rawValue.replace(/[^0-9]/g, "");
    const parsed = numericString === "" ? 0 : Number(numericString);
    updateBudgetField(field, () => parsed);
  };

  const handleReset = () => {
    if (backendOptions?.shapes?.length) {
      updateSelectedShape(backendOptions.shapes[0].label, { notifyParent: true });
    } else {
      updateSelectedShape("Heart", { notifyParent: true });
    }

    const clarityCodes = backendOptions?.clarities.map((c) => c.code);
    const colorCodes = backendOptions?.colors.map((c) => c.code);
    const cutCodes = backendOptions?.cuts.map((c) => c.code as StoneCutGrade);
    updateFiltersState(
      createDefaultFilters({ clarityCodes, colorCodes, cutCodes })
    );
    updateRangeSelectionsState({
      color: createInitialRange(
        colorCodes?.length ?? defaultColorOptions.length
      ),
      clarity: createInitialRange(
        clarityCodes?.length ?? defaultClarityOptions.length
      ),
      cut: createInitialRange(cutCodes?.length ?? defaultCutOptions.length),
    });
  };

  return (
    <section className="step-two-view bg-white">
      <div className="mx-auto max-w-8xl px-4 py-14">
        <div className="text-center">
          <p className="text-xl text-gray-500 md:text-2xl">
            Use the filters below to design your perfect engagement ring
          </p>
        </div>
        <div className="mt-10">
          <div className="flex flex-wrap items-center justify-center gap-4 overflow-x-auto pb-2 text-center">
            {backendOptions?.shapes?.map((shape) => {
              const isSelected = selectedShape === shape.label;
              const iconSvg = shape.iconSvg;
              return (
                <button
                  key={shape.code}
                  type="button"
                  onClick={() => updateSelectedShape(shape.label, { notifyParent: true })}
                  className={`flex h-28 w-24 flex-col items-center justify-center rounded-2xl border-2 transition-all ${
                    isSelected
                      ? "border-black shadow-[0_12px_24px_rgba(0,0,0,0.12)]"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <span className="mb-2 text-gray-700">
                    {iconSvg && (
                      <span
                        className="inline-block h-12 w-12"
                        dangerouslySetInnerHTML={{ __html: iconSvg }}
                      />
                    )}
                  </span>
                  <span className="text-xs font-medium text-gray-600">
                    {shape.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between border-b border-gray-200 pb-4">
          <div className="flex items-center gap-2 text-sm uppercase tracking-wide text-gray-400">
            <span className="h-px w-10 bg-gray-300" />
            Filters
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            Reset
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
            >
              <path
                d="M4 4v4h4"
                strokeWidth={1.4}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4.93 4.93A8 8 0 0116 10a8 8 0 01-3.34 6.56"
                strokeWidth={1.4}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="mt-10 space-y-8">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center text-base font-semibold text-gray-900">
                Color
                <InfoDot />
              </div>
              <div className="mt-3">
                <div
                  className="relative mb-3 flex h-5 overflow-hidden rounded-md border border-gray-200 md:mt-4"
                  style={{
                    background:
                      "linear-gradient(90deg, rgb(255, 254, 235) 10%, rgb(255, 255, 255) 90%)",
                  }}
                >
                  {colorCodes.map((_, index) => (
                    <div
                      key={`color-bar-segment-${index}`}
                      className="relative h-full flex-1"
                    >
                      {index < colorCodes.length - 1 && (
                        <span className="absolute right-0 top-0 bottom-0 w-px bg-gray-200" />
                      )}
                    </div>
                  ))}
                  <div
                    className="pointer-events-none absolute top-0 bottom-0 rounded-lg bg-transparent transition-all duration-500"
                    style={buildHighlightStyle(
                      rangeSelections.color,
                      colorCodes.length
                    )}
                  >
                    <div className="absolute inset-0 border-l border-r border-black" />
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-[#f8f5ef] px-2 py-3">
                  <div
                    className="absolute top-1/2 z-0 h-12 -translate-y-1/2 rounded-2xl border-2 border-black bg-white shadow-[0px_16px_40px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out"
                    style={buildHighlightStyle(
                      rangeSelections.color,
                      colorCodes.length,
                      4
                    )}
                  />
                  <div className="relative z-10 grid grid-cols-7 text-center text-xs font-semibold uppercase tracking-[0.12em]">
                    {colorCodes.map((color, index) => {
                      const isActive = isIndexWithinRange(
                        rangeSelections.color,
                        index
                      );
                      return (
                        <button
                          key={color}
                          type="button"
                          aria-pressed={isActive}
                          onClick={() => handleBandSelection("color", index)}
                          className="py-1 transition-colors"
                        >
                          <span
                            className={`inline-block px-1 ${
                              isActive ? "text-gray-900" : "text-gray-400"
                            }`}
                          >
                            {color}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center text-base font-semibold text-gray-900">
                Clarity
                <InfoDot />
              </div>
              <div className="mt-3">
                <div
                  className="relative mb-3 flex h-5 overflow-hidden rounded-md border border-gray-200 md:mt-4"
                  style={{
                    background:
                      'url("https://cdn.shopify.com/s/files/1/0039/6994/1568/files/clarity-filter-hint.png?v=1743157435") center center / cover no-repeat',
                  }}
                >
                  {clarityCodes.map((_, index) => (
                    <div
                      key={`clarity-bar-segment-${index}`}
                      className="relative z-10 flex-1 h-full bg-transparent px-2 text-center uppercase transition-colors"
                    >
                      {index < clarityCodes.length - 1 && (
                        <span className="absolute right-0 top-0 bottom-0 w-px bg-gray-200" />
                      )}
                    </div>
                  ))}
                  <div
                    className="pointer-events-none absolute top-0 bottom-0 rounded-lg bg-transparent transition-all duration-500"
                    style={buildHighlightStyle(
                      rangeSelections.clarity,
                      clarityCodes.length
                    )}
                  >
                    <div className="absolute z-20 h-full w-full border-l border-r border-black" />
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-[#f8f5ef] px-2 py-3">
                  <div
                    className="absolute top-1/2 z-0 h-12 -translate-y-1/2 rounded-2xl border-2 border-black bg-white shadow-[0px_16px_40px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out"
                    style={buildHighlightStyle(
                      rangeSelections.clarity,
                      clarityCodes.length,
                      4
                    )}
                  />
                  <div className="relative z-10 grid grid-cols-7 text-center text-xs font-semibold uppercase tracking-[0.08em]">
                    {clarityCodes.map((clarity, index) => {
                      const isActive = isIndexWithinRange(
                        rangeSelections.clarity,
                        index
                      );
                      return (
                        <button
                          key={clarity}
                          type="button"
                          aria-pressed={isActive}
                          onClick={() => handleBandSelection("clarity", index)}
                          className="py-1 transition-colors"
                        >
                          <span
                            className={`inline-block px-1 ${
                              isActive ? "text-gray-900" : "text-gray-400"
                            }`}
                          >
                            {clarity}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center text-base font-semibold text-gray-900">
                Cut
                <InfoDot />
              </div>
              <div className="mt-3">
                <div className="relative flex h-10 overflow-hidden rounded-lg border border-gray-200 bg-gray-100 md:mt-4">
                  {dynamicCutOptions.map(({ label, value }, index) => {
                    const isActive = isIndexWithinRange(
                      rangeSelections.cut,
                      index
                    );
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleBandSelection("cut", index)}
                        className={`relative z-10 flex h-full flex-1 items-center justify-center px-2 text-center text-[0.8rem] font-semibold uppercase leading-tight tracking-[0.18em] ${
                          isActive ? "text-gray-900" : "text-gray-600"
                        }`}
                      >
                        <span className="font-[system-ui]">{label}</span>
                        {index < dynamicCutOptions.length - 1 && (
                          <span className="absolute right-0 top-0 bottom-0 w-px bg-gray-300" />
                        )}
                      </button>
                    );
                  })}
                  <div
                    className="pointer-events-none absolute top-0 bottom-0 rounded-lg bg-white transition-all duration-500"
                    style={buildHighlightStyle(
                      rangeSelections.cut,
                      cutCodes.length
                    )}
                  >
                    <div className="absolute inset-0 rounded-lg border border-black ring-1 ring-black" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-lg font-semibold text-gray-900">
                  Carat
                </span>
              </div>
              <div className="mt-4">
                <Slider
                  min={0.5}
                  max={11}
                  step={0.1}
                  value={[filters.carat.min, filters.carat.max]}
                  onValueChange={handleCaratChange}
                  className="h-2"
                />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">
                      Minimum
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {filters.carat.min} ct
                    </p>
                  </div>
                  <SpinnerButtons />
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">
                      Maximum
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {filters.carat.max} ct
                    </p>
                  </div>
                  <SpinnerButtons />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="text-lg font-semibold text-gray-900">Budget</div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">
                      Minimum
                    </p>
                    <div className="mt-1 flex items-baseline gap-0">
                      <span className="text-sm text-gray-400">$</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={filters.budget.min}
                        onChange={(event) =>
                          handleBudgetInput("min", event.target.value)
                        }
                        className="w-24 bg-transparent text-right text-lg font-semibold text-gray-900 focus:outline-none pl-0 leading-none"
                      />
                    </div>
                  </div>
                  <SpinnerButtons
                    onIncrease={() => adjustBudget("min", BUDGET_STEP)}
                    onDecrease={() => adjustBudget("min", -BUDGET_STEP)}
                  />
                </div>
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">
                      Maximum
                    </p>
                    <div className="mt-1 flex items-baseline gap-0">
                      <span className="text-sm text-gray-400">$</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={filters.budget.max}
                        onChange={(event) =>
                          handleBudgetInput("max", event.target.value)
                        }
                        className="w-24 bg-transparent text-right text-lg font-semibold text-gray-900 focus:outline-none pl-0 leading-none"
                      />
                    </div>
                  </div>
                  <SpinnerButtons
                    onIncrease={() => adjustBudget("max", BUDGET_STEP)}
                    onDecrease={() => adjustBudget("max", -BUDGET_STEP)}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="text-lg font-semibold text-gray-900">
                Certificate
              </div>
              <div className="mt-4 flex gap-3">
                {certificateCodes.map((certificate) => {
                  const isActive = filters.certificate.includes(certificate);
                  return (
                    <button
                      key={certificate}
                      type="button"
                      onClick={() => toggleCertificate(certificate)}
                      className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-semibold uppercase tracking-wide transition ${
                        isActive
                          ? "border-black bg-white text-gray-900 shadow-sm"
                          : "border-gray-200 bg-gray-50 text-gray-500 hover:text-gray-800"
                      }`}
                    >
                      {certificate}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              type="button"
              className="text-sm font-medium text-gray-500 underline-offset-4 hover:text-gray-900 hover:underline"
            >
              Advanced Quality Specs +
            </button>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200 pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4 text-sm font-medium text-gray-600">
              <span>Showing {Math.min((currentPage - 1) * pageSize + 1, totalCount)}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount}</span>
              <div className="flex gap-2">
                <button
                  className="rounded-full border border-gray-200 p-2 transition hover:border-gray-400 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M15 6l-6 6 6 6" />
                  </svg>
                </button>
                <button
                  className="rounded-full border border-gray-200 p-2 transition hover:border-gray-400 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={currentPage * pageSize >= totalCount}
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>
            </div>
            <select
              className="w-full max-w-xs rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-gray-400 focus:border-gray-900 focus:outline-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            >
              <option value="default">Default</option>
              <option value="price_asc">Price (low-to-high)</option>
              <option value="price_desc">Price (high-to-low)</option>
            </select>
          </div>
        </div>

        <div className="mt-16">
          <DiamondGrid
            stoneType={stoneType}
            selectedShape={selectedShape}
            filters={filters}
            currentPage={currentPage}
            pageSize={pageSize}
            sortBy={sortBy}
            onMoreInfo={onMoreInfo}
            onAddPendant={onAddPendant}
            onTotalCountChange={setTotalCount}
            shapeIconSvgMap={shapeIconSvgMap}
            selectedStoneId={selectedStone?.id}
          />
        </div>
      </div>
    </section>
  );
}
