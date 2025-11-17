"use client";

import { useMemo, useState } from "react";
import { Heart } from "lucide-react";

export interface StepOneProduct {
  id: number;
  name: string;
  price: string;
  image: string;
  colors: ("white" | "yellow" | "rose")[];
}

const products: StepOneProduct[] = [
  {
    id: 1,
    name: "The Riley",
    price: "$520",
    image: "https://ext.same-assets.com/1796274538/2753797965.jpeg",
    colors: ["white", "yellow", "rose"],
  },
  {
    id: 2,
    name: "The Amelia",
    price: "$670",
    image: "https://ext.same-assets.com/1796274538/3238944449.jpeg",
    colors: ["white", "yellow", "rose"],
  },
  {
    id: 3,
    name: "The Hidden",
    price: "$750",
    image: "https://ext.same-assets.com/1796274538/2503640517.jpeg",
    colors: ["white", "yellow", "rose"],
  },
  {
    id: 4,
    name: "The Ariana",
    price: "$950",
    image: "https://ext.same-assets.com/1796274538/1714726021.jpeg",
    colors: ["white", "yellow", "rose"],
  },
  {
    id: 5,
    name: "The Billie",
    price: "$1,050",
    image: "https://ext.same-assets.com/1796274538/2297414049.jpeg",
    colors: ["white", "yellow", "rose"],
  },
  {
    id: 6,
    name: "The Aubrey",
    price: "$1,100",
    image: "https://ext.same-assets.com/1796274538/2378482463.jpeg",
    colors: ["white", "yellow", "rose"],
  },
  {
    id: 7,
    name: "The Olivia",
    price: "$1,200",
    image: "https://ext.same-assets.com/1796274538/769952172.jpeg",
    colors: ["white", "yellow", "rose"],
  },
  {
    id: 8,
    name: "The Isabella",
    price: "$1,300",
    image: "https://ext.same-assets.com/1796274538/2159421618.jpeg",
    colors: ["white", "yellow", "rose"],
  },
  {
    id: 9,
    name: "The Harper",
    price: "$1,600",
    image: "https://ext.same-assets.com/1796274538/1597554322.jpeg",
    colors: ["white", "yellow", "rose"],
  },
];

interface StepOneLandingProps {
  onMoreInfo: (product: StepOneProduct) => void;
  onCompleteRing: (product: StepOneProduct) => void;
}

const overlayButtonPrimary =
  "px-5 py-2 text-[0.55rem] font-semibold tracking-[0.08em] uppercase rounded-full border border-black bg-black text-white";

const overlayButtonSecondary =
  "px-5 py-2 text-xs font-semibold tracking-[0.10em] uppercase rounded-full border border-black bg-white text-black";

const priceToNumber = (price: string) => Number(price.replace(/[^0-9.]/g, ""));

