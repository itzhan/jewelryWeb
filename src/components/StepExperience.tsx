"use client";

import { useState } from "react";
import CustomizationSteps from "@/components/CustomizationSteps";
import ProductSection from "@/components/ProductSection";
import VirtualAppointment from "@/components/VirtualAppointment";
import StoneSelectionSection from "@/components/StoneSelectionSection";
import ProductContainer from "@/components/ProductContainer";

type StepNumber = 1 | 2 | 3;

export default function StepExperience() {
  const [activeStep, setActiveStep] = useState<StepNumber>(1);

  return (
    <section className="bg-white">
      <div className="max-w-8xl mx-auto px-4 py-8">
        <CustomizationSteps activeStep={activeStep} onStepChange={setActiveStep} />
      </div>

      {activeStep === 1 && (
        <div className="max-w-7xl mx-auto px-4 space-y-8 pb-8">
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
