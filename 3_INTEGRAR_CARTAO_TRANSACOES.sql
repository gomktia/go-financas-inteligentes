-- ============================================
-- INTEGRAR TABELA CARTAO_TRANSACOES
-- Controle detalhado de faturas de cartao
-- ============================================

-- 1. Verificar se a tabela existe e sua estrutura
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cartao_transacoes') THEN
    -- Se nao existir, criar
    CREATE TABLE cartao_transacoes (
      id BIGSERIAL PRIMARY KEY,
      cartao_id BIGINT NOT NULL REFERENCES cartoes(id) ON DELETE CASCADE,
      descricao VARCHAR(255) NOT NULL,
      valor DECIMAL(15,2) NOT NULL,
      data_compra DATE NOT NULL,
      data_lancamento DATE NOT NULL,
      categoria VARCHAR(100),
      tipo_pagamento VARCHAR(50) DEFAULT 'cartao_credito',
      parcelas INTEGER DEFAULT 1,
      parcela_atual INTEGER DEFAULT 1,
      is_parcelado BOOLEAN DEFAULT FALSE,
      compra_parcelada_id BIGINT REFERENCES compras_parceladas(id),
      gasto_id BIGINT REFERENCES gastos(id),
      mes_fatura INTEGER NOT NULL,
      ano_fatura INTEGER NOT NULL,
      pago BOOLEAN DEFAULT FALSE,
      observacoes TEXT,
      data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT valor_positivo CHECK (valor > 0),
      CONSTRAINT parcelas_valido CHECK (parcelas > 0),
      CONSTRAINT mes_valido CHECK (mes_fatura >= 1 AND mes_fatura <= 12)
    );
  ELSE
    -- Se existir, adicionar colunas que podem estar faltando
    ALTER TABLE cartao_transacoes ADD COLUMN IF NOT EXISTS categoria VARCHAR(100);
    ALTER TABLE cartao_transacoes ADD COLUMN IF NOT EXISTS tipo_pagamento VARCHAR(50) DEFAULT 'cartao_credito';
    ALTER TABLE cartao_transacoes ADD COLUMN IF NOT EXISTS is_parcelado BOOLEAN DEFAULT FALSE;
    ALTER TABLE cartao_transacoes ADD COLUMN IF NOT EXISTS compra_parcelada_id BIGINT REFERENCES compras_parceladas(id);
    ALTER TABLE cartao_transacoes ADD COLUMN IF NOT EXISTS gasto_id BIGINT REFERENCES gastos(id);
    ALTER TABLE cartao_transacoes ADD COLUMN IF NOT EXISTS mes_fatura INTEGER;
    ALTER TABLE cartao_transacoes ADD COLUMN IF NOT EXISTS ano_fatura INTEGER;
    ALTER TABLE cartao_transacoes ADD COLUMN IF NOT EXISTS pago BOOLEAN DEFAULT FALSE;
    ALTER TABLE cartao_transacoes ADD COLUMN IF NOT EXISTS observacoes TEXT;
  END IF;
END $$;

-- Criar indices se nao existirem
CREATE INDEX IF NOT EXISTS idx_cartao_trans_cartao ON cartao_transacoes(cartao_id);
CREATE INDEX IF NOT EXISTS idx_cartao_trans_fatura ON cartao_transacoes(ano_fatura, mes_fatura);
CREATE INDEX IF NOT EXISTS idx_cartao_trans_pago ON cartao_transacoes(pago);
CREATE INDEX IF NOT EXISTS idx_cartao_trans_data ON cartao_transacoes(data_compra);

-- ============================================
-- 2. HABILITAR RLS
-- ============================================
ALTER TABLE cartao_transacoes ENABLE ROW LEVEL SECURITY;

-- Policy: Ver apenas transacoes dos proprios cartoes
DROP POLICY IF EXISTS "View own card transactions" ON cartao_transacoes;
CREATE POLICY "View own card transactions" ON cartao_transacoes
  FOR SELECT USING (
    cartao_id IN (
      SELECT id FROM cartoes WHERE usuario_id::text = auth.uid()::text
    )
  );

