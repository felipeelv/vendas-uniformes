# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

School uniform sales management system ("Colégio Eleve") with an admin panel and a public-facing online store. Built with React 19 + TypeScript + Vite 8 + Tailwind CSS v4 + Zustand + Supabase. Deployed on Vercel.

## Commands

- `npm run dev` — Start dev server (Vite)
- `npm run build` — Type-check (`tsc -b`) then build (`vite build`)
- `npm run lint` — ESLint
- `npm run preview` — Preview production build

## Architecture

### State Management
Single Zustand store at `src/store/useStore.ts` holds ALL app state (users, products, clients, sales, expenses, cash closings). The store handles Supabase reads/writes directly — there is no separate API layer. Data is loaded once on app mount via `loadData()` and kept in sync optimistically (local state updated after DB write).

The store converts between camelCase (app) and snake_case (Supabase) using `dbTo*` helper functions defined in the same file.

### Routing & Auth
`src/App.tsx` defines all routes using react-router-dom v7. Auth is role-based with three levels:
- **Vendedor**: `/vendas`, `/fechamento`
- **Gerente**: above + `/estoque`, `/precos`, `/clientes`, `/importar-alunos`
- **Admin**: all routes including `/dashboard`, `/vendedores`, `/financeiro`, `/relatorios`

Auth guards: `RotaProtegida` (checks `isAutenticado`) and `RotaPorRole` (checks user role). The public store at `/loja` and home at `/` bypass auth.

### Layout
`src/components/Layout.tsx` — Sidebar + header shell for admin pages. Renders `<Outlet />` for nested routes.

### Online Store (`/loja`)
`src/pages/LojaVirtual.tsx` orchestrates store components from `src/components/loja/`:
- `StoreHeader`, `StoreBanner`, `CategoryFilter`, `ProductCard`, `SizeModal`, `CartDrawer`, `CheckoutForm`, `SuccessScreen`, `FloatingCartBar`, `ScrollToTop`, `ProductCardSkeleton`

Products are grouped by name+color; variants are different sizes. Checkout flow ends with WhatsApp redirect.

### Database
Supabase with schema in `supabase-schema.sql`. Key tables: `usuarios`, `produtos`, `clientes`, `vendas`, `venda_itens`, `fechamentos_caixa`, `despesas`, `tamanhos_custom`. RLS is enabled but fully permissive (anon key access). Image storage uses Supabase Storage bucket `produto-imagens`.

### Environment
Requires `.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (see `.env.example`).

## Key Conventions

- All UI text and variable names are in **Portuguese** (pt-BR)
- Tailwind classes are used inline (no CSS modules or separate stylesheets)
- Icons from `lucide-react`
- `clsx` and `tailwind-merge` available for conditional class composition
- Product categories: Camiseta, Calca, Bermuda, Moletom, Casaco, Short Saia, Calca Legging, Blusa
- Standard sizes defined in `TAMANHOS_PADRAO` constant in the store
- Payment methods: PIX, CARTAO, DINHEIRO
- SPA routing with Vercel rewrites (`vercel.json`)
