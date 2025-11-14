'use client';

export default function StepsConfiguration() {
  return (
    <div className="steps-configuration-container max-w-8xl mx-auto border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 md:py-6">
        <div className="flex items-center justify-center gap-2 md:gap-4">
          {/* Step 1: Setting */}
          <div className="flex flex-col items-center flex-1">
            <div className="w-full flex items-center justify-center">
              <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-green-600 text-white flex items-center justify-center text-lg font-semibold shrink-0">
                  ✓
                </div>
                <div className="text-center md:text-left">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Step 1</p>
                  <p className="font-semibold text-sm md:text-base">Setting</p>
                </div>
              </div>
            </div>
            <div className="mt-2 text-center text-xs md:text-sm text-gray-600">
              <span className="underline cursor-pointer hover:text-gray-900">View</span> <span className="hidden md:inline">$1,350</span>
            </div>
          </div>

          {/* Connector Line */}
          <div className="h-0.5 w-12 md:w-24 bg-gray-300 mx-1 md:mx-2 shrink-0"></div>

          {/* Step 2: Stone */}
          <div className="flex flex-col items-center flex-1">
            <div className="w-full flex items-center justify-center">
              <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black text-white flex items-center justify-center text-lg font-semibold shrink-0">
                  2
                </div>
                <div className="text-center md:text-left">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Step 2</p>
                  <p className="font-semibold text-sm md:text-base">Stone</p>
                </div>
              </div>
            </div>
            <div className="mt-2 text-center text-xs md:text-sm text-gray-600">
              <span className="underline cursor-pointer hover:text-gray-900">Replace</span>
            </div>
          </div>

          {/* Connector Line */}
          <div className="h-0.5 w-12 md:w-24 bg-gray-200 mx-1 md:mx-2 shrink-0"></div>

          {/* Step 3: Complete Ring */}
          <div className="flex flex-col items-center flex-1">
            <div className="w-full flex items-center justify-center">
              <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-gray-300 text-gray-400 flex items-center justify-center text-lg font-semibold shrink-0">
                  3
                </div>
                <div className="text-center md:text-left">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Step 3</p>
                  <p className="text-sm md:text-base text-gray-400 font-semibold">Ring</p>
                </div>
              </div>
            </div>
            <div className="mt-2 text-center text-xs md:text-sm text-gray-400">
              Total Price <span className="hidden md:inline">N/A</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