-- Policy: Criar transacoes nos proprios cartoes
DROP POLICY IF EXISTS "Insert own card transactions" ON cartao_transacoes;
CREATE POLICY "Insert own card transactions" ON cartao_transacoes
  FOR INSERT WITH CHECK (
    cartao_id IN (
      SELECT id FROM cartoes WHERE usuario_id::text = auth.uid()::text
    )
  );

-- Policy: Atualizar transacoes dos proprios cartoes
DROP POLICY IF EXISTS "Update own card transactions" ON cartao_transacoes;
CREATE POLICY "Update own card transactions" ON cartao_transacoes
  FOR UPDATE USING (
    cartao_id IN (
      SELECT id FROM cartoes WHERE usuario_id::text = auth.uid()::text
    )
  );

-- Policy: Deletar transacoes dos proprios cartoes
DROP POLICY IF EXISTS "Delete own card transactions" ON cartao_transacoes;
CREATE POLICY "Delete own card transactions" ON cartao_transacoes
  FOR DELETE USING (
    cartao_id IN (
      SELECT id FROM cartoes WHERE usuario_id::text = auth.uid()::text
    )
  );

-- ============================================
-- 3. VIEW: Fatura do cartao por mes/ano
-- ============================================
CREATE OR REPLACE VIEW vw_faturas_cartao AS
SELECT 
  c.id as cartao_id,
  c.nome as cartao_nome,
  c.usuario_id,
  u.nome as usuario_nome,
  ct.ano_fatura,
  ct.mes_fatura,
  COUNT(ct.id) as total_transacoes,
  COALESCE(SUM(ct.valor), 0) as valor_total_fatura,
  COUNT(CASE WHEN ct.pago THEN 1 END) as transacoes_pagas,
  COUNT(CASE WHEN NOT ct.pago THEN 1 END) as transacoes_pendentes,
  CASE 
    WHEN COUNT(*) = COUNT(CASE WHEN ct.pago THEN 1 END) THEN true 
    ELSE false 
  END as fatura_paga
FROM cartoes c
LEFT JOIN cartao_transacoes ct ON c.id = ct.cartao_id
LEFT JOIN users u ON c.usuario_id = u.id
WHERE ct.id IS NOT NULL
GROUP BY c.id, c.nome, c.usuario_id, u.nome, ct.ano_fatura, ct.mes_fatura
ORDER BY ct.ano_fatura DESC, ct.mes_fatura DESC;

-- ============================================
-- 4. VIEW: Transacoes detalhadas com info do cartao
-- ============================================
CREATE OR REPLACE VIEW vw_transacoes_detalhadas AS
SELECT 
  ct.*,
  c.nome as cartao_nome,
  c.usuario_id,
  u.nome as usuario_nome,
  CASE 
    WHEN ct.is_parcelado THEN ct.parcela_atual || '/' || ct.parcelas
    ELSE 'A vista'
  END as info_parcelas
FROM cartao_transacoes ct
JOIN cartoes c ON ct.cartao_id = c.id
JOIN users u ON c.usuario_id = u.id
ORDER BY ct.data_compra DESC;

-- ============================================
-- 5. FUNCTION: Criar transacao de cartao automaticamente
-- ============================================
CREATE OR REPLACE FUNCTION criar_transacao_cartao(
  p_cartao_id BIGINT,
  p_descricao VARCHAR,
  p_valor DECIMAL,
  p_data_compra DATE,
  p_categoria VARCHAR DEFAULT NULL,
  p_parcelas INTEGER DEFAULT 1
)
RETURNS BIGINT AS $$
DECLARE
  v_mes INTEGER;
  v_ano INTEGER;
  v_transacao_id BIGINT;
BEGIN
  -- Calcular mes/ano da fatura
  v_mes := EXTRACT(MONTH FROM p_data_compra);
  v_ano := EXTRACT(YEAR FROM p_data_compra);
  
  -- Inserir transacao
  INSERT INTO cartao_transacoes (
    cartao_id,
    descricao,
    valor,
    data_compra,
    data_lancamento,
    categoria,
    tipo_pagamento,
    parcelas,
    parcela_atual,
    is_parcelado,
    mes_fatura,
    ano_fatura
  ) VALUES (
    p_cartao_id,
    p_descricao,
    p_valor,
    p_data_compra,
    p_data_compra,
    p_categoria,
    'cartao_credito',
    p_parcelas,
    1,
    p_parcelas > 1,
    v_mes,
    v_ano
  ) RETURNING id INTO v_transacao_id;
  
  RETURN v_transacao_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. FUNCTION: Calcular total da fatura
