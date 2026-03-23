-- Migration: Adicionar credito aos clientes e permitir 'devolucao' nas vendas

-- 1. Adicionar coluna credito na tabela clientes
ALTER TABLE clientes
  ADD COLUMN credito NUMERIC(10,2) NOT NULL DEFAULT 0;

-- 2. Atualizar CHECK constraint de tipo_venda para incluir 'devolucao'
ALTER TABLE vendas
  DROP CONSTRAINT vendas_tipo_venda_check;

ALTER TABLE vendas
  ADD CONSTRAINT vendas_tipo_venda_check
  CHECK (tipo_venda IN ('venda', 'troca', 'devolucao'));
