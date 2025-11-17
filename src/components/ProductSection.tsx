'use client';

import ProductDetails from './ProductDetails';

type GalleryImage = {
  url: string;
  alt: string;
  badge?: string;
  aspect?: 'square' | 'portrait';
};

const galleryImages: GalleryImage[] = [
  {
    url: 'https://ext.same-assets.com/1796274538/3435028552.jpeg',
    alt: 'Pendant front view',
    badge: 'Shown with 2 ct',
    aspect: 'square',
  },
  {
    url: 'https://ext.same-assets.com/1796274538/2939435500.jpeg',
    alt: 'Pendant on model',
    badge: 'Shown with 2 ct',
    aspect: 'portrait',
  },
  {
    url: 'https://ext.same-assets.com/1796274538/1054153675.jpeg',
    alt: 'Pendant close-up on model',
    aspect: 'portrait',
  },
  {
    url: 'https://ext.same-assets.com/1796274538/1474526449.jpeg',
    alt: 'Pendant angled view',
    badge: 'Shown with 2 ct',
    aspect: 'square',
  },
];

const getAspectClass = (aspect?: GalleryImage['aspect']) =>
  aspect === 'portrait' ? 'aspect-[3/4]' : 'aspect-square';

type ProductSectionProps = {
  isStepOneDetails?: boolean;
  onPrimaryAction?: () => void;
  primaryActionLabel?: string;
  showBuySettingButton?: boolean;
};

export default function ProductSection({
  isStepOneDetails = false,
  onPrimaryAction,
  primaryActionLabel,
  showBuySettingButton = true,
}: ProductSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.6fr,1fr] gap-12 mb-12">
      {/* Product Images */}
      <div className="relative lg:sticky lg:top-10 self-start space-y-4 pb-16">
        <div className="grid grid-cols-2 gap-4 rounded-[36px]">
          {galleryImages.map((image, index) => (
            <figure
              key={`${image.alt}-${index}`}
              className={`relative ${getAspectClass(image.aspect)} rounded-[32px] overflow-hidden bg-gray-50 shadow-[0_18px_45px_rgba(15,23,42,0.08)]`}
            >
              <img
                src={image.url}
                alt={image.alt}
                className="h-full w-full object-cover"
              />
              {image.badge && (
                <span className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-700 shadow-sm">
                  {image.badge}
                </span>
              )}
            </figure>
          ))}
        </div>
        <p className="text-center text-sm text-gray-500">
          Scroll to explore every angle of The Amelia setting.
        </p>
      </div>

      {/* Product Details */}
      <ProductDetails
        isStepOneVariant={isStepOneDetails}
        onPrimaryAction={onPrimaryAction}
        primaryActionLabel={primaryActionLabel}
        showBuySettingButton={showBuySettingButton}
      />
    </div>
  );
}
