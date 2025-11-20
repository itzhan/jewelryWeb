"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import CustomizationSteps from "@/components/CustomizationSteps";
import StoneSelectionSection from "@/components/StoneSelectionSection";
import ProductContainer from "@/components/ProductContainer";
import StepOneLanding, { StepOneProduct } from "@/components/StepOneLanding";
import StoneMoreInfo from "@/components/StoneMoreInfo";
import AddSettingModal, { SettingChoice } from "@/components/AddSettingModal";
import {
  fetchPendantProducts,
  resolveBackendImageUrl,
  type BackendStoneItem,
} from "@/lib/backend";

const choiceProductIndex: Record<SettingChoice, number> = {
  necklace: 0,
  ring: 3,
  earring: 6,
};

type StepNumber = 1 | 2 | 3;

export default function StepExperience() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 从 URL 读取初始状态
  const initialStep = parseInt(searchParams.get("step") || "1") as StepNumber;
  const initialStoneId = searchParams.get("stoneId");
  const initialProductId = searchParams.get("productId");

  const [activeStep, setActiveStep] = useState<StepNumber>(initialStep);
  const [detailContext, setDetailContext] = useState<StepNumber | null>(null);
  const [products, setProducts] = useState<StepOneProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<StepOneProduct | null>(
    null
  );
  const [selectedStone, setSelectedStone] = useState<BackendStoneItem | null>(
    null
  );
  const [settingChoice, setSettingChoice] = useState<SettingChoice | null>(
    null
  );
  const [settingIconSvg, setSettingIconSvg] = useState<string | null>(null);
  const [isTypeSelectionOpen, setIsTypeSelectionOpen] = useState(false);

  // 更新 URL 参数的辅助函数
  const updateURL = (params: Record<string, string | number | null>) => {
    const newParams = new URLSearchParams(searchParams.toString());

    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") {
        newParams.delete(key);
      } else {
        newParams.set(key, String(value));
      }
    });

    router.push(`?${newParams.toString()}`, { scroll: false });
  };

  useEffect(() => {
    if (detailContext && detailContext !== activeStep) {
      setDetailContext(null);
    }
  }, [activeStep, detailContext]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const backendProducts = await fetchPendantProducts();
        const mapped: StepOneProduct[] = backendProducts.map((p) => {
          const priceNumber = p.price ?? 0;
          const price = `${
            p.currency || "USD"
          } ${priceNumber.toLocaleString()}`;
          const colors = (p.colors || []) as ("white" | "yellow" | "rose")[];
          return {
            id: p.id,
            name: p.name,
            price,
            image: resolveBackendImageUrl(p.image),
            colors: colors.length ? colors : ["white", "yellow", "rose"],
          };
        });
        setProducts(mapped);
        setSelectedProduct((prev) => prev ?? mapped[0] ?? null);
      } catch (e) {
        // 失败时先不打断流程，保持空列表
        console.error("加载产品列表失败", e);
      }
    };

    loadProducts();
  }, []);

  const goToStep = (
    step: StepNumber,
    extraParams?: Record<string, string | number | null>
  ) => {
    setActiveStep(step);
    updateURL({ step, ...(extraParams || {}) });
  };

  // 包装 setActiveStep，同时更新 URL（用于仅切换步骤场景）
  const changeStep = (step: StepNumber) => {
    goToStep(step);
  };

  const handleStoneMoreInfo = (stone: BackendStoneItem) => {
    setSelectedStone(stone);
    setSelectedProduct((prev) => prev ?? products[0] ?? null);
    setDetailContext(1);
    updateURL({ stoneId: stone.id });
  };

  const handlePendantMoreInfo = (product: StepOneProduct) => {
    setSelectedProduct(product);
    setDetailContext(2);
    updateURL({ productId: product.id });
  };

  // 步骤一列表中「Add pendant」触发：记录当前石头并打开类型选择弹窗
  const handleStoneAddPendantFromGrid = (stone: BackendStoneItem) => {
    setSelectedStone(stone);
    updateURL({ stoneId: stone.id });
    setIsTypeSelectionOpen(true);
  };

  // 从石头详情页中点击「Add Setting」：此时 selectedStone 已经在 state 中
  const handleStoneAddPendant = () => {
    setIsTypeSelectionOpen(true);
  };

  const handleCompleteRing = (product: StepOneProduct) => {
    setSelectedProduct(product);
    setDetailContext(null);
    setSettingChoice("ring");
    goToStep(3, {
      productId: product.id,
      stoneId: selectedStone?.id ?? null,
    });
  };

  const handleTypeSelected = (choice: SettingChoice, iconSvg?: string | null) => {
    setIsTypeSelectionOpen(false);
    setDetailContext(null);
    setSettingChoice(choice);
    setSettingIconSvg(iconSvg ?? null);
    const preferredProduct =
      products[choiceProductIndex[choice]] ?? products[0] ?? null;
    setSelectedProduct(preferredProduct);
    goToStep(2, {
      productId: preferredProduct?.id ?? null,
      stoneId: selectedStone?.id ?? null,
    });
    // 滚动到页面顶部
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTypeSelectionClose = () => {
    setIsTypeSelectionOpen(false);
  };

  const isDetailVisible = detailContext !== null && selectedProduct;

  return (
    <section className="bg-white">
      <AddSettingModal
        open={isTypeSelectionOpen}
        onClose={handleTypeSelectionClose}
        onSelect={handleTypeSelected}
      />
      <div className="max-w-8xl mx-auto px-4 py-8">
        <CustomizationSteps
          activeStep={activeStep}
          onStepChange={changeStep}
          selectedStone={selectedStone}
          selectedProduct={selectedProduct}
          settingChoice={settingChoice}
        />
      </div>

      {isDetailVisible ? (
        <StoneMoreInfo
          product={selectedProduct}
          stone={detailContext === 1 ? selectedStone : null}
          onBack={() => setDetailContext(null)}
          detailSource={
            detailContext === 1 || detailContext === 2
              ? detailContext
              : undefined
          }
          onAddSetting={detailContext === 1 ? handleStoneAddPendant : undefined}
        />
      ) : activeStep === 1 ? (
        <div className="py-4">
          <StoneSelectionSection
            selectedProduct={selectedProduct}
            onMoreInfo={handleStoneMoreInfo}
            onAddPendant={handleStoneAddPendantFromGrid}
          />
        </div>
      ) : activeStep === 2 ? (
        <div>
          <StepOneLanding
            products={products}
            onMoreInfo={handlePendantMoreInfo}
            onCompleteRing={handleCompleteRing}
          />
        </div>
      ) : null}

      {activeStep === 3 && (
        <div className="py-4">
          <ProductContainer
            productId={selectedProduct?.id ?? 2}
            stoneId={selectedStone?.id}
            settingType={settingChoice}
            settingIconSvg={settingIconSvg}
            stoneIconSvg={selectedStone?.shapeIconSvg}
          />
        </div>
      )}
    </section>
  );
}
