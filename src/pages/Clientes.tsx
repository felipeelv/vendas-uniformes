import { useState } from 'react';
import { useStore } from '../store/useStore';
import type { Cliente } from '../store/useStore';
import { UsersRound, Plus, Search, Edit2, Trash2, X } from 'lucide-react';

export default function Clientes() {
  const { clientes, addCliente, updateCliente, deleteCliente } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);

  const filteredClientes = clientes.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.documento.includes(searchTerm)
  );

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      deleteCliente(id);
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
                <th className="px-6 py-4 font-semibold">Telefone</th>
                <th className="px-6 py-4 font-semibold">Documento</th>
                <th className="px-6 py-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClientes.map(cliente => (
                <tr key={cliente.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">{cliente.nome}</p>
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
                        onClick={() => handleEdit(cliente)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar Cliente"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(cliente.id)}
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
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
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
    </div>
  );
}

function ClienteModal({ cliente, onClose, onSave }: { 
  cliente: Cliente | null, 
  onClose: () => void, 
  onSave: (idOrData: any, data?: any) => void 
}) {
  const [formData, setFormData] = useState({
    nome: cliente?.nome || '',
    telefone: cliente?.telefone || '',
    documento: cliente?.documento || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cliente) {
      onSave(cliente.id, formData);
    } else {
      onSave(formData);
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
