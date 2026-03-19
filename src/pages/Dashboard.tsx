import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Package, TrendingUp, AlertTriangle, Shirt, ShoppingBag, ArrowRight, Copy, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { produtos, vendas } = useStore();
  const [copied, setCopied] = useState(false);

  const totalEstoque = produtos.reduce((acc, p) => acc + p.quantidade, 0);
  
  const estoqueBaixo = produtos.filter(p => p.quantidade <= 10);
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const vendasMes = vendas.filter(v => {
    const dataVenda = new Date(v.data);
    return dataVenda.getMonth() === currentMonth && dataVenda.getFullYear() === currentYear;
  });

  const totalArrecadadoMes = vendasMes.reduce((acc, v) => acc + v.valorTotal, 0);
  const uniformesVendidosMes = vendasMes.reduce((acc, v) => acc + v.quantidade, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Visão Geral</h1>
          <p className="text-slate-500 mt-1">Acompanhe o desempenho das vendas e a situação do seu estoque.</p>
        </div>
        <button 
          onClick={() => {
            const link = window.location.origin + '/loja';
            navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black transition-all shadow-lg shrink-0 uppercase tracking-wide text-sm ${copied ? 'bg-slate-900 text-white shadow-slate-200' : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-emerald-200'}`}
        >
          {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          {copied ? 'Link Copiado!' : 'Link Venda On Line'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-violet-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center gap-4 w-full min-w-0">
            <div className="p-3 bg-violet-100 text-violet-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-500 mb-1 truncate">Faturamento Mensal</p>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalArrecadadoMes)}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center gap-4 w-full min-w-0">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-500 mb-1 truncate">Uniformes Vendidos</p>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">{uniformesVendidosMes} un</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center gap-4 w-full min-w-0">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
              <Package className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-500 mb-1 truncate">Total em Estoque</p>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">{totalEstoque} un</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-amber-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center gap-4 w-full min-w-0">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-500 mb-1 truncate">Estoque Crítico</p>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">{estoqueBaixo.length} itens</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-2 text-slate-800 font-semibold">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Atenção: Estoque Baixo (≤ 10)
            </div>
          </div>
          <div className="p-0 flex-1 overflow-auto max-h-[360px]">
            {estoqueBaixo.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {estoqueBaixo.map(p => (
                  <li key={p.id} className="p-4 sm:px-6 hover:bg-slate-50/50 transition-colors flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                        <Shirt className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 leading-tight">{p.nome}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Tam: {p.tamanho} • {p.categoria}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-bold leading-none text-amber-700 bg-amber-100">
                        {p.quantidade} restando
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[160px] text-slate-500">
                <p>Nenhum item com estoque crítico!</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-2 text-slate-800 font-semibold">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Últimas Vendas
            </div>
            <Link to="/vendas" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
              Ponto de Venda <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-0 flex-1 overflow-auto max-h-[360px]">
            {vendas.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {vendas.slice().reverse().slice(0, 5).map(v => (
                  <li key={v.id} className="p-4 sm:px-6 hover:bg-slate-50/50 transition-colors flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-slate-900 leading-tight">{v.produtoNome}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {new Date(v.data).toLocaleDateString('pt-BR')} • {v.quantidade} un. vendida(s)
                      </p>
                    </div>
                    <div className="text-right font-medium text-emerald-600">
                      +{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v.valorTotal)}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[160px] text-slate-500">
                <p>Nenhuma venda registrada ainda.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
