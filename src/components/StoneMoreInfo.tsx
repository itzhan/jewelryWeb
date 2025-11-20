"use client";

import ProductSection from "@/components/ProductSection";
import VirtualAppointment from "@/components/VirtualAppointment";
import { useEffect, useState } from "react";
import type { StepOneProduct } from "./StepOneLanding";
import type { BackendStoneItem, StoneDetailDto } from "@/lib/backend";
import { fetchStoneDetail } from "@/lib/backend";

interface StoneMoreInfoProps {
  product?: StepOneProduct | null;
  stone?: BackendStoneItem | null;
  onBack: () => void;
  detailSource?: 1 | 2;
  onAddSetting?: () => void;
}

export default function StoneMoreInfo({
  product,
  stone,
  onBack,
  detailSource,
  onAddSetting,
}: StoneMoreInfoProps) {
  const isStepOneDetails = detailSource === 1;
  const [stoneDetail, setStoneDetail] = useState<StoneDetailDto | null>(null);
  const [stoneLoading, setStoneLoading] = useState(false);

  useEffect(() => {
    const loadStone = async () => {
      if (detailSource !== 1 || !stone) {
        setStoneDetail(null);
        return;
      }
      try {
        setStoneLoading(true);
        const detail = await fetchStoneDetail(stone.id);
        setStoneDetail(detail);
      } catch (e) {
        console.error("加载石头详情失败", e);
        setStoneDetail(null);
      } finally {
        setStoneLoading(false);
      }
    };

    loadStone();
  }, [detailSource, stone?.id]);

  const stoneImages = stoneDetail?.images ?? [];

  return (
    <div className="page-width space-y-8 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-gray-500">
            Product Details
          </p>
          <h2 className="text-3xl font-semibold">
            {product?.name ?? "Our Signature Setting"}
          </h2>
        </div>
        <button
          type="button"
          className="text-sm text-gray-500 underline underline-offset-4"
          onClick={onBack}
        >
          Back to Pendants
        </button>
      </div>
      <ProductSection
        isStepOneDetails={isStepOneDetails}
        onPrimaryAction={isStepOneDetails ? onAddSetting : undefined}
        primaryActionLabel={isStepOneDetails ? "Add Setting" : undefined}
        showBuySettingButton={!isStepOneDetails}
        stoneDetail={stoneDetail}
      />
      <VirtualAppointment />
    </div>
  );
}
