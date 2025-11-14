'use client';

import type { CSSProperties, KeyboardEvent } from "react";
import { Check, Gem } from "lucide-react";
import { cn } from "@/lib/utils";

type StepNumber = 1 | 2 | 3;
type StepPosition = "first" | "middle" | "last";

interface CustomizationStepsProps {
  activeStep: StepNumber;
  onStepChange?: (step: StepNumber) => void;
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
  position: StepPosition;
  detail: StepDetail;
}

const ARROW_WIDTH = 42;
const STEP_OVERLAP = ARROW_WIDTH - 12;

const clipPaths: Record<StepPosition, string> = {
  first: `polygon(0 0, calc(100% - ${ARROW_WIDTH}px) 0, 100% 50%, calc(100% - ${ARROW_WIDTH}px) 100%, 0 100%)`,
  middle: `polygon(${ARROW_WIDTH}px 0, calc(100% - ${ARROW_WIDTH}px) 0, 100% 50%, calc(100% - ${ARROW_WIDTH}px) 100%, ${ARROW_WIDTH}px 100%, 0 50%)`,
  last: `polygon(${ARROW_WIDTH}px 0, calc(100% - ${ARROW_WIDTH}px) 0, 100% 50%, calc(100% - ${ARROW_WIDTH}px) 100%, ${ARROW_WIDTH}px 100%, 0 50%)`,
};

const steps: StepConfig[] = [
  {
    value: 1,
    title: "SETTING",
    subtitle: "Select your",
    position: "first",
    detail: {
      label: "The Amelia",
      actionLabel: "View",
      price: "$670",
    },
  },
  {
    value: 2,
    title: "STONE",
    subtitle: "Select your",
    position: "middle",
    detail: {
      label: "1Ct Princess Cut Lab Created Sapphire",
      actionLabel: "Change",
      price: "$500",
    },
  },
  {
    value: 3,
    title: "PENDANT",
    subtitle: "Complete your",
    position: "last",
    detail: {
      label: "Total Price",
      price: "$1,170",
      align: "end",
      icon: <Gem className="w-5 h-5 text-gray-700" />,
    },
  },
];

export default function CustomizationSteps({
  activeStep,
  onStepChange,
}: CustomizationStepsProps) {
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

    return {
      role: "button" as const,
      tabIndex: 0,
      onClick: () => onStepChange(step),
      onKeyDown: handleKeyDown,
      "aria-current": activeStep === step ? "step" : undefined,
    };
  };

  const getWrapperClasses = () => "relative flex-1 min-w-[260px]";

  const getCardClasses = (isActive: boolean, isCompleted: boolean) =>
    cn(
      "relative h-full flex items-center gap-6 px-6 py-5 border overflow-hidden transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 bg-white",
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
        detail.align === "end" ? "text-right items-end" : "text-left items-start",
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
              isActive ? "text-gray-700 hover:text-gray-900" : "text-gray-400 hover:text-gray-600"
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
        <div className="flex min-w-[720px]">
          {steps.map((step) => {
            const isActive = activeStep === step.value;
            const isCompleted = step.value < activeStep;
            const wrapperStyle: CSSProperties = {
              marginLeft: step.position === "first" ? 0 : -STEP_OVERLAP,
              zIndex: isActive ? 40 : steps.length - step.value,
            };
            const cardStyle: CSSProperties = {
              clipPath: clipPaths[step.position],
              borderRadius: 999,
            };

            return (
              <div
                key={step.value}
                className={getWrapperClasses()}
                style={wrapperStyle}
              >
                <div
                  className={getCardClasses(isActive, isCompleted)}
                  {...interactiveProps(step.value)}
                  style={cardStyle}
                >
                  <div className="flex items-center gap-5 min-w-[170px]">
                    <span className="text-4xl font-light text-gray-900">{step.value}</span>
                    <div className="leading-tight">
                      <div className="text-[13px] font-medium text-gray-500">
                        {step.subtitle}
                      </div>
                      <div className="text-[22px] font-semibold tracking-[0.28em] text-gray-900 uppercase">
                        {step.title}
                      </div>
                    </div>
                  </div>

                  <StepDetail detail={step.detail} step={step.value} isActive={isActive} />

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
