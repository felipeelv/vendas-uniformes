import { useStore } from '../store/useStore';
import { Target, Users, Award, Receipt, Download } from 'lucide-react';

export default function Relatorios() {
  const { vendas, usuarios } = useStore();

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const vendasMes = vendas.filter(v => {
    const dataVenda = new Date(v.data);
    return dataVenda.getMonth() === currentMonth && dataVenda.getFullYear() === currentYear;
  });

  // Calculate sales by vendor
  const desempenhoVendedores = usuarios.filter(u => u.role === 'Vendedor' || u.role === 'Admin').map(usuario => {
    const minVendas = vendasMes.filter(v => v.vendedorId === usuario.id);
    const totalValor = minVendas.reduce((acc, v) => acc + v.valorTotal, 0);
    const totalItens = minVendas.reduce((acc, v) => acc + v.quantidade, 0);
    return {
      ...usuario,
      totalValor,
      totalItens,
      vendasCount: minVendas.length
    };
  }).sort((a, b) => b.totalValor - a.totalValor);

  const bestSeller = desempenhoVendedores[0];

  const formatBRL = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  const handleExportCSV = () => {
    const headers = ['Vendedor', 'Cargo', 'Vendas Realizadas', 'Peças Vendidas', 'Receita Gerada (R$)'];
    const rows = desempenhoVendedores.map(v => [
      v.nome,
      v.role,
      v.vendasCount.toString(),
      v.totalItens.toString(),
      v.totalValor.toFixed(2).replace('.', ',')
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map(e => e.join(';'))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio_vendedores_${currentMonth + 1}_${currentYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg shrink-0">
              <Target className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 truncate">Desempenho & Equipe</h1>
          </div>
          <p className="text-slate-500 truncate">Acompanhe relatórios de vendas e performance dos vendedores cadastrados.</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm shrink-0"
        >
          <Download className="w-4 h-4" />
          Baixar Planilha
        </button>
      </div>

      {bestSeller && bestSeller.totalValor > 0 && (
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 rounded-2xl shadow-sm text-white flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-bl-full -z-0"></div>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center shrink-0 backdrop-blur-sm z-10 border border-white/20">
            <Award className="w-8 h-8 text-amber-100" />
          </div>
          <div className="z-10 text-center sm:text-left">
            <p className="text-orange-100 font-medium uppercase tracking-wide text-xs mb-1">Destaque do Mês</p>
            <h2 className="text-2xl font-bold">{bestSeller.nome} está liderando as vendas!</h2>
            <p className="text-orange-50 mt-1">Com {formatBRL(bestSeller.totalValor)} arrecadados ({bestSeller.totalItens} peças vendidas).</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-2 text-slate-800 font-semibold">
              <Users className="w-5 h-5 text-slate-500" />
              Ranking de Vendedores
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4 font-semibold">Vendedor</th>
                  <th className="px-6 py-4 font-semibold text-center">Nº de Vendas</th>
                  <th className="px-6 py-4 font-semibold text-center">Peças Vendidas</th>
                  <th className="px-6 py-4 font-semibold text-right">Receita Gerada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {desempenhoVendedores.map((vendedor, i) => (
                  <tr key={vendedor.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs ring-2 ring-white">
                          {i + 1}º
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{vendedor.nome}</p>
                          <p className="text-xs text-slate-500">{vendedor.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-slate-600">
                      {vendedor.vendasCount}
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-slate-600">
                      {vendedor.totalItens} un
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-600">
                      {formatBRL(vendedor.totalValor)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-2 text-slate-800 font-semibold">
              <Receipt className="w-5 h-5 text-slate-500" />
              Métricas Totais
            </div>
          </div>
          <div className="p-6 flex-1 flex flex-col gap-6">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-500 mb-1 truncate">Volume Arrecadado Mensal</p>
              <div className="flex items-end gap-2 min-w-0">
                <h3 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight truncate">
                  {formatBRL(vendasMes.reduce((acc, v) => acc + v.valorTotal, 0))}
                </h3>
              </div>
            </div>
            
            <div className="h-px bg-slate-100 w-full" />
            
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-500 mb-1 truncate">Tickets Emitidos</p>
              <h3 className="text-xl lg:text-2xl font-bold text-slate-700 tracking-tight truncate">
                {vendasMes.length} operações
              </h3>
            </div>
            
            <div className="h-px bg-slate-100 w-full" />
            
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-500 mb-1 truncate">Ticket Médio por Venda</p>
              <h3 className="text-xl lg:text-2xl font-bold text-slate-700 tracking-tight truncate">
                {vendasMes.length > 0 
                  ? formatBRL(vendasMes.reduce((acc, v) => acc + v.valorTotal, 0) / vendasMes.length)
                  : 'R$ 0,00'
                }
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
