"use client";

import { useEffect, useState } from "react";
import CustomizationSteps from "@/components/CustomizationSteps";
import ProductSection from "@/components/ProductSection";
import VirtualAppointment from "@/components/VirtualAppointment";
import StoneSelectionSection from "@/components/StoneSelectionSection";
import ProductContainer from "@/components/ProductContainer";
import StepOneLanding, { StepOneProduct } from "@/components/StepOneLanding";

type StepNumber = 1 | 2 | 3;
type StepOneView = "landing" | "detail";

export default function StepExperience() {
  const [activeStep, setActiveStep] = useState<StepNumber>(1);
  const [stepOneView, setStepOneView] = useState<StepOneView>("landing");
  const [selectedProduct, setSelectedProduct] = useState<StepOneProduct | null>(
    null
  );

  useEffect(() => {
    if (activeStep !== 1) {
      setStepOneView("landing");
    }
  }, [activeStep]);

  const handleMoreInfo = (product: StepOneProduct) => {
    setSelectedProduct(product);
    setActiveStep(1);
    setStepOneView("detail");
  };

  const handleAddDiamond = (product: StepOneProduct) => {
    setSelectedProduct(product);
    setActiveStep(2);
    setStepOneView("landing");
  };

  return (
    <section className="bg-white">
      <div className="max-w-8xl mx-auto px-4 py-8">
        <CustomizationSteps activeStep={activeStep} onStepChange={setActiveStep} />
      </div>

      {activeStep === 1 && stepOneView === "landing" && (
        <div>
          <StepOneLanding
            onMoreInfo={handleMoreInfo}
            onAddDiamond={handleAddDiamond}
          />
        </div>
      )}

      {activeStep === 1 && stepOneView === "detail" && (
        <div className="max-w-7xl mx-auto px-4 space-y-8 pb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-gray-500">
                Product Details
              </p>
              <h2 className="text-3xl font-semibold">
                {selectedProduct?.name ?? "Our Signature Setting"}
              </h2>
            </div>
            <button
              type="button"
              className="text-sm text-gray-500 underline underline-offset-4"
              onClick={() => setStepOneView("landing")}
            >
              Back to Pendants
            </button>
          </div>
          <ProductSection />
          <VirtualAppointment />
        </div>
      )}

      {activeStep === 2 && (
        <div className="py-4">
          <StoneSelectionSection />
        </div>
      )}

      {activeStep === 3 && (
        <div className="py-4">
          <ProductContainer />
        </div>
      )}
    </section>
  );
}
