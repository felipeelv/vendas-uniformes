-- Migration: adicionar coluna canal na tabela vendas
-- Executar manualmente no SQL Editor do Supabase

ALTER TABLE vendas ADD COLUMN canal TEXT DEFAULT 'presencial';

-- Todas as vendas existentes ficam como 'presencial'
