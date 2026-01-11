-- ============================================
-- MELHORIAS BÁSICAS - VERSÃO SIMPLIFICADA
-- Execute este se MELHORIAS_CRITICAS.sql der erro
-- ============================================

-- ============================================
-- 1. SOFT DELETE (Crítico)
-- ============================================

-- Adicionar colunas de soft delete
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS deletado BOOLEAN DEFAULT FALSE;
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS deletado_em TIMESTAMP;
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS deletado_por BIGINT;

ALTER TABLE compras_parceladas ADD COLUMN IF NOT EXISTS deletado BOOLEAN DEFAULT FALSE;
ALTER TABLE compras_parceladas ADD COLUMN IF NOT EXISTS deletado_em TIMESTAMP;
ALTER TABLE compras_parceladas ADD COLUMN IF NOT EXISTS deletado_por BIGINT;

ALTER TABLE gasolina ADD COLUMN IF NOT EXISTS deletado BOOLEAN DEFAULT FALSE;
ALTER TABLE gasolina ADD COLUMN IF NOT EXISTS deletado_em TIMESTAMP;
ALTER TABLE gasolina ADD COLUMN IF NOT EXISTS deletado_por BIGINT;

ALTER TABLE emprestimos ADD COLUMN IF NOT EXISTS deletado BOOLEAN DEFAULT FALSE;
ALTER TABLE emprestimos ADD COLUMN IF NOT EXISTS deletado_em TIMESTAMP;
ALTER TABLE emprestimos ADD COLUMN IF NOT EXISTS deletado_por BIGINT;

ALTER TABLE dividas ADD COLUMN IF NOT EXISTS deletado BOOLEAN DEFAULT FALSE;
ALTER TABLE dividas ADD COLUMN IF NOT EXISTS deletado_em TIMESTAMP;
ALTER TABLE dividas ADD COLUMN IF NOT EXISTS deletado_por BIGINT;

ALTER TABLE cartoes ADD COLUMN IF NOT EXISTS deletado BOOLEAN DEFAULT FALSE;
ALTER TABLE cartoes ADD COLUMN IF NOT EXISTS deletado_em TIMESTAMP;
ALTER TABLE cartoes ADD COLUMN IF NOT EXISTS deletado_por BIGINT;

-- Índices parciais
CREATE INDEX IF NOT EXISTS idx_gastos_deletado ON gastos(deletado) WHERE deletado = FALSE;
CREATE INDEX IF NOT EXISTS idx_parcelas_deletado ON compras_parceladas(deletado) WHERE deletado = FALSE;
CREATE INDEX IF NOT EXISTS idx_gasolina_deletado ON gasolina(deletado) WHERE deletado = FALSE;
CREATE INDEX IF NOT EXISTS idx_emprestimos_deletado ON emprestimos(deletado) WHERE deletado = FALSE;
CREATE INDEX IF NOT EXISTS idx_dividas_deletado ON dividas(deletado) WHERE deletado = FALSE;
CREATE INDEX IF NOT EXISTS idx_cartoes_deletado ON cartoes(deletado) WHERE deletado = FALSE;

-- ============================================
-- 2. ÍNDICES OTIMIZADOS
-- ============================================

-- GASTOS
CREATE INDEX IF NOT EXISTS idx_gastos_usuario_data ON gastos(usuario_id, data DESC);
CREATE INDEX IF NOT EXISTS idx_gastos_mes_ano ON gastos((DATE_TRUNC('month', data)), usuario_id);
CREATE INDEX IF NOT EXISTS idx_gastos_categoria ON gastos(categoria_id, data DESC);

-- COMPRAS PARCELADAS
CREATE INDEX IF NOT EXISTS idx_parcelas_usuario_ativas ON compras_parceladas(usuario_id, finalizada) WHERE finalizada = FALSE;

-- GASOLINA
CREATE INDEX IF NOT EXISTS idx_gasolina_usuario_data ON gasolina(usuario_id, data DESC);
CREATE INDEX IF NOT EXISTS idx_gasolina_mes ON gasolina((DATE_TRUNC('month', data)));

-- TRANSFERENCIAS
CREATE INDEX IF NOT EXISTS idx_transf_de_usuario ON transferencias(de_usuario_id, data DESC);
CREATE INDEX IF NOT EXISTS idx_transf_para_usuario ON transferencias(para_usuario_id, data DESC);
CREATE INDEX IF NOT EXISTS idx_transf_pendentes ON transferencias(pago) WHERE pago = FALSE;

-- FAMILIA_MEMBROS
CREATE INDEX IF NOT EXISTS idx_familia_membros_lookup ON familia_membros(familia_id, usuario_id);

-- SALARIES
CREATE INDEX IF NOT EXISTS idx_salaries_usuario ON salaries(usuario_id);

-- CARTOES
CREATE INDEX IF NOT EXISTS idx_cartoes_usuario ON cartoes(usuario_id);

-- ============================================
-- 3. CONSTRAINTS BÁSICAS
-- ============================================

-- USERS: email válido
ALTER TABLE users DROP CONSTRAINT IF EXISTS email_valido;
ALTER TABLE users ADD CONSTRAINT email_valido
    CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$');

-- GASTOS: valor mínimo
ALTER TABLE gastos DROP CONSTRAINT IF EXISTS valor_positivo;
ALTER TABLE gastos ADD CONSTRAINT valor_positivo CHECK (valor >= 0.01);

-- CARTOES: dias válidos
ALTER TABLE cartoes DROP CONSTRAINT IF EXISTS dia_fechamento_valido;
ALTER TABLE cartoes ADD CONSTRAINT dia_fechamento_valido
    CHECK (dia_fechamento IS NULL OR (dia_fechamento >= 1 AND dia_fechamento <= 31));