export default function StepOneLanding({
  onMoreInfo,
  onCompleteRing,
}: StepOneLandingProps) {
  const sortedProducts = useMemo(() => [...products], []);
  const [selectedColors, setSelectedColors] = useState<
    Record<number, StepOneProduct["colors"][number]>
  >(() =>
    products.reduce<Record<number, StepOneProduct["colors"][number]>>((acc, product) => {
      acc[product.id] = product.colors[0];
      return acc;
    }, {})
  );

  const selectColor = (productId: number, color: StepOneProduct["colors"][number]) => {
    setSelectedColors((prev) => ({ ...prev, [productId]: color }));
  };

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 pt-12 text-center">
        <h2 className="text-4xl font-light mb-4">Pendants</h2>
        <p className="text-gray-600">
          Discover our collection of made to order pendants and customize it to
          your preference
        </p>
      </div>

      <div className="max-w-[1500px] mx-auto px-4 pb-16 pt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sortedProducts.map((product) => {
            const installment = (priceToNumber(product.price) / 4).toFixed(2);
            const activeColor = selectedColors[product.id] ?? product.colors[0];
            return (
              <div
                key={product.id}
                className="group relative cursor-pointer overflow-visible z-0 hover:z-30"
              >
                {/* 主卡片本体 */}
                <div className="relative rounded-2xl border border-gray-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.1)] transition-[border-radius,_transform,_box-shadow] duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_20px_45px_rgba(15,23,42,0.16)] group-hover:scale-[1.015] transform z-10 group-hover:rounded-bl-none group-hover:rounded-br-none">
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full aspect-square object-cover rounded-t-2xl transition duration-500"
                    />
                    <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors z-10">
                      <Heart className="h-5 w-5 text-gray-600" />
                    </button>
                    <div className="absolute left-4 top-4 rounded-full border border-black bg-white px-3 py-1 text-[0.65rem] uppercase tracking-[0.4em] text-black opacity-0 transition-all duration-300 -translate-x-6 group-hover:translate-x-0 group-hover:opacity-100">
                      Customizable
                    </div>
                    <div className="absolute left-1/2 bottom-4 -translate-x-1/2 flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.35em] text-gray-500 opacity-0 transition-all duration-300 translate-y-3 group-hover:translate-y-0 group-hover:opacity-100">
                      <span className="text-base hover:text-black">‹</span>
                      <span className="text-sm font-semibold text-black tracking-[0.4em]">
                        1 / 11
                      </span>
                      <span className="text-base hover:text-black">›</span>
                    </div>
                  </div>

                  <div className="px-6 pt-4 pb-5">
                    <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.35em] text-gray-500 mb-3">
                      <span>Customizable</span>
                      <span>☆</span>
                    </div>
                    <div className="flex items-start justify-between gap-4 mt-3">
                      <div>
                        <h3 className="font-semibold text-lg">{product.name}</h3>
                        <p className="text-gray-900 mt-1">{product.price}</p>
                      </div>
                      <div className="flex gap-2 items-center">
                        {product.colors.map((color, idx) => {
                          const buttonClasses = `w-8 h-8 rounded-full border-2 transition focus-visible:outline-none ${
                            color === activeColor ? "border-black shadow-lg" : "border-gray-300"
                          }`;
                          const colorClass =
                            color === "white"
                              ? "bg-gray-100"
                              : color === "yellow"
                              ? "bg-gradient-to-br from-yellow-200 to-yellow-400"
                              : "bg-gradient-to-br from-rose-200 to-rose-400";
                          return (
                            <button
                              key={`dot-${product.id}-${idx}`}
                              type="button"
                              aria-label={`Select ${color}`}
                              className={`${buttonClasses} ${colorClass}`}
                              onClick={(event) => {
                                event.stopPropagation();
                                selectColor(product.id, color);
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 悬浮展开区域：轻微上移覆盖 2px，和主卡片无缝衔接，并叠在下方卡片上方 */}
                <div
                  className="
                    absolute
                    -left-[0.5px]
                    -right-[0.5px]
                    top-full
                    -mt-2
                    bg-white
                    rounded-b-2xl
                    border
                    border-t-0
                    border-gray-200
                    shadow-[0_22px_50px_rgba(15,23,42,0.18)]
                    opacity-0
                    translate-y-2
                    pointer-events-none
                    transition-all
                    duration-300
                    group-hover:opacity-100
                    group-hover:translate-y-0
                    group-hover:pointer-events-auto
                    z-20
                  "
                >
                  <div className="px-6 pt-5 pb-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                      <div className="flex flex-1 gap-3">
                        <button
                          className={overlayButtonSecondary}
                          onClick={(event) => {
                            event.stopPropagation();
                            onMoreInfo(product);
                          }}
                        >
                          More Info
                        </button>
                        <button
                          className={overlayButtonPrimary}
                          onClick={(event) => {
                            event.stopPropagation();
                            onCompleteRing(product);
                          }}
                        >
                          Complete your ring
                        </button>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-gray-600">
                      Pay in 4 interest-free installments of{" "}
                      <span className="font-semibold text-gray-900">
                        ${installment}
                      </span>{" "}
                      <span className="underline cursor-pointer">
                        Learn more
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12 text-sm text-gray-600">
          Showing {sortedProducts.length} Out Of {products.length}
        </div>
      </div>
    </div>
  );
}

export const pendantProducts = products;
