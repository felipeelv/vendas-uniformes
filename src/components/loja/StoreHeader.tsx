import { ShoppingCart, Search, X } from 'lucide-react';
import { useState } from 'react';

interface StoreHeaderProps {
  totalPecas: number;
  onOpenCart: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function StoreHeader({ totalPecas, onOpenCart, searchQuery, onSearchChange }: StoreHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <img
            src="/logo.png"
            alt="Eleve"
            className="w-9 h-9 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="hidden sm:block">
            <span className="font-black text-lg tracking-tight text-slate-900">Loja Eleve</span>
            <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest -mt-0.5">Uniformes Escolares</span>
          </div>
        </div>

        {/* Search Bar - Desktop */}
        <div className="hidden sm:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar produto..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-transparent rounded-full text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:bg-white focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Button - Mobile */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="sm:hidden p-2.5 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            className="relative p-2.5 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalPecas > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-emerald-500 text-white text-[10px] font-black min-w-[20px] h-5 flex items-center justify-center rounded-full border-2 border-white animate-[bounce_0.3s_ease-in-out]">
                {totalPecas}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {searchOpen && (
        <div className="sm:hidden px-4 pb-3 animate-[slideDown_0.2s_ease-out]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar produto..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              autoFocus
              className="w-full pl-10 pr-10 py-2.5 bg-slate-100 border border-transparent rounded-full text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:bg-white focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
            />
            <button
              onClick={() => { setSearchOpen(false); onSearchChange(''); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
