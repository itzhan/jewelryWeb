"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
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
const CARAT_MIN = 0.5;
const CARAT_MAX = 20;
const CARAT_STEP = 0.1;

const clampCaratValue = (value: number) =>
  Math.min(CARAT_MAX, Math.max(CARAT_MIN, value));

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
    carat: { min: CARAT_MIN, max: 2 },
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
  currentPageValue?: number;
  onCurrentPageChange?: (page: number) => void;
  sortByValue?: "default" | "price_asc" | "price_desc";
  onSortByChange?: (sort: "default" | "price_asc" | "price_desc") => void;
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
  currentPageValue,
  onCurrentPageChange,
  sortByValue,
  onSortByChange,
  onMoreInfo,
  onAddPendant,
}: StoneSelectionSectionProps) {
  const stoneType = "labGrown" as const;
  const initialFilters = useMemo(
    () => filtersValue ?? createDefaultFilters(),
    [filtersValue]
  );
  const [backendOptions, setBackendOptions] = useState<StoneFiltersDto | null>(
    null
  );
  const [selectedShape, setSelectedShape] = useState<string>(
    selectedShapeValue ?? "Heart"
  );
  const [selectedShapeCode, setSelectedShapeCode] = useState<string | undefined>(
    undefined
  );
  const [filters, setFilters] = useState<StoneFilters>(() => initialFilters);
  const [caratInput, setCaratInput] = useState<{ min: string; max: string }>(
    () => ({
      min: initialFilters.carat.min.toString(),
      max: initialFilters.carat.max.toString(),
    })
  );
  const [rangeSelections, setRangeSelections] = useState<RangeSelections>(
    () =>
      rangeSelectionsValue ?? {
        color: createInitialRange(defaultColorOptions.length),
        clarity: createInitialRange(defaultClarityOptions.length),
        cut: createInitialRange(defaultCutOptions.length),
      }
  );
  const [currentPage, setCurrentPage] = useState(() => currentPageValue ?? 1);
  const [pageInfo, setPageInfo] = useState<{
    total?: number;
    count: number;
    hasNext: boolean;
  }>({ total: undefined, count: 0, hasNext: false });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"default" | "price_asc" | "price_desc">(() => sortByValue ?? "default");
  const pageSize = 8;

  const selectedStoneShape = selectedStone?.shape;

  // Reset to page 1 when filters or sorting changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy, selectedShape]);

  // 同步数字输入框显示值，支持临时清空重新输入
  useEffect(() => {
    setCaratInput({
      min: filters.carat.min.toString(),
      max: filters.carat.max.toString(),
    });
  }, [filters.carat.min, filters.carat.max]);

  const syncJsonEqual = (a: unknown, b: unknown) =>
    JSON.stringify(a) === JSON.stringify(b);

  const updateSelectedShape = useCallback(
    (
      shape: string,
      options?: { notifyParent?: boolean; code?: string }
    ) => {
      setSelectedShape(shape);
      setSelectedShapeCode(options?.code);
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
        // 避免渲染期同步触发父组件 setState，使用微任务延迟
        Promise.resolve().then(() => onFiltersChange?.(resolved));
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
        // 避免渲染期同步触发父组件 setState，使用微任务延迟
        Promise.resolve().then(() => onRangeSelectionsChange?.(resolved));
        return resolved;
      });
    },
    [onRangeSelectionsChange]
  );

  useEffect(() => {
    if (selectedShapeValue && selectedShapeValue !== selectedShape) {
      setSelectedShape(selectedShapeValue);
      if (backendOptions?.shapes?.length) {
        const normalized = selectedShapeValue.toLowerCase();
        const matched = backendOptions.shapes.find(
          (shape) =>
            shape.label?.toLowerCase() === normalized ||
            shape.code?.toLowerCase() === normalized
        );
        if (matched?.code) {
          setSelectedShapeCode(matched.code);
        }
      }
    }
  }, [selectedShapeValue, selectedShape, backendOptions]);

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

  // 同步当前页码从 URL
  useEffect(() => {
    if (currentPageValue !== undefined && currentPageValue !== currentPage) {
      setCurrentPage(currentPageValue);
    }
  }, [currentPageValue, currentPage]);

  // 同步排序方式从 URL
  useEffect(() => {
    if (sortByValue && sortByValue !== sortBy) {
      setSortBy(sortByValue);
    }
  }, [sortByValue, sortBy]);

  // 包装页码更新函数，同步到 URL
  const handlePageChange = useCallback((updater: number | ((prev: number) => number)) => {
    const newPage = typeof updater === "function" ? (updater as (prev: number) => number)(currentPage) : updater;
    setCurrentPage(newPage);
    onCurrentPageChange?.(newPage);
  }, [currentPage, onCurrentPageChange]);

  // 包装排序更新函数，同步到 URL
  const handleSortChange = useCallback((newSort: "default" | "price_asc" | "price_desc") => {
    setSortBy(newSort);
    onSortByChange?.(newSort);
  }, [onSortByChange]);

  const handlePaginationChange = useCallback((meta: {
    total?: number;
    page: number;
    pageSize: number;
    count: number;
    hasNext: boolean;
  }) => {
    setPageInfo({ total: meta.total, count: meta.count, hasNext: meta.hasNext });
    // 总数不一定有，缺失时用 hasNext 控制翻页
  }, []);

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
          const normalizedSelected = selectedShapeValue?.toLowerCase();
          const nextShapeItem =
            (normalizedSelected
              ? data.shapes.find(
                  (shape) =>
                    shape.code?.toLowerCase() === normalizedSelected ||
                    shape.label.toLowerCase() === normalizedSelected
                )
              : null) ||
            (normalizedStoneShape
              ? data.shapes.find(
                  (shape) =>
                    shape.code?.toLowerCase() === normalizedStoneShape ||
                    shape.label.toLowerCase() === normalizedStoneShape
                )
              : null) ||
            data.shapes[0];

          if (nextShapeItem?.label) {
            updateSelectedShape(nextShapeItem.label, {
              code: nextShapeItem.code,
            });
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
      updateSelectedShape(matchedShape.label, { code: matchedShape.code });
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
    updateFiltersState((prev) => {
      const nextMin = clampCaratValue(value[0]);
      const nextMax = clampCaratValue(
        Math.max(nextMin, value[1])
      );
      return {
        ...prev,
        carat: {
          min: Number(nextMin.toFixed(2)),
          max: Number(nextMax.toFixed(2)),
        },
      };
    });
  };

  const applyCaratCandidate = (
    prev: StoneFilters,
    field: "min" | "max",
    candidate: number
  ) => {
    const clamped = clampCaratValue(candidate);
    if (field === "min") {
      const nextMin = Math.min(clamped, prev.carat.max);
      return {
        ...prev,
        carat: {
          ...prev.carat,
          min: Number(nextMin.toFixed(2)),
        },
      };
    }
    const nextMax = Math.max(clamped, prev.carat.min);
    return {
      ...prev,
      carat: {
        ...prev.carat,
        max: Number(nextMax.toFixed(2)),
      },
    };
  };

  const handleCaratBlur = (field: "min" | "max") => () => {
    const raw = caratInput[field];
    const numeric = Number(raw);

    if (raw.trim() === "" || Number.isNaN(numeric)) {
      // 恢复为当前有效值
      setCaratInput((prev) => ({
        ...prev,
        [field]: filters.carat[field].toString(),
      }));
      return;
    }

    updateFiltersState((prev) => applyCaratCandidate(prev, field, numeric));
  };

  const adjustCarat = (field: "min" | "max", delta: number) => {
    updateFiltersState((prev) =>
      applyCaratCandidate(prev, field, prev.carat[field] + delta)
    );
  };

  const handleCaratInput =
    (field: "min" | "max") => (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setCaratInput((prev) => ({ ...prev, [field]: value }));

      if (value.trim() === "") {
        return;
      }

      const parsed = Number(value);
      if (Number.isNaN(parsed)) return;

      updateFiltersState((prev) => applyCaratCandidate(prev, field, parsed));
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
      updateSelectedShape(backendOptions.shapes[0].label, {
        notifyParent: true,
        code: backendOptions.shapes[0].code,
      });
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

  // 筛选条件骨架屏
  const filtersSkeletonContent = (
    <div className="space-y-6 sm:space-y-8 animate-pulse">
      {/* 第一行：Color, Clarity, Cut */}
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={`filter-skeleton-row1-${index}`} className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm">
            <div className="h-5 w-16 rounded-full bg-gray-200" />
            <div className="mt-4 h-5 w-full rounded-md bg-gray-100" />
            <div className="mt-4 h-12 w-full rounded-2xl bg-gray-100" />
          </div>
        ))}
      </div>
      {/* 第二行：Carat, Budget, Certificate */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm">
          <div className="h-5 w-14 rounded-full bg-gray-200" />
          <div className="mt-4 h-2 w-full rounded-full bg-gray-100" />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="h-16 rounded-2xl bg-gray-100" />
            <div className="h-16 rounded-2xl bg-gray-100" />
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm">
          <div className="h-5 w-16 rounded-full bg-gray-200" />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="h-16 rounded-2xl bg-gray-100" />
            <div className="h-16 rounded-2xl bg-gray-100" />
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm">
          <div className="h-5 w-20 rounded-full bg-gray-200" />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="h-12 rounded-2xl bg-gray-100" />
            <div className="h-12 rounded-2xl bg-gray-100" />
          </div>
        </div>
      </div>
      {/* Advanced Specs 链接占位 */}
      <div className="text-center">
        <div className="mx-auto h-4 w-40 rounded-full bg-gray-100" />
      </div>
    </div>
  );

  const filtersContent = (
    <div className="space-y-6 sm:space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
          <div className="flex items-center text-sm sm:text-base font-semibold text-gray-900">
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
              <div className="relative z-10 grid grid-cols-7 text-center text-[10px] sm:text-xs font-semibold uppercase tracking-[0.08em] sm:tracking-[0.12em]">
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

        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
          <div className="flex items-center text-sm sm:text-base font-semibold text-gray-900">
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
              <div className="relative z-10 grid grid-cols-7 text-center text-[10px] sm:text-xs font-semibold uppercase tracking-[0.06em] sm:tracking-[0.08em]">
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

        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
          <div className="flex items-center text-sm sm:text-base font-semibold text-gray-900">
            Cut
            <InfoDot />
          </div>
          <div className="mt-3">
            <div className="relative flex h-12 sm:h-10 overflow-hidden rounded-lg border border-gray-200 bg-gray-100 md:mt-4">
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
                    className={`relative z-10 flex h-full flex-1 items-center justify-center px-1 sm:px-2 text-center text-[10px] sm:text-[0.8rem] font-semibold uppercase leading-[1.1] tracking-[0.1em] sm:tracking-[0.18em] whitespace-normal ${
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

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-base sm:text-lg font-semibold text-gray-900">
              Carat
            </span>
          </div>
          <div className="mt-4">
            <Slider
              min={CARAT_MIN}
              max={CARAT_MAX}
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
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-sm text-gray-400">ct</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={CARAT_MIN}
                    max={CARAT_MAX}
                    step={0.01}
                    value={caratInput.min}
                    onChange={handleCaratInput("min")}
                    onBlur={handleCaratBlur("min")}
                    className="w-20 sm:w-28 bg-transparent text-right text-lg font-semibold text-gray-900 focus:outline-none leading-none"
                  />
                </div>
              </div>
              <SpinnerButtons
                onIncrease={() => adjustCarat("min", CARAT_STEP)}
                onDecrease={() => adjustCarat("min", -CARAT_STEP)}
              />
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  Maximum
                </p>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-sm text-gray-400">ct</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={CARAT_MIN}
                    max={CARAT_MAX}
                    step={0.01}
                    value={caratInput.max}
                    onChange={handleCaratInput("max")}
                    onBlur={handleCaratBlur("max")}
                    className="w-20 sm:w-28 bg-transparent text-right text-lg font-semibold text-gray-900 focus:outline-none leading-none"
                  />
                </div>
              </div>
              <SpinnerButtons
                onIncrease={() => adjustCarat("max", CARAT_STEP)}
                onDecrease={() => adjustCarat("max", -CARAT_STEP)}
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
          <div className="text-base sm:text-lg font-semibold text-gray-900">Budget</div>
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
                    className="w-20 sm:w-24 bg-transparent text-right text-lg font-semibold text-gray-900 focus:outline-none pl-0 leading-none"
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
                    className="w-20 sm:w-24 bg-transparent text-right text-lg font-semibold text-gray-900 focus:outline-none pl-0 leading-none"
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

        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
          <div className="text-base sm:text-lg font-semibold text-gray-900">
            Certificate
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:flex sm:flex-row">
            {certificateCodes.map((certificate) => {
              const isActive = filters.certificate.includes(certificate);
              return (
                <button
                  key={certificate}
                  type="button"
                  onClick={() => toggleCertificate(certificate)}
                  className={`flex-1 rounded-2xl border px-4 py-3 text-xs sm:text-sm font-semibold uppercase tracking-wide transition ${
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
  );

  return (
    <section className="step-two-view bg-white">
      <div className="mx-auto max-w-8xl px-4 py-10 sm:py-14">
        <div className="text-center">
          <p className="text-base sm:text-xl text-gray-500 md:text-2xl">
            Use the filters below to design your perfect engagement ring
          </p>
        </div>
        <div className="mt-10">
          <div className="flex flex-nowrap sm:flex-wrap items-center justify-start sm:justify-center gap-3 sm:gap-4 overflow-x-auto pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 text-center snap-x snap-mandatory">
            {/* 骨架屏：加载中显示占位 */}
            {!backendOptions?.shapes?.length && (
              <>
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={`shape-skeleton-${index}`}
                    className="snap-start shrink-0 flex h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-24 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-gray-100 bg-gray-50 animate-pulse"
                  >
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gray-200" />
                    <div className="h-3 w-12 rounded-full bg-gray-200" />
                  </div>
                ))}
              </>
            )}
            {/* 实际形状选择器 */}
            {backendOptions?.shapes?.map((shape) => {
              const isSelected = selectedShape === shape.label;
              const iconSvg = shape.iconSvg;
              return (
                <button
                  key={shape.code}
                  type="button"
                  onClick={() =>
                    updateSelectedShape(shape.label, {
                      notifyParent: true,
                      code: shape.code,
                    })
                  }
                  className={`snap-start shrink-0 flex h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-24 flex-col items-center justify-center gap-1 rounded-2xl border-2 bg-white transition-all ${
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
                  <span className="text-[11px] sm:text-xs font-medium text-gray-600">
                    {shape.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile filter trigger */}
        <div className="mt-6 flex items-center justify-between md:hidden">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-gray-700 shadow-sm"
          >
            Filters
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-medium text-gray-500 hover:text-gray-900"
          >
            Reset
          </button>
        </div>

        {/* Desktop filter block */}
        <div className="hidden md:block">
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm uppercase tracking-[0.2em] text-gray-400">
              <span className="h-px w-10 bg-gray-300" />
              Filters
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-500 hover:text-gray-900"
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
          <div className="mt-8 sm:mt-10">
            {backendOptions ? filtersContent : filtersSkeletonContent}
          </div>
        </div>

        {/* Mobile drawer */}
        {filtersOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-[1px] animate-overlay-fade"
              onClick={() => setFiltersOpen(false)}
            />
            <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white px-4 pb-8 pt-4 shadow-[0_-20px_40px_rgba(15,23,42,0.2)] animate-modal-pop">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-[0.35em] text-gray-400">
                  Filters
                </div>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600"
                >
                  Close
                </button>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">
                  Refine your stone
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-medium text-gray-500 hover:text-gray-900"
                >
                  Reset
                </button>
              </div>
              <div className="mt-4">
                {backendOptions ? filtersContent : filtersSkeletonContent}
              </div>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  className="w-full rounded-full bg-black py-3 text-sm font-semibold text-white"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 border-t border-gray-200 pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-medium text-gray-600">
              <span>
                {(() => {
                  const start = pageInfo.count
                    ? (currentPage - 1) * pageSize + 1
                    : 0;
                  const end = pageInfo.count
                    ? (currentPage - 1) * pageSize + pageInfo.count
                    : 0;
                  const totalLabel =
                    typeof pageInfo.total === "number"
                      ? pageInfo.total
                      : pageInfo.hasNext
                      ? `${end}+`
                      : `${end}`;
                  return `Showing ${start}-${end} of ${totalLabel}`;
                })()}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-full border border-gray-200 p-2 transition hover:border-gray-400 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handlePageChange(p => Math.max(1, p - 1))}
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
                  type="button"
                  className="rounded-full border border-gray-200 p-2 transition hover:border-gray-400 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handlePageChange(p => p + 1)}
                  disabled={
                    typeof pageInfo.total === "number"
                      ? currentPage * pageSize >= pageInfo.total
                      : !pageInfo.hasNext
                  }
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
            <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center md:justify-end">
              <select
                className="w-full max-w-xs rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-gray-400 focus:border-gray-900 focus:outline-none"
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as typeof sortBy)}
              >
                <option value="default">Default</option>
                <option value="price_asc">Price (low-to-high)</option>
                <option value="price_desc">Price (high-to-low)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <DiamondGrid
            stoneType={stoneType}
            selectedShape={selectedShape}
            selectedShapeCode={selectedShapeCode}
            filters={filters}
            currentPage={currentPage}
            pageSize={pageSize}
            sortBy={sortBy}
            onMoreInfo={onMoreInfo}
            onAddPendant={onAddPendant}
            onPaginationChange={handlePaginationChange}
            shapeIconSvgMap={shapeIconSvgMap}
            selectedStoneId={selectedStone?.id}
          />
        </div>
      </div>
    </section>
  );
}
