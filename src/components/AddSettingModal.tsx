"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Diamond, Sparkles, Star } from "lucide-react";
import { fetchProductCategories, type ProductCategoryDto } from "@/lib/backend";

export type SettingChoice = "necklace" | "ring" | "earring";

interface SettingOption {
  id: SettingChoice;
  title: string;
  icon: ReactNode;
  iconSvg?: string;
}

const defaultOptions: SettingOption[] = [
  {
    id: "necklace",
    title: "Necklace",
    icon: <Sparkles className="h-8 w-8 text-amber-500" />,
  },
  {
    id: "ring",
    title: "Ring",
    icon: <Diamond className="h-8 w-8 text-slate-900" />,
  },
  {
    id: "earring",
    title: "Studs",
    icon: <Star className="h-8 w-8 text-rose-500" />,
  },
];

const settingToCategoryCode: Record<SettingChoice, string> = {
  necklace: "pendant",
  ring: "ring",
  earring: "earring",
};

interface AddSettingModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (choice: SettingChoice, iconSvg?: string | null) => void;
}

export default function AddSettingModal({ open, onClose, onSelect }: AddSettingModalProps) {
  const [categories, setCategories] = useState<ProductCategoryDto[] | null>(null);

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      try {
        const data = await fetchProductCategories();
        setCategories(data);
      } catch (e) {
        console.error("加载产品类型失败", e);
      }
    };
    load();
  }, [open]);

  if (!open) {
    return null;
  }

  const options: SettingOption[] = defaultOptions.map((opt) => {
    const code = settingToCategoryCode[opt.id];
    const matched = categories?.find((c) => c.code === code);
    return {
      ...opt,
      iconSvg: matched?.iconSvg,
    };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <div
        className="absolute inset-0 bg-black/35 backdrop-blur-sm animate-overlay-fade"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl space-y-6 rounded-[28px] border border-gray-200 bg-white p-8 shadow-[0_30px_60px_rgba(15,23,42,0.25)] animate-modal-pop">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-gray-400">Step 01</p>
            <h3 className="text-3xl font-semibold tracking-tight text-gray-900">
              Choose a setting type
            </h3>
          </div>
          <button
            type="button"
            className="rounded-full border border-gray-200 bg-white p-2 text-xl text-gray-600 transition hover:border-gray-400"
            onClick={onClose}
            aria-label="Close selector"
          >
            ×
          </button>
        </div>

        <p className="max-w-2xl text-sm text-gray-500">Choose your setting</p>

        <div className="grid gap-4 md:grid-cols-3">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              className="group relative flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-[28px] border border-gray-200/80 bg-white/90 p-5 text-center shadow-[0_18px_50px_rgba(15,23,42,0.15)] transition duration-300 ease-out hover:border-black/70 hover:shadow-[0_28px_60px_rgba(15,23,42,0.25)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-black"
              onClick={() => onSelect(option.id, option.iconSvg)}
            >
              <div className="flex flex-col items-center gap-3">
                {option.iconSvg ? (
                  <span
                    className="inline-block h-10 w-10"
                    dangerouslySetInnerHTML={{ __html: option.iconSvg }}
                  />
                ) : (
                  option.icon
                )}
                <h4 className="text-2xl font-semibold text-gray-900">{option.title}</h4>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
