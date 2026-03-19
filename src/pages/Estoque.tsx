import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import type { Produto, Categoria } from '../store/useStore';
import { TAMANHOS_PADRAO } from '../store/useStore';
import { Plus, Search, Trash2, AlertCircle, Save, Check, X, Upload, Image } from 'lucide-react';

interface ProductGroup {
  key: string;
  nome: string;
  categoria: Categoria;
  cor: string;
  imagem?: string;
  items: Produto[];
}

const SIZE_ORDER = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'XXG', '2', '4', '6', '8', '10', '12', '14', '16'];
function sortBySize(a: Produto, b: Produto) {
  const ai = SIZE_ORDER.indexOf(a.tamanho);
  const bi = SIZE_ORDER.indexOf(b.tamanho);
  return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
}

export default function Estoque() {
  const { produtos, addProduto, updateProduto, deleteProduto, tamanhosCustom, addTamanhoCustom } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Categoria | 'all'>('all');
  const [editedQtds, setEditedQtds] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [addingSize, setAddingSize] = useState<string | null>(null); // group key
  const [newSizeValue, setNewSizeValue] = useState('');
  const [newSizeQtd, setNewSizeQtd] = useState(0);
  const [savingNewSize, setSavingNewSize] = useState(false);
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);

  const todosOsTamanhos = [...TAMANHOS_PADRAO, ...tamanhosCustom];

  const groups = useMemo(() => {
    const map = new Map<string, Produto[]>();
    produtos.forEach(p => {
      const matchSearch = !searchTerm ||
        p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.categoria.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = categoryFilter === 'all' || p.categoria === categoryFilter;
      if (!matchSearch || !matchCat) return;
      const key = `${p.nome}|${p.categoria}|${p.cor}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    });
    return Array.from(map.entries()).map(([key, items]): ProductGroup => ({
      key,
      nome: items[0].nome,
      categoria: items[0].categoria,
      cor: items[0].cor,
      imagem: items.find(i => i.imagem)?.imagem,
      items: items.sort(sortBySize),
    }));
  }, [produtos, searchTerm, categoryFilter]);

  const categories = useMemo(() => {
    const cats = new Set(produtos.map(p => p.categoria));
    return Array.from(cats).sort();
  }, [produtos]);

  const getQtd = (id: string, original: number) => editedQtds[id] ?? original;

  const handleQtdChange = (id: string, value: number) => {
    setEditedQtds(prev => ({ ...prev, [id]: value }));
    setSaved(prev => ({ ...prev, [id]: false }));
  };

  const isEdited = (id: string, original: number) => {
    return editedQtds[id] !== undefined && editedQtds[id] !== original;
  };

  const handleSave = async (id: string) => {
    const qtd = editedQtds[id];
    if (qtd === undefined) return;
    setSaving(prev => ({ ...prev, [id]: true }));
    await updateProduto(id, { quantidade: qtd });
    setSaving(prev => ({ ...prev, [id]: false }));
    setSaved(prev => ({ ...prev, [id]: true }));
    setEditedQtds(prev => { const { [id]: _, ...rest } = prev; return rest; });
    setTimeout(() => setSaved(prev => ({ ...prev, [id]: false })), 2000);
  };

  const handleSaveAll = async () => {
    const ids = Object.keys(editedQtds).filter(id => {
      const p = produtos.find(pr => pr.id === id);
      return p && isEdited(id, p.quantidade);
    });
    for (const id of ids) await handleSave(id);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Excluir este tamanho/variante?')) {
      await deleteProduto(id);
    }
  };

  const handleAddSize = async (group: ProductGroup) => {
    if (!newSizeValue.trim()) return;
    setSavingNewSize(true);
    const ref = group.items[0];
    await addProduto({
      nome: ref.nome,
      categoria: ref.categoria,
      cor: ref.cor,
      tamanho: newSizeValue.trim().toUpperCase(),
      quantidade: newSizeQtd,
      precoCusto: ref.precoCusto,
      precoVenda: ref.precoVenda,
      imagem: ref.imagem,
    });
    if (!todosOsTamanhos.includes(newSizeValue.trim().toUpperCase()) && !(TAMANHOS_PADRAO as readonly string[]).includes(newSizeValue.trim().toUpperCase())) {
      addTamanhoCustom(newSizeValue.trim().toUpperCase());
    }
    setSavingNewSize(false);
    setAddingSize(null);
    setNewSizeValue('');
    setNewSizeQtd(0);
  };

  const totalEdited = Object.keys(editedQtds).filter(id => {
    const p = produtos.find(pr => pr.id === id);
    return p && isEdited(id, p.quantidade);
  }).length;

  const totalEstoque = produtos.reduce((acc, p) => acc + p.quantidade, 0);
  const estoqueBaixo = produtos.filter(p => p.quantidade > 0 && p.quantidade <= 5).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Controle de Estoque</h1>
          <p className="text-slate-500 mt-1">
            {totalEstoque} unidades no total
            {estoqueBaixo > 0 && <span className="text-amber-600 font-semibold"> · {estoqueBaixo} com estoque baixo</span>}
          </p>
        </div>
        <div className="flex gap-2">
          {totalEdited > 0 && (
            <button
              onClick={handleSaveAll}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-emerald-200"
            >
              <Save className="w-4 h-4" />
              Salvar {totalEdited}
            </button>
          )}
          <button
            onClick={() => setIsNewProductOpen(true)}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-violet-200"
          >
            <Plus className="w-5 h-5" />
            Novo Produto
          </button>
        </div>
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
                <th className="px-3 py-3 font-semibold w-28 text-right">Quantidade</th>
                <th className="px-3 py-3 font-semibold w-16 text-center">Status</th>
                <th className="px-3 py-3 font-semibold w-20 text-center"></th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
                <>
                  {group.items.map((produto, idx) => {
                    const qtdCurrent = getQtd(produto.id, produto.quantidade);
                    const edited = isEdited(produto.id, produto.quantidade);
                    const isSaving = saving[produto.id];
                    const isSaved = saved[produto.id];
                    const isFirst = idx === 0;

                    return (
                      <tr
                        key={produto.id}
                        className={`border-b border-slate-100 hover:bg-blue-50/30 transition-colors ${
                          edited ? 'bg-amber-50/40' : ''
                        }`}
                      >
                        <td className={`px-4 py-2.5 sticky left-0 z-10 ${edited ? 'bg-amber-50/40' : 'bg-white'} ${isFirst ? 'border-t border-slate-200' : ''}`}>
                          {isFirst ? (
                            <div className="flex items-center gap-2.5">
                              {group.imagem ? (
                                <img src={group.imagem} alt="" className="w-8 h-8 rounded-md object-cover border border-slate-200 shrink-0" />
                              ) : (
                                <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
                                  <Image className="w-4 h-4 text-slate-300" />
                                </div>
                              )}
                              <span className="font-semibold text-slate-800">{group.nome}</span>
                            </div>
                          ) : (
                            <span className="text-slate-300 text-xs pl-[42px]">|</span>
                          )}
                        </td>
                        <td className={`px-3 py-2.5 ${isFirst ? 'border-t border-slate-200' : ''}`}>
                          {isFirst && (
                            <span className="inline-flex px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                              {group.categoria}
                            </span>
                          )}
                        </td>
                        <td className={`px-3 py-2.5 font-bold text-slate-700 ${isFirst ? 'border-t border-slate-200' : ''}`}>
                          {produto.tamanho}
                        </td>
                        <td className={`px-3 py-2.5 text-slate-500 ${isFirst ? 'border-t border-slate-200' : ''}`}>
                          {produto.cor || '-'}
                        </td>
                        <td className={`px-1 py-1.5 ${isFirst ? 'border-t border-slate-200' : ''}`}>
                          <input
                            type="number"
                            min="0"
                            value={qtdCurrent}
                            onChange={(e) => handleQtdChange(produto.id, Number(e.target.value))}
                            className={`w-full text-right px-2 py-1.5 rounded-md border text-sm font-mono font-bold transition-colors ${
                              edited
                                ? 'border-amber-300 bg-amber-50 text-amber-800 focus:ring-amber-400'
                                : 'border-slate-200 bg-white text-slate-700 focus:ring-violet-400'
                            } focus:outline-none focus:ring-2`}
                          />
                        </td>
                        <td className={`px-3 py-2.5 text-center ${isFirst ? 'border-t border-slate-200' : ''}`}>
                          {qtdCurrent === 0 ? (
                            <span className="inline-flex px-1.5 py-0.5 rounded bg-red-50 text-red-600 text-[10px] font-bold">Zerado</span>
                          ) : qtdCurrent <= 5 ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 text-[10px] font-bold">
                              <AlertCircle className="w-3 h-3" /> Baixo
                            </span>
                          ) : (
                            <span className="inline-flex px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[10px] font-bold">OK</span>
                          )}
                        </td>
                        <td className={`px-2 py-2.5 text-center ${isFirst ? 'border-t border-slate-200' : ''}`}>
                          <div className="flex items-center justify-center gap-1">
                            {isSaved ? (
                              <span className="text-emerald-600"><Check className="w-3.5 h-3.5" /></span>
                            ) : edited ? (
                              <button
                                onClick={() => handleSave(produto.id)}
                                disabled={isSaving}
                                className="p-1 text-amber-600 hover:bg-amber-100 rounded transition-colors disabled:opacity-50"
                                title="Salvar"
                              >
                                <Save className="w-3.5 h-3.5" />
                              </button>
                            ) : null}
                            <button
                              onClick={() => handleDelete(produto.id)}
                              className="p-1 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors"
                              title="Excluir variante"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {/* Add size row */}
                  {addingSize === group.key ? (
                    <tr key={`add-${group.key}`} className="border-b border-slate-200 bg-violet-50/30">
                      <td className="px-4 py-2 sticky left-0 bg-violet-50/30 z-10">
                        <span className="text-xs text-violet-600 font-semibold pl-[42px]">+ Novo tamanho</span>
                      </td>
                      <td className="px-3 py-2"></td>
                      <td className="px-1 py-1.5">
                        <select
                          value={newSizeValue}
                          onChange={(e) => setNewSizeValue(e.target.value)}
                          className="w-full px-1.5 py-1.5 rounded-md border border-violet-300 bg-white text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-400"
                        >
                          <option value="">--</option>
                          {todosOsTamanhos
                            .filter(t => !group.items.some(i => i.tamanho === t))
                            .map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-2 text-slate-400 text-xs">{group.cor || '-'}</td>
                      <td className="px-1 py-1.5">
                        <input
                          type="number"
                          min="0"
                          value={newSizeQtd}
                          onChange={(e) => setNewSizeQtd(Number(e.target.value))}
                          className="w-full text-right px-2 py-1.5 rounded-md border border-violet-300 bg-white text-sm font-mono font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-400"
                          placeholder="Qtd."
                        />
                      </td>
                      <td className="px-2 py-2" colSpan={2}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleAddSize(group)}
                            disabled={!newSizeValue || savingNewSize}
                            className="p-1 text-emerald-600 hover:bg-emerald-100 rounded transition-colors disabled:opacity-30"
                            title="Confirmar"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setAddingSize(null); setNewSizeValue(''); setNewSizeQtd(0); }}
                            className="p-1 text-slate-400 hover:bg-slate-100 rounded transition-colors"
                            title="Cancelar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={`btn-${group.key}`} className="border-b border-slate-200">
                      <td colSpan={7} className="px-4 py-1.5">
                        <button
                          onClick={() => { setAddingSize(group.key); setNewSizeValue(''); setNewSizeQtd(0); }}
                          className="text-[11px] text-violet-500 hover:text-violet-700 font-semibold pl-[42px] hover:underline transition-colors"
                        >
                          + Adicionar tamanho
                        </button>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {groups.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>{produtos.length} variantes · {groups.length} produtos</span>
          {totalEdited > 0 && (
            <span className="text-amber-600 font-bold">
              {totalEdited} {totalEdited === 1 ? 'quantidade alterada' : 'quantidades alteradas'} (nao salvo)
            </span>
          )}
        </div>
      </div>

      {/* New Product Modal - simplified */}
      {isNewProductOpen && (
        <NewProductModal onClose={() => setIsNewProductOpen(false)} />
      )}
    </div>
  );
}

function NewProductModal({ onClose }: { onClose: () => void }) {
  const { addProduto, tamanhosCustom, addTamanhoCustom, uploadImagem } = useStore();
  const [salvando, setSalvando] = useState(false);
  const [novoTamanho, setNovoTamanho] = useState('');
  const todosOsTamanhos = [...TAMANHOS_PADRAO, ...tamanhosCustom];

  const [tamanhosSelecionados, setTamanhosSelecionados] = useState<string[]>([]);
  const [quantidadesPorTamanho, setQuantidadesPorTamanho] = useState<Record<string, number>>({});

  const [formData, setFormData] = useState({
    nome: '',
    categoria: 'Camiseta' as Categoria,
    cor: '',
    precoCusto: 0,
    precoVenda: 0,
    imagem: '',
  });

  const [imagemPreview, setImagemPreview] = useState('');
  const [imagemFile, setImagemFile] = useState<File | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagemFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagemPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const toggleTamanho = (t: string) => {
    setTamanhosSelecionados(prev => {
      if (prev.includes(t)) {
        setQuantidadesPorTamanho(q => { const { [t]: _, ...rest } = q; return rest; });
        return prev.filter(x => x !== t);
      }
      setQuantidadesPorTamanho(q => ({ ...q, [t]: 0 }));
      return [...prev, t];
    });
  };

  const handleAddTamanho = () => {
    const t = novoTamanho.trim().toUpperCase();
    if (!t) return;
    if (!todosOsTamanhos.includes(t)) addTamanhoCustom(t);
    if (!tamanhosSelecionados.includes(t)) {
      setTamanhosSelecionados(prev => [...prev, t]);
      setQuantidadesPorTamanho(q => ({ ...q, [t]: 0 }));
    }
    setNovoTamanho('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tamanhosSelecionados.length === 0) return;
    setSalvando(true);
    try {
      let dados = { ...formData };
      if (imagemFile) {
        dados.imagem = await uploadImagem(imagemFile);
      }
      for (const tam of tamanhosSelecionados) {
        await addProduto({ ...dados, tamanho: tam, quantidade: quantidadesPorTamanho[tam] || 0 });
      }
      onClose();
    } catch {
      alert('Erro ao salvar produto.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-slate-800">Novo Produto</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-slate-700 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1.5">Nome do Produto</label>
              <input
                required
                type="text"
                value={formData.nome}
                onChange={e => setFormData({ ...formData, nome: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Categoria</label>
              <select
                value={formData.categoria}
                onChange={e => setFormData({ ...formData, categoria: e.target.value as Categoria })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="Camiseta">Camiseta</option>
                <option value="Calça">Calça</option>
                <option value="Bermuda">Bermuda</option>
                <option value="Moletom">Moletom</option>
                <option value="Casaco">Casaco</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Cor</label>
              <input
                type="text"
                value={formData.cor}
                onChange={e => setFormData({ ...formData, cor: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Tamanhos
              {tamanhosSelecionados.length > 0 && (
                <span className="text-violet-600"> ({tamanhosSelecionados.length})</span>
              )}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {todosOsTamanhos.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTamanho(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${
                    tamanhosSelecionados.includes(t)
                      ? 'border-violet-500 bg-violet-50 text-violet-700'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                placeholder="Tamanho personalizado..."
                value={novoTamanho}
                onChange={e => setNovoTamanho(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTamanho(); } }}
                className="flex-1 px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <button type="button" onClick={handleAddTamanho} className="px-3 py-1.5 text-xs font-medium bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200 transition-colors">
                + Criar
              </button>
            </div>

            {tamanhosSelecionados.length > 0 && (
              <div className="mt-3 p-3 bg-violet-50/50 border border-violet-100 rounded-xl">
                <label className="block text-xs font-bold text-violet-800 mb-2">Estoque por tamanho</label>
                <div className="grid grid-cols-4 gap-2">
                  {tamanhosSelecionados.map(t => (
                    <div key={t} className="flex flex-col bg-white p-1.5 rounded-lg border border-violet-200/50">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">{t}</span>
                      <input
                        type="number"
                        min="0"
                        value={quantidadesPorTamanho[t] ?? ''}
                        onChange={e => setQuantidadesPorTamanho(q => ({ ...q, [t]: Number(e.target.value) }))}
                        className="w-full text-center px-1 py-1 bg-slate-50 border border-slate-200 rounded text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Custo (R$)</label>
              <input
                required type="number" step="0.01" min="0"
                value={formData.precoCusto}
                onChange={e => setFormData({ ...formData, precoCusto: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Venda (R$)</label>
              <input
                required type="number" step="0.01" min="0"
                value={formData.precoVenda}
                onChange={e => setFormData({ ...formData, precoVenda: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Imagem (Opcional)</label>
            {imagemPreview ? (
              <div className="relative w-full h-40 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                <img src={imagemPreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setImagemPreview(''); setImagemFile(null); setFormData(f => ({ ...f, imagem: '' })); }}
                  className="absolute top-2 right-2 bg-white/90 hover:bg-white text-slate-600 hover:text-red-500 p-1.5 rounded-full shadow transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-violet-400 hover:bg-violet-50/50 transition-colors">
                <Upload className="w-6 h-6 text-slate-400 mb-1" />
                <span className="text-xs text-slate-500 font-medium">Enviar foto</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} className="hidden" />
              </label>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 hover:bg-slate-100 text-slate-600 rounded-xl font-medium transition-colors">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={tamanhosSelecionados.length === 0 || salvando}
              className="px-6 py-2 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-medium transition-colors shadow-sm shadow-violet-200 disabled:shadow-none"
            >
              {salvando ? 'Salvando...' : tamanhosSelecionados.length <= 1 ? 'Cadastrar' : `Cadastrar ${tamanhosSelecionados.length} Tamanhos`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
