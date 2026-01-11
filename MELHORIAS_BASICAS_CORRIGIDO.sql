-- ============================================
-- MELHORIAS BÁSICAS - VERSÃO CORRIGIDA
-- Execute este no Supabase SQL Editor
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

ALTER TABLE investimentos ADD COLUMN IF NOT EXISTS deletado BOOLEAN DEFAULT FALSE;
ALTER TABLE investimentos ADD COLUMN IF NOT EXISTS deletado_em TIMESTAMP;
ALTER TABLE investimentos ADD COLUMN IF NOT EXISTS deletado_por BIGINT;

ALTER TABLE patrimonio ADD COLUMN IF NOT EXISTS deletado BOOLEAN DEFAULT FALSE;
ALTER TABLE patrimonio ADD COLUMN IF NOT EXISTS deletado_em TIMESTAMP;
ALTER TABLE patrimonio ADD COLUMN IF NOT EXISTS deletado_por BIGINT;

-- Índices parciais (só não deletados)
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
CREATE INDEX IF NOT EXISTS idx_gastos_categoria_data ON gastos(categoria_id, data DESC) WHERE deletado = FALSE;

-- COMPRAS PARCELADAS
CREATE INDEX IF NOT EXISTS idx_parcelas_usuario_ativas ON compras_parceladas(usuario_id, finalizada) WHERE finalizada = FALSE AND deletado = FALSE;

-- GASOLINA
CREATE INDEX IF NOT EXISTS idx_gasolina_usuario_data ON gasolina(usuario_id, data DESC);

-- TRANSFERENCIAS
CREATE INDEX IF NOT EXISTS idx_transf_de_usuario ON transferencias(de_usuario_id, data DESC);
CREATE INDEX IF NOT EXISTS idx_transf_para_usuario ON transferencias(para_usuario_id, data DESC);
CREATE INDEX IF NOT EXISTS idx_transf_pendentes ON transferencias(pago) WHERE pago = FALSE;

-- FAMILIA_MEMBROS
CREATE INDEX IF NOT EXISTS idx_familia_membros_lookup ON familia_membros(familia_id, usuario_id);

-- SALARIES
CREATE INDEX IF NOT EXISTS idx_salaries_usuario ON salaries(usuario_id);

-- CARTOES
CREATE INDEX IF NOT EXISTS idx_cartoes_usuario_ativo ON cartoes(usuario_id, ativo);

-- EMPRESTIMOS
CREATE INDEX IF NOT EXISTS idx_emprestimos_tipo_pago ON emprestimos(tipo, pago) WHERE pago = FALSE;

-- DIVIDAS
CREATE INDEX IF NOT EXISTS idx_dividas_quitada ON dividas(quitada) WHERE quitada = FALSE;

-- ============================================
-- 3. CONSTRAINTS BÁSICAS
-- ============================================

-- USERS: email válido
ALTER TABLE users DROP CONSTRAINT IF EXISTS email_valido;
ALTER TABLE users ADD CONSTRAINT email_valido
    CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$');

-- USERS: nome não vazio
ALTER TABLE users DROP CONSTRAINT IF EXISTS nome_nao_vazio;
ALTER TABLE users ADD CONSTRAINT nome_nao_vazio
    CHECK (TRIM(nome) != '');

-- GASTOS: valor mínimo
ALTER TABLE gastos DROP CONSTRAINT IF EXISTS valor_positivo;
ALTER TABLE gastos ADD CONSTRAINT valor_positivo CHECK (valor >= 0.01);

-- CARTOES: dias válidos
ALTER TABLE cartoes DROP CONSTRAINT IF EXISTS dia_fechamento_valido;
ALTER TABLE cartoes ADD CONSTRAINT dia_fechamento_valido
    CHECK (dia_fechamento IS NULL OR (dia_fechamento >= 1 AND dia_fechamento <= 31));

ALTER TABLE cartoes DROP CONSTRAINT IF EXISTS dia_vencimento_valido;
ALTER TABLE cartoes ADD CONSTRAINT dia_vencimento_valido
    CHECK (dia_vencimento IS NULL OR (dia_vencimento >= 1 AND dia_vencimento <= 31));

-- EMPRESTIMOS: datas coerentes
ALTER TABLE emprestimos DROP CONSTRAINT IF EXISTS datas_coerentes;
ALTER TABLE emprestimos ADD CONSTRAINT datas_coerentes
    CHECK (data_vencimento IS NULL OR data_vencimento >= data_emprestimo);

-- COMPRAS_PARCELADAS: parcelas coerentes
ALTER TABLE compras_parceladas DROP CONSTRAINT IF EXISTS parcela_coerente;
ALTER TABLE compras_parceladas ADD CONSTRAINT parcela_coerente
    CHECK (ABS(valor_parcela * total_parcelas - valor_total) < 1.00);

