import { AlertTriangle, Share2 } from 'lucide-react';
import { useState } from 'react';

interface ProductCardProps {
  nome: string;
  categoria: string;
  imagem?: string;
  precoMin: number;
  precoMax: number;
  totalTamanhos: number;
  estoqueTotal: number;
  formatBRL: (v: number) => string;
  onClick: () => void;
}

export default function ProductCard({
  nome,
  categoria,
  imagem,
  precoMin,
  precoMax,
  totalTamanhos,
  estoqueTotal,
  formatBRL,
  onClick,
}: ProductCardProps) {
  const estoqueBaixo = estoqueTotal > 0 && estoqueTotal <= 3;
  const [imgLoaded, setImgLoaded] = useState(false);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = encodeURIComponent(
      `Olha esse uniforme que achei na Loja Eleve!\n*${nome}* - ${formatBRL(precoMin)}\nConfira: ${window.location.href}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 hover:border-slate-200"
    >
      {/* Image */}
      <div className="aspect-[4/5] bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden">
        {imagem ? (
          <>
            {!imgLoaded && (
              <div className="absolute inset-0 animate-pulse bg-slate-100" />
            )}
            <img
              src={imagem}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              alt={nome}
              onLoad={() => setImgLoaded(true)}
            />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-6">
            {/* Silhueta de uniforme placeholder */}
            <svg viewBox="0 0 80 100" className="w-16 h-20 text-slate-200" fill="currentColor">
              <path d="M40 8c-6 0-10 4-10 10s4 10 10 10 10-4 10-10-4-10-10-10zM22 32c-4 2-7 6-8 11l-4 20c-.5 2.5 1 5 3.5 5.5s5-1 5.5-3.5l3-15h1v42c0 3 2.5 5.5 5.5 5.5S33 95 33 92V62h14v30c0 3 2.5 5.5 5.5 5.5S58 95 58 92V50h1l3 15c.5 2.5 3 4 5.5 3.5s4-3 3.5-5.5l-4-20c-1-5-4-9-8-11H22z" />
            </svg>
            <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-widest">Sem foto</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {estoqueBaixo && (
            <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg shadow-amber-500/30 animate-pulse">
              <AlertTriangle className="w-3 h-3" />
              Últimas {estoqueTotal} un.!
            </span>
          )}
        </div>

        {/* Share button */}
        <button
          onClick={handleShare}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
          title="Compartilhar no WhatsApp"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>

        {/* Quick-add overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <span className="block text-white text-sm font-bold text-center">
            Escolher Tamanho
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex-1 flex flex-col">
        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">
          {categoria}
        </p>
        <h3 className="text-sm sm:text-base font-bold text-slate-800 leading-tight mb-3 flex-1">
          {nome}
        </h3>

        <div className="flex items-end justify-between gap-2">
          <div>
            {precoMin !== precoMax && (
              <span className="block text-[10px] font-semibold text-slate-400 mb-0.5">
                a partir de
              </span>
            )}
            <span className="text-lg sm:text-xl font-black text-slate-900 leading-none">
              {formatBRL(precoMin)}
            </span>
          </div>
          <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
            {totalTamanhos} {totalTamanhos === 1 ? 'tam.' : 'tam.'}
          </span>
        </div>
      </div>
    </div>
  );
}
