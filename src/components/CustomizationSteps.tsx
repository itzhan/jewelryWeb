"use client";

import { useMemo, type KeyboardEvent } from "react";
import { Check, Gem, Diamond, Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BackendStoneItem } from "@/lib/backend";
import type { StepOneProduct } from "@/components/StepOneLanding";
import type { SettingChoice } from "@/components/AddSettingModal";

type StepNumber = 1 | 2 | 3;
interface CustomizationStepsProps {
  activeStep: StepNumber;
  onStepChange?: (step: StepNumber) => void;
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
          selectedStone.type === "lab_grown" ? "Lab Sapphire" : "Sapphire"
        }`
      : "Select your sapphire";

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

    const stoneIconElement = selectedStone?.shapeIconSvg ? (
      <div
        className="w-5 h-5"
        // 后端返回的是一段 SVG 字符串，只用于展示图标
        dangerouslySetInnerHTML={{ __html: selectedStone.shapeIconSvg! }}
      />
    ) : null;

    const settingIconElement =
      settingChoice === "necklace" ? (
        <Sparkles className="w-5 h-5 text-amber-500" />
      ) : settingChoice === "ring" ? (
        <Diamond className="w-5 h-5 text-slate-900" />
      ) : settingChoice === "earring" ? (
        <Star className="w-5 h-5 text-rose-500" />
      ) : null;

    const stoneStepIcon: Partial<StepDetail> = stoneIconElement
      ? { icon: stoneIconElement }
      : {};

    const settingStepIcon: Partial<StepDetail> = settingIconElement
      ? { icon: settingIconElement }
      : {};

    const totalStepIcon: JSX.Element | undefined =
      stoneIconElement || settingIconElement ? (
        <div className="flex items-center gap-2">
          {settingIconElement}
          {stoneIconElement}
        </div>
      ) : (
        <Gem className="w-5 h-5 text-gray-700" />
      );

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
          price: stonePriceLabel,
          ...(stoneStepIcon as Partial<StepDetail>),
        },
      },
      {
        value: 2 as StepNumber,
        title: "SETTING",
        subtitle: "Select your",
        detail: {
          label: settingLabel,
          actionLabel: selectedProduct ? "View" : "Select",
          price: settingPriceLabel,
          ...(settingStepIcon as Partial<StepDetail>),
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
          icon: totalStepIcon,
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
        onStepChange(step);
      }
    };

    const ariaCurrent: "step" | undefined =
      activeStep === step ? "step" : undefined;

    return {
      role: "button" as const,
      tabIndex: 0,
      onClick: () => onStepChange(step),
      onKeyDown: handleKeyDown,
      "aria-current": ariaCurrent,
    };
  };

  const getWrapperClasses = () => "relative flex-1 min-w-[260px]";

  const getCardClasses = (isActive: boolean, isCompleted: boolean) =>
    cn(
      "relative h-full flex items-center gap-6 px-6 py-5 border overflow-hidden transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 bg-white rounded-[999px]",
      isActive
        ? "border-2 border-black shadow-[0_12px_24px_rgba(15,23,42,0.15)]"
        : "border border-[#dcdcdc] bg-[#f7f7f7]",
      onStepChange && "cursor-pointer"
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
        "flex flex-col flex-1 transition-colors duration-300",
        detail.align === "end"
          ? "text-right items-end"
          : "text-left items-start",
        isActive ? "text-gray-600" : "text-gray-500"
      )}
    >
      <div
        className={cn(
          "font-medium truncate transition-colors duration-300 text-[15px]",
          isActive ? "text-gray-900" : "text-gray-700"
        )}
      >
        {detail.label}
      </div>
      <div
        className={cn(
          "flex items-center gap-3 text-xs transition-colors duration-300",
          detail.align === "end" && "justify-end",
          isActive ? "text-gray-500" : "text-gray-400"
        )}
      >
        {detail.actionLabel && (
          <button
            type="button"
            className={cn(
              "underline transition-colors",
              isActive
                ? "text-gray-700 hover:text-gray-900"
                : "text-gray-400 hover:text-gray-600"
            )}
            onClick={(event) => {
              event.stopPropagation();
              onStepChange?.(step);
            }}
          >
            {detail.actionLabel}
          </button>
        )}
        {detail.price && (
          <span
            className={cn(
              "text-sm font-medium",
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
    <div className="steps-configuration-container w-full border border-[#e1e1e1] rounded-[40px] bg-[#f5f4f4] px-2 py-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)]">
      <div className="overflow-x-auto">
        <div className="flex min-w-[720px] gap-4">
          {steps.map((step) => {
            const isActive = activeStep === step.value;
            const isCompleted = step.value < activeStep;

            return (
              <div key={step.value} className={getWrapperClasses()}>
                <div
                  className={getCardClasses(isActive, isCompleted)}
                  {...interactiveProps(step.value)}
                >
                  <div className="flex items-center gap-5 min-w-[170px]">
                    <span className="text-4xl font-light text-gray-900">
                      {step.value}
                    </span>
                    <div className="leading-tight">
                      <div className="text-[13px] font-medium text-gray-500">
                        {step.subtitle}
                      </div>
                      <div className="text-[22px] font-semibold tracking-[0.28em] text-gray-900 uppercase">
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
                        "w-8 h-8 rounded-full border flex items-center justify-center bg-white transition-all duration-300",
                        isCompleted || isActive
                          ? "border-[#63b746] text-[#63b746]"
                          : "border-gray-300 text-transparent"
                      )}
                    >
                      <Check
                        strokeWidth={2}
                        className={cn(
                          "w-4 h-4 transition-opacity",
                          isCompleted || isActive ? "opacity-100" : "opacity-0"
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
