export const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3000";

export function resolveBackendImageUrl(imagePath: string | null | undefined) {
  if (!imagePath) {
    return "";
  }
  const trimmed = imagePath.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  try {
    return new URL(trimmed, BACKEND_BASE_URL).toString();
  } catch (error) {
    console.error("无法解析图片地址", trimmed, error);
    return trimmed;
  }
}

async function apiGet<T>(
  path: string,
  params?: Record<string, any>
): Promise<T> {
  const url = new URL(path, BACKEND_BASE_URL);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (Array.isArray(value)) {
        value.forEach((v) => url.searchParams.append(key, String(v)));
      } else {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

// ========= Products =========

export interface BackendProductSummary {
  id: number;
  name: string;
  price: number;
  currency: string;
  image: string;
  colors: string[];
  categoryCode?: string;
  categoryName?: string;
}

interface ProductsListResponse {
  data: BackendProductSummary[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      total: number;
    };
  };
}

export async function fetchPendantProducts(): Promise<BackendProductSummary[]> {
  const result = await apiGet<ProductsListResponse>("/products", {
    categoryCode: "pendant",
    page: 1,
    pageSize: 24,
  });
  return result.data ?? [];
}

export interface ProductImageDto {
  url: string;
  alt: string;
  badge?: string;
  aspect: "square" | "portrait";
  // 从后端 JSONB 中同步的排序与主图标记，前台按它们决定展示顺序
  sortOrder?: number;
  isPrimary?: boolean;
}

export interface ProductDetailDto {
  id: number;
  name: string;
  sku: string;
  basePrice: number;
  currency: string;
  description: string;
  category: {
    code: string;
    name: string;
    iconSvg?: string;
  };
  availableColors: string[];
  images: ProductImageDto[];
}

export async function fetchProductDetail(
  id: number
): Promise<ProductDetailDto> {
  const result = await apiGet<{ data: ProductDetailDto }>(`/products/${id}`);
  return result.data;
}

// ========= Stones =========

export type BackendStoneType = "natural" | "lab_grown";

export interface BackendStoneItem {
  id: number;
  name: string;
  type: BackendStoneType;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut: string;
  certificate?: string;
  ratio: number;
  price: number;
  currency: string;
  externalId?: number;
  externalDRef?: string;
  externalReportNo?: string;
  externalCertNo?: string;
  externalCertType?: string;
  externalPolish?: string;
  externalSymmetry?: string;
  externalFluorescence?: string;
  externalDepthPercent?: number;
  externalTablePercent?: number;
  externalM1?: number;
  externalM2?: number;
  externalM3?: number;
  externalRate?: number;
  externalDiscount?: number;
  externalLocation?: string;
  externalNatts?: string;
  externalMilky?: string;
  externalEyeClean?: string;
  externalBrowness?: string;
  externalIsBuy?: boolean;
  externalIsSpecialOffer?: boolean;
  externalIsAuction?: boolean;
  externalRap?: number;
  externalUpdateTime?: string;
  externalVideoUrl?: string;
  externalDaylightUrl?: string;
  externalBt?: string;
  externalBc?: string;
  externalWt?: string;
  externalWc?: string;
  externalSupplement1?: string;
  externalSupplement10?: string;
  externalSupplement11?: string;
  externalSupplement12?: string;
  externalSupplement13?: string;
  primaryImageUrl?: string;
  shapeIconSvg?: string;
}


interface StonesListResponse {
  data: BackendStoneItem[];
  meta?: {
    pagination: {
      page: number;
      pageSize: number;
      total: number;
    };
  };
}

export interface StonesQueryParams {
  page?: number;
  pageSize?: number;
  shape?: string;
  color?: string[];
  clarity?: string[];
  cut?: string[];
  minCarat?: number;
  maxCarat?: number;
  minBudget?: number;
  maxBudget?: number;
  certificate?: string[];
  type?: BackendStoneType;
}

export async function fetchStones(
  params: StonesQueryParams
): Promise<StonesListResponse> {
  return apiGet<StonesListResponse>("/stones", params);
}

export interface StoneImageDto {
  url: string;
  alt: string;
  badge?: string;
  aspect: "square" | "portrait";
  // 从后端 JSONB 中同步的排序与主图标记，前台按它们决定展示顺序
  sortOrder?: number;
  isPrimary?: boolean;
}

export interface StoneDetailDto extends BackendStoneItem {
  images: StoneImageDto[];
}

export async function fetchStoneDetail(id: number): Promise<StoneDetailDto> {
  const result = await apiGet<{ data: StoneDetailDto }>(`/stones/${id}`);
  return result.data;
}

// ========= Stone Filters =========

export interface StoneFilterOption {
  code: string;
  label: string;
  iconSvg?: string;
}

export interface StoneFiltersDto {
  shapes: StoneFilterOption[];
  colors: StoneFilterOption[];
  clarities: StoneFilterOption[];
  cuts: StoneFilterOption[];
  certificates: StoneFilterOption[];
}

export async function fetchStoneFilters(): Promise<StoneFiltersDto> {
  const result = await apiGet<{ data: StoneFiltersDto }>("/stones/filters");
  return result.data;
}

// ========= Product Categories (for setting type icons) =========

export interface ProductCategoryDto {
  id: number;
  code: string;
  name: string;
  description?: string;
  iconSvg?: string;
  displayOrder?: number;
}

interface ProductCategoriesResponse {
  items: ProductCategoryDto[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      total: number;
    };
  };
}

export async function fetchProductCategories(): Promise<ProductCategoryDto[]> {
  const result = await apiGet<ProductCategoriesResponse>(
    "/products/categories"
  );
  return result.items ?? [];
}

// ========= Materials =========

export interface MaterialDto {
  id: number;
  code: string;
  name: string;
  karat?: string;
  description?: string;
  svgIcon?: string;
  displayOrder: number;
  isActive: boolean;
}

interface MaterialsResponse {
  items: MaterialDto[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      total: number;
    };
  };
}

export async function fetchMaterials(): Promise<MaterialDto[]> {
  const result = await apiGet<MaterialsResponse>("/products/materials", {
    activeOnly: true,
  });
  return result.items ?? [];
}
