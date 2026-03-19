import { useState } from 'react';
import { useStore } from '../store/useStore';
import type { Produto, Categoria } from '../store/useStore';
import { TAMANHOS_PADRAO } from '../store/useStore';
import { Plus, Search, Edit2, Trash2, AlertCircle, X, Upload, ImageOff } from 'lucide-react';

export default function Estoque() {
  const { produtos, deleteProduto } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);

  // Filter
  const filteredProdutos = produtos.filter(p => 
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (produto?: Produto) => {
    if (produto) {
      setEditingProduto(produto);
    } else {
      setEditingProduto(null);
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      deleteProduto(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gerenciamento de Estoque</h1>
          <p className="text-slate-500 mt-1">Controle de catálogo e quantidade de uniformes</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-violet-200"
        >
          <Plus className="w-5 h-5" />
          Novo Produto
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                <th className="px-6 py-4 font-medium">Produto</th>
                <th className="px-6 py-4 font-medium">Categoria</th>
                <th className="px-6 py-4 font-medium">Tamanho & Cor</th>
                <th className="px-6 py-4 font-medium text-right">Estoque</th>
                <th className="px-6 py-4 font-medium text-right">Preço de Venda</th>
                <th className="px-6 py-4 font-medium text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProdutos.map((produto) => (
                <tr key={produto.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{produto.nome}</div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">ID: {produto.id}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <span className="inline-flex px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                      {produto.categoria}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <div>Tam: <strong className="text-slate-900">{produto.tamanho}</strong></div>
                    <div className="text-sm">{produto.cor}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className={`inline-flex items-center gap-1.5 font-semibold ${produto.quantidade <= 10 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {produto.quantidade <= 10 && <AlertCircle className="w-4 h-4" />}
                      {produto.quantidade} un
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-slate-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.precoVenda)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleOpenModal(produto)}
                        className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(produto.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProdutos.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <ProdutoModal 
          produto={editingProduto} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
}

function ProdutoModal({ produto, onClose }: { produto: Produto | null, onClose: () => void }) {
  const { addProduto, updateProduto, tamanhosCustom, addTamanhoCustom, produtos, uploadImagem } = useStore();
  const [novoTamanho, setNovoTamanho] = useState('');
  const [salvando, setSalvando] = useState(false);
  const isEditing = !!produto;

  const todosOsTamanhos: string[] = [...TAMANHOS_PADRAO, ...tamanhosCustom];

  const [tamanhosSelecionados, setTamanhosSelecionados] = useState<string[]>(
    produto ? [produto.tamanho] : []
  );
  
  const [quantidadesPorTamanho, setQuantidadesPorTamanho] = useState<Record<string, number>>(
    produto ? { [produto.tamanho]: produto.quantidade } : {}
  );

  const [formData, setFormData] = useState({
    nome: produto?.nome || '',
    categoria: produto?.categoria || 'Camiseta',
    cor: produto?.cor || '',
    precoCusto: produto?.precoCusto || 0,
    precoVenda: produto?.precoVenda || 0,
    imagem: produto?.imagem || '',
  });

  const [imagemPreview, setImagemPreview] = useState<string>(produto?.imagem || '');
  const [imagemFile, setImagemFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagemFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagemPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, imagem: '' }));
    setImagemPreview('');
    setImagemFile(null);
  };

  const toggleTamanho = (t: string) => {
    setTamanhosSelecionados(prev => {
      if (prev.includes(t)) {
        const next = prev.filter(x => x !== t);
        setQuantidadesPorTamanho(q => { const { [t]: _, ...rest } = q; return rest; });
        return next;
      } else {
        const existente = produtos.find(p => p.nome === formData.nome && p.categoria === formData.categoria && p.cor === formData.cor && p.tamanho === t);
        setQuantidadesPorTamanho(q => ({ ...q, [t]: existente ? existente.quantidade : 0 }));
        return [...prev, t];
      }
    });
  };

  const handleAddTamanho = () => {
    const t = novoTamanho.trim().toUpperCase();
    if (!t) return;
    if (!todosOsTamanhos.includes(t)) {
      addTamanhoCustom(t);
    }
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
      let dadosFinais = { ...formData };

      // Upload da imagem para o Supabase Storage se houver arquivo novo
      if (imagemFile) {
        setUploadingImage(true);
        const url = await uploadImagem(imagemFile);
        dadosFinais.imagem = url;
        setUploadingImage(false);
      }

      if (isEditing) {
        const tamanhoOriginal = produto!.tamanho;
        const tamanhoPrincipal = tamanhosSelecionados.includes(tamanhoOriginal) ? tamanhoOriginal : tamanhosSelecionados[0];

        await updateProduto(produto!.id, {
          ...dadosFinais,
          tamanho: tamanhoPrincipal,
          quantidade: quantidadesPorTamanho[tamanhoPrincipal] || 0
        } as any);

        for (const tam of tamanhosSelecionados.filter(t => t !== tamanhoPrincipal)) {
          const existente = produtos.find(p => p.nome === formData.nome && p.categoria === formData.categoria && p.cor === formData.cor && p.tamanho === tam && p.id !== produto!.id);
          if (existente) {
            await updateProduto(existente.id, { ...dadosFinais, tamanho: tam, quantidade: quantidadesPorTamanho[tam] || 0 } as any);
          } else {
            await addProduto({ ...dadosFinais, tamanho: tam, quantidade: quantidadesPorTamanho[tam] || 0 } as any);
          }
        }
      } else {
        for (const tam of tamanhosSelecionados) {
          await addProduto({ ...dadosFinais, tamanho: tam, quantidade: quantidadesPorTamanho[tam] || 0 } as any);
        }
      }
      onClose();
    } catch (err) {
      console.error('Erro ao salvar produto:', err);
      alert('Erro ao salvar produto. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-slate-800">
            {isEditing ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-slate-700 overflow-y-auto flex-1">
          <div>
            <label className="block text-sm font-medium mb-1.5">Nome do Produto</label>
            <input
              required
              type="text"
              value={formData.nome}
              onChange={e => setFormData({...formData, nome: e.target.value})}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Categoria</label>
            <select
              value={formData.categoria}
              onChange={e => setFormData({...formData, categoria: e.target.value as Categoria})}
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
            <label className="block text-sm font-medium mb-1.5">
              Tamanhos
              {tamanhosSelecionados.length > 0 && (
                <span className="text-violet-600"> ({tamanhosSelecionados.length} selecionado{tamanhosSelecionados.length > 1 ? 's' : ''})</span>
              )}
            </label>
            <p className="text-xs text-slate-400 mb-2">Selecione os tamanhos associados. Você pode adicionar ou remover tamanhos.</p>
            <div className="flex flex-wrap gap-1.5">
              {todosOsTamanhos.map(t => {
                const selected = tamanhosSelecionados.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTamanho(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${
                      selected
                        ? 'border-violet-500 bg-violet-50 text-violet-700'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                placeholder="Criar tamanho personalizado..."
                value={novoTamanho}
                onChange={e => setNovoTamanho(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTamanho(); } }}
                className="flex-1 px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <button
                type="button"
                onClick={handleAddTamanho}
                className="px-3 py-1.5 text-xs font-medium bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200 transition-colors"
              >
                + Criar
              </button>
            </div>

            {tamanhosSelecionados.length > 0 && (
              <div className="mt-4 p-4 bg-violet-50/50 border border-violet-100 rounded-xl">
                <label className="block text-sm font-bold text-violet-800 mb-3">Definir Estoque para cada Tamanho</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {tamanhosSelecionados.map(t => (
                    <div key={t} className="flex flex-col bg-white p-2 rounded-lg border border-violet-200/50 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 text-center">TAMANHO {t}</span>
                      <input 
                        type="number" 
                        min="0"
                        required
                        value={quantidadesPorTamanho[t] === undefined ? '' : quantidadesPorTamanho[t]}
                        onChange={e => setQuantidadesPorTamanho(q => ({...q, [t]: Number(e.target.value)}))}
                        className="w-full text-center px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm font-bold text-slate-700"
                        placeholder="Qtd."
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Preco de Custo (R$)</label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={formData.precoCusto}
                onChange={e => setFormData({...formData, precoCusto: Number(e.target.value)})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Preco de Venda (R$)</label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={formData.precoVenda}
                onChange={e => setFormData({...formData, precoVenda: Number(e.target.value)})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Imagem do Produto (Opcional)</label>
            {imagemPreview ? (
              <div className="relative w-full h-48 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                <img src={imagemPreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-white/90 hover:bg-white text-slate-600 hover:text-red-500 p-1.5 rounded-full shadow transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-40 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-violet-400 hover:bg-violet-50/50 transition-colors">
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-sm text-slate-500 font-medium">Clique para enviar uma foto</span>
                <span className="text-xs text-slate-400 mt-1">JPG, PNG ou WebP</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="pt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 hover:bg-slate-100 text-slate-600 rounded-xl font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={tamanhosSelecionados.length === 0 || salvando}
              className="px-6 py-2 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-medium transition-colors shadow-sm shadow-violet-200 disabled:shadow-none"
            >
              {salvando
                ? (uploadingImage ? 'Enviando imagem...' : 'Salvando...')
                : isEditing ? 'Salvar' : tamanhosSelecionados.length <= 1 ? 'Cadastrar' : `Cadastrar ${tamanhosSelecionados.length} Tamanhos`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
