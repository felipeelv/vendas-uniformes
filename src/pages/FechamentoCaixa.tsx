import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Lock, Unlock, DollarSign, CreditCard, Banknote, QrCode, RefreshCw, Calendar, ShieldCheck } from 'lucide-react';

export default function FechamentoCaixa() {
  const { vendas, fechamentosCaixa, fecharCaixa, reabrirCaixa, usuarioAtivo } = useStore();
  const [dataSelecionada, setDataSelecionada] = useState(() => new Date().toISOString().split('T')[0]);

  const fechamentoAtual = fechamentosCaixa.find(f => f.data === dataSelecionada);
  const isFechado = fechamentoAtual?.status === 'fechado';
  const isAdmin = usuarioAtivo?.role === 'Admin';

  // Vendas do dia selecionado
  const vendasDoDia = useMemo(() => {
    return vendas.filter(v => {
      const dataVenda = new Date(v.data).toISOString().split('T')[0];
      return dataVenda === dataSelecionada;
    });
  }, [vendas, dataSelecionada]);

  const resumo = useMemo(() => {
    const vendasNormais = vendasDoDia.filter(v => v.tipoVenda === 'venda');
    const trocas = vendasDoDia.filter(v => v.tipoVenda === 'troca');

    const totalVendas = vendasNormais.reduce((acc, v) => acc + v.valorTotal, 0);
    const totalTrocas = trocas.reduce((acc, v) => acc + v.valorTotal, 0);
    const totalGeral = vendasDoDia.reduce((acc, v) => acc + v.valorTotal, 0);

    const totalPix = vendasDoDia.filter(v => v.metodoPagamento === 'PIX').reduce((acc, v) => acc + v.valorTotal, 0);
    const totalCartao = vendasDoDia.filter(v => v.metodoPagamento === 'CARTAO').reduce((acc, v) => acc + v.valorTotal, 0);
    const totalDinheiro = vendasDoDia.filter(v => v.metodoPagamento === 'DINHEIRO').reduce((acc, v) => acc + v.valorTotal, 0);

    return {
      totalVendas,
      totalTrocas,
      totalGeral,
      quantidadeVendas: vendasNormais.length,
      quantidadeTrocas: trocas.length,
      totalPix,
      totalCartao,
      totalDinheiro,
    };
  }, [vendasDoDia]);

  const formatBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const handleFechar = () => {
    if (confirm(`Deseja fechar o caixa do dia ${new Date(dataSelecionada + 'T12:00:00').toLocaleDateString('pt-BR')}? Apos o fechamento, nao sera possivel registrar novas vendas neste dia.`)) {
      fecharCaixa(dataSelecionada);
    }
  };

  const handleReabrir = () => {
    if (!fechamentoAtual) return;
    if (confirm('Deseja reabrir o caixa? Isso permitira novas vendas no dia.')) {
      reabrirCaixa(fechamentoAtual.id);
    }
  };

  const formatDataDisplay = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

  // Historico de fechamentos
  const historico = useMemo(() => {
    return [...fechamentosCaixa]
      .sort((a, b) => b.data.localeCompare(a.data))
      .slice(0, 30);
  }, [fechamentosCaixa]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Fechamento de Caixa</h1>
          </div>
          <p className="text-slate-500">Resumo diario de vendas e trocas com controle de fechamento.</p>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-slate-400" />
          <input
            type="date"
            value={dataSelecionada}
            onChange={e => setDataSelecionada(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 shadow-sm"
          />
        </div>
      </div>

      {/* Status do caixa */}
      {isFechado && (
        <div className="bg-slate-900 text-white p-5 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Caixa Fechado</h3>
              <p className="text-slate-300 text-sm">
                Fechado por {fechamentoAtual?.operadorNome} em {new Date(fechamentoAtual!.dataFechamento).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
          {isAdmin && (
            <button
              onClick={handleReabrir}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-sm transition-colors"
            >
              <Unlock className="w-4 h-4" />
              Reabrir Caixa
            </button>
          )}
        </div>
      )}

      {/* Data selecionada */}
      <div className="text-center">
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
          {formatDataDisplay(dataSelecionada)}
        </p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Vendas</span>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">{formatBRL(resumo.totalVendas)}</p>
          <p className="text-xs text-slate-400 mt-1 font-medium">{resumo.quantidadeVendas} venda{resumo.quantidadeVendas !== 1 ? 's' : ''}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Trocas</span>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">{formatBRL(resumo.totalTrocas)}</p>
          <p className="text-xs text-slate-400 mt-1 font-medium">{resumo.quantidadeTrocas} troca{resumo.quantidadeTrocas !== 1 ? 's' : ''}</p>
        </div>

        <div className="col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 p-5 rounded-2xl shadow-sm border border-slate-700 text-white">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Total Geral do Dia</span>
          </div>
          <p className="text-3xl font-black tracking-tight">{formatBRL(resumo.totalGeral)}</p>
          <p className="text-xs text-slate-400 mt-1 font-medium">{vendasDoDia.length} operacao{vendasDoDia.length !== 1 ? 'es' : ''} no total</p>
        </div>
      </div>

      {/* Resumo por forma de pagamento */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <QrCode className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">PIX</p>
            <p className="text-xl font-black text-slate-900">{formatBRL(resumo.totalPix)}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cartao</p>
            <p className="text-xl font-black text-slate-900">{formatBRL(resumo.totalCartao)}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <Banknote className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dinheiro</p>
            <p className="text-xl font-black text-slate-900">{formatBRL(resumo.totalDinheiro)}</p>
          </div>
        </div>
      </div>

      {/* Tabela de vendas do dia */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-800">Vendas do Dia</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                <th className="px-6 py-4 font-medium">Hora</th>
                <th className="px-6 py-4 font-medium">Tipo</th>
                <th className="px-6 py-4 font-medium">Produto</th>
                <th className="px-6 py-4 font-medium">Vendedor</th>
                <th className="px-6 py-4 font-medium">Pagamento</th>
                <th className="px-6 py-4 font-medium text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vendasDoDia.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Nenhuma venda registrada neste dia.
                  </td>
                </tr>
              ) : (
                vendasDoDia.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-slate-600 font-medium text-sm">
                      {new Date(v.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4">
                      {v.tipoVenda === 'troca' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                          <RefreshCw className="w-3 h-3" /> Troca
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                          Venda
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-800 text-sm font-medium">
                      {v.produtoNome}
                      {v.quantidade > 1 && <span className="text-slate-400 ml-1">({v.quantidade} un)</span>}
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">{v.vendedorNome}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600">
                        {v.metodoPagamento === 'PIX' ? 'PIX' : v.metodoPagamento === 'CARTAO' ? 'Cartao' : 'Dinheiro'}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-right font-bold text-sm ${v.valorTotal >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {formatBRL(v.valorTotal)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Botao de fechamento */}
      {!isFechado && (
        <div className="flex justify-center">
          <button
            onClick={handleFechar}
            className="flex items-center gap-3 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-slate-300"
          >
            <Lock className="w-5 h-5" />
            Fechar Caixa do Dia
          </button>
        </div>
      )}

      {/* Historico de fechamentos */}
      {historico.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-semibold text-slate-800">Historico de Fechamentos</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                  <th className="px-6 py-4 font-medium">Data</th>
                  <th className="px-6 py-4 font-medium">Operador</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Total Vendas</th>
                  <th className="px-6 py-4 font-medium text-right">Trocas</th>
                  <th className="px-6 py-4 font-medium text-right">Total Geral</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historico.map(f => (
                  <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-slate-800 font-medium text-sm">
                      {new Date(f.data + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">{f.operadorNome}</td>
                    <td className="px-6 py-4">
                      {f.status === 'fechado' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-900 text-white">
                          <Lock className="w-3 h-3" /> Fechado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                          <Unlock className="w-3 h-3" /> Reaberto
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-sm text-emerald-600">
                      {formatBRL(f.totalVendas)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-slate-600">
                      {f.quantidadeTrocas} ({formatBRL(f.totalTrocas)})
                    </td>
                    <td className="px-6 py-4 text-right font-black text-sm text-slate-900">
                      {formatBRL(f.totalVendas + f.totalTrocas)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