-- EMPRESTIMOS: datas coerentes
ALTER TABLE emprestimos DROP CONSTRAINT IF EXISTS datas_coerentes;
ALTER TABLE emprestimos ADD CONSTRAINT datas_coerentes
    CHECK (data_vencimento IS NULL OR data_vencimento >= data_emprestimo);

-- ============================================
-- 4. MATERIALIZED VIEW SIMPLES
-- ============================================

DROP MATERIALIZED VIEW IF EXISTS mv_dashboard_mensal CASCADE;
CREATE MATERIALIZED VIEW mv_dashboard_mensal AS
SELECT
    DATE_TRUNC('month', CURRENT_DATE) as mes_referencia,
    EXTRACT(YEAR FROM CURRENT_DATE)::INT as ano,
    EXTRACT(MONTH FROM CURRENT_DATE)::INT as mes,

    -- Receitas
    (SELECT COALESCE(SUM(valor), 0)
     FROM salaries) as receitas_total,

    -- Gastos do mês
    (SELECT COALESCE(SUM(valor), 0)
     FROM gastos
     WHERE DATE_TRUNC('month', data) = DATE_TRUNC('month', CURRENT_DATE)
       AND (deletado = FALSE OR deletado IS NULL)) as gastos_mes,

    -- Parcelas ativas
    (SELECT COALESCE(SUM(valor_parcela), 0)
     FROM compras_parceladas
     WHERE finalizada = FALSE
       AND (deletado = FALSE OR deletado IS NULL)) as parcelas_mes,

    -- Gasolina do mês
    (SELECT COALESCE(SUM(valor), 0)
     FROM gasolina
     WHERE DATE_TRUNC('month', data) = DATE_TRUNC('month', CURRENT_DATE)
       AND (deletado = FALSE OR deletado IS NULL)) as gasolina_mes,

    -- Assinaturas ativas
    (SELECT COALESCE(SUM(valor), 0)
     FROM assinaturas
     WHERE ativa = TRUE) as assinaturas_total,

    -- Contas fixas ativas
    (SELECT COALESCE(SUM(valor), 0)
     FROM contas_fixas
     WHERE ativa = TRUE) as contas_fixas_total,

    -- Ferramentas ativas
    (SELECT COALESCE(SUM(valor), 0)
     FROM ferramentas
     WHERE ativa = TRUE) as ferramentas_total,

    -- Patrimônio
    (SELECT COALESCE(SUM(valor), 0)
     FROM patrimonio
     WHERE ativo = TRUE
       AND (deletado = FALSE OR deletado IS NULL)) as patrimonio_total,

    -- Investimentos
    (SELECT COALESCE(SUM(valor), 0)
     FROM investimentos
     WHERE ativo = TRUE
       AND (deletado = FALSE OR deletado IS NULL)) as investimentos_total,

    -- Dívidas pendentes
    (SELECT COALESCE(SUM(valor_total - valor_pago), 0)
     FROM dividas
     WHERE quitada = FALSE
       AND (deletado = FALSE OR deletado IS NULL)) as dividas_pendentes,

    NOW() as atualizado_em;

-- Índice único
CREATE UNIQUE INDEX ON mv_dashboard_mensal(mes_referencia);

-- ============================================
-- 5. FUNÇÃO PARA ATUALIZAR VIEW
-- ============================================

CREATE OR REPLACE FUNCTION refresh_dashboard_views()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_mensal;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. FAMILIA_ID EM TABELAS PRINCIPAIS
-- ============================================

ALTER TABLE gastos ADD COLUMN IF NOT EXISTS familia_id BIGINT REFERENCES familias(id) ON DELETE CASCADE;
ALTER TABLE salaries ADD COLUMN IF NOT EXISTS familia_id BIGINT REFERENCES familias(id) ON DELETE CASCADE;
ALTER TABLE compras_parceladas ADD COLUMN IF NOT EXISTS familia_id BIGINT REFERENCES familias(id) ON DELETE CASCADE;
ALTER TABLE gasolina ADD COLUMN IF NOT EXISTS familia_id BIGINT REFERENCES familias(id) ON DELETE CASCADE;
ALTER TABLE cartoes ADD COLUMN IF NOT EXISTS familia_id BIGINT REFERENCES familias(id) ON DELETE CASCADE;

-- Índices com familia_id
CREATE INDEX IF NOT EXISTS idx_gastos_familia_usuario ON gastos(familia_id, usuario_id);
CREATE INDEX IF NOT EXISTS idx_salaries_familia ON salaries(familia_id, usuario_id);
CREATE INDEX IF NOT EXISTS idx_parcelas_familia ON compras_parceladas(familia_id, usuario_id);

-- ============================================
-- VERIFICAÇÃO
-- ============================================

SELECT '✅ MELHORIAS BÁSICAS APLICADAS!' as status;

-- Verificar soft delete
SELECT 'Tabelas com soft delete:' as info,
       COUNT(DISTINCT table_name)::TEXT as quantidade
FROM information_schema.columns
WHERE column_name = 'deletado' AND table_schema = 'public';

-- Verificar índices
SELECT 'Índices criados:' as info,
       COUNT(*)::TEXT as quantidade
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%';

-- Verificar materialized view
SELECT 'Materialized views:' as info,
       COUNT(*)::TEXT as quantidade
FROM pg_matviews
WHERE schemaname = 'public';

-- Testar view
SELECT * FROM mv_dashboard_mensal;

SELECT '🎉 Sistema melhorado com sucesso!' as resultado;
SELECT 'Execute: SELECT * FROM mv_dashboard_mensal;' as proximo_passo;
