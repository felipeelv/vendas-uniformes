import { useState } from 'react';
import { useStore } from '../store/useStore';
import type { Despesa } from '../store/useStore';
import { PieChart, TrendingUp, TrendingDown, DollarSign, Plus, X } from 'lucide-react';

export default function Financeiro() {
  const { vendas, despesas, addDespesa } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Totais do mês atual
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const vendasMes = vendas.filter(v => {
    const dataVenda = new Date(v.data);
    return dataVenda.getMonth() === currentMonth && dataVenda.getFullYear() === currentYear;
  });

  const receitasMes = vendasMes.reduce((acc, v) => acc + v.valorTotal, 0);

  const despesasMes = despesas.filter(d => {
    const dataDesp = new Date(d.data);
    return dataDesp.getMonth() === currentMonth && dataDesp.getFullYear() === currentYear;
  });

  const totalDespesasMes = despesasMes.reduce((acc, d) => acc + d.valor, 0);

  const saldoLiquido = receitasMes - totalDespesasMes;

  const formatBRL = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <PieChart className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Controle Financeiro</h1>
          </div>
          <p className="text-slate-500">Balanço geral, receitas de vendas e registro de despesas operacionais.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-indigo-200"
        >
          <Plus className="w-5 h-5" />
          Nova Despesa
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 truncate ml-2">
              Receitas (Mês)
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500 mb-1 truncate">Total Entradas</p>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight truncate">{formatBRL(receitasMes)}</h3>
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <TrendingDown className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-100 truncate ml-2">
              Despesas (Mês)
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500 mb-1 truncate">Total Saídas</p>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight truncate">{formatBRL(totalDespesasMes)}</h3>
          </div>
        </div>

        <div className={`sm:col-span-2 lg:col-span-1 p-5 sm:p-6 rounded-2xl shadow-sm border relative overflow-hidden ${saldoLiquido >= 0 ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700' : 'bg-gradient-to-br from-rose-900 to-rose-800 border-rose-700'}`}>
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <DollarSign className="w-24 h-24 text-white" />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm">
                Saldo Líquido (Mês)
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white/70 mb-1 truncate">Resultado no Período</p>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight truncate">{formatBRL(saldoLiquido)}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-800">Histórico de Movimentações</h2>
          <p className="text-sm text-slate-500">Últimas vendas (entradas) e despesas registradas.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                <th className="px-6 py-4 font-medium">Data</th>
                <th className="px-6 py-4 font-medium">Descrição / Origem</th>
                <th className="px-6 py-4 font-medium">Tipo</th>
                <th className="px-6 py-4 font-medium text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Combine vendas and despesas, sort by date descending */}
              {[...vendas.map(v => ({
                  type: 'entrada' as const,
                  tipoVenda: v.tipoVenda || 'venda',
                  metodoPagamento: v.metodoPagamento || 'DINHEIRO',
                  date: new Date(v.data),
                  desc: `${v.tipoVenda === 'troca' ? 'Troca' : 'Venda'}: ${v.produtoNome} (${v.quantidade} un)`,
                  val: v.valorTotal
                })),
                ...despesas.map(d => ({
                  type: 'saida' as const,
                  tipoVenda: '' as string,
                  metodoPagamento: '' as string,
                  date: new Date(d.data),
                  desc: `${d.categoria}: ${d.descricao}`,
                  val: d.valor
                }))]
                .sort((a, b) => b.date.getTime() - a.date.getTime())
                .slice(0, 15)
                .map((mov, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-slate-600 font-medium">
                    {mov.date.toLocaleDateString('pt-BR')} <span className="text-slate-400 text-xs ml-1">{mov.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-800">
                    {mov.desc}
                    {mov.metodoPagamento && (
                      <span className="ml-2 text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        {mov.metodoPagamento === 'PIX' ? 'PIX' : mov.metodoPagamento === 'CARTAO' ? 'Cartao' : 'Dinheiro'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {mov.type === 'entrada' ? (
                      mov.tipoVenda === 'troca' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-700">Troca</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-700">Entrada</span>
                      )
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-700">Saida</span>
                    )}
                  </td>
                  <td className={`px-6 py-4 text-right font-bold ${mov.type === 'entrada' ? (mov.tipoVenda === 'troca' ? 'text-amber-600' : 'text-emerald-600') : 'text-rose-600'}`}>
                    {mov.type === 'entrada' ? '+' : '-'}{formatBRL(mov.val)}
                  </td>
                </tr>
              ))}
              {(vendas.length === 0 && despesas.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    Nenhuma movimentação para exibir.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <NovaDespesaModal onClose={() => setIsModalOpen(false)} onAdd={(d) => addDespesa(d)} />
      )}
    </div>
  );
}

function NovaDespesaModal({ onClose, onAdd }: { onClose: () => void, onAdd: (d: Omit<Despesa, 'id'>) => Promise<void> | void }) {
  const [formData, setFormData] = useState({
    descricao: '',
    valor: 0,
    categoria: 'Outros' as Despesa['categoria']
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAdd({
      ...formData,
      data: new Date().toISOString()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">
            Adicionar Despesa
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-slate-700">
          <div>
            <label className="block text-sm font-medium mb-1.5">Descrição</label>
            <input 
              required
              type="text" 
              placeholder="Ex: Conta de Luz / Aluguel"
              value={formData.descricao}
              onChange={e => setFormData({...formData, descricao: e.target.value})}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1.5">Categoria</label>
            <select 
              value={formData.categoria}
              onChange={e => setFormData({...formData, categoria: e.target.value as any})}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            >
              <option value="Fixa">Despesa Fixa (ex. Aluguel)</option>
              <option value="Variável">Despesa Variável (ex. Luz)</option>
              <option value="Fornecedor">Pagamento Fornecedor (ex. Tecidos)</option>
              <option value="Outros">Outras Saídas</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Valor da Despesa (R$)</label>
            <input 
              required
              type="number" 
              step="0.01"
              min="0.01"
              value={formData.valor || ''}
              onChange={e => setFormData({...formData, valor: Number(e.target.value)})}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
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
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-sm shadow-indigo-200"
            >
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
