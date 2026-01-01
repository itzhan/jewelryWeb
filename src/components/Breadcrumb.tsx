import { ChevronRight } from 'lucide-react';

export default function Breadcrumb() {
  return (
    <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm mb-6">
      <a href="#" className="hover:underline">Homepage</a>
      <ChevronRight className="w-4 h-4" />
      <a href="#" className="hover:underline">Pendants</a>
      <ChevronRight className="w-4 h-4" />
      <span className="text-gray-500">The Amelia</span>
    </div>
  );
}
