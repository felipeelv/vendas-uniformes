import { ShoppingCart, ArrowRight } from 'lucide-react';

interface FloatingCartBarProps {
  totalPecas: number;
  totalVenda: number;
  onOpenCart: () => void;
  formatBRL: (v: number) => string;
}

export default function FloatingCartBar({
  totalPecas,
  totalVenda,
  onOpenCart,
  formatBRL,
}: FloatingCartBarProps) {
  if (totalPecas === 0) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-30 p-4 sm:p-6 pointer-events-none">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={onOpenCart}
          className="pointer-events-auto w-full bg-slate-900 hover:bg-slate-800 text-white rounded-2xl px-6 py-4 shadow-2xl shadow-slate-900/30 flex items-center justify-between gap-4 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 bg-eleve-teal text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {totalPecas}
              </span>
            </div>
            <span className="font-bold text-sm">
              {totalPecas} {totalPecas === 1 ? 'item' : 'itens'} no carrinho
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-black text-lg">{formatBRL(totalVenda)}</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      </div>
    </div>
  );
}
