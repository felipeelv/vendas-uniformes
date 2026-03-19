import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import type { Produto } from '../store/useStore';
import { ShoppingCart, Plus, Minus, CheckCircle2, ChevronLeft, ImageOff, Phone, School, User as Users, Trash2, X } from 'lucide-react';

interface ProdutoGroup {
  nome: string;
  categoria: string;
  imagem?: string;
  variantes: Produto[];
  precoMin: number;
  precoMax: number;
}

export default function LojaVirtual() {
  const { produtos, clientes, addCliente, registrarVenda } = useStore();
  const [carrinho, setCarrinho] = useState<Record<string, number>>({});
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  // 'catalog' | 'cart' | 'checkout' | 'success'
  const [view, setView] = useState<'catalog' | 'cart' | 'checkout' | 'success'>('catalog');

  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    aluno: ''
  });

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

  const activeGroup = selectedGroup ? produtoGroups.find(g => g.nome === selectedGroup) : null;

  const handleAddToCart = (produto: Produto, qtdAdicionada: number = 1, goToCart: boolean = false) => {
    if (produto.quantidade === 0) return;
    setCarrinho(prev => {
      const current = prev[produto.id] || 0;
      const novoTotal = Math.min(produto.quantidade, current + qtdAdicionada);
      return { ...prev, [produto.id]: novoTotal };
    });
    if (goToCart) setView('cart');
  };

  const updateCartItem = (id: string, qtd: number) => {
    setCarrinho(prev => {
      if (qtd <= 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: qtd };
    });
  };

  const removeCartItem = (id: string) => {
    setCarrinho(prev => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  };

  const carrinhoItens = Object.entries(carrinho).map(([id, qtd]) => {
    const produto = produtos.find(p => p.id === id);
    return { produto: produto!, qtd };
  }).filter(item => item.produto);

  const totalVenda = carrinhoItens.reduce((acc, item) => acc + (item.produto.precoVenda * item.qtd), 0);
  const totalPecas = carrinhoItens.reduce((acc, item) => acc + item.qtd, 0);

  const handleFinalizar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (carrinhoItens.length === 0) return;

    let clienteId: string;
    const clienteExistente = clientes.find(c => c.documento === formData.telefone || c.telefone === formData.telefone);

    if (clienteExistente) {
      clienteId = clienteExistente.id;
    } else {
      await addCliente({
        nome: `${formData.nome} (Resp: ${formData.aluno})`,
        turma: '',
        telefone: formData.telefone,
        documento: 'Site'
      });
      // Buscar o cliente recém-criado
      const novosClientes = useStore.getState().clientes;
      const novoCli = novosClientes.find(c => c.telefone === formData.telefone);
      clienteId = novoCli?.id || '';
    }

    const itens = carrinhoItens.map(({ produto, qtd }) => ({
      produtoId: produto.id,
      quantidade: qtd,
      valorTotal: produto.precoVenda * qtd,
    }));
    registrarVenda(itens, 'PIX', clienteId, formData.nome);

    setView('success');
    setCarrinho({});
  };

  const formatBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  // --- RENDERS ---

  if (view === 'success') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center animate-in zoom-in duration-300">
          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Compra Finalizada!</h1>
          <p className="text-slate-500 mb-8">Seu pedido foi recebido pelo Colégio Eleve. Conclua o seu pedido enviando o resumo no WhatsApp oficial.</p>
          
          <button 
            onClick={() => {
              const texto = encodeURIComponent(`Olá! Gostaria de confirmar meu pedido feito pela loja virtual.\n*Responsável:* ${formData.nome}\n*Aluno:* ${formData.aluno}\n*Total:* ${formatBRL(totalVenda)}\n\nAguarde, enviaremos os detalhes para pagamento.`);
              window.open(`https://wa.me/5511999999999?text=${texto}`, '_blank');
              setView('catalog');
              setFormData({nome: '', telefone: '', aluno: ''});
            }}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-xl shadow-lg shadow-emerald-200 mb-4 transition-colors flex items-center justify-center gap-2 text-lg"
          >
            <Phone className="w-6 h-6" /> Confirmar no WhatsApp
          </button>
          
          <button 
            onClick={() => {
              setView('catalog');
              setFormData({nome: '', telefone: '', aluno: ''});
            }}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 rounded-xl transition-colors"
          >
            Voltar para a Loja
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header Fixo com Barra de Navegação */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {view !== 'catalog' && (
              <button onClick={() => setView('catalog')} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors">
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            <img src="/logo.png" alt="Eleve" className="w-8 h-8 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; document.getElementById('fallback-logo-site')?.classList.remove('hidden'); }} />
            <div id="fallback-logo-site" className="hidden w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl leading-none -mt-0.5">e</span>
            </div>
            <span className="font-black text-xl tracking-tight text-slate-900 hidden sm:block">Loja Eleve</span>
          </div>
          
          {/* Botão Superior do Carrinho */}
          {view === 'catalog' && (
            <button 
              onClick={() => setView('cart')}
              className="relative p-2 text-slate-700 hover:bg-slate-100 rounded-full transition-colors flex items-center gap-2"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalPecas > 0 && (
                <span className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {totalPecas}
                </span>
              )}
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-3xl mx-auto bg-white/50 min-h-full">
        
        {/* VIEW: CATALOGO */}
        {view === 'catalog' && (
          <div className="p-4 sm:p-6 pb-24">
            <h2 className="text-2xl font-black text-slate-900 mb-6">Uniformes Escolares</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
              {produtoGroups.filter(g => g.variantes.some(v => v.quantidade > 0)).map(group => (
                <div
                  key={group.nome}
                  onClick={() => setSelectedGroup(group.nome)}
                  className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm flex flex-col relative transition-transform hover:-translate-y-1 hover:shadow-md duration-300 cursor-pointer"
                >
                  <div className="aspect-square bg-slate-50 relative overflow-hidden flex items-center justify-center p-4">
                    {group.imagem ? (
                      <img src={group.imagem} className="w-full h-full object-cover rounded-xl" alt={group.nome} />
                    ) : (
                      <ImageOff className="text-slate-300 w-10 h-10" />
                    )}
                  </div>
                  <div className="p-4 sm:p-5 flex-1 flex flex-col">
                    <p className="text-[9px] sm:text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">{group.categoria}</p>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-800 mb-2 leading-tight flex-1">{group.nome}</h3>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg border border-slate-100">
                        {group.variantes.filter(v => v.quantidade > 0).length} {group.variantes.filter(v => v.quantidade > 0).length === 1 ? 'tamanho' : 'tamanhos'}
                      </span>
                      <span className="text-emerald-600 font-black text-sm sm:text-base">
                        {group.precoMin === group.precoMax ? formatBRL(group.precoMin) : `${formatBRL(group.precoMin)}+`}
                      </span>
                    </div>
                    <button
                      className="w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-emerald-500 hover:bg-emerald-600 text-white transition-colors shadow-sm uppercase tracking-wide"
                    >
                      Escolher Tamanho
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal de seleção de tamanho */}
        {activeGroup && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50" onClick={() => setSelectedGroup(null)}>
            <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full sm:max-w-md overflow-hidden animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
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
                              onClick={() => updateCartItem(variante.id, noCarrinho - 1)} 
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

              <div className="px-5 pb-5 flex gap-3">
                <button
                  onClick={() => setSelectedGroup(null)}
                  className="flex-1 py-3 rounded-xl font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                >
                  Continuar Comprando
                </button>
                <button
                  onClick={() => { setSelectedGroup(null); setView('cart'); }}
                  className="flex-1 py-3 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-600 text-white transition-colors shadow-sm"
                >
                  Ver Carrinho
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: CARRINHO */}
        {view === 'cart' && (
          <div className="flex flex-col h-[calc(100vh-64px)] animate-in slide-in-from-right-8 duration-300 bg-slate-50">
            <div className="p-6 bg-white border-b border-slate-200">
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                <ShoppingCart className="w-7 h-7 text-emerald-500" />
                Seu Carrinho
              </h1>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {carrinhoItens.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-slate-200" />
                  <p className="text-lg font-bold text-slate-500">Seu carrinho está vazio</p>
                  <button onClick={() => setView('catalog')} className="mt-6 text-emerald-600 font-bold hover:underline">Continuar comprando</button>
                </div>
              ) : (
                carrinhoItens.map(({ produto, qtd }) => (
                  <div key={produto.id} className="flex gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm relative">
                    <button onClick={() => removeCartItem(produto.id)} className="absolute top-3 right-3 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                      {produto.imagem ? <img src={produto.imagem} className="w-full h-full object-cover" /> : <ImageOff className="w-6 h-6 text-slate-300"/>}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center pr-8">
                      <p className="font-bold text-slate-800 leading-tight mb-1">{produto.nome}</p>
                      <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-3">Tam: {produto.tamanho}</p>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
                          <button onClick={() => updateCartItem(produto.id, qtd - 1)} className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm text-slate-600"><Minus className="w-3 h-3" /></button>
                          <span className="w-8 text-center font-bold text-sm text-slate-700">{qtd}</span>
                          <button onClick={() => updateCartItem(produto.id, Math.min(produto.quantidade, qtd + 1))} className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm text-slate-600"><Plus className="w-3 h-3" /></button>
                        </div>
                        <span className="font-black text-emerald-600">{formatBRL(produto.precoVenda * qtd)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {carrinhoItens.length > 0 && (
              <div className="bg-white border-t border-slate-200 p-5 sm:p-6 pb-safe shrink-0 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                <div className="flex justify-between items-center mb-5">
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-sm">Total a pagar</span>
                  <span className="text-2xl sm:text-3xl font-black text-slate-900">{formatBRL(totalVenda)}</span>
                </div>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => setView('checkout')}
                    className="w-full py-4 rounded-xl font-black text-lg bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-200 transition-all flex items-center justify-center"
                  >
                    Confirmar Compra
                  </button>
                  <button 
                    onClick={() => setView('catalog')}
                    className="w-full py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all flex items-center justify-center border border-transparent hover:border-slate-200"
                  >
                    Continuar Comprando
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW: CHECKOUT ALUNO */}
        {view === 'checkout' && (
          <div className="flex flex-col h-[calc(100vh-64px)] animate-in slide-in-from-right-8 duration-300 bg-white">
            <div className="p-6 border-b border-slate-100 bg-slate-50">
              <h1 className="text-2xl font-black text-slate-900">Identificação</h1>
              <p className="text-slate-500 text-sm mt-1">Prencha os dados para associar o pedido.</p>
            </div>
            
            <form onSubmit={handleFinalizar} className="flex-1 overflow-y-auto p-6 flex flex-col space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Users className="w-4 h-4"/> NOME DO RESPONSÁVEL</label>
                <input required type="text" placeholder="Nome completo de quem vai pagar" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-800 font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Phone className="w-4 h-4"/> SEU WHATSAPP</label>
                <input required type="tel" placeholder="(11) 90000-0000" value={formData.telefone} onChange={e => setFormData({...formData, telefone: e.target.value})} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-800 font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><School className="w-4 h-4"/> NOME DO ALUNO(A)</label>
                <input required type="text" placeholder="Nome do estudante que usará a peça" value={formData.aluno} onChange={e => setFormData({...formData, aluno: e.target.value})} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-800 font-medium" />
              </div>
              
              <div className="mt-auto pt-8 pb-safe">
                <button type="submit" className="w-full py-4 rounded-xl font-black text-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-200 transition-all flex items-center justify-center uppercase tracking-wide">
                   Finalizar Compra
                </button>
              </div>
            </form>
          </div>
        )}

      </main>
    </div>
  );
}
