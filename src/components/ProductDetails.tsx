"use client";

import { useMemo, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type {
  StoneDetailDto,
  MaterialDto,
  StoneFilterOption,
} from "@/lib/backend";
import { fetchMaterials, fetchStoneFilters, type BackendStoneType } from "@/lib/backend";
import { buildCertificateLink } from "@/lib/certificate";
import {
  Heart,
  Plane,
  Shield,
  RotateCcw,
  Award,
  Gem,
  Package,
  Info,
  ChevronDown,
  MessageCircle,
  Plus,
  Lock,
  Diamond,
} from "lucide-react";

export const knowSettingStats = [
  { label: "Gold", value: "58.5%", color: "bg-amber-400" },
  { label: "Silver", value: "6.1%", color: "bg-gray-400" },
  { label: "Copper", value: "30.5%", color: "bg-orange-500" },
  { label: "Zinc", value: "4.7%", color: "bg-gray-300" },
];

const getPendantDetails = (
  centerStoneShape?: string | null,
  centerStoneShapeIconSvg?: string | null
) => {
  const centerShapeLabel =
    centerStoneShape && centerStoneShape.trim().length > 0
      ? centerStoneShape
      : "—";
  const centerShapeValue =
    centerStoneShapeIconSvg && centerShapeLabel !== "—" ? (
      <span className="inline-flex items-center gap-2">
        <span
          className="inline-flex h-5 w-5 items-center justify-center text-gray-600"
          dangerouslySetInnerHTML={{ __html: centerStoneShapeIconSvg }}
        />
        <span>{centerShapeLabel}</span>
      </span>
    ) : (
      centerShapeLabel
    );

  return [
    { label: "SKU", value: "243Q-DP-R-YG-14" },
    {
      label: "Center Stone Shape",
      value: centerShapeValue,
    },
    { label: "Material", value: "14k Yellow Gold" },
    { label: "Chain Length", value: "18 in adjustable" },
  ];
};

export const accordionOrder = ["pendant", "shipping", "returns"] as const;
export type AccordionSection = (typeof accordionOrder)[number];

export const buildAccordionContent = (
  centerStoneShape?: string | null,
  centerStoneShapeIconSvg?: string | null
): Record<
  AccordionSection,
  { title: string; icon: JSX.Element; body: JSX.Element }
> => ({
  pendant: {
    title: "Pendant Details",
    icon: <Gem className="w-4 h-4 text-gray-600" />,
    body: (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
        {getPendantDetails(centerStoneShape, centerStoneShapeIconSvg).map(
          (item) => (
          <div key={item.label}>
            <div className="text-xs uppercase tracking-wide text-gray-400">
              {item.label}
            </div>
            <div className="font-medium text-gray-900">{item.value}</div>
          </div>
        ))}
      </div>
    ),
  },
  shipping: {
    title: "Shipping",
    icon: <Package className="w-4 h-4 text-gray-600" />,
    body: (
      <p className="text-sm text-gray-600 leading-relaxed">
        This item is made to order and takes 3–4 weeks to craft. We ship FedEx
        Priority Overnight with signature required and full insurance for every
        pendant that leaves our studio.
      </p>
    ),
  },
  returns: {
    title: "Return Policy",
    icon: <RotateCcw className="w-4 h-4 text-gray-600" />,
    body: (
      <p className="text-sm text-gray-600 leading-relaxed">
        Received an item you don’t love? WATSONGEM is proud to offer free returns
        within <strong>35 days</strong> from receiving your item. Contact our
        support team to issue a return label and we’ll take care of the rest.
      </p>
    ),
  },
});

// 石头 more info 场景下使用的 Diamond Details 样式
const getDiamondAccordionContent = (
  stoneDetail: StoneDetailDto | null,
  baseAccordionContent: ReturnType<typeof buildAccordionContent>,
  certificateLink: string | null
): Record<
  AccordionSection,
  { title: string; icon: JSX.Element; body: JSX.Element }
> => ({
  pendant: {
    title: "Diamond Details",
    icon: <Diamond className="w-4 h-4 text-gray-600" />,
    body: (
      <div className="flex flex-col gap-6 text-sm text-gray-700 sm:flex-row">
        {/* 左侧参数列表 */}
        <div className="flex-1 grid grid-cols-[auto,1fr] gap-x-6 gap-y-2">
          <span className="text-gray-500">Carat</span>
          <span className="font-semibold text-gray-900">
            {stoneDetail?.carat.toFixed(2) || "-"}
          </span>

          <span className="text-gray-500">Shape</span>
          <span className="font-semibold text-gray-900">
            {stoneDetail?.shape || "-"}
          </span>

          <span className="text-gray-500">Color</span>
          <span className="font-semibold text-gray-900">
            {stoneDetail?.color || "-"}
          </span>

          <span className="text-gray-500">Clarity</span>
          <span className="font-semibold text-gray-900">
            {stoneDetail?.clarity || "-"}
          </span>

          <span className="text-gray-500">L/W (mm)</span>
          <span className="font-semibold text-gray-900">
            {stoneDetail?.externalM1 && stoneDetail?.externalM2
              ? `${stoneDetail.externalM1.toFixed(
                  2
                )}/${stoneDetail.externalM2.toFixed(2)}`
              : "-"}
          </span>

          <span className="text-gray-500">Ratio</span>
          <span className="font-semibold text-gray-900">
            {stoneDetail?.ratio?.toFixed(2) || "-"}
          </span>

          <span className="text-gray-500">Cut</span>
          <span className="font-semibold text-gray-900">
            {stoneDetail?.cut || "-"}
          </span>

          <span className="text-gray-500">Depth (mm)</span>
          <span className="font-semibold text-gray-900">
            {stoneDetail?.externalM3?.toFixed(2) || "-"}
          </span>
        </div>

        {/* 右侧证书卡片 */}
        <div className="w-full sm:max-w-xs rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 p-6 shadow-sm flex flex-col items-center justify-center text-center">
          <img
            src="https://cdn.shopify.com/oxygen-v2/24658/9071/18525/2676729/build/_assets/kzr-icon-igi-crt-GAZVFCK3.svg"
            width="400"
            height="400"
            loading="eager"
            alt="Diamond certificate Round shape desktop image "
            className="DiamondCertificate__Image w-full aspect-square fadeIn object-cover max-w-[8rem] mb-4"
          />
          <p className="text-[#937D67] text-2xl leading-tight uppercase font-bold">
            {stoneDetail?.type === "lab_grown" ? "Lab Diamond" : "Natural Diamond"}
          </p>
          {certificateLink ? (
            <a
              className="cursor-pointer text-gray-600 text-base leading-tight font-medium mt-2 underline hover:text-gray-900 transition"
              href={certificateLink}
              target="_blank"
              rel="noreferrer"
            >
              View Certificate
            </a>
          ) : (
            <span className="text-gray-400 text-sm mt-2">
              Certificate unavailable
            </span>
          )}
        </div>
      </div>
    ),
  },
  shipping: baseAccordionContent.shipping,
  returns: baseAccordionContent.returns,
});

const stepOneStats = [
  { label: "Carat", value: "0.5" },
  { label: "Color", value: "1" },
  { label: "Clarity", value: "VS1" },
  { label: "Cut", value: "Excellent" },
  { label: "Ratio", value: "1.0" },
  { label: "L/W (mm)", value: "5.04/5.02" },
];

interface ProductDetailsProps {
  isStepOneVariant?: boolean;
  onPrimaryAction?: () => void;
  primaryActionLabel?: string;
  showBuySettingButton?: boolean;
  stoneDetail?: StoneDetailDto | null;
  centerStoneShape?: string | null;
  centerStoneType?: BackendStoneType | null;
  lockCenterStoneShape?: boolean;
}

export default function ProductDetails({
  isStepOneVariant = false,
  onPrimaryAction,
  primaryActionLabel,
  showBuySettingButton = true,
  stoneDetail,
  centerStoneShape,
  centerStoneType,
  lockCenterStoneShape = false,
}: ProductDetailsProps) {
  const [selectedShape, setSelectedShape] = useState(
    centerStoneShape?.trim() || "Round"
  );
  const [selectedMetalId, setSelectedMetalId] = useState<number | null>(null);
  const [showMoreMetals, setShowMoreMetals] = useState(false);
  const [openSections, setOpenSections] = useState<
    Record<AccordionSection, boolean>
  >({
    pendant: true,
    shipping: false,
    returns: false,
  });

  // 从后端获取形状和材料数据
  const [shapes, setShapes] = useState<StoneFilterOption[]>([]);
  const [materials, setMaterials] = useState<MaterialDto[]>([]);
  const [loading, setLoading] = useState(false);
  const certificateLink = buildCertificateLink(stoneDetail);

  useEffect(() => {
    if (isStepOneVariant) return; // 步骤一不需要加载这些数据

    const loadFilters = async () => {
      try {
        setLoading(true);

        const [shapesData, materialsData] = await Promise.all([
          fetchStoneFilters(),
          fetchMaterials(),
        ]);
        setShapes(shapesData.shapes || []);
        setMaterials(materialsData || []);

        if (!lockCenterStoneShape && shapesData.shapes?.length > 0 && !selectedShape) {
          setSelectedShape(shapesData.shapes[0].label);
        }
        if (materialsData?.length > 0 && selectedMetalId === null) {
          setSelectedMetalId(materialsData[0].id);
        }
      } catch (error) {
        console.error("加载筛选器数据失败", error);
      } finally {
        setLoading(false);
      }
    };

    loadFilters();
  }, [isStepOneVariant, selectedShape, selectedMetalId, lockCenterStoneShape]);

  useEffect(() => {
    if (lockCenterStoneShape && centerStoneShape) {
      setSelectedShape(centerStoneShape);
    }
  }, [lockCenterStoneShape, centerStoneShape]);

  const formatDimension = (value?: number) =>
    value !== undefined && value !== null ? value.toFixed(2) : "-";

  const actualStats = stoneDetail
    ? [
        { label: "Carat", value: stoneDetail.carat.toFixed(2) },
        { label: "Color", value: stoneDetail.color },
        { label: "Clarity", value: stoneDetail.clarity },
        { label: "Cut", value: stoneDetail.cut },
        { label: "Ratio", value: stoneDetail.ratio?.toFixed(2) || "-" },
        {
          label: "L/W (mm)",
          value: `${formatDimension(stoneDetail.externalM1)}/${formatDimension(
            stoneDetail.externalM2
          )}`,
        },
      ]
    : stepOneStats;

  const statsRows = [actualStats.slice(0, 3), actualStats.slice(3)];
  const primaryLabel = primaryActionLabel ?? "Add Center Stone";
  const shapeLabel = lockCenterStoneShape
    ? centerStoneShape?.trim() || stoneDetail?.shape?.trim() || "—"
    : centerStoneShape?.trim() || selectedShape;
  const selectedShapeIconSvg = useMemo(() => {
    if (!shapeLabel || shapeLabel === "—") return null;
    if (lockCenterStoneShape && stoneDetail?.shapeIconSvg) {
      return stoneDetail.shapeIconSvg;
    }
    const normalized = shapeLabel.toLowerCase();
    const match = shapes.find(
      (shape) =>
        shape.label?.toLowerCase() === normalized ||
        shape.code?.toLowerCase() === normalized
    );
    return match?.iconSvg ?? null;
  }, [shapeLabel, shapes, lockCenterStoneShape, stoneDetail?.shapeIconSvg]);

  const baseAccordionContent = buildAccordionContent(
    shapeLabel,
    selectedShapeIconSvg
  );

  const primaryShapes = [
    {
      name: "Round",
      svg: (
        <svg viewBox="0 0 40 40" className="w-8 h-8">
          <circle
            cx="20"
            cy="20"
            r="12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      ),
    },
    {
      name: "Oval",
      svg: (
        <svg viewBox="0 0 40 40" className="w-8 h-8">
          <ellipse
            cx="20"
            cy="20"
            rx="8"
            ry="12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      ),
    },
    {
      name: "Pear",
      svg: (
        <svg viewBox="0 0 40 40" className="w-8 h-8">
          <path
            d="M20 10 L28 20 Q28 28, 20 32 Q12 28, 12 20 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      ),
    },
    {
      name: "Heart",
      svg: (
        <svg viewBox="0 0 40 40" className="w-8 h-8">
          <path
            d="M20 32 L12 24 Q8 20, 12 16 Q16 12, 20 16 Q24 12, 28 16 Q32 20, 28 24 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      ),
    },
  ];

  const extraShapes = [
    {
      name: "Emerald",
      svg: (
        <svg viewBox="0 0 40 40" className="w-8 h-8">
          <rect
            x="12"
            y="8"
            width="16"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      ),
    },
    {
      name: "Marquise",
      svg: (
        <svg viewBox="0 0 40 40" className="w-8 h-8">
          <path
            d="M20 6 Q32 20 20 34 Q8 20 20 6 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      ),
    },
    {
      name: "Princess",
      svg: (
        <svg viewBox="0 0 40 40" className="w-8 h-8">
          <polygon
            points="12,8 28,8 32,20 28,32 12,32 8,20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      ),
    },
  ];

  const primaryMetals = [
    {
      name: "White Gold",
      label: "14K",
      color: "bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300",
    },
    {
      name: "Yellow Gold",
      label: "14K",
      color:
        "bg-gradient-to-br from-yellow-200 to-yellow-300 border-yellow-400",
    },
    {
      name: "Rose Gold",
      label: "10K",
      color: "bg-gradient-to-br from-rose-200 to-rose-300 border-rose-400",
    },
    {
      name: "Rose Gold",
      label: "18K",
      color: "bg-gradient-to-br from-rose-300 to-rose-400 border-rose-500",
    },
  ];

  const extraMetals = [
    {
      name: "Platinum",
      label: "PT",
      color: "bg-gradient-to-br from-gray-200 to-gray-300 border-gray-400",
    },
    {
      name: "White Gold",
      label: "18K",
      color: "bg-gradient-to-br from-gray-100 to-white border-gray-200",
    },
    {
      name: "Yellow Gold",
      label: "18K",
      color:
        "bg-gradient-to-br from-yellow-200 to-yellow-100 border-yellow-300",
    },
  ];

  const toggleSection = (section: AccordionSection) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const stoneTitle = stoneDetail
    ? `${stoneDetail.carat.toFixed(2)}ct ${shapeLabel} ${
        stoneDetail.type === "lab_grown" ? "Lab-Grown" : "Natural"
      } Stone`
    : "The Amelia";

  const stonePrice = stoneDetail
    ? `${stoneDetail.currency} ${stoneDetail.price.toLocaleString()}`
    : null;

  return (
    <div className="flex flex-col">
      <h1 className="text-2xl sm:text-4xl mb-2">{stoneTitle}</h1>
      {isStepOneVariant ? (
        <>
          {/* Mobile layout */}
          <div className="md:hidden space-y-4">
            {stonePrice && (
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.35em] text-gray-400">
                    Price
                  </span>
                  <span className="text-lg font-semibold text-gray-900">
                    {stonePrice}
                  </span>
                </div>
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {actualStats.slice(0, 4).map((stat) => (
                    <div
                      key={`chip-${stat.label}`}
                      className="shrink-0 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600"
                    >
                      {stat.label}: {stat.value}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              {actualStats.map((stat) => (
                <div
                  key={`mobile-stat-${stat.label}`}
                  className="rounded-2xl border border-gray-200 bg-white px-3 py-3 shadow-sm"
                >
                  <p className="text-[10px] uppercase tracking-[0.35em] text-gray-400">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-base font-semibold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
            {stoneDetail?.externalSupplement1 && (
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-semibold mb-2">Description</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {stoneDetail.externalSupplement1}
                </p>
              </div>
            )}
          </div>

          {/* Desktop layout */}
          <div className="hidden md:block">
            {stonePrice && (
              <p className="text-2xl sm:text-4xl font-bold mb-4">{stonePrice}</p>
            )}
            <div className="rounded-[32px] border border-gray-200 overflow-hidden mb-6">
              {statsRows.map((row, rowIndex) => (
                <div
                  key={`row-${rowIndex}`}
                  className={cn(
                    "grid grid-cols-3 text-center bg-white",
                    rowIndex < statsRows.length - 1 && "border-b border-gray-200"
                  )}
                >
                  {row.map((stat, statIndex) => (
                    <div
                      key={stat.label}
                      className={cn(
                        "px-4 sm:px-6 py-4 sm:py-5",
                        statIndex !== 0 && "border-l border-gray-200"
                      )}
                    >
                      <p className="text-lg sm:text-xl font-normal text-gray-900 tracking-[0.08em] leading-tight font-[Playfair_Display]">
                        {stat.value}
                      </p>
                      <p className="text-[0.6rem] uppercase tracking-[0.65em] text-gray-500 mt-1">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            {stoneDetail?.externalSupplement1 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  {stoneDetail.externalSupplement1}
                </p>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <p className="text-2xl sm:text-4xl font-bold mb-4">$670</p>

          <p className="text-gray-700 mb-6 leading-relaxed">
            Stylish and modern, The Amelia has a bezel setting that showcases
            the fiery brilliance of your chosen diamond. With its simple, yet
            striking design and matching cable chain necklace, this pendant is
            the perfect accessory for a day at the office or night on the town.
          </p>
        </>
      )}

      {!isStepOneVariant && (
        <>
          {/* Center Stone Type */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">
              Center Stone Type:{" "}
              <span className="font-normal">
                {stoneDetail
                  ? stoneDetail.type === "lab_grown"
                    ? "Lab Diamond"
                    : "Natural Diamond"
                  : centerStoneType
                    ? centerStoneType === "lab_grown"
                      ? "Lab Diamond"
                      : "Natural Diamond"
                    : "—"}
              </span>
            </h3>
          </div>

          {/* Center Stone Shape */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">
              Center Stone Shape:{" "}
              <span className="font-normal">{shapeLabel}</span>
            </h3>
            <div className="flex gap-2 flex-wrap">
              <div
                className={`flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 border-2 rounded-lg ${
                  shapeLabel === "—"
                    ? "border-gray-300"
                    : "border-black bg-gray-50"
                }`}
              >
                {selectedShapeIconSvg ? (
                  <div
                    className="mb-1 w-7 h-7 sm:w-8 sm:h-8"
                    dangerouslySetInnerHTML={{ __html: selectedShapeIconSvg }}
                  />
                ) : (
                  <div className="mb-1 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-gray-400">
                    ◆
                  </div>
                )}
                <span className="text-xs">{shapeLabel}</span>
              </div>
            </div>
          </div>

          {/* Material */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">
              Material: <span className="font-normal">{materials.find(m => m.id === selectedMetalId)?.name || ""}</span>
            </h3>
            <div className="flex gap-2 flex-wrap">
              {materials.slice(0, 4).map((material) => (
                <button
                  key={material.id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedMetalId(material.id);
                  }}
                  className={`flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 border-2 rounded-lg transition-colors ${
                    selectedMetalId === material.id
                      ? "border-black bg-gray-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {material.svgIcon ? (
                    <div
                      className="mb-1 w-8 h-8 sm:w-10 sm:h-10"
                      dangerouslySetInnerHTML={{ __html: material.svgIcon }}
                    />
                  ) : (
                    <div className="mb-1 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300"></div>
                  )}
                  <span className="text-xs text-center leading-tight">
                    {material.name}
                  </span>
                </button>
              ))}
              {materials.length > 4 && (
                <button
                  className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                  onClick={() => setShowMoreMetals((prev) => !prev)}
                >
                  <span className="text-2xl text-gray-400">
                    {showMoreMetals ? "−" : "+"}
                  </span>
                </button>
              )}
            </div>
            {showMoreMetals && materials.length > 4 && (
              <div className="flex gap-2 flex-wrap mt-3">
                {materials.slice(4).map((material) => (
                  <button
                    key={material.id}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedMetalId(material.id);
                    }}
                    className={`flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 border-2 rounded-lg transition-colors ${
                      selectedMetalId === material.id
                        ? "border-black bg-gray-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {material.svgIcon ? (
                      <div
                        className="mb-1 w-8 h-8 sm:w-10 sm:h-10"
                        dangerouslySetInnerHTML={{ __html: material.svgIcon }}
                      />
                    ) : (
                      <div className="mb-1 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300"></div>
                    )}
                    <span className="text-xs text-center leading-tight">
                      {material.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {!isStepOneVariant && (
        <>
          {/* Price and Shipping */}
          <div className="border-t pt-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-semibold">Total Price</span>
              <span className="text-2xl sm:text-3xl font-bold">$670</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              <span>Ships in 3-4 weeks</span>
            </div>
          </div>
        </>
      )}

      {/* Action Buttons */}
      <div className="space-y-3 mb-6">
        <button
          type="button"
          onClick={onPrimaryAction}
          className="w-full bg-black text-white py-4 rounded-full font-medium hover:bg-gray-900 transition-all duration-300 flex items-center justify-between px-8 group relative overflow-hidden shadow-lg hover:shadow-xl"
        >
          <Heart className="w-5 h-5 transition-all group-hover:scale-110 group-hover:fill-white" />
          <span className="relative z-10 text-base">{primaryLabel}</span>
          <MessageCircle className="w-5 h-5 transition-all group-hover:scale-110" />
        </button>
        {showBuySettingButton && (
          <button className="w-full border-2 border-black py-4 rounded-full transition-all duration-300 font-semibold hover:bg-black hover:text-white flex items-center justify-between px-8 group shadow-sm hover:shadow-md">
            <div className="text-left">
              <span className="block text-base">Buy Setting Only</span>
              <span className="text-xs font-normal text-gray-600 group-hover:text-white/80">
                *Center stone not included
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Lock className="w-4 h-4 transition-all group-hover:scale-110" />
              <Plus className="w-5 h-5 transition-all group-hover:rotate-90 group-hover:scale-110" />
            </div>
          </button>
        )}
        <div className="text-center text-sm">
          Pay in 4 interest-free installments of $167.50{" "}
          <a href="#" className="underline">
            Learn more
          </a>
        </div>
      </div>

      {/* Add to wish list */}
      <button className="flex items-center justify-center gap-2 mb-6 py-2 hover:opacity-70">
        <Heart className="w-5 h-5" />
        <span>Add to wish list</span>
      </button>

      {/* Features */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 text-center">
        <div>
          <Plane className="w-8 h-8 mx-auto mb-2" />
          <div className="text-xs font-semibold">Overnight</div>
          <div className="text-xs text-gray-600">Shipping</div>
        </div>
        <div>
          <Shield className="w-8 h-8 mx-auto mb-2" />
          <div className="text-xs font-semibold">Lifetime</div>
          <div className="text-xs text-gray-600">Warranty</div>
        </div>
        <div>
          <RotateCcw className="w-8 h-8 mx-auto mb-2" />
          <div className="text-xs font-semibold">30 Days</div>
          <div className="text-xs text-gray-600">Free Return</div>
        </div>
        <div>
          <Award className="w-8 h-8 mx-auto mb-2" />
          <div className="text-xs font-semibold">Certificate</div>
          <div className="text-xs text-gray-600">& Appraisal</div>
        </div>
      </div>

      {/* Know your setting / Your Diamond Info */}
      {isStepOneVariant ? (
        <div className="rounded-3xl border border-gray-200 bg-[#f6f6f6] p-6 shadow-sm mb-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-gray-600">
              <Diamond className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Your Diamond Info
            </h3>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Carat */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-2 shadow-sm">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.4em] text-gray-400">
                <span className="text-amber-500">carat</span>
              </div>
              <p className="text-2xl sm:text-3xl font-semibold text-gray-900">{stoneDetail?.carat.toFixed(2)}</p>
              <p className="text-xs text-gray-500">
                Universal measurement unit for diamonds
              </p>
            </div>

            {/* Color */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-2 shadow-sm">
              <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.4em] text-gray-400">
                <span className="text-pink-500">color</span>
                <span className="text-gray-500">{stoneDetail?.color}</span>
              </div>
              <div
                className="mt-2 h-5 w-full rounded-md border border-gray-200 overflow-hidden"
                style={{
                  background: "linear-gradient(90deg, rgb(255, 254, 235) 10%, rgb(255, 255, 255) 90%)"
                }}
              />
              <p className="text-xs text-gray-500">
                {stoneDetail?.color === 'D' ? 'Absolutely colorless' :
                 stoneDetail?.color === 'E' || stoneDetail?.color === 'F' ? 'Colorless' :
                 stoneDetail?.color === 'G' || stoneDetail?.color === 'H' ? 'Near colorless' :
                 stoneDetail?.color === 'I' || stoneDetail?.color === 'J' ? 'Near colorless with slight warmth' :
                 'Noticeable color'}
              </p>
            </div>

            {/* Clarity */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-2 shadow-sm">
              <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.4em] text-gray-400">
                <span className="text-indigo-500">clarity</span>
                <span className="text-gray-500">{stoneDetail?.clarity}</span>
              </div>
              <div
                className="mt-2 h-5 w-full rounded-md border border-gray-200 overflow-hidden"
                style={{
                  background: 'url("https://cdn.shopify.com/s/files/1/0039/6994/1568/files/clarity-filter-hint.png?v=1743157435") center center / cover no-repeat'
                }}
              />
              <p className="text-xs text-gray-500">
                {stoneDetail?.clarity?.startsWith('FL') || stoneDetail?.clarity?.startsWith('IF') ? 'No inclusions visible' :
                 stoneDetail?.clarity?.startsWith('VVS') ? 'Very very slight inclusions' :
                 stoneDetail?.clarity?.startsWith('VS') ? 'Very slight inclusions' :
                 stoneDetail?.clarity?.startsWith('SI') ? 'Slight inclusions' :
                 'Inclusions may be visible'}
              </p>
            </div>

            {/* Cut */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-2 shadow-sm">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.4em] text-gray-400">
                <span className="text-emerald-500">cut</span>
              </div>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">{stoneDetail?.cut}</p>
              <p className="text-xs text-gray-500">
                {stoneDetail?.cut?.toLowerCase() === 'excellent' || stoneDetail?.cut?.toLowerCase() === 'ideal' ? 'Incredible fire and brilliance' :
                 stoneDetail?.cut?.toLowerCase() === 'very good' ? 'Exceptional brilliance' :
                 stoneDetail?.cut?.toLowerCase() === 'good' ? 'Good brilliance' :
                 'Standard brilliance'}
              </p>
            </div>

            {/* Dimensions */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-2 shadow-sm">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.4em] text-gray-400">
                <span className="text-cyan-500">dimensions (mm)</span>
              </div>
              <p className="text-2xl sm:text-3xl font-semibold text-gray-900">
                {stoneDetail?.externalM1 && stoneDetail?.externalM2
                  ? `${stoneDetail.externalM1.toFixed(2)}x${stoneDetail.externalM2.toFixed(2)}`
                  : 'N/A'}
              </p>
              <div className="flex items-center gap-2 text-gray-500">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 40 40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                >
                  <rect x="8" y="12" width="24" height="16" rx="4" />
                  <path d="M8 28l7-6 7 6" />
                  <line x1="8" y1="28" x2="16" y2="28" />
                </svg>
                <span className="text-xs font-medium">Ratio: {stoneDetail?.ratio.toFixed(2)}</span>
              </div>
            </div>

            {/* Certification */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-2 shadow-sm">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.4em] text-gray-400">
                <span className="text-yellow-500">certification</span>
              </div>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">{stoneDetail?.externalCertType || stoneDetail?.certificate || 'N/A'}</p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs text-gray-700">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-yellow-400 bg-yellow-50 text-[10px] font-semibold text-yellow-700">
                    {stoneDetail?.type === 'lab_grown' ? 'LAB' : 'NAT'}
                  </span>
                  <span className="uppercase tracking-[0.25em] text-[10px] text-yellow-700">
                    {stoneDetail?.type === 'lab_grown' ? 'Lab-Grown' : 'Natural'} diamond
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6 space-y-6 shadow-sm mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center">
              <Info className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Know your setting
              </p>
              <h3 className="text-xl font-semibold text-gray-900">
                14k Yellow Gold
              </h3>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6">
            <div className="relative w-32 h-32 mx-auto sm:mx-0">
              <div
                className="w-full h-full rounded-full"
                style={{
                  background:
                    "conic-gradient(#fbbf24 0% 58.5%, #ea580c 58.5% 89%, #fde68a 89% 95%, #d4d4d8 95% 100%)",
                }}
              />
              <div className="absolute inset-4 bg-gray-50 rounded-full flex items-center justify-center text-gray-800 font-semibold">
                14k
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {knowSettingStats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2 text-gray-700">
                    <span
                      className={`w-3 h-3 rounded-full ${stat.color} ring-2 ring-white`}
                    />
                    {stat.label}
                  </div>
                  <span className="font-semibold text-gray-900">
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-600 italic">
            The secret sauce that makes this piece.
          </p>
        </div>
      )}

      {/* Accordion sections */}
      <div className="space-y-4">
        {accordionOrder.map((key) => {
          const item = (
            isStepOneVariant
              ? getDiamondAccordionContent(
                  stoneDetail ?? null,
                  baseAccordionContent,
                  certificateLink
                )
              : baseAccordionContent
          )[key];
          const isOpen = openSections[key];

          return (
            <div
              key={key}
              className="rounded-2xl border border-gray-200 bg-white shadow-sm"
            >
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left"
                onClick={() => toggleSection(key)}
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className="font-medium text-gray-900">
                    {item.title}
                  </span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={cn(
                  "px-5 border-t border-gray-100 overflow-hidden transition-all duration-300",
                  isOpen
                    ? "max-h-[400px] opacity-100 py-4"
                    : "max-h-0 opacity-0 py-0"
                )}
              >
                <div className="pt-1 text-sm text-gray-700">{item.body}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
