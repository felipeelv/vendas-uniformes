# Financeiro como Extrato + Campo Canal — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganizar o Financeiro como extrato cronológico (caixas fechados + vendas online + despesas) e adicionar campo `canal` para distinguir vendas presenciais de online.

**Architecture:** Adicionar coluna `canal` na tabela `vendas` do Supabase. Atualizar tipos e funções no Zustand store. Reescrever `Financeiro.tsx` com extrato cronológico e accordion para expandir caixas. Ajustar `fecharCaixa` para filtrar só vendas presenciais.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Zustand, Supabase, lucide-react

**Spec:** `docs/superpowers/specs/2026-03-24-financeiro-extrato-caixas-design.md`

---

### Task 1: SQL Migration — adicionar coluna `canal`

**Files:**
- Create: `supabase-migrations/2026-03-24-add-canal-vendas.sql`
- Modify: `supabase-schema.sql:39-54`

- [ ] **Step 1: Criar arquivo de migration**

```sql
-- Migration: adicionar coluna canal na tabela vendas
-- Executar manualmente no SQL Editor do Supabase

ALTER TABLE vendas ADD COLUMN canal TEXT DEFAULT 'presencial';

-- Todas as vendas existentes ficam como 'presencial'
```

- [ ] **Step 2: Atualizar schema de referência**

Em `supabase-schema.sql`, adicionar na tabela `vendas` (após a linha `cliente_nome TEXT,`):

```sql
  canal TEXT DEFAULT 'presencial',
```

- [ ] **Step 3: Executar migration no Supabase SQL Editor**

Rodar o SQL do step 1 manualmente no dashboard do Supabase.

- [ ] **Step 4: Commit**

```bash
git add supabase-migrations/2026-03-24-add-canal-vendas.sql supabase-schema.sql
git commit -m "feat: add canal column to vendas table"
```

---

### Task 2: Store — adicionar tipo, campo `canal` e passar nas funções de registro

**Files:**
- Modify: `src/store/useStore.ts:6-8` (tipos)
- Modify: `src/store/useStore.ts:42-57` (interface Venda)
- Modify: `src/store/useStore.ts:180-197` (dbToVenda)
- Modify: `src/store/useStore.ts:456-469` (registrarVenda — insert)
- Modify: `src/store/useStore.ts:539-552` (registrarTroca — insert)
- Modify: `src/store/useStore.ts:623-635` (registrarDevolucao — insert)

- [ ] **Step 1: Adicionar tipo CanalVenda**

Em `src/store/useStore.ts`, após a linha 8 (`export type TipoItemVenda = ...`), adicionar:

```typescript
export type CanalVenda = 'presencial' | 'online';
```

- [ ] **Step 2: Adicionar campo `canal` à interface Venda**

Em `src/store/useStore.ts`, na interface `Venda` (linha ~57, após `clienteNome?: string;`), adicionar:

```typescript
  canal: CanalVenda;
```

- [ ] **Step 3: Atualizar dbToVenda**

Em `src/store/useStore.ts`, na função `dbToVenda` (linha ~180), adicionar ao objeto retornado:

```typescript
    canal: row.canal || 'presencial',
```

- [ ] **Step 4: Atualizar registrarVenda**

Em `src/store/useStore.ts`, na função `registrarVenda`, no objeto passado ao `supabase.from('vendas').insert({...})` (linha ~456), adicionar:

```typescript
      canal: 'presencial',
```

- [ ] **Step 5: Atualizar registrarTroca**

Em `src/store/useStore.ts`, na função `registrarTroca`, no objeto passado ao `supabase.from('vendas').insert({...})` (linha ~539), adicionar:

```typescript
      canal: 'presencial',
```

- [ ] **Step 6: Atualizar registrarDevolucao**

Em `src/store/useStore.ts`, na função `registrarDevolucao`, no objeto passado ao `supabase.from('vendas').insert({...})` (linha ~623), adicionar:

