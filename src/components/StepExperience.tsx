"use client";

import { useEffect, useState } from "react";
import CustomizationSteps from "@/components/CustomizationSteps";
import StoneSelectionSection from "@/components/StoneSelectionSection";
import ProductContainer from "@/components/ProductContainer";
import StepOneLanding, {
  StepOneProduct,
  pendantProducts,
} from "@/components/StepOneLanding";
import StoneMoreInfo from "@/components/StoneMoreInfo";

type StepNumber = 1 | 2 | 3;

export default function StepExperience() {
  const [activeStep, setActiveStep] = useState<StepNumber>(1);
  const [detailContext, setDetailContext] = useState<StepNumber | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<StepOneProduct | null>(
    pendantProducts[0] ?? null
  );

  useEffect(() => {
    if (detailContext && detailContext !== activeStep) {
      setDetailContext(null);
    }
  }, [activeStep, detailContext]);

  const handleStoneMoreInfo = () => {
    setSelectedProduct((prev) => prev ?? (pendantProducts[0] ?? null));
    setDetailContext(1);
  };

  const handlePendantMoreInfo = (product: StepOneProduct) => {
    setSelectedProduct(product);
    setDetailContext(2);
  };

  const handleStoneAddPendant = () => {
    setActiveStep(2);
    setDetailContext(null);
  };

  const handleCompleteRing = () => {
    setActiveStep(3);
    setDetailContext(null);
  };

  const isDetailVisible = detailContext !== null && selectedProduct;

  return (
    <section className="bg-white">
      <div className="max-w-8xl mx-auto px-4 py-8">
        <CustomizationSteps activeStep={activeStep} onStepChange={setActiveStep} />
      </div>

      {isDetailVisible ? (
        <StoneMoreInfo
          product={selectedProduct}
          onBack={() => setDetailContext(null)}
          detailSource={detailContext === 1 || detailContext === 2 ? detailContext : undefined}
          onAddSetting={detailContext === 1 ? handleStoneAddPendant : undefined}
        />
      ) : activeStep === 1 ? (
        <div className="py-4">
          <StoneSelectionSection
            selectedProduct={selectedProduct}
            onMoreInfo={handleStoneMoreInfo}
            onAddPendant={handleStoneAddPendant}
          />
        </div>
      ) : activeStep === 2 ? (
        <div>
          <StepOneLanding
            onMoreInfo={handlePendantMoreInfo}
            onCompleteRing={handleCompleteRing}
          />
        </div>
      ) : null}

      {activeStep === 3 && (
        <div className="py-4">
          <ProductContainer />
        </div>
      )}
    </section>
  );
}
