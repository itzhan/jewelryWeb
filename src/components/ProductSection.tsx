"use client";

import ProductDetails from "./ProductDetails";
import type { StoneDetailDto } from "@/lib/backend";
import { resolveBackendImageUrl } from "@/lib/backend";
import { buildCertificateLink } from "@/lib/certificate";

type GalleryImage = {
  url: string;
  alt: string;
  badge?: string;
  aspect?: "square" | "portrait";
};

const defaultGalleryImages: GalleryImage[] = [
  {
    url: "https://ext.same-assets.com/1796274538/3435028552.jpeg",
    alt: "Pendant front view",
    badge: "Shown with 2 ct",
    aspect: "square",
  },
  {
    url: "https://ext.same-assets.com/1796274538/2939435500.jpeg",
    alt: "Pendant on model",
    badge: "Shown with 2 ct",
    aspect: "portrait",
  },
  {
    url: "https://ext.same-assets.com/1796274538/1054153675.jpeg",
    alt: "Pendant close-up on model",
    aspect: "portrait",
  },
  {
    url: "https://ext.same-assets.com/1796274538/1474526449.jpeg",
    alt: "Pendant angled view",
    badge: "Shown with 2 ct",
    aspect: "square",
  },
];

const getAspectClass = (aspect?: GalleryImage["aspect"]) => "aspect-square";

type ProductSectionProps = {
  isStepOneDetails?: boolean;
  onPrimaryAction?: () => void;
  primaryActionLabel?: string;
  showBuySettingButton?: boolean;
  stoneDetail?: StoneDetailDto | null;
  productImages?: GalleryImage[];
  centerStoneShape?: string | null;
  lockCenterStoneShape?: boolean;
};