-- DIVIDAS: valores coerentes
ALTER TABLE dividas DROP CONSTRAINT IF EXISTS valores_divida_coerentes;
ALTER TABLE dividas ADD CONSTRAINT valores_divida_coerentes
    CHECK (valor_pago <= valor_total);

-- TRANSFERENCIAS: usuários diferentes
ALTER TABLE transferencias DROP CONSTRAINT IF EXISTS usuarios_diferentes;
ALTER TABLE transferencias ADD CONSTRAINT usuarios_diferentes
    CHECK (de_usuario_id != para_usuario_id);

-- ============================================
-- 4. MATERIALIZED VIEW PARA DASHBOARD
-- ============================================

DROP MATERIALIZED VIEW IF EXISTS mv_dashboard_mensal CASCADE;
CREATE MATERIALIZED VIEW mv_dashboard_mensal AS
SELECT
    CURRENT_DATE as mes_referencia,
    EXTRACT(YEAR FROM CURRENT_DATE)::INT as ano,
    EXTRACT(MONTH FROM CURRENT_DATE)::INT as mes,

    -- Receitas
    (SELECT COALESCE(SUM(valor), 0)
     FROM salaries) as receitas_total,

    -- Gastos do mês atual
    (SELECT COALESCE(SUM(valor), 0)
     FROM gastos
     WHERE EXTRACT(YEAR FROM data) = EXTRACT(YEAR FROM CURRENT_DATE)
       AND EXTRACT(MONTH FROM data) = EXTRACT(MONTH FROM CURRENT_DATE)
       AND COALESCE(deletado, FALSE) = FALSE) as gastos_mes,

    -- Parcelas ativas
    (SELECT COALESCE(SUM(valor_parcela), 0)
     FROM compras_parceladas
     WHERE finalizada = FALSE
       AND COALESCE(deletado, FALSE) = FALSE) as parcelas_mes,

    -- Gasolina do mês
    (SELECT COALESCE(SUM(valor), 0)
     FROM gasolina
     WHERE EXTRACT(YEAR FROM data) = EXTRACT(YEAR FROM CURRENT_DATE)
       AND EXTRACT(MONTH FROM data) = EXTRACT(MONTH FROM CURRENT_DATE)
       AND COALESCE(deletado, FALSE) = FALSE) as gasolina_mes,

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
       AND COALESCE(deletado, FALSE) = FALSE) as patrimonio_total,

    -- Investimentos
    (SELECT COALESCE(SUM(valor), 0)
     FROM investimentos
     WHERE ativo = TRUE
       AND COALESCE(deletado, FALSE) = FALSE) as investimentos_total,

    -- Dívidas pendentes
    (SELECT COALESCE(SUM(valor_total - valor_pago), 0)
     FROM dividas
     WHERE quitada = FALSE
       AND COALESCE(deletado, FALSE) = FALSE) as dividas_pendentes,

    -- Empréstimos que você emprestou (a receber)
    (SELECT COALESCE(SUM(valor), 0)
     FROM emprestimos
     WHERE tipo = 'emprestei'
       AND pago = FALSE
       AND COALESCE(deletado, FALSE) = FALSE) as a_receber,

    -- Empréstimos que você pegou (a pagar)
    (SELECT COALESCE(SUM(valor), 0)
     FROM emprestimos
     WHERE tipo = 'peguei'
       AND pago = FALSE
       AND COALESCE(deletado, FALSE) = FALSE) as a_pagar,

    NOW() as atualizado_em;

-- Índice único para permitir REFRESH CONCURRENTLY
CREATE UNIQUE INDEX idx_mv_dashboard_mes ON mv_dashboard_mensal(mes_referencia);

-- ============================================
-- 5. VIEW DE GASTOS POR CATEGORIA
-- ============================================

DROP MATERIALIZED VIEW IF EXISTS mv_gastos_categoria_mes CASCADE;
CREATE MATERIALIZED VIEW mv_gastos_categoria_mes AS
SELECT
    CURRENT_DATE as mes_referencia,
    c.id as categoria_id,
    c.nome as categoria,
    c.icone,
    c.cor,
    COUNT(g.id) as quantidade,
    COALESCE(SUM(g.valor), 0) as total
FROM categorias c
LEFT JOIN gastos g ON c.id = g.categoria_id
    AND EXTRACT(YEAR FROM g.data) = EXTRACT(YEAR FROM CURRENT_DATE)
    AND EXTRACT(MONTH FROM g.data) = EXTRACT(MONTH FROM CURRENT_DATE)
    AND COALESCE(g.deletado, FALSE) = FALSE
WHERE c.tipo = 'gasto' AND c.ativa = TRUE
GROUP BY c.id, c.nome, c.icone, c.cor
ORDER BY total DESC;

CREATE UNIQUE INDEX idx_mv_gastos_cat_mes ON mv_gastos_categoria_mes(mes_referencia, categoria_id);

-- ============================================
-- 6. FUNÇÕES ÚTEIS
-- ============================================

