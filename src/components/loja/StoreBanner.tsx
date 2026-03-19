import { ShoppingBag, Sparkles } from 'lucide-react';

interface StoreBannerProps {
  onScrollToProducts: () => void;
}

export default function StoreBanner({ onScrollToProducts }: StoreBannerProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-12 sm:py-16 md:py-20">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Nova Coleção 2026
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-[1.1] mb-4">
            Uniformes com a{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-300">
              qualidade
            </span>{' '}
            que seu filho merece
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-lg mb-8 leading-relaxed">
            Tecidos resistentes, cortes confortáveis e o melhor preço. Compre online e receba na escola.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onScrollToProducts}
              className="inline-flex items-center justify-center gap-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 text-base"
            >
              <ShoppingBag className="w-5 h-5" />
              Comprar Agora
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-10 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              Pagamento via PIX
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              Entrega na escola
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              Troca garantida
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
