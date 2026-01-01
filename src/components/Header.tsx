import { Search, User, ShoppingCart } from 'lucide-react';

export default function Header() {
  return (
    <div className="border-b">
      <div className="page-width py-4 flex flex-wrap items-center gap-3 md:flex-nowrap md:gap-0">
        <div className="order-1 flex-none md:order-2 md:flex-1 md:flex md:justify-center">
          <h1 className="text-lg sm:text-2xl tracking-[0.2em] sm:tracking-[0.3em]">
            WATSONGEM
          </h1>
        </div>

        <div className="order-2 ml-auto flex items-center gap-4 md:order-3 md:flex-1 md:justify-end md:gap-6">
          <User className="w-5 h-5 cursor-pointer" />
          <ShoppingCart className="w-5 h-5 cursor-pointer" />
        </div>

        <div className="order-3 flex w-full items-center gap-2 md:order-1 md:flex-1 md:max-w-xs">
          <Search className="h-4 w-4 text-gray-500 sm:h-5 sm:w-5" />
          <input
            type="text"
            placeholder="SEARCH..."
            className="outline-none text-xs sm:text-sm w-full"
          />
        </div>
      </div>
    </div>
  );
}