-- Função para atualizar materialized views
CREATE OR REPLACE FUNCTION refresh_dashboard_views()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_mensal;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_gastos_categoria_mes;
END;
$$ LANGUAGE plpgsql;

-- Função para soft delete
CREATE OR REPLACE FUNCTION soft_delete(
    p_tabela TEXT,
    p_id BIGINT
)
RETURNS BOOLEAN AS $$
BEGIN
    EXECUTE format('
        UPDATE %I
        SET deletado = TRUE,
            deletado_em = NOW()
        WHERE id = $1 AND COALESCE(deletado, FALSE) = FALSE
    ', p_tabela)
    USING p_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para restaurar
CREATE OR REPLACE FUNCTION soft_undelete(
    p_tabela TEXT,
    p_id BIGINT
)
RETURNS BOOLEAN AS $$
BEGIN
    EXECUTE format('
        UPDATE %I
        SET deletado = FALSE,
            deletado_em = NULL,
            deletado_por = NULL
        WHERE id = $1 AND deletado = TRUE
    ', p_tabela)
    USING p_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. FAMILIA_ID EM TABELAS PRINCIPAIS
-- ============================================

ALTER TABLE gastos ADD COLUMN IF NOT EXISTS familia_id BIGINT REFERENCES familias(id) ON DELETE CASCADE;
ALTER TABLE salaries ADD COLUMN IF NOT EXISTS familia_id BIGINT REFERENCES familias(id) ON DELETE CASCADE;
ALTER TABLE compras_parceladas ADD COLUMN IF NOT EXISTS familia_id BIGINT REFERENCES familias(id) ON DELETE CASCADE;
ALTER TABLE gasolina ADD COLUMN IF NOT EXISTS familia_id BIGINT REFERENCES familias(id) ON DELETE CASCADE;
ALTER TABLE cartoes ADD COLUMN IF NOT EXISTS familia_id BIGINT REFERENCES familias(id) ON DELETE CASCADE;
ALTER TABLE emprestimos ADD COLUMN IF NOT EXISTS familia_id BIGINT REFERENCES familias(id) ON DELETE CASCADE;
ALTER TABLE dividas ADD COLUMN IF NOT EXISTS familia_id BIGINT REFERENCES familias(id) ON DELETE CASCADE;

-- Índices com familia_id
CREATE INDEX IF NOT EXISTS idx_gastos_familia_usuario ON gastos(familia_id, usuario_id);
CREATE INDEX IF NOT EXISTS idx_salaries_familia ON salaries(familia_id, usuario_id);
CREATE INDEX IF NOT EXISTS idx_parcelas_familia ON compras_parceladas(familia_id, usuario_id);
CREATE INDEX IF NOT EXISTS idx_cartoes_familia ON cartoes(familia_id, usuario_id);

-- ============================================
-- 8. ATUALIZAR RLS POLICIES (Opcional)
-- ============================================

-- Atualizar policy de gastos para excluir deletados
DROP POLICY IF EXISTS "View family expenses" ON gastos;
CREATE POLICY "View family expenses" ON gastos
  FOR SELECT USING (
    COALESCE(deletado, FALSE) = FALSE AND
    (familia_id IS NULL OR familia_id IN (
      SELECT familia_id FROM familia_membros
      WHERE usuario_id::text = auth.uid()::text
    ))
  );

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================

SELECT '✅ MELHORIAS BÁSICAS APLICADAS COM SUCESSO!' as status;
SELECT '' as separador;

-- Verificar soft delete
SELECT 'Soft Delete:' as tipo,
       COUNT(DISTINCT table_name)::TEXT || ' tabelas' as resultado
FROM information_schema.columns
WHERE column_name = 'deletado' AND table_schema = 'public';

-- Verificar índices
SELECT 'Índices:' as tipo,
       COUNT(*)::TEXT || ' índices criados' as resultado
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%';

-- Verificar constraints
SELECT 'Constraints:' as tipo,
       COUNT(*)::TEXT || ' validações ativas' as resultado
FROM information_schema.table_constraints
WHERE constraint_schema = 'public'
  AND constraint_type = 'CHECK';

-- Verificar materialized views
SELECT 'Views:' as tipo,
       COUNT(*)::TEXT || ' materialized views' as resultado
FROM pg_matviews
WHERE schemaname = 'public';

-- Verificar funções
SELECT 'Funções:' as tipo,
       COUNT(*)::TEXT || ' funções criadas' as resultado
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('refresh_dashboard_views', 'soft_delete', 'soft_undelete');

SELECT '' as separador;
SELECT '📊 TESTE DO DASHBOARD:' as info;

-- Testar view (deve retornar dados)
SELECT * FROM mv_dashboard_mensal;

SELECT '' as separador;
SELECT '🎉 SISTEMA MELHORADO COM SUCESSO!' as resultado;
SELECT '💡 Próximo passo: SELECT * FROM mv_gastos_categoria_mes;' as dica;
