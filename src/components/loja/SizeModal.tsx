import { X, Plus, Minus, ImageOff, ShoppingCart, Check } from 'lucide-react';
import type { Produto } from '../../store/useStore';
import { useState } from 'react';

interface SizeModalProps {
  group: {
    nome: string;
    cor: string;
    categoria: string;
    imagem?: string;
    variantes: Produto[];
  };
  carrinho: Record<string, number>;
  onAddToCart: (produto: Produto) => void;
  onUpdateCart: (id: string, qtd: number) => void;
  onClose: () => void;
  onGoToCart: () => void;
  formatBRL: (v: number) => string;
}

export default function SizeModal({
  group,
  carrinho,
  onAddToCart,
  onUpdateCart,
  onClose,
  onGoToCart,
  formatBRL,
}: SizeModalProps) {
  const [justAdded, setJustAdded] = useState<string | null>(null);

  const handleAdd = (variante: Produto) => {
    onAddToCart(variante);
    setJustAdded(variante.id);
    setTimeout(() => setJustAdded(null), 800);
  };

  const totalNoCarrinho = group.variantes.reduce(
    (acc, v) => acc + (carrinho[v.id] || 0),
    0
  );

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'slideUp 0.3s ease-out' }}
      >
        {/* Header */}
        <div className="flex gap-4 p-5 border-b border-slate-100 bg-slate-50/50">
          {group.imagem ? (
            <img
              src={group.imagem}
              className="w-24 h-24 rounded-xl object-cover bg-slate-100 shrink-0 shadow-sm"
              alt={group.nome}
            />
          ) : (
            <div className="w-24 h-24 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              <ImageOff className="w-8 h-8 text-slate-300" />
            </div>
          )}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">
              {group.categoria}
            </p>
            <h3 className="text-lg font-bold text-slate-900 leading-tight">
              {group.cor ? `${group.nome} - ${group.cor}` : group.nome}
            </h3>
            {totalNoCarrinho > 0 && (
              <p className="text-xs font-semibold text-emerald-600 mt-2 flex items-center gap-1">
                <ShoppingCart className="w-3.5 h-3.5" />
                {totalNoCarrinho} no carrinho
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-colors self-start shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sizes */}
        <div className="p-5 max-h-[50vh] overflow-y-auto">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            Escolha o Tamanho
          </p>
          <div className="space-y-2.5">
            {group.variantes.map((variante) => {
              const noCarrinho = carrinho[variante.id] || 0;
              const isJustAdded = justAdded === variante.id;
              const semEstoque = variante.quantidade === 0;

              return (
                <div
                  key={variante.id}
                  className={`flex items-center justify-between p-3.5 rounded-xl border-2 transition-all ${
                    noCarrinho > 0
                      ? 'border-emerald-200 bg-emerald-50/50'
                      : semEstoque
                      ? 'border-slate-100 bg-slate-50 opacity-50'
                      : 'border-slate-100 bg-white hover:border-emerald-200'
                  }`}
                >
                  {/* Size info */}
                  <div className="flex items-center gap-4">
                    <span className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-sm font-black text-slate-700 shadow-sm">
                      {variante.tamanho}
                    </span>
                    <div>
                      <span className="block text-sm font-bold text-slate-800">
                        {formatBRL(variante.precoVenda)}
                      </span>
                      <span className={`block text-[11px] font-medium mt-0.5 ${
                        variante.quantidade <= 3 ? 'text-amber-600 font-semibold' : 'text-slate-400'
                      }`}>
                        {semEstoque
                          ? 'Esgotado'
                          : variante.quantidade <= 3
                          ? `Últimas ${variante.quantidade} un.`
                          : `${variante.quantidade} em estoque`}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {semEstoque ? (
                    <span className="text-xs font-bold text-slate-400 px-3 py-2">
                      Indisponível
                    </span>
                  ) : noCarrinho === 0 ? (
                    <button
                      onClick={() => handleAdd(variante)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isJustAdded
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      {isJustAdded ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        'Adicionar'
                      )}
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-emerald-200 shadow-sm">
                      <button
                        onClick={() => onUpdateCart(variante.id, noCarrinho - 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-bold text-sm text-slate-800">
                        {noCarrinho}
                      </span>
                      <button
                        onClick={() => handleAdd(variante)}
                        disabled={noCarrinho >= variante.quantidade}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors disabled:opacity-30"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            Continuar Comprando
          </button>
          <button
            onClick={onGoToCart}
            className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-600 text-white transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Ver Carrinho
            {totalNoCarrinho > 0 && (
              <span className="bg-white/25 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-md">
                {totalNoCarrinho}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
