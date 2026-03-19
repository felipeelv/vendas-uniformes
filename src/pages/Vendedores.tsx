import { useState } from 'react';
import { useStore } from '../store/useStore';
import type { Usuario } from '../store/useStore';
import { Users, Plus, Edit2, Trash2, X } from 'lucide-react';

export default function Vendedores() {
  const { usuarios, deleteUsuario } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);

  const handleEdit = (usuario: Usuario) => {
    setEditingUsuario(usuario);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário/vendedor?')) {
      await deleteUsuario(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 truncate">Equipe de Vendas</h1>
          </div>
          <p className="text-slate-500 truncate">Gerencie os vendedores e administradores que operam o caixa.</p>
        </div>
        <button 
          onClick={() => { setEditingUsuario(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-indigo-200 shrink-0"
        >
          <Plus className="w-5 h-5" />
          Novo Usuário
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                <th className="px-6 py-4 font-semibold">Nome do Operador</th>
                <th className="px-6 py-4 font-semibold">Nível de Acesso</th>
                <th className="px-6 py-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usuarios.map(usuario => (
                <tr key={usuario.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">{usuario.nome}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-md text-xs font-bold ${usuario.role === 'Admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                      {usuario.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(usuario)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Editar Usuário"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(usuario.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Excluir Usuário"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {usuarios.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                    Nenhum usuário cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <UsuarioModal 
          usuario={editingUsuario} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
}

function UsuarioModal({ usuario, onClose }: { 
  usuario: Usuario | null, 
  onClose: () => void
}) {
  const { addUsuario, updateUsuario } = useStore();
  const [formData, setFormData] = useState({
    nome: usuario?.nome || '',
    role: usuario?.role || 'Vendedor' as 'Admin' | 'Vendedor'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (usuario) {
      await updateUsuario(usuario.id, formData);
    } else {
      await addUsuario(formData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800">
            {usuario ? 'Editar Operador' : 'Novo Operador'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-slate-700">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700">Nome do Vendedor / Administrador</label>
            <input 
              required
              type="text" 
              placeholder="Ex: Carlos (Vendedor)"
              value={formData.nome}
              onChange={e => setFormData({...formData, nome: e.target.value})}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors shadow-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700">Nível de Acesso no Sistema</label>
            <select 
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value as 'Admin' | 'Vendedor'})}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors shadow-sm"
            >
              <option value="Vendedor">Vendedor (Sessão Regular)</option>
              <option value="Admin">Administrador (Pode ver Finanças/Relatório)</option>
            </select>
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
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-sm shadow-indigo-200"
            >
              {usuario ? 'Atualizar Dados' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
