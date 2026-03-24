# Design: Reorganização do Financeiro como Extrato + Campo Canal

**Data:** 2026-03-24

## Contexto

O Financeiro (`/financeiro`) mostra movimentações (vendas + despesas) numa tabela plana sem relação com caixas. O Fechamento de Caixa (`/fechamento`) tem histórico de fechamentos mas não é acessível pelo Financeiro. Não há distinção entre vendas presenciais e online.

## Decisões

- Financeiro funciona como **extrato cronológico** com 3 tipos de linha: caixa fechado (expandível), venda online e despesa
- Campo `canal` na tabela `vendas` distingue presencial de online
- Vendas online **não entram** no fechamento de caixa
- Cards de resumo do mês consideram **todas** as vendas (presencial + online)
- Só caixas fechados aparecem no extrato (dias sem fechamento não aparecem como caixa)
- Accordion inline para expandir caixas (sem modal)
- Despesas ficam em seção separada do caixa, mas fazem parte do extrato

## Mudanças no banco de dados

```sql
ALTER TABLE vendas ADD COLUMN canal text DEFAULT 'presencial';
```

## Mudanças no store (`src/store/useStore.ts`)

- Novo tipo: `CanalVenda = 'presencial' | 'online'`
- Adicionar `canal: CanalVenda` ao tipo `Venda`
- Atualizar `dbToVenda` para mapear campo `canal`
- `registrarVenda`, `registrarTroca`, `registrarDevolucao`: passar `canal: 'presencial'`
- `fecharCaixa`: filtrar apenas vendas com `canal === 'presencial'`

## Mudanças no Financeiro (`src/pages/Financeiro.tsx`)

### Cards de resumo (topo)
- Mantém: Receitas (Mês), Despesas (Mês), Saldo Líquido (Mês)
- Receitas = todas as vendas do mês (presencial + online)

### Extrato cronológico (substituiu "Histórico de Movimentações")
Três tipos de linha, ordenados por data decrescente:

1. **Caixa fechado**: data, operador, total — expandível (accordion) mostrando vendas do dia + resumo por forma de pagamento
2. **Venda online**: data, produto, cliente, valor — linha individual
3. **Despesa**: data, categoria, descrição, valor — linha individual

### Filtro
- Seletor de mês/ano para navegar entre períodos

## Páginas sem alteração

- `/fechamento` — continua operando só vendas presenciais
- `/vendas` — registra como `presencial` por padrão
- `/loja` — sem mudança agora (futuro: registrar automático com `canal: 'online'`)

## Escopo de arquivos

1. SQL migration manual — `ALTER TABLE vendas ADD COLUMN canal text DEFAULT 'presencial'`
2. `src/store/useStore.ts` — tipo + campo canal
3. `src/pages/Financeiro.tsx` — reescrita com extrato + accordion
