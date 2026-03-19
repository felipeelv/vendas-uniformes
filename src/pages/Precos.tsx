import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import type { Categoria } from '../store/useStore';
import { Save, Search, Check } from 'lucide-react';

interface ProdutoPreco {
  id: string;
  nome: string;
  categoria: Categoria;
  tamanho: string;
  cor: string;
  precoCusto: number;
  precoVenda: number;
}

export default function Precos() {
  const { produtos, updateProduto } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Categoria | 'all'>('all');
  const [editedPrices, setEditedPrices] = useState<Record<string, { precoCusto?: number; precoVenda?: number }>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  // Group products by name for spreadsheet view
  const groupedProducts = useMemo(() => {
    let filtered = produtos.filter(p => {
      const matchSearch = !searchTerm ||
        p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.categoria.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = categoryFilter === 'all' || p.categoria === categoryFilter;
      return matchSearch && matchCategory;
    });

    const groups = new Map<string, ProdutoPreco[]>();
    filtered.forEach(p => {
      const key = `${p.nome}|${p.categoria}|${p.cor}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(p);
    });

    return Array.from(groups.entries()).map(([key, items]) => ({
      key,
      nome: items[0].nome,
      categoria: items[0].categoria,
      cor: items[0].cor,
      items: items.sort((a, b) => {
        const order = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'XXG', '2', '4', '6', '8', '10', '12', '14', '16'];
        return (order.indexOf(a.tamanho) === -1 ? 99 : order.indexOf(a.tamanho)) -
               (order.indexOf(b.tamanho) === -1 ? 99 : order.indexOf(b.tamanho));
      }),
    }));
  }, [produtos, searchTerm, categoryFilter]);

  const categories = useMemo(() => {
    const cats = new Set(produtos.map(p => p.categoria));
    return Array.from(cats).sort();
  }, [produtos]);

  const getEditedValue = (id: string, field: 'precoCusto' | 'precoVenda', original: number) => {
    return editedPrices[id]?.[field] ?? original;
  };

  const handlePriceChange = (id: string, field: 'precoCusto' | 'precoVenda', value: number) => {
    setEditedPrices(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
    setSaved(prev => ({ ...prev, [id]: false }));
  };

  const isEdited = (id: string, produto: ProdutoPreco) => {
    const edits = editedPrices[id];
    if (!edits) return false;
    return (edits.precoCusto !== undefined && edits.precoCusto !== produto.precoCusto) ||
           (edits.precoVenda !== undefined && edits.precoVenda !== produto.precoVenda);
  };

  const handleSave = async (id: string) => {
    const edits = editedPrices[id];
    if (!edits) return;
    setSaving(prev => ({ ...prev, [id]: true }));
    await updateProduto(id, edits);
    setSaving(prev => ({ ...prev, [id]: false }));
    setSaved(prev => ({ ...prev, [id]: true }));
    setEditedPrices(prev => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
    setTimeout(() => setSaved(prev => ({ ...prev, [id]: false })), 2000);
  };

  const handleSaveAll = async () => {
    const ids = Object.keys(editedPrices).filter(id => {
      const produto = produtos.find(p => p.id === id);
      return produto && isEdited(id, produto);
    });
    for (const id of ids) {
      await handleSave(id);
    }
  };

  const totalEdited = Object.keys(editedPrices).filter(id => {
    const produto = produtos.find(p => p.id === id);
    return produto && isEdited(id, produto);
  }).length;

  const calcMargem = (custo: number, venda: number) => {
    if (custo === 0) return 0;
    return ((venda - custo) / custo) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tabela de Precos</h1>
          <p className="text-slate-500 mt-1">Gerencie precos de custo e venda dos uniformes</p>
        </div>
        {totalEdited > 0 && (
          <button
            onClick={handleSaveAll}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-emerald-200"
          >
            <Save className="w-4 h-4" />
            Salvar {totalEdited} {totalEdited === 1 ? 'alteracao' : 'alteracoes'}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-colors"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all shrink-0 ${
                categoryFilter === 'all'
                  ? 'border-violet-500 bg-violet-50 text-violet-700'
                  : 'border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              Todos
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all shrink-0 ${
                  categoryFilter === cat
                    ? 'border-violet-500 bg-violet-50 text-violet-700'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Spreadsheet Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs border-b border-slate-200">
                <th className="px-4 py-3 font-semibold sticky left-0 bg-slate-50 z-10 min-w-[180px]">Produto</th>
                <th className="px-3 py-3 font-semibold w-20">Categoria</th>
                <th className="px-3 py-3 font-semibold w-16">Tam.</th>
                <th className="px-3 py-3 font-semibold w-16">Cor</th>
                <th className="px-3 py-3 font-semibold w-28 text-right">Custo (R$)</th>
                <th className="px-3 py-3 font-semibold w-28 text-right">Venda (R$)</th>
                <th className="px-3 py-3 font-semibold w-20 text-right">Margem</th>
                <th className="px-3 py-3 font-semibold w-16 text-center"></th>
              </tr>
            </thead>
            <tbody>
              {groupedProducts.map((group) => (
                group.items.map((produto, idx) => {
                  const custoCurrent = getEditedValue(produto.id, 'precoCusto', produto.precoCusto);
                  const vendaCurrent = getEditedValue(produto.id, 'precoVenda', produto.precoVenda);
                  const margem = calcMargem(custoCurrent, vendaCurrent);
                  const edited = isEdited(produto.id, produto);
                  const isSaving = saving[produto.id];
                  const isSaved = saved[produto.id];
                  const isFirstInGroup = idx === 0;

                  return (
                    <tr
                      key={produto.id}
                      className={`border-b border-slate-100 hover:bg-blue-50/30 transition-colors ${
                        edited ? 'bg-amber-50/40' : ''
                      } ${isFirstInGroup && idx > 0 ? '' : ''}`}
                    >
                      {/* Product name - only show on first row of group */}
                      <td className={`px-4 py-2.5 sticky left-0 z-10 ${edited ? 'bg-amber-50/40' : 'bg-white'} ${isFirstInGroup ? 'border-t border-slate-200' : ''}`}>
                        {isFirstInGroup ? (
                          <span className="font-semibold text-slate-800">{group.nome}</span>
                        ) : (
                          <span className="text-slate-300 text-xs pl-3">|</span>
                        )}
                      </td>
                      <td className={`px-3 py-2.5 ${isFirstInGroup ? 'border-t border-slate-200' : ''}`}>
                        {isFirstInGroup && (
                          <span className="inline-flex px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                            {group.categoria}
                          </span>
                        )}
                      </td>
                      <td className={`px-3 py-2.5 font-bold text-slate-700 ${isFirstInGroup ? 'border-t border-slate-200' : ''}`}>
                        {produto.tamanho}
                      </td>
                      <td className={`px-3 py-2.5 text-slate-500 ${isFirstInGroup ? 'border-t border-slate-200' : ''}`}>
                        {produto.cor || '-'}
                      </td>
                      <td className={`px-1 py-1.5 ${isFirstInGroup ? 'border-t border-slate-200' : ''}`}>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={custoCurrent}
                          onChange={(e) => handlePriceChange(produto.id, 'precoCusto', Number(e.target.value))}
                          className={`w-full text-right px-2 py-1.5 rounded-md border text-sm font-mono transition-colors ${
                            edited
                              ? 'border-amber-300 bg-amber-50 text-amber-800 focus:ring-amber-400'
                              : 'border-slate-200 bg-white text-slate-700 focus:ring-violet-400'
                          } focus:outline-none focus:ring-2`}
                        />
                      </td>
                      <td className={`px-1 py-1.5 ${isFirstInGroup ? 'border-t border-slate-200' : ''}`}>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={vendaCurrent}
                          onChange={(e) => handlePriceChange(produto.id, 'precoVenda', Number(e.target.value))}
                          className={`w-full text-right px-2 py-1.5 rounded-md border text-sm font-mono font-bold transition-colors ${
                            edited
                              ? 'border-amber-300 bg-amber-50 text-amber-800 focus:ring-amber-400'
                              : 'border-slate-200 bg-white text-slate-900 focus:ring-violet-400'
                          } focus:outline-none focus:ring-2`}
                        />
                      </td>
                      <td className={`px-3 py-2.5 text-right font-mono text-xs ${isFirstInGroup ? 'border-t border-slate-200' : ''}`}>
                        <span className={`font-bold ${
                          margem > 50 ? 'text-emerald-600' :
                          margem > 20 ? 'text-blue-600' :
                          margem > 0 ? 'text-amber-600' :
                          'text-red-600'
                        }`}>
                          {margem.toFixed(0)}%
                        </span>
                      </td>
                      <td className={`px-2 py-2.5 text-center ${isFirstInGroup ? 'border-t border-slate-200' : ''}`}>
                        {isSaved ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        ) : edited ? (
                          <button
                            onClick={() => handleSave(produto.id)}
                            disabled={isSaving}
                            className="p-1.5 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors disabled:opacity-50"
                            title="Salvar"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })
              ))}
              {groupedProducts.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary bar */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>{produtos.length} produtos no total</span>
          {totalEdited > 0 && (
            <span className="text-amber-600 font-bold">
              {totalEdited} {totalEdited === 1 ? 'preco alterado' : 'precos alterados'} (nao salvo)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
