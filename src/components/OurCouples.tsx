'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function OurCouples() {
  return (
    <div className="bg-black text-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl font-serif">OUR COUPLES</h2>
          <div className="flex gap-2">
            <button className="p-3 border border-white rounded-full hover:bg-white hover:text-black transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button className="p-3 border border-white rounded-full hover:bg-white hover:text-black transition-colors">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <CoupleStory
            names="SHEA & JOSH SCHMIDT"
            story="Our day was so special filled with family and so much love! My fiancé Josh told me we were going to..."
          />
          <CoupleStory
            names="NICOLE & JOEL VAN DYK"
            story="My fiancée and I flew out east to PEI to visit his family and explore the island. When we decided..."
          />
        </div>
      </div>
    </div>
  );
}

function CoupleStory({ names, story }: { names: string; story: string }) {
  return (
    <div>
      <div className="aspect-[4/3] bg-gray-800 rounded-lg mb-4"></div>
      <h3 className="font-bold text-xl mb-2">{names}</h3>
      <p className="text-gray-300 mb-4">{story}</p>
      <a href="#" className="inline-flex items-center gap-2 hover:opacity-70">
        <span>Read More</span>
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M5 12h14M12 5l7 7-7 7" strokeWidth="2"/>
        </svg>
      </a>
    </div>
  );
}