export default function ProductSection({
  isStepOneDetails = false,
  onPrimaryAction,
  primaryActionLabel,
  showBuySettingButton = true,
  stoneDetail,
  productImages,
  centerStoneShape,
  lockCenterStoneShape = false,
}: ProductSectionProps) {
  const certificateLink = buildCertificateLink(stoneDetail);
  // 如果是步骤一详情页且有石头数据，使用石头图片；否则使用产品图片或默认图片
  const images =
    isStepOneDetails && stoneDetail?.images?.length
      ? (() => {
          const primary = stoneDetail.images.find((img) => img.isPrimary);
          const others = stoneDetail.images
            .filter((img) => img !== primary)
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
          const ordered = primary ? [primary, ...others] : others;
          return ordered.map((img) => ({
            url: resolveBackendImageUrl(img.url),
            alt: img.alt,
            badge: img.badge,
            aspect: img.aspect,
          }));
        })()
      : productImages || defaultGalleryImages;

  const has360Video = isStepOneDetails && stoneDetail?.externalVideoUrl;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.6fr,1fr] gap-12 mb-12">
      {/* Product Images */}
      <div className="relative lg:sticky lg:top-10 self-start space-y-4 pb-16">
        <div className="grid grid-cols-2 gap-4 rounded-[36px]">
          {/* First image */}
          {images[0] && (
            <figure
              className={`relative ${getAspectClass(
                images[0].aspect
              )} rounded-[32px] overflow-hidden bg-gray-50 shadow-[0_18px_45px_rgba(15,23,42,0.08)]`}
            >
              <img
                src={images[0].url}
                alt={images[0].alt}
                className="h-full w-full object-cover"
              />
              {images[0].badge && (
                <span className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-700 shadow-sm">
                  {images[0].badge}
                </span>
              )}
            </figure>
          )}

          {/* Second position - 360 video if available, else image */}
          {has360Video ? (
            <div className="relative aspect-square rounded-[32px] overflow-hidden bg-gray-50 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
              <iframe
                src={`${stoneDetail.externalVideoUrl}${stoneDetail.externalVideoUrl?.includes('?') ? '&' : '?'}controls=0&ui=minimal`}
                className="w-full h-full border-0"
                title="360° Stone View"
                allow="fullscreen"
                loading="lazy"
                style={{ pointerEvents: 'auto' }}
              />
            </div>
          ) : (
            images[1] && (
              <figure
                className={`relative ${getAspectClass(
                  images[1].aspect
                )} rounded-[32px] overflow-hidden bg-gray-50 shadow-[0_18px_45px_rgba(15,23,42,0.08)]`}
              >
                <img
                  src={images[1].url}
                  alt={images[1].alt}
                  className="h-full w-full object-cover"
                />
                {images[1].badge && (
                  <span className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-700 shadow-sm">
                    {images[1].badge}
                  </span>
                )}
              </figure>
            )
          )}

          {/* Third image */}
          {images[2] && (
            <figure
              className={`relative ${getAspectClass(
                images[2].aspect
              )} rounded-[32px] overflow-hidden bg-gray-50 shadow-[0_18px_45px_rgba(15,23,42,0.08)]`}
            >
              <img
                src={images[2].url}
                alt={images[2].alt}
                className="h-full w-full object-cover"
              />
              {images[2].badge && (
                <span className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-700 shadow-sm">
                  {images[2].badge}
                </span>
              )}
            </figure>
          )}

          {/* Certificate Card - Fixed 4th position */}
          {isStepOneDetails && stoneDetail ? (
            <div className="relative aspect-square rounded-[32px] overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 shadow-[0_18px_45px_rgba(15,23,42,0.08)] flex justify-center items-center flex-col text-center p-8">
              <img
                src="https://cdn.shopify.com/oxygen-v2/24658/9071/18525/2676729/build/_assets/kzr-icon-igi-crt-GAZVFCK3.svg"
                width="400"
                height="400"
                loading="eager"
                alt="Diamond certificate Round shape desktop image "
                className="DiamondCertificate__Image w-full aspect-square fadeIn object-cover max-w-[8rem] mb-4"
              />
              <p className="text-[#937D67] text-2xl leading-tight uppercase font-bold">
                {stoneDetail.type === "lab_grown" ? "Lab Diamond" : "Natural Diamond"}
              </p>
              {certificateLink ? (
                <a
                  href={certificateLink}
                  target="_blank"
                  rel="noreferrer"
                  className="cursor-pointer text-gray-600 text-base leading-tight font-medium mt-2 underline hover:text-gray-900 transition"
                >
                  View Certificate
                </a>
              ) : (
                <span className="text-gray-400 text-sm mt-2">
                  Certificate unavailable
                </span>
              )}
            </div>
          ) : (
            images[3] && (
              <figure
                className={`relative ${getAspectClass(
                  images[3].aspect
                )} rounded-[32px] overflow-hidden bg-gray-50 shadow-[0_18px_45px_rgba(15,23,42,0.08)]`}
              >
                <img
                  src={images[3].url}
                  alt={images[3].alt}
                  className="h-full w-full object-cover"
                />
                {images[3].badge && (
                  <span className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-700 shadow-sm">
                    {images[3].badge}
                  </span>
                )}
              </figure>
            )
          )}
        </div>
        <p className="text-center text-sm text-gray-500">
          {isStepOneDetails && stoneDetail
            ? has360Video
              ? `Interact with the 360° viewer to explore every angle of this ${stoneDetail.shape} stone.`
              : `Explore every angle of this ${stoneDetail.shape} ${
                  stoneDetail.type === "lab_grown" ? "lab-grown" : "natural"
                } stone.`
            : "Scroll to explore every angle of The Amelia setting."}
        </p>
      </div>

      {/* Product Details */}
      <ProductDetails
        isStepOneVariant={isStepOneDetails}
        onPrimaryAction={onPrimaryAction}
        primaryActionLabel={primaryActionLabel}
        showBuySettingButton={showBuySettingButton}
        stoneDetail={stoneDetail}
        centerStoneShape={centerStoneShape}
        lockCenterStoneShape={lockCenterStoneShape}
      />

    </div>
  );
}
