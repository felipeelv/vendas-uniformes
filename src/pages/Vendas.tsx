import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import type { Produto } from '../store/useStore';
import { ShoppingCart, Plus, Minus, Search, CheckCircle2, ChevronRight, ChevronLeft, ImageOff, Trash2, X } from 'lucide-react';

interface ProdutoGroup {
  nome: string;
  categoria: string;
  imagem?: string;
  variantes: Produto[];
  precoMin: number;
  precoMax: number;
}

export default function Vendas() {
  const { produtos, clientes, registrarSaida, usuarioAtivo } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState<string>('Todas');
  const [clienteSelecionado, setClienteSelecionado] = useState<string>('');

  const [carrinho, setCarrinho] = useState<Record<string, number>>({});
  const [vendaSucesso, setVendaSucesso] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'payment'>('cart');
  const [metodoPagamento, setMetodoPagamento] = useState('PIX');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const categorias = ['Todas', ...Array.from(new Set(produtos.map(p => p.categoria)))];

  // Agrupar produtos por nome
  const produtoGroups = useMemo(() => {
    const groups = new Map<string, Produto[]>();
    produtos.forEach(p => {
      if (p.quantidade > 0) {
        if (!groups.has(p.nome)) groups.set(p.nome, []);
        groups.get(p.nome)!.push(p);
      }
    });
    return Array.from(groups.entries()).map(([nome, variantes]): ProdutoGroup => ({
      nome,
      categoria: variantes[0].categoria,
      imagem: variantes.find(v => v.imagem)?.imagem,
      variantes,
      precoMin: Math.min(...variantes.map(v => v.precoVenda)),
      precoMax: Math.max(...variantes.map(v => v.precoVenda)),
    }));
  }, [produtos]);

  const filteredGroups = produtoGroups.filter(g => {
    const matchesSearch = g.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoriaFilter === 'Todas' || g.categoria === categoriaFilter;
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

  const handleRemoveFromCart = (id: string) => {
    setCarrinho(prev => {
      const current = prev[id] || 0;
      if (current <= 1) {
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
    setCheckoutStep('payment');
  };

  const handleConfirmarPagamento = () => {
    let clienteNome = '';
    if (clienteSelecionado) {
      const cli = clientes.find(c => c.id === clienteSelecionado);
      if (cli) clienteNome = cli.nome;
    }

    carrinhoItens.forEach(item => {
      registrarSaida(item.produto.id, item.qtd, item.produto.precoVenda * item.qtd, clienteSelecionado || undefined, clienteNome || undefined);
    });

    setVendaSucesso(true);
    setTimeout(() => {
      setVendaSucesso(false);
      setCarrinho({});
      setClienteSelecionado('');
      setCheckoutStep('cart');
    }, 2000);
  };

  const formatBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  // Calcular total de itens no carrinho para um grupo
  const getGroupCartCount = (group: ProdutoGroup) => {
    return group.variantes.reduce((acc, v) => acc + (carrinho[v.id] || 0), 0);
  };

  const activeGroup = selectedGroup ? produtoGroups.find(g => g.nome === selectedGroup) : null;

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
            {filteredGroups.map(group => {
              const todasEsgotadas = group.variantes.every(v => v.quantidade === 0);
              const groupCartCount = getGroupCartCount(group);
              return (
                <div
                  key={group.nome}
                  onClick={() => setSelectedGroup(group.nome)}
                  className={`group bg-white rounded-xl border ${todasEsgotadas ? 'border-red-100 opacity-60' : 'border-slate-200 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-100/50'} overflow-hidden cursor-pointer transition-all duration-300 flex flex-col relative`}
                >
                  <div className="aspect-[4/5] bg-slate-100 relative overflow-hidden flex items-center justify-center">
                    {group.imagem ? (
                      <img src={group.imagem} alt={group.nome} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <ImageOff className="w-10 h-10 text-slate-300" />
                    )}
                    {todasEsgotadas && (
                      <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">Esgotado</span>
                      </div>
                    )}
                    {groupCartCount > 0 && !todasEsgotadas && (
                      <div className="absolute inset-0 bg-emerald-900/10 flex items-center justify-center">
                        <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg border-2 border-white animate-in zoom-in">
                          {groupCartCount}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col bg-white z-10">
                    <p className="text-[10px] font-bold text-slate-400 mb-1 tracking-widest uppercase truncate">{group.categoria}</p>
                    <h3 className="text-sm font-bold text-slate-800 leading-tight mb-2 line-clamp-2 flex-1">{group.nome}</h3>

                    <div className="flex items-end justify-between mt-2 pt-2 border-t border-slate-100">
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-0.5">
                          {group.variantes.length} {group.variantes.length === 1 ? 'tamanho' : 'tamanhos'}
                        </span>
                        <span className="text-lg font-black text-emerald-600 tracking-tight">
                          {group.precoMin === group.precoMax
                            ? formatBRL(group.precoMin)
                            : `${formatBRL(group.precoMin)} - ${formatBRL(group.precoMax)}`
                          }
                        </span>
                      </div>
                      {todasEsgotadas && (
                        <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Esgotado</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {filteredGroups.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4 py-20">
              <Search className="w-12 h-12 opacity-20" />
              <p>Nenhum produto listado nesta categoria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de seleção de tamanho */}
      {activeGroup && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedGroup(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex gap-4 p-5 border-b border-slate-100">
              {activeGroup.imagem ? (
                <img src={activeGroup.imagem} className="w-20 h-20 rounded-xl object-cover bg-slate-100 shrink-0" />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  <ImageOff className="w-8 h-8 text-slate-300" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{activeGroup.categoria}</p>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">{activeGroup.nome}</h3>
              </div>
              <button onClick={() => setSelectedGroup(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors self-start shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Escolha o Tamanho</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {activeGroup.variantes.map(variante => {
                  const noCarrinho = carrinho[variante.id] || 0;
                  return (
                    <div
                      key={variante.id}
                      className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-between gap-2 ${
                        noCarrinho > 0
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-slate-200 bg-white hover:border-emerald-400'
                      }`}
                    >
                      <div className="text-center w-full">
                        <span className="block text-sm font-bold text-slate-800">
                          {variante.tamanho}
                        </span>
                        <span className="block text-[10px] font-medium text-slate-500 mt-0.5">
                          {formatBRL(variante.precoVenda)}
                        </span>
                        <span className="block text-[9px] text-slate-400 mt-0.5 font-medium">
                          Estoque: {variante.quantidade}
                        </span>
                      </div>
                      
                      {noCarrinho === 0 ? (
                        <button
                          onClick={() => handleAddToCart(variante)}
                          className="w-full py-1.5 mt-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-emerald-500 hover:text-white text-slate-600 transition-colors"
                        >
                          Adicionar
                        </button>
                      ) : (
                        <div className="flex items-center justify-between w-full bg-white rounded-lg p-1 border border-emerald-200 mt-1">
                          <button 
                            onClick={() => handleRemoveFromCart(variante.id)} 
                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-50 text-red-500 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-bold text-sm text-slate-800">{noCarrinho}</span>
                          <button 
                            onClick={() => handleAddToCart(variante)} 
                            disabled={noCarrinho >= variante.quantidade}
                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-emerald-50 text-emerald-600 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="px-5 pb-5">
              <button
                onClick={() => setSelectedGroup(null)}
                className="w-full py-3 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Direita: Carrinho / PDV Checkout */}
      <div className="w-full lg:w-96 flex flex-col bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden shrink-0 z-10 relative">

        {checkoutStep === 'cart' ? (
          <>
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
                <option value="">Venda Balcao (Sem Cadastro)</option>
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
                  <p className="text-sm px-8 font-medium">O carrinho esta vazio.<br/>Selecione produtos na galeria ao lado para adiciona-los.</p>
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
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight truncate">{formatBRL(totalVenda)}</h2>
              </div>

              <button
                disabled={carrinhoItens.length === 0}
                onClick={handleFinalizar}
                className="relative w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white px-4 py-4 rounded-xl font-bold text-lg transition-all active:scale-[0.98] shadow-xl shadow-emerald-200 disabled:shadow-none overflow-hidden"
              >
                Avancar para Pagamento <ChevronRight className="w-6 h-6" />
              </button>

              <div className="text-center mt-5">
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                  Operador de Venda: <span className="text-slate-700">{usuarioAtivo?.nome || 'Nao logado'}</span>
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 bg-white z-20 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="h-16 flex items-center gap-3 px-6 bg-slate-900 text-white shrink-0">
              <button onClick={() => setCheckoutStep('cart')} className="p-2 hover:bg-slate-700 rounded-full transition-colors -ml-2">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="font-bold text-lg tracking-tight">Pagina de Finalizacao</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 flex flex-col relative">
              {vendaSucesso && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in fade-in">
                  <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-200">
                    <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 mb-2">Pagamento Aprovado</h2>
                  <p className="text-slate-500 font-medium">A venda foi registrada com sucesso no sistema.</p>
                </div>
              )}

              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Escolher a Forma de Pagamento</h3>

              <div className="grid grid-cols-2 gap-3 mb-8">
                <button onClick={() => setMetodoPagamento('PIX')} className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-colors ${metodoPagamento === 'PIX' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-100'}`}>
                  <span className="font-bold">PIX</span>
                </button>
                <button onClick={() => setMetodoPagamento('CARTAO')} className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-colors ${metodoPagamento === 'CARTAO' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-100'}`}>
                  <span className="font-bold">Cartao</span>
                </button>
                <button onClick={() => setMetodoPagamento('DINHEIRO')} className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-colors col-span-2 ${metodoPagamento === 'DINHEIRO' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-100'}`}>
                  <span className="font-bold">Dinheiro em Especie</span>
                </button>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-500 font-medium">Resumo do Pedido</span>
                  <span className="text-slate-900 font-bold">{totalPecas} {totalPecas === 1 ? 'peca' : 'pecas'}</span>
                </div>
                <div className="flex justify-between items-center pt-3 mt-3 border-t border-slate-100">
                  <span className="text-lg font-bold text-slate-900">Total a Pagar</span>
                  <span className="text-2xl font-black text-emerald-600">{formatBRL(totalVenda)}</span>
                </div>
              </div>

              <div className="mt-auto pt-6">
                <button
                  onClick={handleConfirmarPagamento}
                  className="w-full py-4 rounded-xl font-black text-xl bg-slate-900 hover:bg-slate-800 text-white shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5"/> Confirmar Recebimento
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
