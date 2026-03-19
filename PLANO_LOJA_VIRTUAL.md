# Plano de Redesign — Loja Virtual Eleve

## Contexto do Projeto
- **Tech Stack**: React 19 + Vite + Tailwind CSS v4 + Zustand + Supabase + lucide-react
- **Rota da loja**: `/loja` → `src/pages/LojaVirtual.tsx`
- **Home page**: `/` → `src/pages/Home.tsx`
- **Estado global**: `src/store/useStore.ts` (produtos, clientes, vendas)
- **Categorias**: Camiseta, Calça, Bermuda, Moletom, Casaco
- **Tamanhos**: 4, 6, 8, 10, 12, 14, 16, PP, P, M, G, GG, XG
- **Pagamento**: PIX, Cartão, Dinheiro
- **Fluxo atual**: Catálogo → Modal tamanho → Carrinho (página) → Checkout → Sucesso → WhatsApp

## Diagnóstico Atual
- Tudo em 1 arquivo (`LojaVirtual.tsx`, ~436 linhas)
- Sem hero/banner, sem filtros, sem busca
- Cards genéricos que parecem sistema admin, não loja
- Carrinho é página separada (tira o cliente do catálogo)
- Checkout sem resumo visual do pedido
- Sem elementos de urgência/conversão (estoque baixo, etc.)
- Cores: slate + emerald (funcional mas sem identidade forte)

---

## Fases de Implementação

### Fase 1 — Componentização ✅
> Quebrar LojaVirtual.tsx em componentes reutilizáveis

- [x] `src/components/loja/StoreHeader.tsx` — Header com logo, busca, carrinho
- [x] `src/components/loja/StoreBanner.tsx` — Hero com branding e CTA
- [x] `src/components/loja/CategoryFilter.tsx` — Filtro horizontal por categoria
- [x] `src/components/loja/ProductCard.tsx` — Card de produto redesenhado
- [x] Grid responsivo integrado no LojaVirtual.tsx (orquestrador)
- [x] `src/components/loja/SizeModal.tsx` — Modal de seleção de tamanho
- [x] `src/components/loja/CartDrawer.tsx` — Carrinho lateral (drawer) com CartItem integrado
- [x] `src/components/loja/CheckoutForm.tsx` — Formulário + Resumo do pedido integrado
- [x] `src/components/loja/SuccessScreen.tsx` — Tela de compra finalizada
- [x] `src/components/loja/FloatingCartBar.tsx` — Barra flutuante do carrinho
- [x] `src/pages/LojaVirtual.tsx` — Orquestrador (importa componentes)

### Fase 2 — UI de Loja Profissional ✅
> Design que remete a e-commerce real

- [x] Hero Banner com gradiente escuro, badge "Nova Coleção", CTA "Comprar Agora", trust badges
- [x] Barra de categorias com contagem e scroll horizontal no mobile
- [x] Cards: aspect-ratio 4:5, hover zoom na imagem, overlay "Escolher Tamanho", badge "Últimas unidades"
- [x] Carrinho como Drawer lateral direito (mantém cliente na loja)
- [x] Checkout: 2 colunas no desktop (form + resumo), empilhado no mobile
- [x] Tela de sucesso com animação ping, dados do pedido, CTA WhatsApp

### Fase 3 — Elementos de Conversão ✅
> UI que incentiva a compra

- [x] Badge "Últimas unidades!" quando estoque <= 3 (ProductCard + SizeModal)
- [x] Animação bounce no contador do carrinho ao adicionar item
- [x] Barra flutuante no rodapé com total + "Ver Carrinho" (FloatingCartBar)
- [x] Feedback de sucesso animado (check) ao adicionar tamanho no modal
- [x] Validação em tempo real no checkout com feedback visual + máscara de telefone + loading state

### Fase 4 — Refinamento Visual ✅
> Polimento final

- [x] Paleta de cores refinada: emerald accent, footer escuro (slate-900), header backdrop-blur
- [x] Micro-animações: staggered cards (fadeInUp), transições de página (fadeIn), hover zoom
- [x] Skeleton loading nos cards enquanto carrega (ProductCardSkeleton)
- [x] Imagens placeholder melhores: SVG silhueta de uniforme + texto "Sem foto"
- [x] Responsividade: botão remover visível no mobile (sem hover), cards 2→3→4 cols
- [x] Footer dark com branding + trust badges, header com backdrop-blur
- [x] Selection color verde, smooth scroll global
- [x] Imagem lazy load com pulse placeholder

### Fase 5 — Funcionalidades Extras ✅
> Diferenciais

- [x] Busca por texto (já na Fase 1)
- [x] Compartilhar produto via WhatsApp (botão no hover do ProductCard)
- [x] Botão "Voltar ao topo" com scroll suave (ScrollToTop component)
- [x] Loading states com skeleton screens (ProductCardSkeleton)
- [x] Botão "Limpar filtros" quando nenhum resultado encontrado

---

## Arquitetura de Componentes

```
src/pages/LojaVirtual.tsx (orquestrador)
├── StoreHeader (logo, busca, carrinho)
├── StoreBanner (hero)
├── CategoryFilter (filtros)
├── ProductGrid
│   └── ProductCard (x N)
├── SizeModal (modal flutuante)
├── CartDrawer (drawer lateral)
│   └── CartItem (x N)
├── CheckoutForm + OrderSummary
└── SuccessScreen
```

## Referência de Tipos (useStore.ts)
```ts
Produto { id, nome, categoria, tamanho, cor, quantidade, precoCusto, precoVenda, imagem? }
Cliente { id, nome, turma, telefone, documento }
Categoria = 'Camiseta' | 'Calça' | 'Bermuda' | 'Moletom' | 'Casaco'
```

## Notas
- A loja é pública (sem autenticação), rota `/loja`
- O checkout finaliza via WhatsApp (redirecionamento)
- Produtos são agrupados por nome (variantes = tamanhos diferentes)
- Estoque é verificado em tempo real (quantidade > 0)
