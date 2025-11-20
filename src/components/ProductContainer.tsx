"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  Diamond,
  Heart,
  Info,
  Lock,
  MessageCircle,
  Plus,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SettingChoice } from "@/components/AddSettingModal";
import {
  accordionContent,
  accordionOrder,
  AccordionSection,
  knowSettingStats,
} from "./ProductDetails";
import {
  fetchProductDetail,
  fetchStoneDetail,
  resolveBackendImageUrl,
  fetchProductCategories,
  type ProductDetailDto,
  type ProductCategoryDto,
  type StoneDetailDto,
} from "@/lib/backend";

const settingToCategoryCode: Record<SettingChoice, string> = {
  necklace: "pendant",
  ring: "ring",
  earring: "earring",
};

interface ProductContainerProps {
  productId?: number;
  stoneId?: number;
  settingType?: SettingChoice | null;
  settingIconSvg?: string | null;
  stoneIconSvg?: string | null;
}

export default function ProductContainer({
  productId = 2,
  stoneId,
  settingType,
  settingIconSvg,
  stoneIconSvg,
}: ProductContainerProps) {
  const [expandedSection, setExpandedSection] =
    useState<AccordionSection | null>(null);
  const [product, setProduct] = useState<ProductDetailDto | null>(null);
  const [stone, setStone] = useState<StoneDetailDto | null>(null);
  const [categories, setCategories] = useState<ProductCategoryDto[] | null>(
    null
  );

  const stoneShapeIcon = useMemo(
    () => stone?.shapeIconSvg ?? stoneIconSvg ?? null,
    [stone?.shapeIconSvg, stoneIconSvg]
  );

  const productImages = useMemo(() => {
    if (!product?.images?.length) return [];
    const primary = product.images.find((img) => img.isPrimary);
    const others = product.images
      .filter((img) => img !== primary)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    const ordered = primary ? [primary, ...others] : others;
    return ordered.map((img) => ({
      ...img,
      url: resolveBackendImageUrl(img.url),
    }));
  }, [product]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchProductDetail(productId);
        setProduct(data);
      } catch (e) {
        console.error("加载产品详情失败", e);
      }
    };

    load();
  }, [productId]);

  useEffect(() => {
    if (!stoneId) {
      setStone(null);
      return;
    }

    const load = async () => {
      try {
        const data = await fetchStoneDetail(stoneId);
        setStone(data);
      } catch (e) {
        console.error("加载石头详情失败", e);
      }
    };

    load();
  }, [stoneId]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchProductCategories();
        setCategories(data);
      } catch (e) {
        console.error("加载产品分类失败", e);
      }
    };
    load();
  }, []);

  const categoryIconSvg = useMemo(() => {
    if (settingIconSvg) return settingIconSvg;
    if (product?.category?.iconSvg) return product.category.iconSvg;
    const codeFromProduct = product?.category?.code;
    const codeFromSelection =
      settingType && settingToCategoryCode[settingType]
        ? settingToCategoryCode[settingType]
        : undefined;
    const targetCode = codeFromProduct ?? codeFromSelection;
    if (!targetCode || !categories?.length) return null;
    const matched = categories.find((c) => c.code === targetCode);
    return matched?.iconSvg ?? null;
  }, [categories, product, settingIconSvg, settingType]);

  const settingIcon = useMemo(() => {
    if (categoryIconSvg) {
      return (
        <span
          className="block h-8 w-8"
          dangerouslySetInnerHTML={{ __html: categoryIconSvg }}
        />
      );
    }

    const baseClass = "w-8 h-8 text-gray-700";

    switch (settingType) {
      case "necklace":
        return <Sparkles className={baseClass} />;
      case "ring":
        return <Diamond className={baseClass} />;
      case "earring":
        return (
          <svg
            className={baseClass}
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M10 3v4" strokeLinecap="round" />
            <circle cx="10" cy="12" r="3.5" />
          </svg>
        );
      default:
        return (
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle
              cx="14"
              cy="14"
              r="7"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        );
    }
  }, [settingType]);

  const toggleSection = (section: AccordionSection) => {
    setExpandedSection((prev) => (prev === section ? null : section));
  };

  return (
    <div className="step-three-view grid grid-cols-1 gap-0 custom-product-container mx-auto md:py-10 md:px-5">
      <div className="grid md:grid-cols-[1.6fr,1fr] gap-8 page-width w-full">
        {/* Image Gallery Section */}
        <div className="relative lg:sticky lg:top-10 self-start space-y-4 pb-16">
          <div className="grid grid-cols-2 gap-4 rounded-[36px]">
            {productImages.map((image, index) => (
              <figure
                key={`${image.alt}-${index}`}
                className={`relative ${
                  image.aspect === "portrait" ? "aspect-[3/4]" : "aspect-square"
                } rounded-[32px] overflow-hidden bg-gray-50 shadow-[0_18px_45px_rgba(15,23,42,0.08)]`}
              >
                <img
                  src={image.url}
                  alt={image.alt}
                  className="h-full w-full object-cover"
                />
                {image.badge && (
                  <span className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-700 shadow-sm">
                    {image.badge}
                  </span>
                )}
              </figure>
            ))}
          </div>
          <p className="text-center text-sm text-gray-500">
            This gallery follows you as you scroll so you never lose sight of
            the pendant details.
          </p>
        </div>

        {/* Product Details Section */}
        <div className="flex flex-col space-y-6">
          {/* Title */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl font-normal text-gray-900">
                {product?.name ?? "Product"}
              </h1>
              <button className="flex flex-col items-center gap-1 p-2 hover:bg-gray-100 rounded-lg transition-all duration-300 group whitespace-nowrap">
                <svg
                  className="w-6 h-6 transition-transform group-hover:scale-110"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-xs font-medium">Drop a Hint</span>
              </button>
            </div>
          </div>

          {/* Setting Info */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-700">
                  {settingIcon}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {product?.name ?? "Setting"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {product?.category?.name ?? "Pendant"}
                  </p>
                  <button className="text-sm text-gray-600 underline hover:text-gray-900">
                    Change | View Details
                  </button>
                </div>
              </div>
              <p className="text-xl font-medium">
                {product
                  ? `${product.currency} ${product.basePrice.toLocaleString()}`
                  : ""}
              </p>
            </div>

            {/* Stone Info */}
            {stone && (
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    {stoneShapeIcon ? (
                      <div
                        className="w-8 h-8"
                        dangerouslySetInnerHTML={{ __html: stoneShapeIcon }}
                      />
                    ) : (
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 28 28"
                        fill="none"
                      >
                        <rect
                          x="8"
                          y="8"
                          width="12"
                          height="12"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{stone.shape}</h3>
                    <p className="text-sm text-gray-600">
                      {stone.carat}ct {stone.color} {stone.clarity}
                    </p>
                    <button className="text-sm text-gray-600 underline hover:text-gray-900">
                      Change | View Details
                    </button>
                  </div>
                </div>
                <p className="text-xl font-medium">
                  {stone.currency} {stone.price.toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* Total Price */}
          <div className="text-center py-4">
            <p className="text-gray-600 text-sm mb-1">Total Price</p>
            <p className="text-4xl font-light text-gray-900">
              {product && stone
                ? `${product.currency} ${(
                    product.basePrice + stone.price
                  ).toLocaleString()}`
                : product
                ? `${product.currency} ${product.basePrice.toLocaleString()}`
                : "-"}
            </p>
            <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-600">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 2v12M2 8l6-6 6 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
              <span>Ships in 3-4 weeks</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button className="w-full bg-black text-white py-4 rounded-full font-medium hover:bg-gray-900 transition-all duration-300 flex items-center justify-between px-8 group relative overflow-hidden shadow-lg hover:shadow-xl">
              <Heart className="w-5 h-5 transition-all group-hover:scale-110 group-hover:fill-white" />
              <span className="relative z-10 text-base">Secure Checkout</span>
              <MessageCircle className="w-5 h-5 transition-all group-hover:scale-110" />
            </button>

            <button className="w-full border-2 border-black text-black py-4 rounded-full font-medium hover:bg-black hover:text-white transition-all duration-300 flex items-center justify-between px-8 group shadow-sm hover:shadow-md">
              <Lock className="w-4 h-4 transition-all group-hover:scale-110" />
              <span className="text-base">Add to Shopping Bag</span>
              <Plus className="w-5 h-5 transition-all group-hover:rotate-90 group-hover:scale-110" />
            </button>
          </div>

          {/* Payment Info */}
          <p className="text-sm text-center text-gray-600">
            Pay in 12 interest-free installments of $97.50{" "}
            <button className="underline hover:text-gray-900">
              Learn more
            </button>
          </p>

          {/* Features */}
          <div className="grid grid-cols-4 gap-4 py-6 border-y border-gray-200">
            <div className="text-center group cursor-pointer">
              <div className="mb-2 flex justify-center">
                <svg
                  className="w-8 h-8 transition-transform group-hover:scale-110"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
                    strokeWidth="1.5"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <p className="text-xs font-medium text-gray-900">Overnight</p>
              <p className="text-xs text-gray-600">Shipping</p>
            </div>

            <div className="text-center group cursor-pointer">
              <div className="mb-2 flex justify-center">
                <svg
                  className="w-8 h-8 transition-transform group-hover:scale-110"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
                  <path
                    d="M9 12l2 2 4-4"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="text-xs font-medium text-gray-900">Lifetime</p>
              <p className="text-xs text-gray-600">Warranty</p>
            </div>

            <div className="text-center group cursor-pointer">
              <div className="mb-2 flex justify-center">
                <svg
                  className="w-8 h-8 transition-transform group-hover:scale-110"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    d="M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M16 21l5-5-5-5"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="text-xs font-medium text-gray-900">30 Days</p>
              <p className="text-xs text-gray-600">Free Return</p>
            </div>

            <div className="text-center group cursor-pointer">
              <div className="mb-2 flex justify-center">
                <svg
                  className="w-8 h-8 transition-transform group-hover:scale-110"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                    strokeWidth="1.5"
                  />
                  <polyline points="14 2 14 8 20 8" strokeWidth="1.5" />
                  <line x1="9" y1="15" x2="15" y2="15" strokeWidth="1.5" />
                  <line x1="9" y1="12" x2="15" y2="12" strokeWidth="1.5" />
                </svg>
              </div>
              <p className="text-xs font-medium text-gray-900">Certificate</p>
              <p className="text-xs text-gray-600">& Appraisal</p>
            </div>
          </div>

          {/* Know Your Setting */}
          {stone && (
            <div className="rounded-3xl border border-gray-200 bg-[#f6f6f6] p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-gray-600">
                  <Diamond className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Your {stone.type === "lab_grown" ? "Lab-Grown" : "Natural"}{" "}
                  {stone.shape} Info
                </h3>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-2 shadow-sm">
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.4em] text-gray-400">
                    <span className="text-amber-500">carat</span>
                  </div>
                  <p className="text-3xl font-semibold text-gray-900">
                    {stone.carat}
                  </p>
                  <p className="text-xs text-gray-500">
                    Universal measurement unit for diamonds
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-2 shadow-sm">
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.4em] text-gray-400">
                    <span className="text-pink-500">color</span>
                  </div>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stone.color}
                  </p>
                  <p className="text-xs text-gray-500">
                    Clarity: {stone.clarity}
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-2 shadow-sm">
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.4em] text-gray-400">
                    <span className="text-cyan-500">dimensions (mm)</span>
                  </div>
                  <p className="text-3xl font-semibold text-gray-900">
                    {stone.lengthMm?.toFixed(1)}x{stone.widthMm?.toFixed(1)}
                  </p>
                  <div className="flex items-center gap-2 text-gray-500">
                    {stone.shapeIconSvg ? (
                      <div
                        className="h-5 w-5"
                        dangerouslySetInnerHTML={{ __html: stone.shapeIconSvg }}
                      />
                    ) : (
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 40 40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      >
                        <rect x="8" y="12" width="24" height="16" rx="4" />
                        <path d="M8 28l7-6 7 6" />
                        <line x1="8" y1="28" x2="16" y2="28" />
                      </svg>
                    )}
                    <span className="text-xs font-medium">
                      Ratio: {stone.ratio?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6 space-y-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center">
                <Info className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Know your setting
                </p>
                <h3 className="text-xl font-semibold text-gray-900">
                  {product?.description || "14k Yellow Gold"}
                </h3>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <div className="relative w-32 h-32 mx-auto sm:mx-0">
                <div
                  className="w-full h-full rounded-full"
                  style={{
                    background:
                      "conic-gradient(#fbbf24 0% 58.5%, #ea580c 58.5% 89%, #fde68a 89% 95%, #d4d4d8 95% 100%)",
                  }}
                />
                <div className="absolute inset-4 bg-gray-50 rounded-full flex items-center justify-center text-gray-800 font-semibold">
                  14k
                </div>
              </div>
              <div className="flex-1 space-y-2">
                {knowSettingStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2 text-gray-700">
                      <span
                        className={`w-3 h-3 rounded-full ${stat.color} ring-2 ring-white`}
                      />
                      {stat.label}
                    </div>
                    <span className="font-semibold text-gray-900">
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-600 italic">
              The secret sauce that makes this piece.
            </p>
          </div>

          {/* Accordion sections */}
          <div className="space-y-4">
            {accordionOrder.map((key) => {
              const section = accordionContent[key];
              const isOpen = expandedSection === key;

              return (
                <div
                  key={key}
                  className="rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-5 py-4 text-left"
                    onClick={() => toggleSection(key)}
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                        {section.icon}
                      </div>
                      <span className="font-medium text-gray-900">
                        {section.title}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-500 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={cn(
                      "px-5 border-t border-gray-100 overflow-hidden transition-all duration-300",
                      isOpen
                        ? "max-h-[400px] opacity-100 py-4"
                        : "max-h-0 opacity-0 py-0"
                    )}
                  >
                    <div className="pt-1 text-sm text-gray-700">
                      {section.body}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Virtual Appointment */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-medium text-lg mb-2">Virtual Appointment</h3>
            <p className="text-sm text-gray-600 mb-4">
              See Keyzar's jewelry up close with a personal appointment. Explore
              engagement rings, diamonds, and fine jewelry in person through
              your device.
            </p>
            <button className="text-sm font-medium underline hover:text-gray-900">
              Book Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
