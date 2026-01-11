-- ============================================
-- ATUALIZAR TABELA cartao_transacoes
-- Adicionar campos para controle de faturas
-- ============================================

-- Adicionar novos campos
ALTER TABLE cartao_transacoes ADD COLUMN IF NOT EXISTS tipo_pagamento VARCHAR(50) DEFAULT 'cartao_credito';
ALTER TABLE cartao_transacoes ADD COLUMN IF NOT EXISTS parcelas INTEGER DEFAULT 1;
ALTER TABLE cartao_transacoes ADD COLUMN IF NOT EXISTS parcela_atual INTEGER DEFAULT 1;
ALTER TABLE cartao_transacoes ADD COLUMN IF NOT EXISTS is_parcelado BOOLEAN DEFAULT FALSE;
ALTER TABLE cartao_transacoes ADD COLUMN IF NOT EXISTS compra_parcelada_id BIGINT REFERENCES compras_parceladas(id);
ALTER TABLE cartao_transacoes ADD COLUMN IF NOT EXISTS gasto_id BIGINT REFERENCES gastos(id);
ALTER TABLE cartao_transacoes ADD COLUMN IF NOT EXISTS mes_fatura INTEGER;
ALTER TABLE cartao_transacoes ADD COLUMN IF NOT EXISTS ano_fatura INTEGER;
ALTER TABLE cartao_transacoes ADD COLUMN IF NOT EXISTS pago BOOLEAN DEFAULT FALSE;

-- Criar indices
CREATE INDEX IF NOT EXISTS idx_cartao_trans_cartao ON cartao_transacoes(cartao_id);
CREATE INDEX IF NOT EXISTS idx_cartao_trans_usuario ON cartao_transacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_cartao_trans_fatura ON cartao_transacoes(ano_fatura, mes_fatura);
CREATE INDEX IF NOT EXISTS idx_cartao_trans_pago ON cartao_transacoes(pago);
CREATE INDEX IF NOT EXISTS idx_cartao_trans_data ON cartao_transacoes(data_transacao);

-- Habilitar RLS
ALTER TABLE cartao_transacoes ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "View own card transactions" ON cartao_transacoes;
CREATE POLICY "View own card transactions" ON cartao_transacoes
  FOR SELECT USING (usuario_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Insert own card transactions" ON cartao_transacoes;
CREATE POLICY "Insert own card transactions" ON cartao_transacoes
  FOR INSERT WITH CHECK (usuario_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Update own card transactions" ON cartao_transacoes;
CREATE POLICY "Update own card transactions" ON cartao_transacoes
  FOR UPDATE USING (usuario_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Delete own card transactions" ON cartao_transacoes;
CREATE POLICY "Delete own card transactions" ON cartao_transacoes
  FOR DELETE USING (usuario_id::text = auth.uid()::text);

-- ============================================
-- TRIGGER: Calcular mes/ano da fatura automaticamente
-- ============================================
CREATE OR REPLACE FUNCTION calcular_fatura_mes_ano()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.mes_fatura IS NULL THEN
    NEW.mes_fatura := EXTRACT(MONTH FROM NEW.data_transacao);
  END IF;
  
  IF NEW.ano_fatura IS NULL THEN
    NEW.ano_fatura := EXTRACT(YEAR FROM NEW.data_transacao);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calcular_fatura ON cartao_transacoes;
CREATE TRIGGER trigger_calcular_fatura
  BEFORE INSERT OR UPDATE ON cartao_transacoes
  FOR EACH ROW
  EXECUTE FUNCTION calcular_fatura_mes_ano();

-- ============================================
-- TRIGGER: Atualizar gasto do cartao
-- ============================================
CREATE OR REPLACE FUNCTION atualizar_gasto_cartao()
RETURNS TRIGGER AS $$
DECLARE
  v_total DECIMAL;
  v_cartao_id BIGINT;
BEGIN
  -- Determinar o cartao_id (funciona para INSERT, UPDATE, DELETE)
  v_cartao_id := COALESCE(NEW.cartao_id, OLD.cartao_id);
  
  -- Calcular total nao pago
  SELECT COALESCE(SUM(valor), 0)
  INTO v_total
  FROM cartao_transacoes
  WHERE cartao_id = v_cartao_id
    AND pago = FALSE;
  
  -- Atualizar campo gasto_atual do cartao
  UPDATE cartoes
  SET gasto_atual = v_total
  WHERE id = v_cartao_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_atualizar_gasto_cartao ON cartao_transacoes;
CREATE TRIGGER trigger_atualizar_gasto_cartao
  AFTER INSERT OR UPDATE OR DELETE ON cartao_transacoes
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_gasto_cartao();

-- ============================================
-- VIEW: Faturas agrupadas por cartao/mes/ano
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
-- VIEW: Transacoes detalhadas
-- ============================================
CREATE OR REPLACE VIEW vw_transacoes_detalhadas AS
SELECT 
  ct.*,
  c.nome as cartao_nome,
  c.limite as cartao_limite,
  u.nome as usuario_nome,
  cat.nome as categoria_nome,
  CASE 
    WHEN ct.is_parcelado THEN ct.parcela_atual || '/' || ct.parcelas || 'x'
    ELSE 'A vista'
  END as info_parcelas
FROM cartao_transacoes ct
JOIN cartoes c ON ct.cartao_id = c.id
JOIN users u ON c.usuario_id = u.id
LEFT JOIN categorias cat ON ct.categoria_id = cat.id
ORDER BY ct.data_transacao DESC;

-- ============================================
-- FUNCTION: Criar transacao de cartao
-- ============================================
CREATE OR REPLACE FUNCTION criar_transacao_cartao(
  p_cartao_id BIGINT,
  p_usuario_id BIGINT,
  p_descricao VARCHAR,
  p_valor DECIMAL,
  p_data_transacao DATE,
  p_categoria_id BIGINT DEFAULT NULL,
  p_parcelas INTEGER DEFAULT 1,
  p_observacoes TEXT DEFAULT NULL
)
RETURNS BIGINT AS $$
DECLARE
  v_transacao_id BIGINT;
BEGIN
  INSERT INTO cartao_transacoes (
    cartao_id,
    usuario_id,
    categoria_id,
    descricao,
    valor,
    data_transacao,
    tipo_pagamento,
    parcelas,
    parcela_atual,
    is_parcelado,
    observacoes
  ) VALUES (
    p_cartao_id,
    p_usuario_id,
    p_categoria_id,
    p_descricao,
    p_valor,
    p_data_transacao,
    'cartao_credito',
    p_parcelas,
    1,
    p_parcelas > 1,
    p_observacoes
  ) RETURNING id INTO v_transacao_id;
  
  RETURN v_transacao_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Pagar fatura completa
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
-- FUNCTION: Total da fatura
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
-- VERIFICACAO
-- ============================================
SELECT 'cartao_transacoes atualizada com sucesso' as status;

-- Ver nova estrutura
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'cartao_transacoes'
ORDER BY ordinal_position;

