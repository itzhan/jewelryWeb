import { Search, User, ShoppingCart } from 'lucide-react';

export default function Header() {
  return (
    <div className="border-b">
      <div className="page-width py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 max-w-xs">
          <Search className="w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="SEARCH..."
            className="outline-none text-sm w-full"
          />
        </div>

        <div className="flex-1 flex justify-center">
          <h1 className="text-2xl tracking-[0.3em]">WATSONGEM</h1>
        </div>

        <div className="flex items-center gap-6 flex-1 justify-end">
          <User className="w-5 h-5 cursor-pointer" />
          <ShoppingCart className="w-5 h-5 cursor-pointer" />
        </div>
      </div>
    </div>
  );
}