-- ============================================
CREATE OR REPLACE FUNCTION total_fatura_cartao(
  p_cartao_id BIGINT,
  p_mes INTEGER,
  p_ano INTEGER
)
RETURNS DECIMAL AS $$
DECLARE
  v_total DECIMAL;
BEGIN
  SELECT COALESCE(SUM(valor), 0)
  INTO v_total
  FROM cartao_transacoes
  WHERE cartao_id = p_cartao_id
    AND mes_fatura = p_mes
    AND ano_fatura = p_ano;
    
  RETURN v_total;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. FUNCTION: Marcar fatura como paga
-- ============================================
CREATE OR REPLACE FUNCTION pagar_fatura_cartao(
  p_cartao_id BIGINT,
  p_mes INTEGER,
  p_ano INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  v_updated INTEGER;
BEGIN
  UPDATE cartao_transacoes
  SET pago = TRUE
  WHERE cartao_id = p_cartao_id
    AND mes_fatura = p_mes
    AND ano_fatura = p_ano
    AND pago = FALSE;
    
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. TRIGGER: Atualizar gasto do cartao automaticamente
-- ============================================
CREATE OR REPLACE FUNCTION atualizar_gasto_cartao()
RETURNS TRIGGER AS $$
DECLARE
  v_total DECIMAL;
BEGIN
  -- Calcular total atual do cartao
  SELECT COALESCE(SUM(valor), 0)
  INTO v_total
  FROM cartao_transacoes
  WHERE cartao_id = NEW.cartao_id
    AND pago = FALSE;
  
  -- Atualizar campo gasto_atual do cartao
  UPDATE cartoes
  SET gasto_atual = v_total
  WHERE id = NEW.cartao_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_atualizar_gasto_cartao ON cartao_transacoes;
CREATE TRIGGER trigger_atualizar_gasto_cartao
  AFTER INSERT OR UPDATE OR DELETE ON cartao_transacoes
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_gasto_cartao();

-- ============================================
-- 9. DADOS DE EXEMPLO (OPCIONAL)
-- ============================================
-- Descomente para inserir dados de teste

/*
-- Criar transacao de exemplo
INSERT INTO cartao_transacoes (
  cartao_id,
  descricao,
  valor,
  data_compra,
  data_lancamento,
  categoria,
  mes_fatura,
  ano_fatura
) VALUES
(1, 'Mercado Dia', 450.00, CURRENT_DATE, CURRENT_DATE, 'Alimentacao', 
 EXTRACT(MONTH FROM CURRENT_DATE), EXTRACT(YEAR FROM CURRENT_DATE));

-- Compra parcelada em 3x
INSERT INTO cartao_transacoes (
  cartao_id,
  descricao,
  valor,
  data_compra,
  data_lancamento,
  categoria,
  parcelas,
  parcela_atual,
  is_parcelado,
  mes_fatura,
  ano_fatura
) VALUES
(1, 'TV Samsung 1/3', 333.33, CURRENT_DATE, CURRENT_DATE, 'Eletronicos', 
 3, 1, true, EXTRACT(MONTH FROM CURRENT_DATE), EXTRACT(YEAR FROM CURRENT_DATE)),
(1, 'TV Samsung 2/3', 333.33, CURRENT_DATE, CURRENT_DATE, 'Eletronicos', 
 3, 2, true, EXTRACT(MONTH FROM CURRENT_DATE), EXTRACT(YEAR FROM CURRENT_DATE)),
(1, 'TV Samsung 3/3', 333.33, CURRENT_DATE, CURRENT_DATE, 'Eletronicos', 
 3, 3, true, EXTRACT(MONTH FROM CURRENT_DATE), EXTRACT(YEAR FROM CURRENT_DATE));
*/

-- ============================================
-- 10. VERIFICACAO
-- ============================================
SELECT 'Integracao de cartao_transacoes completa' as status;

-- Ver estrutura final
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'cartao_transacoes'
ORDER BY ordinal_position;

-- Ver views criadas
SELECT table_name, view_definition
FROM information_schema.views
WHERE table_name LIKE 'vw_%'
  AND table_schema = 'public';

