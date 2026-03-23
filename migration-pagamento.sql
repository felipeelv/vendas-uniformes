-- =============================================
-- Migration: Atualizar metodo_pagamento e adicionar parcelas
-- =============================================

-- 1. Migrar dados existentes de 'CARTAO' para 'DEBITO' (antes de alterar a constraint)
UPDATE vendas SET metodo_pagamento = 'DEBITO' WHERE metodo_pagamento = 'CARTAO';

-- 2. Remover a CHECK constraint antiga de metodo_pagamento
ALTER TABLE vendas DROP CONSTRAINT IF EXISTS vendas_metodo_pagamento_check;

-- 3. Criar a nova CHECK constraint com os metodos atualizados
ALTER TABLE vendas ADD CONSTRAINT vendas_metodo_pagamento_check
  CHECK (metodo_pagamento IN ('PIX', 'DEBITO', 'CREDITO_VISTA', 'CREDITO_PARCELADO', 'DINHEIRO'));

-- 4. Adicionar coluna parcelas (nullable, default null)
ALTER TABLE vendas ADD COLUMN IF NOT EXISTS parcelas INTEGER DEFAULT NULL;
