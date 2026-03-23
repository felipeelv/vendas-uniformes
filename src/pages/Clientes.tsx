import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import type { Cliente, Venda } from '../store/useStore';
import { UsersRound, Plus, Search, Edit2, Trash2, X, ShoppingBag, RefreshCw, DollarSign } from 'lucide-react';

export default function Clientes() {
  const { clientes, vendas, addCliente, updateCliente, deleteCliente } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [historicoCliente, setHistoricoCliente] = useState<Cliente | null>(null);

  const filteredClientes = clientes.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.documento.includes(searchTerm)
  );

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      await deleteCliente(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
              <UsersRound className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 truncate">CRM / Clientes</h1>
          </div>
          <p className="text-slate-500 truncate">Base de dados de alunos e responsáveis para o PDV.</p>
        </div>
        <button 
          onClick={() => { setEditingCliente(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-blue-200 shrink-0"
        >
          <Plus className="w-5 h-5" />
          Novo Cliente
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-4 bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou documento..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors shadow-sm"
            />
          </div>
          <div className="flex items-center text-sm text-slate-500 font-medium px-2">
            {filteredClientes.length} cliente(s)
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-white text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                <th className="px-6 py-4 font-semibold">Nome / Aluno</th>
                <th className="px-6 py-4 font-semibold">Turma</th>
                <th className="px-6 py-4 font-semibold">Telefone</th>
                <th className="px-6 py-4 font-semibold">Documento</th>
                <th className="px-6 py-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClientes.map(cliente => (
                <tr key={cliente.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => setHistoricoCliente(cliente)}>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">{cliente.nome}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {cliente.turma || '-'}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {cliente.telefone || '-'}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {cliente.documento || '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(cliente); }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar Cliente"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(cliente.id); }}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Excluir Cliente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredClientes.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    Nenhum cliente cadastrado ou encontrado na busca.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <ClienteModal
          cliente={editingCliente}
          onClose={() => setIsModalOpen(false)}
          onSave={editingCliente ? (id, data) => updateCliente(id, data) : (data) => addCliente(data)}
        />
      )}

      {historicoCliente && (
        <HistoricoModal
          cliente={historicoCliente}
          vendas={vendas}
          onClose={() => setHistoricoCliente(null)}
        />
      )}
    </div>
  );
}

function ClienteModal({ cliente, onClose, onSave }: { 
  cliente: Cliente | null, 
  onClose: () => void, 
  onSave: (idOrData: any, data?: any) => Promise<void> | void
}) {
  const [formData, setFormData] = useState({
    nome: cliente?.nome || '',
    turma: cliente?.turma || '',
    telefone: cliente?.telefone || '',
    documento: cliente?.documento || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cliente) {
      await onSave(cliente.id, formData);
    } else {
      await onSave(formData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800">
            {cliente ? 'Editar Cliente' : 'Novo Cliente'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-slate-700">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700">Nome do Aluno ou Responsável</label>
            <input 
              required
              type="text" 
              placeholder="Ex: João da Silva"
              value={formData.nome}
              onChange={e => setFormData({...formData, nome: e.target.value})}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors shadow-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700">Turma</label>
            <input
              type="text"
              placeholder="Ex: 1ºA"
              value={formData.turma}
              onChange={e => setFormData({...formData, turma: e.target.value})}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700">Telefone / WhatsApp</label>
            <input 
              required
              type="text"
              placeholder="(11) 99999-9999"
              value={formData.telefone}
              onChange={e => setFormData({...formData, telefone: e.target.value})}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700">Documento (Opcional)</label>
            <input 
              type="text"
              placeholder="CPF ou RG"
              value={formData.documento}
              onChange={e => setFormData({...formData, documento: e.target.value})}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors shadow-sm"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-5 py-2.5 hover:bg-slate-100 text-slate-600 rounded-xl font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm shadow-blue-200"
            >
              {cliente ? 'Atualizar Dados' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function HistoricoModal({ cliente, vendas, onClose }: {
  cliente: Cliente;
  vendas: Venda[];
  onClose: () => void;
}) {
  const vendasCliente = useMemo(() =>
    vendas.filter(v => v.clienteId === cliente.id).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()),
    [vendas, cliente.id]
  );

  const totalGasto = vendasCliente.filter(v => v.tipoVenda === 'venda').reduce((acc, v) => acc + v.valorTotal, 0);
  const totalTrocas = vendasCliente.filter(v => v.tipoVenda === 'troca').length;

  const formatBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-start bg-slate-50/50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{cliente.nome}</h2>
            <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
              {cliente.turma && <span>Turma: {cliente.turma}</span>}
              {cliente.telefone && <span>{cliente.telefone}</span>}
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumo */}
        <div className="px-6 py-4 border-b border-slate-100 grid grid-cols-3 gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Gasto</p>
              <p className="text-lg font-black text-slate-900">{formatBRL(totalGasto)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Compras</p>
              <p className="text-lg font-black text-slate-900">{vendasCliente.filter(v => v.tipoVenda === 'venda').length}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trocas</p>
              <p className="text-lg font-black text-slate-900">{totalTrocas}</p>
            </div>
          </div>
        </div>

        {/* Lista de vendas */}
        <div className="flex-1 overflow-y-auto">
          {vendasCliente.length === 0 ? (
            <div className="px-6 py-12 text-center text-slate-500">
              Nenhuma compra registrada para este aluno.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white">
                <tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-3 font-semibold">Data</th>
                  <th className="px-6 py-3 font-semibold">Tipo</th>
                  <th className="px-6 py-3 font-semibold">Produto</th>
                  <th className="px-6 py-3 font-semibold">Pagamento</th>
                  <th className="px-6 py-3 font-semibold text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vendasCliente.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3 text-sm text-slate-600 font-medium">
                      {new Date(v.data).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-3">
                      {v.tipoVenda === 'troca' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                          <RefreshCw className="w-3 h-3" /> Troca
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                          Venda
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-800 font-medium">
                      {v.produtoNome}
                      {v.quantidade > 1 && <span className="text-slate-400 ml-1">({v.quantidade} un)</span>}
                    </td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600">
                        {({ PIX: 'PIX', DINHEIRO: 'Dinheiro', DEBITO: 'Debito', CREDITO_VISTA: 'Credito', CREDITO_PARCELADO: v.parcelas ? `Credito ${v.parcelas}x` : 'Credito', CARTAO: 'Cartao' } as Record<string, string>)[v.metodoPagamento] || v.metodoPagamento}
                      </span>
                    </td>
                    <td className={`px-6 py-3 text-right font-bold text-sm ${v.valorTotal >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {formatBRL(v.valorTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
