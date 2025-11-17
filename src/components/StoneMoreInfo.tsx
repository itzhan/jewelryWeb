"use client";

import ProductSection from "@/components/ProductSection";
import VirtualAppointment from "@/components/VirtualAppointment";
import type { StepOneProduct } from "./StepOneLanding";

interface StoneMoreInfoProps {
  product?: StepOneProduct | null;
  onBack: () => void;
  detailSource?: 1 | 2;
  onAddSetting?: () => void;
}

export default function StoneMoreInfo({
  product,
  onBack,
  detailSource,
  onAddSetting,
}: StoneMoreInfoProps) {
  const isStepOneDetails = detailSource === 1;
  return (
    <div className="max-w-7xl mx-auto px-4 space-y-8 pb-8">
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
      />
      <VirtualAppointment />
    </div>
  );
}
