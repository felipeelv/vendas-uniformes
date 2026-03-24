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
    <header className="sticky top-0 z-40">
      {/* Top promo strip */}
      <div className="bg-eleve-green text-white text-center text-[11px] sm:text-xs font-semibold py-1.5 px-4 tracking-wide">
        Entrega grátis na escola &nbsp;·&nbsp; Pagamento via PIX &nbsp;·&nbsp; Troca garantida
      </div>

      {/* Main header */}
      <div className="bg-eleve-teal">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3 sm:gap-5">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img
              src="/logo.png"
              alt="Eleve"
              className="w-9 h-9 sm:w-10 sm:h-10 object-contain rounded-lg bg-white/20 p-1 backdrop-blur-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="hidden sm:block leading-tight">
              <span className="font-black text-lg text-white tracking-tight block">Eleve</span>
              <span className="text-[10px] font-medium text-white/70 -mt-0.5 block">Uniformes Escolares</span>
            </div>
          </div>

          {/* Search Bar - Always visible */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar uniformes..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-4 pr-12 py-2.5 sm:py-3 bg-white rounded-lg text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none shadow-sm focus:ring-2 focus:ring-eleve-teal-light"
              />
              {searchQuery ? (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : null}
              <button className="absolute right-0 top-0 h-full px-3 bg-eleve-teal-dark hover:bg-eleve-green rounded-r-lg transition-colors flex items-center justify-center">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 text-white hover:bg-white/15 rounded-lg transition-colors flex items-center gap-2"
            >
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
              {totalPecas > 0 && (
                <span className="absolute -top-0.5 -right-0.5 sm:top-0 sm:right-0 bg-eleve-orange text-white text-[10px] font-black min-w-[20px] h-5 flex items-center justify-center rounded-full border-2 border-eleve-teal shadow-sm">
                  {totalPecas}
                </span>
              )}
              <span className="hidden sm:block text-sm font-semibold text-white/90">Carrinho</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile search - expandable for extra small screens if needed */}
      {searchOpen && (
        <div className="sm:hidden bg-eleve-teal px-4 pb-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar uniformes..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              autoFocus
              className="w-full pl-4 pr-10 py-2.5 bg-white rounded-lg text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none"
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
