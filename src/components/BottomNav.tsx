import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingCart } from 'lucide-react';
import { useCartStore } from '../lib/store';

export function BottomNav() {
  const location = useLocation();
  const { items, toggleCart } = useCartStore();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 z-[999] lg:hidden transition-all duration-300 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around h-14">
        <Link
          to="/"
          className={`flex flex-col items-center gap-0.5 py-1 px-3 ${isActive('/') ? 'text-gray-900' : 'text-gray-400'}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link
          to="/search"
          className={`flex flex-col items-center gap-0.5 py-1 px-3 ${isActive('/search') ? 'text-gray-900' : 'text-gray-400'}`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-medium">Search</span>
        </Link>
        <button
          onClick={toggleCart}
          className="flex flex-col items-center gap-0.5 py-1 px-3 text-gray-400 relative"
        >
          <ShoppingCart className="w-5 h-5" />
          {items.length > 0 && (
            <span className="absolute top-0 right-1 bg-red-500 text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
              {items.length}
            </span>
          )}
          <span className="text-[10px] font-medium">Cart</span>
        </button>
      </div>
    </div>
  );
}
