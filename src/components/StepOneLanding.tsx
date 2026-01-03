"use client";

import { useEffect, useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { fetchProductDetailCached, resolveBackendImageUrl } from "@/lib/backend";

export interface StepOneProduct {
  id: number;
  name: string;
  price: string;
  image: string;
  colors: ("white" | "yellow" | "rose")[];
}

interface StepOneLandingProps {
  products: StepOneProduct[];
  onMoreInfo: (product: StepOneProduct) => void;
  onCompleteRing: (product: StepOneProduct) => void;
}

const overlayButtonPrimary =
  "px-5 py-2 text-[0.55rem] font-semibold tracking-[0.08em] uppercase rounded-full border border-black bg-black text-white";

const overlayButtonSecondary =
  "px-5 py-2 text-xs font-semibold tracking-[0.10em] uppercase rounded-full border border-black bg-white text-black";

const priceToNumber = (price: string) => Number(price.replace(/[^0-9.]/g, ""));

const colorPalettes: Record<
  StepOneProduct["colors"][number],
  string[]
> = {
  white: [
    "#CCCCCC",
    "#F1F1F1",
    "#F7F7F7",
    "#E2E2E2",
    "#C4C4C4",
    "#B3B3B3",
    "#E3E3E3",
    "#F0F0F0",
  ],
  yellow: ["#FBC926", "#FFFBCC", "#F8F0BB", "#E7D28E", "#CCA246", "#C3922E"],
  rose: [
    "#FE7A69",
    "#FDD1CB",
    "#F5B9B1",
    "#F1988D",
    "#E86C5C",
    "#E26B5B",
    "#FD968F",
    "#FFDDD9",
  ],
};

const buildPaletteGradient = (colors: string[]) => {
  if (colors.length === 0) return "transparent";
  if (colors.length === 1) return colors[0];
  const stops = colors.map((c, idx) => {
    const pct = Math.round((idx / (colors.length - 1)) * 100);
    return `${c} ${pct}%`;
  });
  return `linear-gradient(135deg, ${stops.join(", ")})`;
};

export default function StepOneLanding({
  products,
  onMoreInfo,
  onCompleteRing,
}: StepOneLandingProps) {
  const sortedProducts = useMemo(() => [...products], [products]);
  const [selectedColors, setSelectedColors] = useState<
    Record<number, StepOneProduct["colors"][number]>
  >(() =>
    products.reduce<Record<number, StepOneProduct["colors"][number]>>((acc, product) => {
      acc[product.id] = product.colors[0];
      return acc;
    }, {})
  );
  const [productImages, setProductImages] = useState<Record<number, string[]>>(
    {}
  );
  const [activeImageIndex, setActiveImageIndex] = useState<
    Record<number, number>
  >({});
  const [loadingProductId, setLoadingProductId] = useState<number | null>(null);

  useEffect(() => {
    setProductImages((prev) => {
      const next = { ...prev };
      products.forEach((product) => {
        if (!next[product.id] || next[product.id].length === 0) {
          next[product.id] = [product.image];
        }
      });
      return next;
    });
    setActiveImageIndex((prev) => {
      const next = { ...prev };
      products.forEach((product) => {
        if (prev[product.id] == null) {
          next[product.id] = 0;
        }
      });
      return next;
    });
  }, [products]);

  const ensureProductImages = async (product: StepOneProduct) => {
    const existing = productImages[product.id];
    if ((existing && existing.length > 1) || loadingProductId === product.id) {
      return;
    }
    setLoadingProductId(product.id);
    try {
      const detail = await fetchProductDetailCached(product.id);
      const sortedImages =
        detail.images && detail.images.length
          ? [...detail.images].sort((a, b) => {
              const aOrder = a.sortOrder ?? 0;
              const bOrder = b.sortOrder ?? 0;
              return aOrder - bOrder;
            })
          : [];

      const resolvedImages = sortedImages
        .map((img) => {
          const rawUrl =
            img.url ??
            (img as { imageUrl?: string }).imageUrl ??
            (img as { image?: string }).image;
          const url = resolveBackendImageUrl(rawUrl || "");
          return {
            url,
            isPrimary: !!img.isPrimary,
            sortOrder: img.sortOrder ?? 0,
          };
        })
        .filter((img) => !!img.url);

      const primaryImage =
        resolvedImages.find((img) => img.isPrimary) ?? resolvedImages[0] ?? null;

      const orderedImages: typeof resolvedImages =
        primaryImage != null
          ? [
              primaryImage,
              ...resolvedImages
                .filter((img) => img !== primaryImage && !img.isPrimary)
                .sort((a, b) => a.sortOrder - b.sortOrder),
            ]
          : resolvedImages;

      const baseImage = resolveBackendImageUrl(product.image);
      // 保证列表主图无论后端排序如何，都在首位，避免悬浮时切换首帧跳动
      const urls = [baseImage, ...orderedImages.map((img) => img.url)].reduce<
        string[]
      >((acc, url) => {
        if (!url) return acc;
        if (acc.includes(url)) return acc;
        acc.push(url);
        return acc;
      }, []);

      setProductImages((prev) => ({ ...prev, [product.id]: urls }));
      setActiveImageIndex((prev) => ({
        ...prev,
        [product.id]: 0,
      }));
    } catch (e) {
      console.error("加载商品图片失败", e);
    } finally {
      setLoadingProductId((prev) => (prev === product.id ? null : prev));
    }
  };

  const handleImageChange = (productId: number, direction: 1 | -1) => {
    const images = productImages[productId] ?? [];
    if (!images.length) return;
    setActiveImageIndex((prev) => {
      const current = prev[productId] ?? 0;
      const next = (current + direction + images.length) % images.length;
      return { ...prev, [productId]: next };
    });
  };

  const selectColor = (productId: number, color: StepOneProduct["colors"][number]) => {
    setSelectedColors((prev) => ({ ...prev, [productId]: color }));
  };

  return (
    <div className="bg-white">
      <div className="page-width pt-10 sm:pt-12 text-center">
        <h2 className="text-2xl sm:text-4xl font-light mb-3 sm:mb-4">Pendants</h2>
        <p className="text-sm sm:text-base text-gray-600">
          Discover our collection of made to order pendants and customize it to
          your preference
        </p>
      </div>

      <div className="page-width pb-12 sm:pb-16 pt-6 sm:pt-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6 -mx-2 sm:mx-0">
          {sortedProducts.map((product) => {
            const installment = (priceToNumber(product.price) / 4).toFixed(2);
            const activeColor = selectedColors[product.id] ?? product.colors[0];
            return (
              <div
                key={product.id}
                className="group relative cursor-pointer overflow-visible z-0 hover:z-30"
                onMouseEnter={() => ensureProductImages(product)}
                onClick={() => onMoreInfo(product)}
              >
                {/* 主卡片本体 */}
                <div className="relative rounded-2xl border border-gray-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.1)] transition-[border-radius,_transform,_box-shadow] duration-300 ease-out md:group-hover:-translate-y-1 md:group-hover:shadow-[0_20px_45px_rgba(15,23,42,0.16)] md:group-hover:scale-[1.015] transform z-10 md:group-hover:rounded-bl-none md:group-hover:rounded-br-none">
                  <div className="relative">
                    <img
                      src={
                        productImages[product.id]?.[
                          activeImageIndex[product.id] ?? 0
                        ] ?? product.image
                      }
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-[160px] sm:h-[300px] lg:h-[420px] min-h-[140px] sm:min-h-[260px] object-contain rounded-t-2xl transition duration-500"
                    />
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className="hidden"
                    />
                    {/* Temporarily commented out - may be re-enabled in the future */}
                    {/* <button
                      className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Heart className="h-5 w-5 text-gray-600" />
                    </button> */}
                    <div className="absolute left-4 top-4 rounded-full border border-black bg-white px-3 py-1 text-[0.65rem] uppercase tracking-[0.4em] text-black opacity-0 transition-all duration-300 -translate-x-6 md:group-hover:translate-x-0 md:group-hover:opacity-100">
                      Customizable
                    </div>
                    <div className="absolute left-1/2 bottom-4 -translate-x-1/2 flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.35em] text-gray-500 opacity-0 transition-all duration-300 translate-y-3 md:group-hover:translate-y-0 md:group-hover:opacity-100">
                      <button
                        type="button"
                        className="text-base hover:text-black"
                        onClick={(event) => {
                          event.stopPropagation();
                          ensureProductImages(product);
                          handleImageChange(product.id, -1);
                        }}
                      >
                        ‹
                      </button>
                      <span className="text-sm font-semibold text-black tracking-[0.4em]">
                        {(activeImageIndex[product.id] ?? 0) + 1} /{" "}
                        {(productImages[product.id]?.length ?? 1) || 1}
                      </span>
                      <button
                        type="button"
                        className="text-base hover:text-black"
                        onClick={(event) => {
                          event.stopPropagation();
                          ensureProductImages(product);
                          handleImageChange(product.id, 1);
                        }}
                      >
                        ›
                      </button>
                    </div>
                  </div>

                  <div className="px-3 sm:px-6 pt-2.5 sm:pt-4 pb-3.5 sm:pb-5">
                    <div className="flex items-center justify-between text-[0.6rem] sm:text-[0.65rem] uppercase tracking-[0.3em] text-gray-500 mb-2 sm:mb-3">
                      <span>Customizable</span>
                      <span>☆</span>
                    </div>
                    <div className="flex items-start justify-between gap-4 mt-3">
                      <div>
                        <h3 className="font-semibold text-[13px] sm:text-lg">
                          {product.name}
                        </h3>
                        <p className="text-gray-900 mt-1 text-[11px] sm:text-base">
                          {product.price}
                        </p>
                      </div>
                      <div className="flex gap-2 items-center">
                        {product.colors.map((color, idx) => {
                          const isActive = color === activeColor;
                          const buttonClasses = `relative w-6 h-6 sm:w-7 sm:h-7 rounded-full border transition focus-visible:outline-none ${
                            isActive
                              ? "border-gray-400 ring-2 ring-gray-300/70 ring-offset-1 ring-offset-white shadow-[0_0_0_1px_rgba(0,0,0,0.08)]"
                              : "border-gray-300"
                          }`;
                          const palette = colorPalettes[color];
                          const gradient = buildPaletteGradient(palette);
                          return (
                            <button
                              key={`dot-${product.id}-${idx}`}
                              type="button"
                              aria-label={`Select ${color}`}
                              className={buttonClasses}
                              style={{ background: gradient }}
                              onClick={(event) => {
                                event.stopPropagation();
                                selectColor(product.id, color);
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                    <div className="mt-4 flex flex-col gap-2 md:hidden">
                      <button
                        className="w-full rounded-full border border-black bg-black py-1.5 text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-white"
                        onClick={(event) => {
                          event.stopPropagation();
                          onCompleteRing(product);
                        }}
                      >
                        Complete your ring
                      </button>
                      <button
                        className="w-full rounded-full border border-black bg-white py-1.5 text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-black"
                        onClick={(event) => {
                          event.stopPropagation();
                          onMoreInfo(product);
                        }}
                      >
                        More Info
                      </button>
                      <p className="text-[10px] text-gray-600 leading-tight">
                        Pay in 4 interest-free installments of{" "}
                        <span className="font-semibold text-gray-900">
                          ${installment}
                        </span>{" "}
                        <span className="underline cursor-pointer">
                          Learn more
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* 悬浮展开区域：轻微上移覆盖 2px，和主卡片无缝衔接，并叠在下方卡片上方 */}
                <div
                  className="
                    hidden
                    md:block
                    absolute
                    -left-[0.5px]
                    -right-[0.5px]
                    top-full
                    -mt-2
                    bg-white
                    rounded-b-2xl
                    border
                    border-t-0
                    border-gray-200
                    shadow-[0_22px_50px_rgba(15,23,42,0.18)]
                    md:opacity-0
                    md:translate-y-2
                    md:pointer-events-none
                    transition-all
                    duration-300
                    md:group-hover:opacity-100
                    md:group-hover:translate-y-0
                    md:group-hover:pointer-events-auto
                    z-20
                  "
                >
                  <div className="px-6 pt-5 pb-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                      <div className="flex flex-1 gap-3">
                        <button
                          className={overlayButtonSecondary}
                          onClick={(event) => {
                            event.stopPropagation();
                            onMoreInfo(product);
                          }}
                        >
                          More Info
                        </button>
                        <button
                          className={overlayButtonPrimary}
                          onClick={(event) => {
                            event.stopPropagation();
                            onCompleteRing(product);
                          }}
                        >
                          Complete your ring
                        </button>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-gray-600">
                      Pay in 4 interest-free installments of{" "}
                      <span className="font-semibold text-gray-900">
                        ${installment}
                      </span>{" "}
                      <span className="underline cursor-pointer">
                        Learn more
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12 text-sm text-gray-600">
          Showing {sortedProducts.length} Out Of {products.length}
        </div>
      </div>
    </div>
  );
}