```typescript
      canal: 'presencial',
```

- [ ] **Step 7: Validar build**

```bash
npm run build
```

Expected: PASS — sem erros de tipo.

- [ ] **Step 8: Commit**

```bash
git add src/store/useStore.ts
git commit -m "feat: add CanalVenda type and canal field to store"
```

---

### Task 3: Filtrar vendas presenciais no fecharCaixa e FechamentoCaixa

**Files:**
- Modify: `src/store/useStore.ts:717-785` (fecharCaixa)
- Modify: `src/pages/FechamentoCaixa.tsx:16-21` (vendasDoDia filter)

- [ ] **Step 1: Filtrar por canal presencial no store (fecharCaixa)**

Em `src/store/useStore.ts`, na função `fecharCaixa`, linha ~726, alterar:

```typescript
    // ANTES:
    const vendasDoDia = state.vendas.filter(v => getDateStr(new Date(v.data)) === data);

    // DEPOIS:
    const vendasDoDia = state.vendas.filter(v => getDateStr(new Date(v.data)) === data && v.canal === 'presencial');
```

- [ ] **Step 2: Filtrar por canal presencial na página FechamentoCaixa**

Em `src/pages/FechamentoCaixa.tsx`, na função `vendasDoDia` (linhas 16-21), alterar:

```typescript
    // ANTES:
    return vendas.filter(v => {
      const dataVenda = new Date(v.data).toISOString().split('T')[0];
      return dataVenda === dataSelecionada;
    });

    // DEPOIS:
    return vendas.filter(v => {
      const dataVenda = new Date(v.data).toISOString().split('T')[0];
      return dataVenda === dataSelecionada && v.canal === 'presencial';
    });
```

- [ ] **Step 3: Validar build**

```bash
npm run build
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/store/useStore.ts src/pages/FechamentoCaixa.tsx
git commit -m "feat: filter only presencial sales in fecharCaixa and FechamentoCaixa page"
```

---

### Task 4: Reescrever Financeiro — cards de resumo + seletor de mês

**Files:**
- Modify: `src/pages/Financeiro.tsx` (reescrita completa)

Este é o task principal. A página será reescrita por completo. Vamos dividir em steps incrementais.

- [ ] **Step 1: Reescrever imports e estado base**

Substituir todo o conteúdo de `src/pages/Financeiro.tsx` por:

```tsx
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
            {extrato.map((item, i) => {
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
```

Note: The `NovaDespesaModal` component stays exactly as it is today — copy it unchanged from the current file.

- [ ] **Step 2: Copiar NovaDespesaModal sem alterações**

Manter a função `NovaDespesaModal` exatamente como está no arquivo atual (linhas 187-274), colando após o `export default function Financeiro`.

- [ ] **Step 3: Validar build**

```bash
npm run build
```

Expected: PASS

- [ ] **Step 4: Testar manualmente no dev server**

```bash
npm run dev
```

Verificar:
- Cards de resumo aparecem com valores corretos
- Seletor de mês navega entre meses
- Extrato mostra caixas fechados (expandíveis), vendas online e despesas
- Accordion de caixa abre/fecha e mostra vendas + resumo por pagamento
- Botão "Nova Despesa" funciona
- Despesas novas aparecem no extrato

- [ ] **Step 5: Commit**

```bash
git add src/pages/Financeiro.tsx
git commit -m "feat: rewrite Financeiro as chronological statement with cash register accordion"
```

---

### Task 5: Validação final e lint

- [ ] **Step 1: Lint**

```bash
npm run lint
```

Fix any issues found.

- [ ] **Step 2: Build final**

```bash
npm run build
```

Expected: PASS with no errors.

- [ ] **Step 3: Commit final (se houver fixes)**

```bash
git add src/store/useStore.ts src/pages/Financeiro.tsx src/pages/FechamentoCaixa.tsx
git commit -m "fix: lint and build fixes"
```
