'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Reviews() {
  return (
    <div className="bg-white py-10 sm:py-12">
      <div className="page-width">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
          <div className="flex items-center gap-6">
            <div>
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-6 h-6 sm:w-8 sm:h-8 fill-green-500" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold mb-1">Excellent</h2>
              <p className="text-sm text-gray-600">Based on 1,157 reviews</p>
              <svg className="w-32 h-8 mt-2" viewBox="0 0 120 30">
                <text x="0" y="20" fontSize="16" fontWeight="bold" fill="#00b67a">★ Trustpilot</text>
              </svg>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 border rounded-full hover:bg-gray-50">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="p-2 border rounded-full hover:bg-gray-50">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <ReviewCard
            rating={5}
            title="Love it"
            review="I purchased this ring on April 12 2023, The Penelope set with a 2.37 carat F vs2..."
            author="Angelica King"
            date="August 8"
          />
          <ReviewCard
            rating={5}
            title="10/10"
            review="I was nervous about getting an engagement ring online at first but Keyzar got it..."
            author="Joshua F"
            date="August 5"
          />
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">Showing our favorite reviews</p>
      </div>
    </div>
  );
}

function ReviewCard({ rating, title, review, author, date }: {
  rating: number;
  title: string;
  review: string;
  author: string;
  date: string;
}) {
  return (
    <div className="border rounded-lg p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex gap-1">
          {[...Array(rating)].map((_, i) => (
            <svg key={i} className="w-5 h-5 fill-green-500" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          ))}
        </div>
        <span className="text-sm text-green-600">✓ Verified</span>
      </div>
      <h3 className="font-semibold text-base sm:text-lg mb-2">{title}</h3>
      <p className="text-gray-700 mb-4">{review}</p>
      <p className="text-sm text-gray-600">{author}, {date}</p>
    </div>
  );
}
