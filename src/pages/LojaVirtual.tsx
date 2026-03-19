import { useState, useMemo, useRef } from 'react';
import { useStore } from '../store/useStore';
import type { Produto, Categoria } from '../store/useStore';

import StoreHeader from '../components/loja/StoreHeader';
import StoreBanner from '../components/loja/StoreBanner';
import CategoryFilter from '../components/loja/CategoryFilter';
import ProductCard from '../components/loja/ProductCard';
import ProductCardSkeleton from '../components/loja/ProductCardSkeleton';
import SizeModal from '../components/loja/SizeModal';
import CartDrawer from '../components/loja/CartDrawer';
import CheckoutForm from '../components/loja/CheckoutForm';
import SuccessScreen from '../components/loja/SuccessScreen';
import FloatingCartBar from '../components/loja/FloatingCartBar';
import ScrollToTop from '../components/loja/ScrollToTop';

interface ProdutoGroup {
  nome: string;
  categoria: string;
  imagem?: string;
  variantes: Produto[];
  precoMin: number;
  precoMax: number;
  estoqueTotal: number;
}

export default function LojaVirtual() {
  const { produtos, clientes, addCliente, registrarVenda, loaded } = useStore();

  // State
  const [carrinho, setCarrinho] = useState<Record<string, number>>({});
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [view, setView] = useState<'catalog' | 'checkout' | 'success'>('catalog');
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Categoria | 'all'>('all');
  const [formData, setFormData] = useState({ nome: '', telefone: '', aluno: '' });

  const productsRef = useRef<HTMLDivElement>(null);

  // Derived data
  const produtoGroups = useMemo(() => {
    const groups = new Map<string, Produto[]>();
    produtos.forEach((p) => {
      if (p.quantidade > 0) {
        if (!groups.has(p.nome)) groups.set(p.nome, []);
        groups.get(p.nome)!.push(p);
      }
    });
    return Array.from(groups.entries()).map(
      ([nome, variantes]): ProdutoGroup => ({
        nome,
        categoria: variantes[0].categoria,
        imagem: variantes.find((v) => v.imagem)?.imagem,
        variantes,
        precoMin: Math.min(...variantes.map((v) => v.precoVenda)),
        precoMax: Math.max(...variantes.map((v) => v.precoVenda)),
        estoqueTotal: variantes.reduce((acc, v) => acc + v.quantidade, 0),
      })
    );
  }, [produtos]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    produtoGroups.forEach((g) => {
      counts[g.categoria] = (counts[g.categoria] || 0) + 1;
    });
    return counts;
  }, [produtoGroups]);

  const filteredGroups = useMemo(() => {
    let filtered = produtoGroups;
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((g) => g.categoria === categoryFilter);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (g) =>
          g.nome.toLowerCase().includes(query) ||
          g.categoria.toLowerCase().includes(query)
      );
    }
    return filtered;
  }, [produtoGroups, categoryFilter, searchQuery]);

  const activeGroup = selectedGroup
    ? produtoGroups.find((g) => g.nome === selectedGroup)
    : null;

  const carrinhoItens = Object.entries(carrinho)
    .map(([id, qtd]) => {
      const produto = produtos.find((p) => p.id === id);
      return { produto: produto!, qtd };
    })
    .filter((item) => item.produto);

  const totalVenda = carrinhoItens.reduce(
    (acc, item) => acc + item.produto.precoVenda * item.qtd,
    0
  );
  const totalPecas = carrinhoItens.reduce((acc, item) => acc + item.qtd, 0);

  // Handlers
  const handleAddToCart = (produto: Produto) => {
    if (produto.quantidade === 0) return;
    setCarrinho((prev) => {
      const current = prev[produto.id] || 0;
      const novoTotal = Math.min(produto.quantidade, current + 1);
      return { ...prev, [produto.id]: novoTotal };
    });
  };

  const updateCartItem = (id: string, qtd: number) => {
    setCarrinho((prev) => {
      if (qtd <= 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: qtd };
    });
  };

  const removeCartItem = (id: string) => {
    setCarrinho((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  };

  const formatBRL = (v: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(v);

  const handleFinalizar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (carrinhoItens.length === 0) return;

    let clienteId: string;
    const clienteExistente = clientes.find(
      (c) => c.documento === formData.telefone || c.telefone === formData.telefone
    );

    if (clienteExistente) {
      clienteId = clienteExistente.id;
    } else {
      await addCliente({
        nome: `${formData.nome} (Resp: ${formData.aluno})`,
        turma: '',
        telefone: formData.telefone,
        documento: 'Site',
      });
      const novosClientes = useStore.getState().clientes;
      const novoCli = novosClientes.find((c) => c.telefone === formData.telefone);
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

  const handleWhatsApp = () => {
    const texto = encodeURIComponent(
      `Olá! Gostaria de confirmar meu pedido feito pela loja virtual.\n*Responsável:* ${formData.nome}\n*Aluno:* ${formData.aluno}\n*Total:* ${formatBRL(totalVenda)}\n\nAguarde, enviaremos os detalhes para pagamento.`
    );
    window.open(`https://wa.me/5511999999999?text=${texto}`, '_blank');
    resetToShop();
  };

  const resetToShop = () => {
    setView('catalog');
    setFormData({ nome: '', telefone: '', aluno: '' });
    setCartOpen(false);
  };

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // --- RENDERS ---

  if (view === 'success') {
    return (
      <SuccessScreen
        formData={formData}
        totalVenda={totalVenda}
        formatBRL={formatBRL}
        onWhatsApp={handleWhatsApp}
        onContinueShopping={resetToShop}
      />
    );
  }

  if (view === 'checkout') {
    return (
      <CheckoutForm
        formData={formData}
        onFormChange={setFormData}
        onSubmit={handleFinalizar}
        onBack={() => setView('catalog')}
        items={carrinhoItens}
        totalVenda={totalVenda}
        formatBRL={formatBRL}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <StoreHeader
        totalPecas={totalPecas}
        onOpenCart={() => setCartOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <StoreBanner onScrollToProducts={scrollToProducts} />

      {/* Products Section */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12" ref={productsRef}>
        {/* Section header + filters */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">
            Nossos Uniformes
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            Encontre o uniforme ideal para seu filho(a)
          </p>
          <CategoryFilter
            selected={categoryFilter}
            onChange={setCategoryFilter}
            counts={categoryCounts}
          />
        </div>

        {/* Product Grid */}
        {!loaded ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-20" style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </div>
            <p className="text-lg font-bold text-slate-400 mb-2">Nenhum produto encontrado</p>
            <p className="text-sm text-slate-400 mb-4">Tente alterar os filtros ou busca</p>
            {(categoryFilter !== 'all' || searchQuery) && (
              <button
                onClick={() => { setCategoryFilter('all'); setSearchQuery(''); }}
                className="text-emerald-600 font-bold text-sm hover:underline"
              >
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="product-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredGroups.map((group) => (
              <ProductCard
                key={group.nome}
                nome={group.nome}
                categoria={group.categoria}
                imagem={group.imagem}
                precoMin={group.precoMin}
                precoMax={group.precoMax}
                totalTamanhos={group.variantes.filter((v) => v.quantidade > 0).length}
                estoqueTotal={group.estoqueTotal}
                formatBRL={formatBRL}
                onClick={() => setSelectedGroup(group.nome)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-10 mt-auto">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Eleve" className="w-8 h-8 object-contain brightness-0 invert opacity-60" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <div>
                <span className="font-bold text-sm text-white/80">Colégio Eleve</span>
                <span className="block text-[10px] text-white/40 font-medium">Loja Virtual de Uniformes</span>
              </div>
            </div>
            <div className="flex items-center gap-6 text-[11px] font-medium text-white/40">
              <span>Pagamento via PIX</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span>Entrega na escola</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span>Troca garantida</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top */}
      <ScrollToTop />

      {/* Size Modal */}
      {activeGroup && (
        <SizeModal
          group={activeGroup}
          carrinho={carrinho}
          onAddToCart={handleAddToCart}
          onUpdateCart={updateCartItem}
          onClose={() => setSelectedGroup(null)}
          onGoToCart={() => {
            setSelectedGroup(null);
            setCartOpen(true);
          }}
          formatBRL={formatBRL}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={carrinhoItens}
        totalVenda={totalVenda}
        onUpdateItem={updateCartItem}
        onRemoveItem={removeCartItem}
        onCheckout={() => {
          setCartOpen(false);
          setView('checkout');
        }}
        onContinueShopping={() => setCartOpen(false)}
        formatBRL={formatBRL}
      />

      {/* Floating Cart Bar */}
      {!cartOpen && view === 'catalog' && (
        <FloatingCartBar
          totalPecas={totalPecas}
          totalVenda={totalVenda}
          onOpenCart={() => setCartOpen(true)}
          formatBRL={formatBRL}
        />
      )}
    </div>
  );
}
