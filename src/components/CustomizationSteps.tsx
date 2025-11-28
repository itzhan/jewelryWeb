"use client";

import { useMemo, type KeyboardEvent } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BackendStoneItem } from "@/lib/backend";
import type { StepOneProduct } from "@/components/StepOneLanding";
import type { SettingChoice } from "@/components/AddSettingModal";

type StepNumber = 1 | 2 | 3;
type StepIntent = "select" | "change" | "view" | "card" | undefined;
interface CustomizationStepsProps {
  activeStep: StepNumber;
  onStepChange?: (step: StepNumber, intent?: StepIntent) => void;
  selectedStone?: BackendStoneItem | null;
  selectedProduct?: StepOneProduct | null;
  settingChoice?: SettingChoice | null;
}

interface StepDetail {
  label: string;
  actionLabel?: string;
  price?: string;
  align?: "start" | "end";
  icon?: JSX.Element;
}

interface StepConfig {
  value: StepNumber;
  title: string;
  subtitle: string;
  detail: StepDetail;
}

const parseProductPrice = (
  price?: string | null
): { currency: string | null; amount: number | null } => {
  if (!price) return { currency: null, amount: null };
  const parts = price.trim().split(/\s+/);
  if (parts.length === 0) return { currency: null, amount: null };
  if (parts.length === 1) {
    const amount = Number(parts[0].replace(/[^0-9.]/g, ""));
    return {
      currency: null,
      amount: Number.isNaN(amount) ? null : amount,
    };
  }
  const currency = parts[0];
  const rawAmount = parts.slice(1).join(" ");
  const amount = Number(rawAmount.replace(/[^0-9.]/g, ""));
  return {
    currency,
    amount: Number.isNaN(amount) ? null : amount,
  };
};

const formatCurrencyAmount = (
  currency: string | null | undefined,
  amount: number | null | undefined
): string | undefined => {
  if (amount == null || Number.isNaN(amount)) return undefined;
  const code = (currency && currency.trim()) || "USD";
  return `${code} ${amount.toLocaleString()}`;
};

