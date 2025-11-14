'use client';

import type { ReactNode } from "react";

interface StoneTypeToggleProps {
  stoneType: "natural" | "labGrown";
  setStoneType: (type: "natural" | "labGrown") => void;
}

const toggleOptions: Array<{
  id: "natural" | "labGrown";
  label: string;
  icon: ReactNode;
}> = [
  {
    id: "labGrown",
    label: "Lab Grown",
    icon: (
      <svg
        viewBox="0 0 32 32"
        className="h-7 w-7 text-gray-800"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path d="M6 9l10-6 10 6-10 6z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 9v8l10 6 10-6V9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 15v8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "natural",
    label: "Natural",
    icon: (
      <svg
        viewBox="0 0 32 32"
        className="h-7 w-7 text-gray-800"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path d="M16 3l7 6-7 20-7-20z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 9h14" strokeLinecap="round" />
        <path d="M12 9l4-6 4 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function StoneTypeToggle({ stoneType, setStoneType }: StoneTypeToggleProps) {
  return (
    <div className="flex justify-center">
      <div className="inline-flex w-full max-w-md items-center gap-2 rounded-[2rem] border border-gray-300 bg-[#f4f3ef] p-1 shadow-inner">
        {toggleOptions.map(({ id, label, icon }) => {
          const isActive = stoneType === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={isActive}
              onClick={() => setStoneType(id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-[1.4rem] px-4 py-3 text-sm font-semibold transition-all ${
                isActive
                  ? "bg-white text-gray-900 shadow-[0_8px_20px_rgba(0,0,0,0.08)] ring-2 ring-black"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <span className="shrink-0">{icon}</span>
              <span className="text-base">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
