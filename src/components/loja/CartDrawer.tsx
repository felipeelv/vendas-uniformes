import { X, ShoppingCart, Minus, Plus, Trash2, ImageOff, ArrowRight, ShoppingBag } from 'lucide-react';
import type { Produto } from '../../store/useStore';

interface CartItem {
  produto: Produto;
  qtd: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  totalVenda: number;
  onUpdateItem: (id: string, qtd: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
  onContinueShopping: () => void;
  formatBRL: (v: number) => string;
}

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  totalVenda,
  onUpdateItem,
  onRemoveItem,
  onCheckout,
  onContinueShopping,
  formatBRL,
}: CartDrawerProps) {
  if (!isOpen) return null;

  const totalPecas = items.reduce((acc, item) => acc + item.qtd, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Drawer */}
      <div
        className="relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl"
        style={{ animation: 'slideInRight 0.3s ease-out' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-eleve-teal/10 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-eleve-teal-dark" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Seu Carrinho</h2>
              <p className="text-xs text-slate-400 font-medium">
                {totalPecas} {totalPecas === 1 ? 'item' : 'itens'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-lg font-bold text-slate-400 mb-2">Carrinho vazio</p>
              <p className="text-sm text-slate-400 mb-6">
                Adicione uniformes para começar
              </p>
              <button
                onClick={onContinueShopping}
                className="text-eleve-teal-dark font-bold text-sm hover:underline"
              >
                Ver Produtos
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {items.map(({ produto, qtd }) => (
                <div
                  key={produto.id}
                  className="flex gap-3 bg-slate-50 p-3 rounded-xl relative group"
                >
                  {/* Image */}
                  <div className="w-20 h-20 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                    {produto.imagem ? (
                      <img src={produto.imagem} className="w-full h-full object-cover" alt={produto.nome} />
                    ) : (
                      <ImageOff className="w-5 h-5 text-slate-300" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <p className="font-bold text-sm text-slate-800 leading-tight truncate pr-8">
                        {produto.nome}
                      </p>
                      <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                        Tam: {produto.tamanho}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity controls */}
                      <div className="flex items-center bg-white rounded-lg border border-slate-200 shadow-sm">
                        <button
                          onClick={() => onUpdateItem(produto.id, qtd - 1)}
                          className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-red-500 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-slate-700">
                          {qtd}
                        </span>
                        <button
                          onClick={() =>
                            onUpdateItem(
                              produto.id,
                              Math.min(produto.quantidade, qtd + 1)
                            )
                          }
                          className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-eleve-teal-dark transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-bold text-sm text-slate-900">
                        {formatBRL(produto.precoVenda * qtd)}
                      </span>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => onRemoveItem(produto.id)}
                    className="absolute top-3 right-3 p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-slate-100 p-5 bg-white shrink-0">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-semibold text-slate-500">Total</span>
              <span className="text-2xl font-black text-slate-900">
                {formatBRL(totalVenda)}
              </span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full py-4 rounded-xl font-bold text-base bg-eleve-teal hover:bg-eleve-teal-dark text-white shadow-xl shadow-eleve-teal/20 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
            >
              Finalizar Compra
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onContinueShopping}
              className="w-full py-3 mt-2 rounded-xl font-semibold text-sm text-slate-500 hover:bg-slate-50 transition-colors"
            >
              Continuar Comprando
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
