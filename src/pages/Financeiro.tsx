import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import type { Despesa, FechamentoCaixa as FechamentoType } from '../store/useStore';
import {
  PieChart, TrendingUp, TrendingDown, DollarSign, Plus, X,
  ChevronDown, ChevronRight, Lock, Globe, QrCode,
  Banknote, CreditCard, ChevronLeft,
} from 'lucide-react';

type ExtratoItem =
  | { type: 'caixa'; date: Date; data: FechamentoType }
  | { type: 'venda_online'; date: Date; data: { id: string; data: string; produtoNome: string; quantidade: number; valorTotal: number; clienteNome?: string; metodoPagamento: string; parcelas?: number } }
  | { type: 'despesa'; date: Date; data: { id: string; data: string; descricao: string; valor: number; categoria: string } };

export default function Financeiro() {
  const { vendas, despesas, fechamentosCaixa, addDespesa } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedCaixa, setExpandedCaixa] = useState<string | null>(null);

  // Mês/ano selecionado
  const [mesSelecionado, setMesSelecionado] = useState(() => {
    const now = new Date();
    return { month: now.getMonth(), year: now.getFullYear() };
  });

  const navegarMes = (delta: number) => {
    setMesSelecionado(prev => {
      let m = prev.month + delta;
      let y = prev.year;
      if (m > 11) { m = 0; y++; }
      if (m < 0) { m = 11; y--; }
      return { month: m, year: y };
    });
    setExpandedCaixa(null);
  };

  const formatBRL = (valor: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

  const labelMes = new Date(mesSelecionado.year, mesSelecionado.month).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  // Filtrar dados do mês
  const vendasMes = useMemo(() => vendas.filter(v => {
    const d = new Date(v.data);
    return d.getMonth() === mesSelecionado.month && d.getFullYear() === mesSelecionado.year;
  }), [vendas, mesSelecionado]);

  const despesasMes = useMemo(() => despesas.filter(d => {
    const dt = new Date(d.data);
    return dt.getMonth() === mesSelecionado.month && dt.getFullYear() === mesSelecionado.year;
  }), [despesas, mesSelecionado]);

  const caixasMes = useMemo(() => fechamentosCaixa.filter(f => {
    const d = new Date(f.data + 'T12:00:00');
    return d.getMonth() === mesSelecionado.month && d.getFullYear() === mesSelecionado.year && f.status === 'fechado';
  }).sort((a, b) => b.data.localeCompare(a.data)), [fechamentosCaixa, mesSelecionado]);

  const vendasOnlineMes = useMemo(() => vendasMes.filter(v => v.canal === 'online'), [vendasMes]);

  const receitasMes = vendasMes.reduce((acc, v) => acc + v.valorTotal, 0);
  const totalDespesasMes = despesasMes.reduce((acc, d) => acc + d.valor, 0);
  const saldoLiquido = receitasMes - totalDespesasMes;

  // Montar extrato cronológico
  const extrato = useMemo(() => {
    const items: ExtratoItem[] = [
      ...caixasMes.map(f => ({ type: 'caixa' as const, date: new Date(f.data + 'T23:59:59'), data: f })),
      ...vendasOnlineMes.map(v => ({ type: 'venda_online' as const, date: new Date(v.data), data: v })),
      ...despesasMes.map(d => ({ type: 'despesa' as const, date: new Date(d.data), data: d })),
    ];
    return items.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [caixasMes, vendasOnlineMes, despesasMes]);

  // Vendas presenciais de um caixa específico
  const getVendasDoCaixa = (dataStr: string) =>
    vendas.filter(v => {
      const dv = new Date(v.data).toISOString().split('T')[0];
      return dv === dataStr && v.canal === 'presencial';
    });

  const formatPagamento = (m: string, parcelas?: number) => {
    const labels: Record<string, string> = { PIX: 'PIX', DINHEIRO: 'Dinheiro', DEBITO: 'Debito', CREDITO_VISTA: 'Credito', CREDITO_PARCELADO: 'Credito', CARTAO: 'Cartao' };
    const label = labels[m] || m;
    if (m === 'CREDITO_PARCELADO' && parcelas) return `${label} ${parcelas}x`;
    return label;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <PieChart className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Controle Financeiro</h1>
          </div>
          <p className="text-slate-500">Extrato de caixas, vendas online e despesas.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
            <button onClick={() => navegarMes(-1)} className="p-2 hover:bg-white rounded-lg transition-colors">
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <span className="text-sm font-semibold text-slate-700 capitalize min-w-[140px] text-center">{labelMes}</span>
            <button onClick={() => navegarMes(1)} className="p-2 hover:bg-white rounded-lg transition-colors">
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-indigo-200"
          >
            <Plus className="w-5 h-5" />
            Nova Despesa
          </button>
        </div>
      </div>

      {/* Cards resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 truncate ml-2">
              Receitas
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
              Despesas
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500 mb-1 truncate">Total Saidas</p>
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
                Saldo Liquido
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white/70 mb-1 truncate">Resultado no Periodo</p>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight truncate">{formatBRL(saldoLiquido)}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Extrato */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-800">Extrato de Movimentacoes</h2>
          <p className="text-sm text-slate-500">Caixas fechados, vendas online e despesas do periodo.</p>
        </div>

        {extrato.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-500">
            Nenhuma movimentacao neste periodo.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {extrato.map((item) => {
              if (item.type === 'caixa') {
                const f = item.data;
                const isExpanded = expandedCaixa === f.id;
                const vendasCaixa = isExpanded ? getVendasDoCaixa(f.data) : [];
                const totalCaixa = f.totalVendas + f.totalTrocas;

                return (
                  <div key={`caixa-${f.id}`}>
                    <button
                      onClick={() => setExpandedCaixa(isExpanded ? null : f.id)}
                      className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
                        <Lock className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800">
                          Caixa do dia — {new Date(f.data + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-xs text-slate-400">
                          {f.operadorNome} · {f.quantidadeVendas} venda{f.quantidadeVendas !== 1 ? 's' : ''}
                          {f.quantidadeTrocas > 0 && ` · ${f.quantidadeTrocas} troca${f.quantidadeTrocas !== 1 ? 's' : ''}`}
                        </p>
                      </div>
                      <span className="text-sm font-black text-emerald-600 shrink-0">+{formatBRL(totalCaixa)}</span>
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
                    </button>

                    {isExpanded && (
                      <div className="bg-slate-50/80 border-t border-slate-100 px-6 py-4 space-y-4">
                        {/* Tabela de vendas do caixa */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm">
                            <thead>
                              <tr className="text-slate-400 text-xs uppercase tracking-widest">
                                <th className="pb-2 font-medium">Hora</th>
                                <th className="pb-2 font-medium">Tipo</th>
                                <th className="pb-2 font-medium">Produto</th>
                                <th className="pb-2 font-medium">Pagamento</th>
                                <th className="pb-2 font-medium text-right">Valor</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200/60">
                              {vendasCaixa.length === 0 ? (
                                <tr><td colSpan={5} className="py-4 text-center text-slate-400 text-xs">Nenhuma venda presencial neste dia.</td></tr>
                              ) : vendasCaixa.map(v => (
                                <tr key={v.id}>
                                  <td className="py-2 text-slate-600">{new Date(v.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                                  <td className="py-2">
                                    {v.tipoVenda === 'troca' ? (
                                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-700">Troca</span>
                                    ) : v.tipoVenda === 'devolucao' ? (
                                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700">Devolucao</span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-700">Venda</span>
                                    )}
                                  </td>
                                  <td className="py-2 text-slate-700 font-medium">
                                    {v.produtoNome}
                                    {v.quantidade > 1 && <span className="text-slate-400 ml-1">({v.quantidade} un)</span>}
                                  </td>
                                  <td className="py-2">
                                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600">
                                      {formatPagamento(v.metodoPagamento, v.parcelas)}
                                    </span>
                                  </td>
                                  <td className="py-2 text-right font-bold text-slate-800">{formatBRL(v.valorTotal)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Resumo por pagamento */}
                        <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-200/60">
                          {f.totalPix > 0 && (
                            <div className="flex items-center gap-2 text-xs">
                              <QrCode className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-slate-500">PIX:</span>
                              <span className="font-bold text-slate-700">{formatBRL(f.totalPix)}</span>
                            </div>
                          )}
                          {f.totalDinheiro > 0 && (
                            <div className="flex items-center gap-2 text-xs">
                              <Banknote className="w-3.5 h-3.5 text-amber-500" />
                              <span className="text-slate-500">Dinheiro:</span>
                              <span className="font-bold text-slate-700">{formatBRL(f.totalDinheiro)}</span>
                            </div>
                          )}
                          {f.totalCartao > 0 && (
                            <div className="flex items-center gap-2 text-xs">
                              <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                              <span className="text-slate-500">Cartao:</span>
                              <span className="font-bold text-slate-700">{formatBRL(f.totalCartao)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              if (item.type === 'venda_online') {
                const v = item.data;
                return (
                  <div key={`online-${v.id}`} className="flex items-center gap-4 px-6 py-4">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                      <Globe className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800">
                        Venda Online — {v.produtoNome}
                        {v.quantidade > 1 && ` (${v.quantidade} un)`}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(v.data).toLocaleDateString('pt-BR')} {new Date(v.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        {v.clienteNome && ` · ${v.clienteNome}`}
                        {` · ${formatPagamento(v.metodoPagamento, v.parcelas)}`}
                      </p>
                    </div>
                    <span className="text-sm font-black text-indigo-600 shrink-0">+{formatBRL(v.valorTotal)}</span>
                  </div>
                );
              }

              if (item.type === 'despesa') {
                const d = item.data;
                return (
                  <div key={`desp-${d.id}`} className="flex items-center gap-4 px-6 py-4">
                    <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">
                      <TrendingDown className="w-4 h-4 text-rose-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800">
                        {d.categoria}: {d.descricao}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(d.data).toLocaleDateString('pt-BR')} {new Date(d.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className="text-sm font-black text-rose-600 shrink-0">-{formatBRL(d.valor)}</span>
                  </div>
                );
              }

              return null;
            })}
          </div>
        )}
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
              onChange={e => setFormData({...formData, categoria: e.target.value as Despesa['categoria']})}
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
