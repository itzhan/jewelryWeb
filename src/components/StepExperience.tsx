"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useSearchParams,
  useRouter,
  usePathname,
} from "next/navigation";
import CustomizationSteps from "@/components/CustomizationSteps";
import StoneSelectionSection, {
  type RangeSelections,
} from "@/components/StoneSelectionSection";
import ProductContainer from "@/components/ProductContainer";
import StepOneLanding, { StepOneProduct } from "@/components/StepOneLanding";
import StoneMoreInfo from "@/components/StoneMoreInfo";
import AddSettingModal, { SettingChoice } from "@/components/AddSettingModal";
import {
  fetchPendantProducts,
  fetchProductDetailCached,
  fetchStoneDetailCached,
  resolveBackendImageUrl,
  type BackendProductSummary,
  type BackendStoneItem,
  type BackendStoneType,
  type ProductDetailDto,
} from "@/lib/backend";
import type { StoneFilters } from "@/types/stone-filters";

const DEFAULT_STEP_ONE_COLORS: StepOneProduct["colors"] = [
  "white",
  "yellow",
  "rose",
];

const STONE_SHAPE_LABEL_MAP: Record<string, string> = {
  round: "Round",
  emerald: "Emerald",
  heart: "Heart",
  marquise: "Marquise",
  oval: "Oval",
  pear: "Pear",
  princess: "Princess",
  radiant: "Radiant",
  cushion: "Cushion",
  e_cushion: "E. Cushion",
};

const formatStoneShapeLabel = (value: string | null | undefined) => {
  const raw = value?.trim();
  if (!raw) return null;
  const lower = raw.toLowerCase();
  return STONE_SHAPE_LABEL_MAP[lower] ?? raw;
};

const parseStoneType = (
  value: string | null | undefined,
): BackendStoneType | null => {
  const raw = value?.trim().toLowerCase();
  if (!raw) return null;
  if (raw === "natural") return "natural";
  if (raw === "lab_grown" || raw === "lab-grown" || raw === "labgrown") {
    return "lab_grown";
  }
  return null;
};