export default function CustomizationSteps({
  activeStep,
  onStepChange,
  selectedStone,
  selectedProduct,
  settingChoice,
}: CustomizationStepsProps) {
  const steps = useMemo<StepConfig[]>(() => {
    const { currency: productCurrency, amount: productAmount } =
      parseProductPrice(selectedProduct?.price);

    const stonePrice = selectedStone?.price ?? null;
    const stoneCurrency = selectedStone?.currency ?? null;

    const stoneLabel: string = selectedStone
      ? `${selectedStone.carat.toFixed(2)}ct ${selectedStone.shape} ${
          selectedStone.type === "lab_grown" ? "Lab" : ""
        }`
      : "Choose your stone";

    const stonePriceLabel = formatCurrencyAmount(
      stoneCurrency || productCurrency,
      stonePrice
    );

    const settingLabel: string = selectedProduct?.name ?? "Select your setting";

    const settingPriceLabel =
      selectedProduct?.price && selectedProduct.price.trim().length > 0
        ? selectedProduct.price
        : undefined;

    const totalAmount = (stonePrice ?? 0) + (productAmount ?? 0);
    const hasAnyPrice = (stonePrice ?? 0) > 0 || (productAmount ?? 0) > 0;

    const totalPriceLabel = hasAnyPrice
      ? formatCurrencyAmount(stoneCurrency || productCurrency, totalAmount)
      : undefined;

    const pendantTitle =
      settingChoice === "ring"
        ? "RING"
        : settingChoice === "necklace"
        ? "PENDANT"
        : settingChoice === "earring"
        ? "EARRING"
        : "PENDANT";

    return [
      {
        value: 1 as StepNumber,
        title: "STONE",
        subtitle: "Select your",
        detail: {
          label: stoneLabel,
          actionLabel: selectedStone ? "Change" : "Select",
          price: stonePriceLabel
        },
      },
      {
        value: 2 as StepNumber,
        title: "SETTING",
        subtitle: "Select your",
        detail: {
          label: settingLabel,
          actionLabel: selectedProduct ? "View" : "Select",
          price: settingPriceLabel
        },
      },
      {
        value: 3 as StepNumber,
        title: pendantTitle,
        subtitle: "Complete your",
        detail: {
          label: "Total Price",
          price: totalPriceLabel,
          align: "end",
        },
      },
    ];
  }, [selectedStone, selectedProduct, settingChoice]);

  const interactiveProps = (step: StepNumber) => {
    if (!onStepChange) {
      return {};
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onStepChange(step, "card");
      }
    };

    const ariaCurrent: "step" | undefined =
      activeStep === step ? "step" : undefined;

    return {
      role: "button" as const,
      tabIndex: 0,
      onClick: () => onStepChange(step, "card"),
      onKeyDown: handleKeyDown,
      "aria-current": ariaCurrent,
    };
  };

  const getWrapperClasses = () => "relative flex-1 min-w-0";

  const getCardClasses = (isActive: boolean, _isCompleted: boolean) =>
    cn(
      "group relative h-full flex items-center gap-6 px-5 py-4 border overflow-hidden transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 bg-white/90 backdrop-blur-sm rounded-2xl shadow-[0_10px_22px_rgba(17,24,39,0.08)]",
      isActive
        ? "border-black/80 shadow-[0_16px_34px_rgba(17,24,39,0.14)]"
        : "border-[#e5e5e5] hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(17,24,39,0.12)]",
      onStepChange && "cursor-pointer select-none"
    );

  const StepDetail = ({
    detail,
    step,
    isActive,
  }: {
    detail: StepDetail;
    step: StepNumber;
    isActive: boolean;
  }) => (
    <div
      className={cn(
        "flex flex-col flex-1 min-w-0 transition-colors duration-300",
        detail.align === "end"
          ? "text-right items-end"
          : "text-left items-start",
        isActive ? "text-gray-600" : "text-gray-500"
      )}
    >
      <div
        className={cn(
          "font-semibold truncate transition-colors duration-300 text-sm md:text-base",
          isActive ? "text-gray-900" : "text-gray-700"
        )}
      >
        {detail.label}
      </div>
      <div
        className={cn(
          "flex items-center gap-3 text-[12px] transition-colors duration-300",
          detail.align === "end" && "justify-end",
          isActive ? "text-gray-500" : "text-gray-400"
        )}
      >
        {detail.actionLabel && (
          <button
            type="button"
            className={cn(
              "font-semibold tracking-[0.08em] uppercase transition-colors border-b border-transparent pb-[1px]",
              isActive
                ? "text-gray-800 hover:text-black hover:border-black"
                : "text-gray-400 hover:text-gray-600 hover:border-gray-600"
            )}
            onClick={(event) => {
              event.stopPropagation();
              const intent =
                detail.actionLabel?.toLowerCase() === "change"
                  ? "change"
                  : detail.actionLabel?.toLowerCase() === "view"
                  ? "view"
                  : "select";
              onStepChange?.(step, intent);
            }}
          >
            {detail.actionLabel}
          </button>
        )}
        {detail.price && (
          <span
            className={cn(
              "text-sm font-medium truncate",
              isActive ? "text-gray-600" : "text-gray-400"
            )}
          >
            {detail.price}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="steps-configuration-container w-full border border-[#e7e7e7] rounded-[28px] bg-gradient-to-r from-[#f7f7f7] via-white to-[#f7f7f7] px-3 py-4 shadow-[0_18px_36px_rgba(17,24,39,0.08)]">
      <div className="w-full">
        <div className="flex gap-4 w-full">
          {steps.map((step) => {
            const isActive = activeStep === step.value;
            const isCompleted = step.value < activeStep;

            return (
              <div key={step.value} className={getWrapperClasses()}>
                <div
                  className={getCardClasses(isActive, isCompleted)}
                  {...interactiveProps(step.value)}
                >
                  <div className="flex items-center gap-4 min-w-[170px] shrink-0">
                    <span
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-300 border",
                        isActive
                          ? "bg-black text-white border-black"
                          : "bg-[#f0f0f0] text-gray-800 border-[#dcdcdc]"
                      )}
                    >
                      {step.value}
                    </span>
                    <div className="leading-tight">
                      <div className="text-[12px] font-semibold text-gray-500 tracking-[0.18em] uppercase">
                        {step.subtitle}
                      </div>
                      <div className="text-lg md:text-xl font-semibold text-gray-900 uppercase">
                        {step.title}
                      </div>
                    </div>
                  </div>

                  <StepDetail
                    detail={step.detail}
                    step={step.value}
                    isActive={isActive}
                  />

                  <div className="flex items-center gap-3">
                    {step.detail.icon && (
                      <div className="hidden md:block text-gray-700">
                        {step.detail.icon}
                      </div>
                    )}
                    <div
                      className={cn(
                        "w-9 h-9 rounded-full border flex items-center justify-center bg-white transition-all duration-300 shadow-sm",
                        isCompleted
                          ? "border-[#11845b] bg-[#11845b] text-white"
                          : isActive
                          ? "border-black bg-black text-white"
                          : "border-[#dcdcdc] text-transparent"
                      )}
                    >
                      <Check
                        strokeWidth={2}
                        className={cn(
                          "w-4 h-4 transition-all",
                          isCompleted || isActive
                            ? "opacity-100 scale-100"
                            : "opacity-0 scale-90"
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
