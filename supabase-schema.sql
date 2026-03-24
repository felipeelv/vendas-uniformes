-- =============================================
-- Schema do Supabase para Vendas de Uniformes
-- Execute este SQL no SQL Editor do Supabase
-- =============================================

-- Tabela de Usuários
CREATE TABLE usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Vendedor')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Produtos
CREATE TABLE produtos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('Camiseta', 'Calça', 'Bermuda', 'Moletom', 'Casaco')),
  tamanho TEXT NOT NULL,
  cor TEXT NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 0,
  preco_custo NUMERIC(10,2) NOT NULL DEFAULT 0,
  preco_venda NUMERIC(10,2) NOT NULL DEFAULT 0,
  imagem TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Clientes
CREATE TABLE clientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL DEFAULT '',
  documento TEXT NOT NULL DEFAULT '',
  credito NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Vendas
CREATE TABLE vendas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo_venda TEXT NOT NULL DEFAULT 'venda' CHECK (tipo_venda IN ('venda', 'troca', 'devolucao')),
  metodo_pagamento TEXT NOT NULL DEFAULT 'DINHEIRO' CHECK (metodo_pagamento IN ('PIX', 'DEBITO', 'CREDITO_VISTA', 'CREDITO_PARCELADO', 'DINHEIRO')),
  parcelas INTEGER DEFAULT NULL,
  produto_id UUID REFERENCES produtos(id) ON DELETE SET NULL,
  produto_nome TEXT NOT NULL,
  quantidade INTEGER NOT NULL,
  valor_total NUMERIC(10,2) NOT NULL,
  data TIMESTAMPTZ NOT NULL DEFAULT now(),
  vendedor_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  vendedor_nome TEXT NOT NULL,
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  cliente_nome TEXT,
  canal TEXT DEFAULT 'presencial',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Itens da Venda (detalhamento por produto)
CREATE TABLE venda_itens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  venda_id UUID NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
  tipo_item TEXT NOT NULL CHECK (tipo_item IN ('saida', 'entrada')),
  produto_id UUID REFERENCES produtos(id) ON DELETE SET NULL,
  produto_nome TEXT NOT NULL,
  quantidade INTEGER NOT NULL,
  preco_unitario NUMERIC(10,2) NOT NULL,
  valor_total NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Fechamentos de Caixa
CREATE TABLE fechamentos_caixa (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  data DATE NOT NULL UNIQUE,
  data_fechamento TIMESTAMPTZ NOT NULL DEFAULT now(),
  operador_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  operador_nome TEXT NOT NULL,
  total_vendas NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_trocas NUMERIC(10,2) NOT NULL DEFAULT 0,
  quantidade_vendas INTEGER NOT NULL DEFAULT 0,
  quantidade_trocas INTEGER NOT NULL DEFAULT 0,
  total_pix NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_cartao NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_dinheiro NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'fechado' CHECK (status IN ('fechado', 'reaberto')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Despesas
CREATE TABLE despesas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  descricao TEXT NOT NULL,
  valor NUMERIC(10,2) NOT NULL,
  data TIMESTAMPTZ NOT NULL DEFAULT now(),
  categoria TEXT NOT NULL CHECK (categoria IN ('Fixa', 'Variável', 'Fornecedor', 'Outros')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Tamanhos Customizados
CREATE TABLE tamanhos_custom (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tamanho TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- Row Level Security (RLS) - permissivo para começar
-- =============================================

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE venda_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE fechamentos_caixa ENABLE ROW LEVEL SECURITY;
ALTER TABLE despesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE tamanhos_custom ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas (acesso total via anon key)
-- Ajuste conforme necessidade de autenticação

CREATE POLICY "Acesso total usuarios" ON usuarios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total produtos" ON produtos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total clientes" ON clientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total vendas" ON vendas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total venda_itens" ON venda_itens FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total fechamentos_caixa" ON fechamentos_caixa FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total despesas" ON despesas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total tamanhos_custom" ON tamanhos_custom FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- Storage Bucket para imagens de produtos
-- =============================================

INSERT INTO storage.buckets (id, name, public) VALUES ('produto-imagens', 'produto-imagens', true);

CREATE POLICY "Upload público produto-imagens" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'produto-imagens');

CREATE POLICY "Leitura pública produto-imagens" ON storage.objects
  FOR SELECT USING (bucket_id = 'produto-imagens');

CREATE POLICY "Deletar público produto-imagens" ON storage.objects
  FOR DELETE USING (bucket_id = 'produto-imagens');