const parseUrlIntParam = (value: string | null): number | null => {
  if (!value) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const formatProductPrice = (value: number | undefined, currency?: string) => {
  const priceNumber = value ?? 0;
  return `${currency ?? "USD"} ${priceNumber.toLocaleString()}`;
};

const normalizeStepOneColors = (colors?: string[]) => {
  const normalized = (colors ?? [])
    .map((item) => item?.toLowerCase().trim())
    .filter(
      (item): item is StepOneProduct["colors"][number] =>
        typeof item === "string" &&
        item.length > 0 &&
        DEFAULT_STEP_ONE_COLORS.includes(
          item as StepOneProduct["colors"][number]
        ),
    );
  return normalized.length ? normalized : DEFAULT_STEP_ONE_COLORS;
};

const mapBackendProductToStepOneProduct = (
  product: BackendProductSummary,
): StepOneProduct => ({
  id: product.id,
  name: product.name,
  price: formatProductPrice(product.price, product.currency),
  image: resolveBackendImageUrl(product.image),
  colors: normalizeStepOneColors(product.colors),
});

const mapProductDetailToStepOneProduct = (
  detail: ProductDetailDto,
): StepOneProduct => {
  const primaryImage =
    detail.images?.find((item) => item.isPrimary) ?? detail.images?.[0];
  const imageUrl = primaryImage?.url ?? "";
  return {
    id: detail.id,
    name: detail.name,
    price: formatProductPrice(detail.basePrice, detail.currency),
    image: resolveBackendImageUrl(imageUrl),
    colors: normalizeStepOneColors(detail.availableColors),
  };
};

const mapProductDetailImages = (detail: ProductDetailDto): ProductGalleryImage[] => {
  const sorted = detail.images?.length
    ? [...detail.images].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    : [];
  const primary = sorted.find((item) => item.isPrimary) ?? sorted[0];
  const ordered = primary
    ? [primary, ...sorted.filter((item) => item !== primary)]
    : sorted;
  return ordered
    .map((item) => ({
      url: resolveBackendImageUrl(item.url),
      alt: item.alt || detail.name,
      badge: item.badge,
      aspect: item.aspect,
    }))
    .filter((item) => item.url.length > 0);
};

const choiceProductIndex: Record<SettingChoice, number> = {
  necklace: 0,
  ring: 3,
  earring: 6,
};

type ProductGalleryImage = {
  url: string;
  alt: string;
  badge?: string;
  aspect?: "square" | "portrait";
};

type StepNumber = 1 | 2 | 3;
type StepIntent = "select" | "change" | "view" | "card" | undefined;
const BASE_PATH = "/design-studio";

const parseSettingChoice = (
  value: string | null | undefined
): SettingChoice | null => {
  if (!value) return null;
  if (value === "necklace" || value === "ring" || value === "earring") {
    return value;
  }
  return null;
};

const normalizeStepFromRoute = (step: number | null): StepNumber => {
  if (!step || step < 1 || step > 3) return 1;
  return step as StepNumber;
};

// localStorage key
const STONE_FILTERS_STORAGE_KEY = "stone-filters-v1";

// 将筛选条件保存到localStorage
const saveFiltersToStorage = (filters: StoneFilters, currentPage: number, sortBy: string, selectedShape: string) => {
  try {
    const data = {
      filters,
      currentPage,
      sortBy,
      selectedShape,
      timestamp: Date.now(),
    };
    localStorage.setItem(STONE_FILTERS_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("保存筛选条件到localStorage失败", error);
  }
};

// 从localStorage加载筛选条件
const loadFiltersFromStorage = (): {
  filters: StoneFilters;
  currentPage: number;
  sortBy: string;
  selectedShape: string;
} | null => {
  try {
    const stored = localStorage.getItem(STONE_FILTERS_STORAGE_KEY);
    if (!stored) return null;

    const data = JSON.parse(stored);
    // 检查数据是否过期（24小时）
    if (Date.now() - data.timestamp > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(STONE_FILTERS_STORAGE_KEY);
      return null;
    }

    return {
      filters: data.filters,
      currentPage: data.currentPage || 1,
      sortBy: data.sortBy || "default",
      selectedShape: data.selectedShape || "",
    };
  } catch (error) {
    console.error("从localStorage加载筛选条件失败", error);
    return null;
  }
};

export default function StepExperience() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const routeState = useMemo(() => {
    const segments = pathname.split("?")[0].split("/").filter(Boolean);
    let step: StepNumber = 1;
    let detailContext: StepNumber | null = null;
    let stoneId: number | null = null;
    let productId: number | null = null;
    let settingChoice: SettingChoice | null = null;

    if (segments[0] === BASE_PATH.replace("/", "")) {
      const section = segments[1];
      if (!section) {
        step = 1;
      } else if (section === "stone") {
        step = 1;
        const id = parseUrlIntParam(segments[2] ?? null);
        if (id) {
          stoneId = id;
          detailContext = 1;
        }
      } else if (section === "setting") {
        step = 2;
        settingChoice = parseSettingChoice(segments[2] ?? null);
        const id = parseUrlIntParam(segments[3] ?? null);
        if (id) {
          productId = id;
          detailContext = 2;
        }
      } else if (section === "summary") {
        step = 3;
        settingChoice = parseSettingChoice(segments[2] ?? null);
      }
    }

    const stoneFromQuery =
      parseUrlIntParam(searchParams.get("stone")) ??
      parseUrlIntParam(searchParams.get("stoneId"));
    const stoneShapeFromQuery =
      searchParams.get("stoneShape") ?? searchParams.get("centerStoneShape");
    const stoneTypeFromQuery = parseStoneType(
      searchParams.get("stoneType") ?? searchParams.get("centerStoneType"),
    );
    const productFromQuery =
      parseUrlIntParam(searchParams.get("product")) ??
      parseUrlIntParam(searchParams.get("productId"));
    const settingFromQuery = parseSettingChoice(searchParams.get("setting"));

    return {
      step: normalizeStepFromRoute(step),
      detailContext,
      stoneId: stoneId ?? stoneFromQuery,
      stoneShape: stoneShapeFromQuery,
      stoneType: stoneTypeFromQuery,
      productId: productId ?? productFromQuery,
      settingChoice: settingChoice ?? settingFromQuery,
    };
  }, [pathname, searchParams]);

  const stoneIdFromUrl = routeState.stoneId;
  const stoneShapeFromUrl = routeState.stoneShape;
  const stoneTypeFromUrl = routeState.stoneType;
  const productIdFromUrl = routeState.productId;
  const settingChoiceFromUrl = routeState.settingChoice;

  const [activeStep, setActiveStep] = useState<StepNumber>(() =>
    routeState.step
  );
  const [detailContext, setDetailContext] = useState<StepNumber | null>(null);
  const [products, setProducts] = useState<StepOneProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<StepOneProduct | null>(
    null
  );
  const [selectedStone, setSelectedStone] = useState<BackendStoneItem | null>(
    null
  );
  const [stoneLoading, setStoneLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const [detailStoneFallback, setDetailStoneFallback] = useState<BackendStoneItem | null>(null);
  const [detailProductFallback, setDetailProductFallback] = useState<StepOneProduct | null>(null);
  const [detailProductImages, setDetailProductImages] = useState<ProductGalleryImage[] | null>(null);
  const [hasSelectedProduct, setHasSelectedProduct] = useState(false);
  const [settingChoice, setSettingChoice] = useState<SettingChoice | null>(
    null
  );
  const [settingIconSvg, setSettingIconSvg] = useState<string | null>(null);
  const [isTypeSelectionOpen, setIsTypeSelectionOpen] = useState(false);
  const [stepOneEntry, setStepOneEntry] = useState<"grid" | "detail">("grid");
  const [shouldShowProductDetailOnReturn, setShouldShowProductDetailOnReturn] =
    useState(false);
  const [isProductConfirmed, setIsProductConfirmed] = useState(false);
  const [persistedStoneFilters, setPersistedStoneFilters] = useState<
    StoneFilters | undefined
  >(undefined);
  const [persistedRangeSelections, setPersistedRangeSelections] = useState<
    RangeSelections | undefined
  >(undefined);
  const [persistedSelectedShape, setPersistedSelectedShape] = useState<
    string | undefined
  >(undefined);
  const [currentPageFromUrl, setCurrentPageFromUrl] = useState<number>(1);
  const [sortByFromUrl, setSortByFromUrl] = useState<"default" | "price_asc" | "price_desc">("default");
  const [forceDetailHidden, setForceDetailHidden] = useState(false);

  // 更新 URL 参数的辅助函数
  const buildPath = (segments: Array<string | number | null | undefined>) => {
    const normalized = segments
      .filter((segment) => segment !== null && segment !== undefined)
      .map((segment) =>
        String(segment).trim().replace(/^\/+|\/+$/g, "")
      )
      .filter((segment) => segment.length > 0);
    return `/${normalized.join("/")}`;
  };

  const buildQuery = (params: Record<string, string | number | null | undefined>) => {
    const newParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") return;
      newParams.set(key, String(value));
    });
    const query = newParams.toString();
    return query ? `?${query}` : "";
  };

  const navigateTo = (
    segments: Array<string | number | null | undefined>,
    params: Record<string, string | number | null | undefined> = {}
  ) => {
    const path = buildPath(segments);
    const query = buildQuery(params);
    router.push(`${path}${query}`, { scroll: false });
  };

  // 根据路由变化更新步骤
  useEffect(() => {
    if (routeState.step !== activeStep) {
      setActiveStep(routeState.step);
    }
  }, [routeState.step, activeStep]);

  // 从 localStorage 恢复石头筛选条件
  useEffect(() => {
    // 只有在步骤1时才恢复石头筛选条件
    if (activeStep !== 1) return;

    // 优先从localStorage加载，如果不存在则使用默认值
    const stored = loadFiltersFromStorage();
    const defaultFilters: StoneFilters = {
      clarity: ["SI1", "VS2", "VS1", "VVS2", "VVS1", "IF", "FL"],
      color: ["J", "I", "H", "G", "F", "E", "D"],
      cut: ["good", "veryGood", "excellent"],
      carat: { min: 0.5, max: 20 },
      budget: { min: 250, max: 5000 },
      certificate: [],
    };

    try {
      if (stored) {
        setPersistedStoneFilters(stored.filters);
        setCurrentPageFromUrl(stored.currentPage);
        setSortByFromUrl(stored.sortBy as "default" | "price_asc" | "price_desc");
        setPersistedSelectedShape(stored.selectedShape);
      } else {
        setPersistedStoneFilters(defaultFilters);
        setCurrentPageFromUrl(1);
        setSortByFromUrl("default");
        setPersistedSelectedShape("");
      }
    } catch (error) {
      console.error("恢复筛选条件失败", error);
      setPersistedStoneFilters(defaultFilters);
      setCurrentPageFromUrl(1);
      setSortByFromUrl("default");
      setPersistedSelectedShape("");
    }
  }, [activeStep]);

  // 从 URL 恢复设置类型
  useEffect(() => {
    if (settingChoiceFromUrl) {
      if (settingChoice !== settingChoiceFromUrl) {
        setSettingChoice(settingChoiceFromUrl);
      }
      if (activeStep === 3 && !isProductConfirmed && selectedProduct) {
        setIsProductConfirmed(true);
      }
    }
  }, [
    settingChoiceFromUrl,
    settingChoice,
    activeStep,
    isProductConfirmed,
    selectedProduct,
  ]);

  // 从 URL 恢复详情页面状态
  useEffect(() => {
    if (routeState.detailContext) {
      setDetailContext(routeState.detailContext);
      return;
    }
    setDetailContext(null);
  }, [routeState.detailContext]);

  useEffect(() => {
    if (detailContext && detailContext !== activeStep) {
      setDetailContext(null);
    }
  }, [activeStep, detailContext]);

  useEffect(() => {
    if (!routeState.detailContext) {
      setForceDetailHidden(false);
    }
  }, [routeState.detailContext]);

  const shouldLoadProducts =
    routeState.step >= 2 ||
    routeState.detailContext === 2 ||
    detailContext === 2;
  // 产品列表只加载一次，按需加载（兼容 Strict Mode 双执行）
  const productsRequestRef = useRef({ fetching: false, fetched: false });
  useEffect(() => {
    if (!shouldLoadProducts) return;
    if (productsRequestRef.current.fetched || productsRequestRef.current.fetching) return;
    productsRequestRef.current.fetching = true;

    let cancelled = false;
    const clearFetching = () => {
      if (productsRequestRef.current.fetching) {
        productsRequestRef.current.fetching = false;
      }
    };

    const loadProducts = async () => {
      try {
        const backendProducts = await fetchPendantProducts();
        if (cancelled) return;
        const mapped: StepOneProduct[] = backendProducts.map((p) =>
          mapBackendProductToStepOneProduct(p),
        );
        setProducts(mapped);
        productsRequestRef.current.fetched = true;
      } catch (e) {
        console.error("加载产品列表失败", e);
      } finally {
        clearFetching();
      }
    };

    loadProducts();
    return () => {
      cancelled = true;
      clearFetching();
    };
  }, [shouldLoadProducts]);

  // 石头加载：只在需要从 URL 恢复石头数据时加载（如刷新页面）
  // 使用 ref 跟踪已请求的石头 ID，防止重复请求
  const stoneRequestRef = useRef<{ fetching: number | null; fetched: number | null }>({ fetching: null, fetched: null });
  // 产品详情加载：用于详情页避免重复请求
  const productDetailRequestRef = useRef<{ fetching: number | null; fetched: number | null }>({ fetching: null, fetched: null });

  useEffect(() => {
    // 没有 URL 中的石头 ID，不需要加载
    if (stoneIdFromUrl == null) {
      return;
    }

    // 已经请求过或正在请求这个石头，跳过
    if (stoneRequestRef.current.fetched === stoneIdFromUrl || stoneRequestRef.current.fetching === stoneIdFromUrl) {
      return;
    }

    const requestId = stoneIdFromUrl;
    stoneRequestRef.current.fetching = requestId;
    let cancelled = false;
    const finalizeLoading = () => {
      if (stoneRequestRef.current.fetching === requestId) {
        stoneRequestRef.current.fetching = null;
        setStoneLoading(false);
      }
    };

    (async () => {
      setStoneLoading(true);
      try {
        const detail = await fetchStoneDetailCached(stoneIdFromUrl);
        if (cancelled) return;
        // 若期间用户点击了其他石头（触发了新的请求），忽略当前过期响应，避免详情被旧请求覆盖
        if (stoneRequestRef.current.fetching !== requestId) {
          return;
        }
        stoneRequestRef.current.fetched = stoneIdFromUrl;
        setSelectedStone(detail);
        setDetailStoneFallback(detail);
        // 如果 URL 包含石头详情页路径，设置详情页上下文
        if (routeState.detailContext === 1) {
          setDetailContext(1);
          setStepOneEntry("detail");
        }
      } catch (error) {
        console.error("无法从 URL 还原石头信息", error);
      } finally {
        finalizeLoading();
      }
    })();

    return () => {
      cancelled = true;
      finalizeLoading();
    };
  }, [stoneIdFromUrl, routeState.detailContext]);

  useEffect(() => {
    if (productIdFromUrl == null) {
      return;
    }
    if (selectedProduct?.id === productIdFromUrl) {
      return;
    }
    if (productDetailRequestRef.current.fetching === productIdFromUrl) {
      if (routeState.detailContext === 2) {
        setProductLoading(true);
      }
      return;
    }
    if (productDetailRequestRef.current.fetched === productIdFromUrl) {
      if (detailProductFallback?.id === productIdFromUrl) {
        setSelectedProduct(detailProductFallback);
        setHasSelectedProduct(true);
      }
      return;
    }
    const persisted = products.find((item) => item.id === productIdFromUrl);
    if (persisted) {
      setSelectedProduct(persisted);
      setHasSelectedProduct(true);
      return;
    }

    let cancelled = false;
    const requestId = productIdFromUrl;
    const shouldShowLoading = routeState.detailContext === 2;
    productDetailRequestRef.current.fetching = requestId;
    if (shouldShowLoading) {
      setProductLoading(true);
    }
    (async () => {
      try {
        const detail = await fetchProductDetailCached(productIdFromUrl);
        if (cancelled) return;
        const mapped = mapProductDetailToStepOneProduct(detail);
        setDetailProductFallback(mapped);
        setDetailProductImages(mapProductDetailImages(detail));
        productDetailRequestRef.current.fetched = productIdFromUrl;
        setProducts((prev) =>
          prev.some((item) => item.id === mapped.id) ? prev : [...prev, mapped],
        );
        setSelectedProduct(mapped);
        setHasSelectedProduct(true);
      } catch (error) {
        console.error("无法从 URL 还原商品信息", error);
      } finally {
        if (productDetailRequestRef.current.fetching === requestId) {
          productDetailRequestRef.current.fetching = null;
          if (shouldShowLoading) {
            setProductLoading(false);
          }
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    productIdFromUrl,
    products,
    selectedProduct?.id,
    detailProductFallback,
    routeState.detailContext,
  ]);

  const navigateStep = (
    step: StepNumber,
    options: {
      stoneId?: number | null;
      stoneShape?: string | null;
      stoneType?: BackendStoneType | null;
      productId?: number | null;
      settingChoice?: SettingChoice | null;
      detail?: StepNumber | null;
    } = {}
  ) => {
    setActiveStep(step);
    const stoneId = options.stoneId ?? stoneIdFromUrl ?? selectedStone?.id ?? null;
    const productId =
      options.productId ?? productIdFromUrl ?? selectedProduct?.id ?? null;
    const effectiveSetting =
      options.settingChoice ?? settingChoice ?? settingChoiceFromUrl ?? null;

    if (step === 1) {
      if (options.detail === 1 && stoneId) {
        navigateTo([BASE_PATH, "stone", stoneId], {});
        return;
      }
      navigateTo([BASE_PATH], {});
      return;
    }

    if (step === 2) {
      const segments: Array<string | number | null> = [
        BASE_PATH,
        "setting",
        effectiveSetting,
      ];
      const canShowDetail =
        options.detail === 2 && productId && Boolean(effectiveSetting);
      if (canShowDetail) {
        segments.push(productId);
      }
      // 进入步骤二时把已选 stone 写入 URL，避免刷新或进入第三步时丢失 selectedStone
      navigateTo(segments, {
        stone: stoneId ?? null,
        stoneShape:
          options.stoneShape ??
          stoneShapeFromUrl ??
          formatStoneShapeLabel(selectedStone?.shape) ??
          null,
        stoneType: options.stoneType ?? stoneTypeFromUrl ?? selectedStone?.type ?? null,
      });
      return;
    }

    if (step === 3) {
      navigateTo([BASE_PATH, "summary", effectiveSetting], {
        stone: stoneId ?? null,
        product: productId ?? null,
      });
    }
  };

  const handleStoneMoreInfo = (stone: BackendStoneItem) => {
    const resolvedStoneId = Number((stone as unknown as { id?: unknown }).id);
    if (!Number.isFinite(resolvedStoneId)) {
      console.error("石头详情缺少有效 id，无法请求详情", stone);
      return;
    }
    // 同时设置 selectedStone 和 detailStoneFallback，确保数据立即可用
    setSelectedStone({ ...stone, id: resolvedStoneId });
    setDetailStoneFallback({ ...stone, id: resolvedStoneId });
    setDetailProductImages(null);
    setForceDetailHidden(false);
    setDetailContext(1);
    setStepOneEntry("detail");
    window.scrollTo({ top: 0, behavior: "auto" });

    if (
      stoneRequestRef.current.fetching === resolvedStoneId ||
      stoneRequestRef.current.fetched === resolvedStoneId
    ) {
      return;
    }

    const requestId = resolvedStoneId;
    stoneRequestRef.current.fetching = requestId;
    setStoneLoading(true);
    (async () => {
      try {
        const detail = await fetchStoneDetailCached(requestId);
        // 若期间用户又点了别的石头，忽略当前过期响应，避免“点哪个都变成同一个”的错觉
        if (stoneRequestRef.current.fetching !== requestId) {
          return;
        }
        stoneRequestRef.current.fetched = requestId;
        setSelectedStone(detail);
        setDetailStoneFallback(detail);
      } catch (error) {
        console.error("加载石头详情失败", error);
      } finally {
        if (stoneRequestRef.current.fetching === requestId) {
          stoneRequestRef.current.fetching = null;
          setStoneLoading(false);
        }
      }
    })();
  };

  const handlePendantMoreInfo = (product: StepOneProduct) => {
    setSelectedProduct(product);
    setDetailProductFallback(product);
    setDetailProductImages(null);
    setHasSelectedProduct(true);
    setForceDetailHidden(false);
    setIsProductConfirmed(false);
    setShouldShowProductDetailOnReturn(false);
    setDetailContext(2);
    window.scrollTo({ top: 0, behavior: "auto" });

    if (
      productDetailRequestRef.current.fetching === product.id ||
      productDetailRequestRef.current.fetched === product.id
    ) {
      return;
    }

    const requestId = product.id;
    productDetailRequestRef.current.fetching = requestId;
    setProductLoading(true);
    (async () => {
      try {
        const detail = await fetchProductDetailCached(product.id);
        productDetailRequestRef.current.fetched = product.id;
        const mapped = mapProductDetailToStepOneProduct(detail);
        setDetailProductFallback(mapped);
        setDetailProductImages(mapProductDetailImages(detail));
      } catch (error) {
        console.error("加载商品详情失败", error);
      } finally {
        if (productDetailRequestRef.current.fetching === requestId) {
          productDetailRequestRef.current.fetching = null;
          setProductLoading(false);
        }
      }
    })();
  };

  // 步骤一列表中「Add pendant」触发：记录当前石头并打开类型选择弹窗
  const handleStoneAddPendantFromGrid = (stone: BackendStoneItem) => {
    setSelectedStone(stone);
    setStepOneEntry("grid");
    navigateStep(1, { stoneId: stone.id });
    setIsTypeSelectionOpen(true);
  };

  // 从石头详情页中点击「Add Setting」：此时 selectedStone 已经在 state 中
  const handleStoneAddPendant = () => {
    setStepOneEntry("detail");
    setIsTypeSelectionOpen(true);
  };

  const handleCompleteRing = (product: StepOneProduct) => {
    setSelectedProduct(product);
    setDetailContext(null);
    setSettingChoice("ring");
    setHasSelectedProduct(true);
    setIsProductConfirmed(true);
    setShouldShowProductDetailOnReturn(true);
    navigateStep(3, {
      productId: product.id,
      stoneId: selectedStone?.id ?? null,
      settingChoice: "ring",
    });
  };

  const handleTypeSelected = (choice: SettingChoice, iconSvg?: string | null) => {
    setIsTypeSelectionOpen(false);
    const cameFromDetail = (detailContext ?? routeState.detailContext) === 1;
    setDetailContext(null);
    setIsProductConfirmed(false);
    setShouldShowProductDetailOnReturn(false);
    setStepOneEntry(cameFromDetail ? "detail" : "grid");
    setSettingChoice(choice);
    setSettingIconSvg(iconSvg ?? null);
    setHasSelectedProduct(false);
    const preferredProduct =
      products[choiceProductIndex[choice]] ?? products[0] ?? null;
    setSelectedProduct(preferredProduct);
    navigateStep(2, {
      stoneId: selectedStone?.id ?? null,
      stoneShape: formatStoneShapeLabel(selectedStone?.shape),
      stoneType: selectedStone?.type ?? null,
      settingChoice: choice,
    });
    // 滚动到页面顶部
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 若用户以旧链接进入步骤二（只有 stoneId 没有 stoneShape/stoneType），在石头数据恢复后补齐 URL，保证渲染所需信息齐全
  useEffect(() => {
    if (routeState.step !== 2) return;
    if (!stoneIdFromUrl || !settingChoiceFromUrl) return;
    if (stoneShapeFromUrl && stoneTypeFromUrl) return;
    if (!selectedStone || selectedStone.id !== stoneIdFromUrl) return;

    const nextShape = stoneShapeFromUrl ?? formatStoneShapeLabel(selectedStone.shape);
    const nextType = stoneTypeFromUrl ?? selectedStone.type ?? null;
    if (!nextShape && !nextType) return;

    navigateStep(2, {
      stoneId: stoneIdFromUrl,
      stoneShape: nextShape,
      stoneType: nextType,
      productId: productIdFromUrl ?? null,
      settingChoice: settingChoiceFromUrl,
      detail: routeState.detailContext === 2 ? 2 : null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    routeState.step,
    routeState.detailContext,
    stoneIdFromUrl,
    stoneShapeFromUrl,
    stoneTypeFromUrl,
    settingChoiceFromUrl,
    productIdFromUrl,
    selectedStone,
  ]);

  const handleTypeSelectionClose = () => {
    setIsTypeSelectionOpen(false);
  };

  const handleGoToStepThree = () => {
    if (!selectedProduct || !settingChoice) return;
    setDetailContext(null);
    setHasSelectedProduct(true);
    setIsProductConfirmed(true);
    setShouldShowProductDetailOnReturn(true);
    navigateStep(3, {
      productId: selectedProduct?.id ?? null,
      stoneId: selectedStone?.id ?? null,
      settingChoice: settingChoice,
    });
  };

  const handleDetailBack = () => {
    setForceDetailHidden(true);
    setDetailContext((prev) => {
      if (prev === 2) {
        setIsProductConfirmed(false);
        setShouldShowProductDetailOnReturn(false);
      }
      return null;
    });
  };

  const handleShapePersist = (shape: string) => {
    setPersistedSelectedShape(shape);
    // 保存到 localStorage
    if (activeStep === 1 && persistedStoneFilters) {
      saveFiltersToStorage(persistedStoneFilters, currentPageFromUrl, sortByFromUrl, shape);
    }
  };

  const handleFiltersPersist = (next: StoneFilters) => {
    setPersistedStoneFilters(next);
    // 保存到 localStorage
    if (activeStep === 1) {
      saveFiltersToStorage(next, currentPageFromUrl, sortByFromUrl, persistedSelectedShape || "");
    }
  };

  const handleRangePersist = (next: RangeSelections) => {
    setPersistedRangeSelections(next);
  };

  const handlePagePersist = (page: number) => {
    setCurrentPageFromUrl(page);
    // 保存到 localStorage
    if (activeStep === 1 && persistedStoneFilters) {
      saveFiltersToStorage(persistedStoneFilters, page, sortByFromUrl, persistedSelectedShape || "");
    }
  };

  const handleSortPersist = (sort: "default" | "price_asc" | "price_desc") => {
    setSortByFromUrl(sort);
    // 保存到 localStorage
    if (activeStep === 1 && persistedStoneFilters) {
      saveFiltersToStorage(persistedStoneFilters, currentPageFromUrl, sort, persistedSelectedShape || "");
    }
  };

  const resolvedDetailContext = forceDetailHidden
    ? null
    : detailContext ?? routeState.detailContext ?? null;
  const stepForRender = routeState.step;
  const isDetailVisible = resolvedDetailContext === 1 || resolvedDetailContext === 2;
  // 使用稳定的 key，只根据步骤变化，避免详情页切换时组件重新挂载导致闪屏
  const viewKey = `step-${stepForRender}`;
  // 优先使用 detailStoneFallback（点击时同步设置），确保数据立即可用
  const detailStone = detailStoneFallback ?? selectedStone ?? null;
  const detailLoading =
    resolvedDetailContext === 1
      ? stoneLoading
      : resolvedDetailContext === 2
      ? productLoading
      : false;
  const detailProductImagesForView =
    resolvedDetailContext === 2 ? detailProductImages ?? undefined : undefined;

  // 包装 setActiveStep，同时更新 URL（用于仅切换步骤场景）
  const changeStep = (step: StepNumber, intent?: StepIntent) => {
    if (step === activeStep) return;

    // card intent等同于change intent，都不应该显示详情页
    const isChangeIntent = intent === "change" || intent === "card";

    if (step === 1) {
      const shouldShowStoneDetail =
        stepOneEntry === "detail" && !!selectedStone && !isChangeIntent;
      const needResetStepTwo =
        activeStep === 3 || shouldShowProductDetailOnReturn || isChangeIntent;

      if (needResetStepTwo) {
        setSelectedProduct(null);
        setSettingChoice(null);
        setSettingIconSvg(null);
        setIsProductConfirmed(false);
        setShouldShowProductDetailOnReturn(false);
        setHasSelectedProduct(false);
      }
      setDetailContext(shouldShowStoneDetail ? 1 : null);
      if (isChangeIntent) {
        setStepOneEntry("grid");
      }
      navigateStep(1, {
        stoneId: selectedStone?.id ?? null,
      });
      return;
    }

    if (step === 2) {
      if (!selectedStone || !settingChoice) {
        return;
      }
      const showProductDetail =
        intent === "view" &&
        shouldShowProductDetailOnReturn &&
        !!selectedProduct;
      const showStoneDetail =
        intent === "view" &&
        !showProductDetail &&
        stepOneEntry === "detail" &&
        !!selectedStone;
        setDetailContext(showProductDetail ? 2 : showStoneDetail ? 1 : null);
      if (intent === "view") {
        setShouldShowProductDetailOnReturn(false);
      }
      navigateStep(2, {
        stoneId: selectedStone?.id ?? null,
        productId: selectedProduct?.id ?? null,
        settingChoice: settingChoice,
        detail: showProductDetail ? 2 : null,
      });
      return;
    }

    if (step === 3) {
      // 如果有URL参数（从URL直接访问或刷新），允许进入第三步
      const hasUrlParams = stoneIdFromUrl || productIdFromUrl || settingChoiceFromUrl;
      if (!isProductConfirmed && !hasUrlParams && !selectedProduct) {
        return;
      }
      setDetailContext(null);
      navigateStep(3, {
        productId: selectedProduct?.id ?? productIdFromUrl ?? null,
        stoneId: selectedStone?.id ?? stoneIdFromUrl ?? null,
        settingChoice: settingChoice ?? settingChoiceFromUrl,
      });
    }
  };

  let content: JSX.Element | null = null;
  if (isDetailVisible) {
    content = (
      <StoneMoreInfo
        product={selectedProduct ?? detailProductFallback}
        stone={detailStone}
        onBack={handleDetailBack}
        detailSource={
          resolvedDetailContext === 1 || resolvedDetailContext === 2
            ? resolvedDetailContext
            : undefined
        }
        onAddSetting={
          resolvedDetailContext === 1 ? handleStoneAddPendant : handleGoToStepThree
        }
        centerStoneShape={
          stoneShapeFromUrl ?? formatStoneShapeLabel(detailStone?.shape) ?? null
        }
        centerStoneType={stoneTypeFromUrl ?? detailStone?.type ?? null}
        isLoading={detailLoading}
        productImages={detailProductImagesForView}
      />
    );
  } else if (stepForRender === 1) {
    content = (
      <div className="py-4">
        <StoneSelectionSection
          selectedProduct={selectedProduct}
          selectedStone={selectedStone}
          selectedShapeValue={persistedSelectedShape}
          onSelectedShapeChange={handleShapePersist}
          filtersValue={persistedStoneFilters}
          onFiltersChange={handleFiltersPersist}
          rangeSelectionsValue={persistedRangeSelections}
          onRangeSelectionsChange={handleRangePersist}
          currentPageValue={currentPageFromUrl}
          onCurrentPageChange={handlePagePersist}
          sortByValue={sortByFromUrl}
          onSortByChange={handleSortPersist}
          onMoreInfo={handleStoneMoreInfo}
          onAddPendant={handleStoneAddPendantFromGrid}
        />
      </div>
    );
  } else if (stepForRender === 2) {
    content = (
      <div>
        <StepOneLanding
          products={products}
          onMoreInfo={handlePendantMoreInfo}
          onCompleteRing={handleCompleteRing}
        />
      </div>
    );
  } else if (stepForRender === 3) {
    // 如果从 URL 恢复了 settingChoice但当前状态中没有，则应用它
    const effectiveSettingChoice = settingChoice ?? settingChoiceFromUrl;

    // 支持从 URL 或 state 恢复石头信息
    const effectiveStoneId = selectedStone?.id ?? stoneIdFromUrl ?? undefined;
    // 第三步不应因为 selectedStone 未恢复而永久卡住：
    // - 恢复石头是异步的，且 ProductContainer 自己也会根据 stoneId 拉取详情
    // - 仅在“确实正在加载且还没恢复到 state”时显示 loading
    const isLoadingStone = Boolean(stoneIdFromUrl && !selectedStone && stoneLoading);
    const effectiveProductId = selectedProduct?.id ?? productIdFromUrl ?? 2;

    content = (
      <div className="py-4">
        {isLoadingStone ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading your stone...</p>
            </div>
          </div>
        ) : (
          <ProductContainer
            productId={effectiveProductId}
            stoneId={effectiveStoneId}
            settingType={effectiveSettingChoice}
            settingIconSvg={settingIconSvg}
            stoneIconSvg={selectedStone?.shapeIconSvg}
          />
        )}
      </div>
    );
  }

  return (
    <section className="bg-white">
      <AddSettingModal
        open={isTypeSelectionOpen}
        onClose={handleTypeSelectionClose}
        onSelect={handleTypeSelected}
      />
      <div className="max-w-8xl mx-auto px-4 py-8">
        <CustomizationSteps
          activeStep={stepForRender}
          onStepChange={changeStep}
          selectedStone={selectedStone}
          selectedProduct={selectedProduct}
          settingChoice={settingChoice}
          hasSelectedProduct={hasSelectedProduct}
        />
      </div>

      {content && (
        <div key={viewKey} className="view-transition-wrapper">
          {content}
        </div>
      )}
    </section>
  );
}
