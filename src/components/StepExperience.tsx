"use client";

import { useEffect, useMemo, useState } from "react";
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
  fetchProductDetail,
  fetchStoneDetail,
  resolveBackendImageUrl,
  type BackendProductSummary,
  type BackendStoneItem,
  type ProductDetailDto,
} from "@/lib/backend";
import type { StoneFilters } from "@/types/stone-filters";

const DEFAULT_STEP_ONE_COLORS: StepOneProduct["colors"] = [
  "white",
  "yellow",
  "rose",
];
const PRODUCTS_PAGE_SIZE = 12;

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

const choiceProductIndex: Record<SettingChoice, number> = {
  necklace: 0,
  ring: 3,
  earring: 6,
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
      if (section === "stone") {
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
    const productFromQuery =
      parseUrlIntParam(searchParams.get("product")) ??
      parseUrlIntParam(searchParams.get("productId"));
    const settingFromQuery = parseSettingChoice(searchParams.get("setting"));

    return {
      step: normalizeStepFromRoute(step),
      detailContext,
      stoneId: stoneId ?? stoneFromQuery,
      productId: productId ?? productFromQuery,
      settingChoice: settingChoice ?? settingFromQuery,
    };
  }, [pathname, searchParams]);

  const stoneIdFromUrl = routeState.stoneId;
  const productIdFromUrl = routeState.productId;
  const settingChoiceFromUrl = routeState.settingChoice;

  const [activeStep, setActiveStep] = useState<StepNumber>(() =>
    routeState.step
  );
  const [detailContext, setDetailContext] = useState<StepNumber | null>(null);
  const [products, setProducts] = useState<StepOneProduct[]>([]);
  const [productTotal, setProductTotal] = useState<number | undefined>(undefined);
  const [productPage, setProductPage] = useState<number>(1);
  const [productLoading, setProductLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<StepOneProduct | null>(
    null
  );
  const [selectedStone, setSelectedStone] = useState<BackendStoneItem | null>(
    null
  );
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
    let cancelled = false;
    const loadProducts = async () => {
      setProductLoading(true);
      try {
        const response = await fetchPendantProducts({
          page: productPage,
          pageSize: PRODUCTS_PAGE_SIZE,
        });
        if (cancelled) return;
        const mapped: StepOneProduct[] = response.data.map((p) =>
          mapBackendProductToStepOneProduct(p),
        );
        const total = response.meta?.pagination?.total;
        setProducts(mapped);
        setProductTotal(typeof total === "number" ? total : undefined);
        const preferredProduct =
          productIdFromUrl != null
            ? mapped.find((item) => item.id === productIdFromUrl)
            : null;
        setSelectedProduct((prev) => prev ?? preferredProduct ?? mapped[0] ?? null);
      } catch (e) {
        // 失败时先不打断流程，保持空列表
        console.error("加载产品列表失败", e);
        if (!cancelled) {
          setProducts([]);
          setProductTotal(0);
        }
      } finally {
        if (!cancelled) {
          setProductLoading(false);
        }
      }
    };

    loadProducts();
    return () => {
      cancelled = true;
    };
  }, [productIdFromUrl, productPage]);

  useEffect(() => {
    if (typeof productTotal !== "number") return;
    const maxPage = Math.max(1, Math.ceil(productTotal / PRODUCTS_PAGE_SIZE));
    if (productPage > maxPage) {
      setProductPage(maxPage);
    }
  }, [productTotal, productPage]);

  useEffect(() => {
    if (stoneIdFromUrl == null) {
      return;
    }
    if (selectedStone?.id === stoneIdFromUrl) {
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const detail = await fetchStoneDetail(stoneIdFromUrl);
        if (cancelled) return;
        setSelectedStone(detail);
        if (activeStep === 1) {
          setDetailContext((prev) => (prev ?? 1));
          setStepOneEntry((prev) => (prev === "detail" ? prev : "detail"));
        }
      } catch (error) {
        console.error("无法从 URL 还原石头信息", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [stoneIdFromUrl, selectedStone?.id, activeStep]);

  useEffect(() => {
    if (productIdFromUrl == null) {
      return;
    }
    if (selectedProduct?.id === productIdFromUrl) {
      return;
    }
    const persisted = products.find((item) => item.id === productIdFromUrl);
    if (persisted) {
      setSelectedProduct(persisted);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const detail = await fetchProductDetail(productIdFromUrl);
        if (cancelled) return;
        const mapped = mapProductDetailToStepOneProduct(detail);
        setSelectedProduct(mapped);
      } catch (error) {
        console.error("无法从 URL 还原商品信息", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [productIdFromUrl, products, selectedProduct?.id]);

  const navigateStep = (
    step: StepNumber,
    options: {
      stoneId?: number | null;
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
      navigateTo([BASE_PATH, "stone"], {
        stone: stoneId ?? null,
      });
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
      navigateTo(segments, {
        stone: stoneId ?? null,
        product: canShowDetail ? null : productId ?? null,
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
    setSelectedStone(stone);
    setSelectedProduct((prev) => prev ?? products[0] ?? null);
    setDetailContext(1);
    setStepOneEntry("detail");
    navigateStep(1, { stoneId: stone.id, detail: 1 });
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const handlePendantMoreInfo = (product: StepOneProduct) => {
    setSelectedProduct(product);
    setIsProductConfirmed(false);
    setShouldShowProductDetailOnReturn(false);
    setDetailContext(2);
    navigateStep(2, {
      productId: product.id,
      stoneId: selectedStone?.id ?? stoneIdFromUrl ?? null,
      settingChoice: settingChoice ?? settingChoiceFromUrl ?? null,
      detail: 2,
    });
    window.scrollTo({ top: 0, behavior: "auto" });
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
    const cameFromDetail = detailContext === 1;
    setDetailContext(null);
    setIsProductConfirmed(false);
    setShouldShowProductDetailOnReturn(false);
    setStepOneEntry(cameFromDetail ? "detail" : "grid");
    setSettingChoice(choice);
    setSettingIconSvg(iconSvg ?? null);
    const preferredProduct =
      products[choiceProductIndex[choice]] ?? products[0] ?? null;
    setSelectedProduct(preferredProduct);
    navigateStep(2, {
      stoneId: selectedStone?.id ?? null,
      settingChoice: choice,
    });
    // 滚动到页面顶部
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTypeSelectionClose = () => {
    setIsTypeSelectionOpen(false);
  };

  const handleGoToStepThree = () => {
    if (!selectedProduct || !settingChoice) return;
    setDetailContext(null);
    setIsProductConfirmed(true);
    setShouldShowProductDetailOnReturn(true);
    navigateStep(3, {
      productId: selectedProduct?.id ?? null,
      stoneId: selectedStone?.id ?? null,
      settingChoice: settingChoice,
    });
  };

  const handleDetailBack = () => {
    setDetailContext((prev) => {
      if (prev === 2) {
        setIsProductConfirmed(false);
        setShouldShowProductDetailOnReturn(false);
      }
      return null;
    });
    if (detailContext === 1) {
      navigateStep(1, { stoneId: selectedStone?.id ?? stoneIdFromUrl ?? null });
      return;
    }
    if (detailContext === 2) {
      navigateStep(2, {
        stoneId: selectedStone?.id ?? stoneIdFromUrl ?? null,
        settingChoice: settingChoice ?? settingChoiceFromUrl ?? null,
        productId: selectedProduct?.id ?? productIdFromUrl ?? null,
      });
    }
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

  const isDetailVisible =
    (detailContext === 1 && !!selectedStone) ||
    (detailContext === 2 && !!selectedProduct);
  const viewKey = isDetailVisible
    ? detailContext === 1
      ? "detail-stone"
      : "detail-product"
    : `step-${activeStep}`;

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
        product={selectedProduct}
        stone={detailContext === 1 ? selectedStone : null}
        onBack={handleDetailBack}
        detailSource={
          detailContext === 1 || detailContext === 2 ? detailContext : undefined
        }
        onAddSetting={
          detailContext === 1 ? handleStoneAddPendant : handleGoToStepThree
        }
        centerStoneShape={selectedStone?.shape ?? null}
      />
    );
  } else if (activeStep === 1) {
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
  } else if (activeStep === 2) {
    content = (
      <div>
        <StepOneLanding
          products={products}
          total={productTotal}
          currentPage={productPage}
          pageSize={PRODUCTS_PAGE_SIZE}
          loading={productLoading}
          onPageChange={setProductPage}
          onMoreInfo={handlePendantMoreInfo}
          onCompleteRing={handleCompleteRing}
        />
      </div>
    );
  } else if (activeStep === 3) {
    // 如果从 URL 恢复了 settingChoice但当前状态中没有，则应用它
    const effectiveSettingChoice = settingChoice ?? settingChoiceFromUrl;

    // 支持从 URL 或 state 恢复石头信息
    const effectiveStoneId = selectedStone?.id ?? stoneIdFromUrl ?? undefined;
    const isLoadingStone = !!(stoneIdFromUrl && !selectedStone);
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
          activeStep={activeStep}
          onStepChange={changeStep}
          selectedStone={selectedStone}
          selectedProduct={selectedProduct}
          settingChoice={settingChoice}
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
