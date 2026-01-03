"use client";

import ProductSection from "@/components/ProductSection";
import VirtualAppointment from "@/components/VirtualAppointment";
import { useEffect, useMemo, useState } from "react";
import type { StepOneProduct } from "./StepOneLanding";
import type { BackendStoneItem, BackendStoneType, StoneDetailDto } from "@/lib/backend";

interface StoneMoreInfoProps {
  product?: StepOneProduct | null;
  stone?: BackendStoneItem | null;
  onBack: () => void;
  detailSource?: 1 | 2;
  onAddSetting?: () => void;
  centerStoneShape?: string | null;
  centerStoneType?: BackendStoneType | null;
  isLoading?: boolean;
  productImages?: Array<{
    url: string;
    alt: string;
    badge?: string;
    aspect?: "square" | "portrait";
  }>;
}

export default function StoneMoreInfo({
  product,
  stone,
  onBack,
  detailSource,
  onAddSetting,
  centerStoneShape,
  centerStoneType,
  isLoading = false,
  productImages,
}: StoneMoreInfoProps) {
  const isStepOneDetails = detailSource === 1;
  const [isMobileView, setIsMobileView] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia("(max-width: 767px)").matches;
  });

  // 将 stone 转换为 StoneDetailDto 格式用于显示
  const stoneDetail = useMemo<StoneDetailDto | null>(() => {
    if (!stone) return null;
    const fromDetail = (stone as unknown as { images?: unknown }).images;
    const hasDetailImages =
      Array.isArray(fromDetail) && fromDetail.length > 0;

    const images: StoneDetailDto["images"] = hasDetailImages
      ? (fromDetail as StoneDetailDto["images"])
      : stone.primaryImageUrl
        ? [
            {
              url: stone.primaryImageUrl,
              alt: stone.name || stone.shape || "Stone",
              badge: "Selected stone",
              aspect: "square" as const,
              sortOrder: 0,
              isPrimary: true,
            },
          ]
        : [];

    return { ...(stone as unknown as Omit<StoneDetailDto, "images">), images };
  }, [stone]);

  const isMissingProduct = detailSource === 2 && !product;
  const isLoadingDetail = isLoading;
  const resolvedCenterStoneShape =
    centerStoneShape ?? stoneDetail?.shape ?? stone?.shape ?? null;
  const resolvedCenterStoneType =
    centerStoneType ?? stoneDetail?.type ?? stone?.type ?? null;
  const detailHeading = useMemo(() => {
    if (!isStepOneDetails) {
      return {
        label: "Product Details",
        title: product?.name ?? "Our Signature Setting",
      };
    }

    if (!stoneDetail) {
      return { label: "Stone Details", title: "Stone Details" };
    }

    const shape = stoneDetail.shape?.trim();
    const carat =
      typeof stoneDetail.carat === "number" ? stoneDetail.carat : null;
    const prefix =
      carat != null && Number.isFinite(carat)
        ? `${carat.toFixed(2)}ct`
        : null;
    const typeLabel =
      stoneDetail.type === "lab_grown" ? "Lab-Grown" : "Natural";

    return {
      label: "Stone Details",
      title: [prefix, shape, `${typeLabel} Stone`].filter(Boolean).join(" "),
    };
  }, [isStepOneDetails, product?.name, stoneDetail]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobileView(media.matches);
    update();
    if (media.addEventListener) {
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }
    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  const detailsContent = isLoadingDetail ? (
    <>
          {/* Mobile skeleton */}
          <div className="md:hidden space-y-6 animate-pulse">
            <div className="rounded-2xl bg-gray-100 aspect-[4/3]" />
            <div className="flex items-center justify-between">
              <div className="h-5 w-2/3 rounded-full bg-gray-100" />
              <div className="h-5 w-12 rounded-full bg-gray-100" />
            </div>
            <div className="space-y-3">
              <div className="h-4 w-1/2 rounded-full bg-gray-100" />
              <div className="h-10 w-full rounded-2xl bg-gray-100" />
              <div className="h-10 w-5/6 rounded-2xl bg-gray-100" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="h-16 rounded-2xl bg-gray-100" />
              <div className="h-16 rounded-2xl bg-gray-100" />
              <div className="h-16 rounded-2xl bg-gray-100" />
              <div className="h-16 rounded-2xl bg-gray-100" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-28 rounded-full bg-gray-100" />
              <div className="h-9 w-20 rounded-full bg-gray-100" />
              <div className="ml-auto h-6 w-6 animate-spin rounded-full border-b-2 border-gray-400" />
            </div>
          </div>

          {/* Desktop skeleton */}
          <div className="hidden md:grid grid-cols-1 lg:grid-cols-[1.6fr,1fr] gap-8 lg:gap-12 mb-12 animate-pulse">
            <div className="grid grid-cols-2 gap-4 rounded-[36px]">
              <div className="aspect-square rounded-[24px] sm:rounded-[32px] bg-gray-100" />
              <div className="aspect-square rounded-[24px] sm:rounded-[32px] bg-gray-100" />
              <div className="aspect-square rounded-[24px] sm:rounded-[32px] bg-gray-100" />
              <div className="aspect-square rounded-[24px] sm:rounded-[32px] bg-gray-100" />
            </div>
            <div className="space-y-5">
              <div className="h-6 w-2/3 rounded-full bg-gray-100" />
              <div className="h-4 w-1/2 rounded-full bg-gray-100" />
              <div className="h-12 w-full rounded-2xl bg-gray-100" />
              <div className="h-12 w-5/6 rounded-2xl bg-gray-100" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-20 rounded-2xl bg-gray-100" />
                <div className="h-20 rounded-2xl bg-gray-100" />
                <div className="h-20 rounded-2xl bg-gray-100" />
                <div className="h-20 rounded-2xl bg-gray-100" />
              </div>
              <div className="h-12 w-40 rounded-full bg-gray-100" />
            </div>
          </div>
    </>
  ) : isMissingProduct ? (
    <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-white py-16 shadow-sm">
      <p className="text-sm text-gray-500">正在准备商品信息...</p>
    </div>
  ) : (
    <>
      <ProductSection
        isStepOneDetails={isStepOneDetails}
        onPrimaryAction={onAddSetting}
        primaryActionLabel={isStepOneDetails ? "Add Setting" : undefined}
        showBuySettingButton={!isStepOneDetails}
        stoneDetail={stoneDetail}
        productImages={productImages}
        centerStoneShape={resolvedCenterStoneShape}
        centerStoneType={resolvedCenterStoneType}
        lockCenterStoneShape={detailSource === 2}
      />
      <VirtualAppointment />
    </>
  );

  if (isMobileView) {
    return (
      <div className="fixed inset-0 z-40">
        <div
          className="absolute inset-0 bg-black/35 backdrop-blur-[1px]"
          onClick={onBack}
        />
        <div className="absolute inset-x-0 bottom-0 max-h-[92vh] max-h-[92dvh] overflow-y-auto rounded-t-3xl bg-white px-4 pb-8 pt-4 shadow-[0_-20px_50px_rgba(15,23,42,0.25)]">
          <div className="mx-auto h-1.5 w-12 rounded-full bg-gray-200" />
          <div className="mt-4 flex items-start justify-between">
            <div className={isLoadingDetail ? "animate-pulse space-y-2" : ""}>
              {isLoadingDetail ? (
                <>
                  <div className="h-2.5 w-24 rounded-full bg-gray-200" />
                  <div className="h-5 w-40 rounded-full bg-gray-200" />
                </>
              ) : (
                <>
                  <p className="text-[10px] uppercase tracking-[0.45em] text-gray-400">
                    {detailHeading.label}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-gray-900">
                    {detailHeading.title}
                  </h2>
                </>
              )}
            </div>
            <button
              type="button"
              className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600"
              onClick={onBack}
            >
              Back
            </button>
          </div>
          <div className="mt-5 space-y-6">{detailsContent}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-width space-y-8 pb-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className={isLoadingDetail ? "animate-pulse space-y-3" : ""}>
          {isLoadingDetail ? (
            <>
              <div className="h-3 w-28 rounded-full bg-gray-200" />
              <div className="h-6 w-64 rounded-full bg-gray-200" />
            </>
          ) : (
            <>
              <p className="text-xs uppercase tracking-[0.5em] text-gray-500">
                {detailHeading.label}
              </p>
              <h2 className="text-2xl sm:text-3xl font-semibold">
                {detailHeading.title}
              </h2>
            </>
          )}
        </div>
        <button
          type="button"
          className="text-sm text-gray-500 underline underline-offset-4"
          onClick={onBack}
        >
          Back to Pendants
        </button>
      </div>
      {detailsContent}
    </div>
  );
}
