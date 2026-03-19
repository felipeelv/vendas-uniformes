import { useState } from 'react';
import { useStore } from '../store/useStore';
import type { Produto } from '../store/useStore';
import { ShoppingCart, Plus, Minus, Search, CheckCircle2, ChevronRight, ImageOff, Trash2 } from 'lucide-react';

export default function Vendas() {
  const { produtos, clientes, registrarSaida, usuarioAtivo } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState<string>('Todas');
  const [clienteSelecionado, setClienteSelecionado] = useState<string>('');
  
  const [carrinho, setCarrinho] = useState<Record<string, number>>({});
  const [vendaSucesso, setVendaSucesso] = useState(false);

  const categorias = ['Todas', ...Array.from(new Set(produtos.map(p => p.categoria)))];

  const filteredProdutos = produtos.filter(p => {
    const matchesSearch = p.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoriaFilter === 'Todas' || p.categoria === categoriaFilter;
    return matchesSearch && matchesCat;
  });

  const handleAddToCart = (produto: Produto) => {
    if (produto.quantidade === 0) return;
    setCarrinho(prev => {
      const current = prev[produto.id] || 0;
      if (current >= produto.quantidade) return prev; 
      return { ...prev, [produto.id]: current + 1 };
    });
  };

  const handleRemoveFromCart = (id: string, forceAll = false) => {
    setCarrinho(prev => {
      const current = prev[id] || 0;
      if (current <= 1 || forceAll) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: current - 1 };
    });
  };

  const handleClearCart = () => setCarrinho({});

  const carrinhoItens = Object.entries(carrinho).map(([id, qtd]) => {
    const produto = produtos.find(p => p.id === id);
    return { produto: produto!, qtd };
  }).filter(item => item.produto);

  const totalVenda = carrinhoItens.reduce((acc, item) => acc + (item.produto.precoVenda * item.qtd), 0);
  const totalPecas = carrinhoItens.reduce((acc, item) => acc + item.qtd, 0);

  const handleFinalizar = () => {
    if (carrinhoItens.length === 0) return;

    let clienteNome = '';
    if (clienteSelecionado) {
      const cli = clientes.find(c => c.id === clienteSelecionado);
      if (cli) clienteNome = cli.nome;
    }

    carrinhoItens.forEach(item => {
      registrarSaida(item.produto.id, item.qtd, item.produto.precoVenda * item.qtd, clienteSelecionado || undefined, clienteNome || undefined);
    });

    setVendaSucesso(true);
    setCarrinho({});
    setClienteSelecionado('');
    
    setTimeout(() => {
      setVendaSucesso(false);
    }, 4000);
  };

  const formatBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-8rem)]">
      
      {/* Esquerda: Catálogo / E-commerce Galeria */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden h-[800px] lg:h-auto">
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50 space-y-4 shrink-0">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Catálogo / Fast POS</h1>
            <div className="relative w-full sm:w-72 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Buscar produto por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 shadow-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
              />
            </div>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categorias.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoriaFilter(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors shadow-sm ${
                  categoriaFilter === cat 
                    ? 'bg-slate-800 text-white' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/30">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredProdutos.map(produto => {
              const semEstoque = produto.quantidade === 0;
              const inCart = carrinho[produto.id] || 0;
              return (
                <div 
                  key={produto.id} 
                  onClick={() => handleAddToCart(produto)}
                  className={`group bg-white rounded-xl border ${semEstoque ? 'border-red-100 opacity-60' : 'border-slate-200 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-100/50'} overflow-hidden cursor-pointer transition-all duration-300 flex flex-col relative`}
                >
                  <div className="aspect-[4/5] bg-slate-100 relative overflow-hidden flex items-center justify-center">
                    {produto.imagem ? (
                      <img src={produto.imagem} alt={produto.nome} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <ImageOff className="w-10 h-10 text-slate-300" />
                    )}
                    {semEstoque && (
                      <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">Esgotado</span>
                      </div>
                    )}
                    {inCart > 0 && !semEstoque && (
                      <div className="absolute inset-0 bg-emerald-900/10 flex items-center justify-center">
                        <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg border-2 border-white animate-in zoom-in">
                          {inCart}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 flex-1 flex flex-col bg-white z-10">
                    <p className="text-[10px] font-bold text-slate-400 mb-1 tracking-widest uppercase truncate">{produto.categoria}</p>
                    <h3 className="text-sm font-bold text-slate-800 leading-tight mb-2 line-clamp-2 flex-1">{produto.nome}</h3>
                    
                    <div className="flex items-end justify-between mt-2 pt-2 border-t border-slate-100">
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-0.5 truncate">Tam: {produto.tamanho}</span>
                        <span className="text-lg font-black text-emerald-600 tracking-tight">{formatBRL(produto.precoVenda)}</span>
                      </div>
                      <div className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                        {produto.quantidade} un
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {filteredProdutos.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4 py-20">
              <Search className="w-12 h-12 opacity-20" />
              <p>Nenhum produto listado nesta categoria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Direita: Carrinho / PDV Checkout */}
      <div className="w-full lg:w-96 flex flex-col bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden shrink-0 z-10">
        <div className="h-16 flex items-center justify-between px-6 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="font-bold text-lg tracking-tight">Caixa Virtual</h2>
          </div>
          {carrinhoItens.length > 0 && (
            <button onClick={handleClearCart} className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center" title="Limpar Carrinho">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="p-5 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Cliente / Aluno (Opcional)</label>
          <select 
            value={clienteSelecionado}
            onChange={e => setClienteSelecionado(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm transition-colors"
          >
            <option value="">🛒 Venda Balcão (Sem Cadastro)</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-slate-50/30">
          {carrinhoItens.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-4 py-12">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-sm px-8 font-medium">O carrinho está vazio.<br/>Selecione produtos na galeria ao lado para adicioná-los.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {carrinhoItens.map(({ produto, qtd }) => (
                <div key={produto.id} className="flex gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] animate-in fade-in slide-in-from-right-4">
                  {produto.imagem ? (
                    <img src={produto.imagem} className="w-16 h-16 rounded-lg object-cover bg-slate-100 border border-slate-100 shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-100 flex items-center justify-center shrink-0">
                      <ImageOff className="w-5 h-5 text-slate-300" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-800 leading-tight truncate">{produto.nome}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Tam: {produto.tamanho}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-emerald-600 text-sm tracking-tight">{formatBRL(produto.precoVenda * qtd)}</span>
                      <div className="flex items-center bg-slate-100/80 rounded-lg p-0.5 border border-slate-200">
                        <button onClick={() => handleRemoveFromCart(produto.id)} className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-white hover:shadow-sm rounded-md transition-all">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-slate-800 select-none">{qtd}</span>
                        <button onClick={() => handleAddToCart(produto)} className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-white hover:shadow-sm rounded-md transition-all">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 bg-white border-t border-slate-100 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] z-10 relative">
          <div className="flex justify-between items-end mb-5">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total a Pagar</p>
              <p className="text-sm font-bold text-slate-600">{totalPecas} {totalPecas === 1 ? 'item' : 'itens'}</p>
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">{formatBRL(totalVenda)}</h2>
          </div>
          
          <button 
            disabled={carrinhoItens.length === 0}
            onClick={handleFinalizar}
            className="relative w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white px-4 py-4 rounded-xl font-bold text-lg transition-all active:scale-[0.98] shadow-xl shadow-emerald-200 disabled:shadow-none overflow-hidden"
          >
            {vendaSucesso && (
              <div className="absolute inset-0 bg-emerald-600 flex items-center justify-center gap-2 animate-in fade-in z-20">
                <CheckCircle2 className="w-6 h-6" /> Concluído!
              </div>
            )}
            Pagar e Finalizar <ChevronRight className="w-6 h-6" />
          </button>

          <div className="text-center mt-5">
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
              Operador de Venda: <span className="text-slate-700">{usuarioAtivo?.nome || 'Não logado'}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
