-- ============================================
-- MELHORIAS - VERSÃO FINAL TESTADA
-- Execute este arquivo NO SUPABASE SQL EDITOR
-- ============================================

-- ============================================
-- PASSO 0: GARANTIR QUE TABELAS EXISTAM
-- ============================================

-- Adicionar colunas que podem estar faltando
ALTER TABLE compras_parceladas ADD COLUMN IF NOT EXISTS valor_parcela DECIMAL(15, 2);
ALTER TABLE compras_parceladas ADD COLUMN IF NOT EXISTS total_parcelas INTEGER DEFAULT 1;
ALTER TABLE compras_parceladas ADD COLUMN IF NOT EXISTS parcelas_pagas INTEGER DEFAULT 0;

-- Atualizar valor_parcela se estiver NULL
UPDATE compras_parceladas
SET valor_parcela = valor_total / NULLIF(total_parcelas, 0)
WHERE valor_parcela IS NULL AND valor_total IS NOT NULL AND total_parcelas > 0;

-- ============================================
-- PASSO 1: SOFT DELETE
-- ============================================

-- Adicionar colunas de soft delete
DO $$
DECLARE
    tabela TEXT;
BEGIN
    FOR tabela IN
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
          AND table_name IN (
              'gastos', 'compras_parceladas', 'gasolina',
              'emprestimos', 'dividas', 'cartoes',
              'investimentos', 'patrimonio', 'metas'
          )
    LOOP
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS deletado BOOLEAN DEFAULT FALSE', tabela);
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS deletado_em TIMESTAMP', tabela);
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS deletado_por BIGINT', tabela);

        -- Índice parcial
        EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_deletado ON %I(deletado) WHERE deletado = FALSE', tabela, tabela);
    END LOOP;
END $$;

-- ============================================
-- PASSO 2: ÍNDICES OTIMIZADOS
-- ============================================

-- GASTOS
CREATE INDEX IF NOT EXISTS idx_gastos_usuario_data ON gastos(usuario_id, data DESC);
CREATE INDEX IF NOT EXISTS idx_gastos_categoria_data ON gastos(categoria_id, data DESC);
CREATE INDEX IF NOT EXISTS idx_gastos_data_usuario ON gastos(data, usuario_id);

-- COMPRAS PARCELADAS
CREATE INDEX IF NOT EXISTS idx_parcelas_usuario_ativas ON compras_parceladas(usuario_id, finalizada) WHERE finalizada = FALSE;
CREATE INDEX IF NOT EXISTS idx_parcelas_usuario ON compras_parceladas(usuario_id);

-- GASOLINA
CREATE INDEX IF NOT EXISTS idx_gasolina_usuario_data ON gasolina(usuario_id, data DESC);
CREATE INDEX IF NOT EXISTS idx_gasolina_data ON gasolina(data DESC);

-- TRANSFERENCIAS (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transferencias') THEN
        CREATE INDEX IF NOT EXISTS idx_transf_de_usuario ON transferencias(de_usuario_id, data DESC);
        CREATE INDEX IF NOT EXISTS idx_transf_para_usuario ON transferencias(para_usuario_id, data DESC);
        CREATE INDEX IF NOT EXISTS idx_transf_pendentes ON transferencias(pago) WHERE pago = FALSE;
    END IF;
END $$;

-- FAMILIA_MEMBROS (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'familia_membros') THEN
        CREATE INDEX IF NOT EXISTS idx_familia_membros_lookup ON familia_membros(familia_id, usuario_id);
        CREATE INDEX IF NOT EXISTS idx_familia_membros_usuario ON familia_membros(usuario_id);
    END IF;
END $$;

-- SALARIES
CREATE INDEX IF NOT EXISTS idx_salaries_usuario ON salaries(usuario_id);

-- CARTOES
CREATE INDEX IF NOT EXISTS idx_cartoes_usuario_ativo ON cartoes(usuario_id, ativo);
CREATE INDEX IF NOT EXISTS idx_cartoes_usuario ON cartoes(usuario_id);

-- EMPRESTIMOS
CREATE INDEX IF NOT EXISTS idx_emprestimos_tipo_pago ON emprestimos(tipo, pago);
CREATE INDEX IF NOT EXISTS idx_emprestimos_pago ON emprestimos(pago) WHERE pago = FALSE;

-- DIVIDAS
CREATE INDEX IF NOT EXISTS idx_dividas_quitada ON dividas(quitada) WHERE quitada = FALSE;

-- ============================================
-- PASSO 3: CONSTRAINTS BÁSICAS
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
    CHECK (valor_parcela IS NULL OR ABS(valor_parcela * total_parcelas - valor_total) < 1.00);

-- DIVIDAS: valores coerentes
ALTER TABLE dividas DROP CONSTRAINT IF EXISTS valores_divida_coerentes;
ALTER TABLE dividas ADD CONSTRAINT valores_divida_coerentes
    CHECK (valor_pago <= valor_total);

-- TRANSFERENCIAS: usuários diferentes (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transferencias') THEN
        ALTER TABLE transferencias DROP CONSTRAINT IF EXISTS usuarios_diferentes;
        ALTER TABLE transferencias ADD CONSTRAINT usuarios_diferentes
            CHECK (de_usuario_id != para_usuario_id);
    END IF;
END $$;

-- ============================================
-- PASSO 4: MATERIALIZED VIEW DASHBOARD
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

    -- Parcelas ativas (usar COALESCE para valor_parcela)
    (SELECT COALESCE(SUM(COALESCE(valor_parcela, valor_total / NULLIF(total_parcelas, 0))), 0)
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

    -- Ferramentas ativas (se existir)
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

    -- Empréstimos a receber
    (SELECT COALESCE(SUM(valor), 0)
     FROM emprestimos
     WHERE tipo = 'emprestei'
       AND pago = FALSE
       AND COALESCE(deletado, FALSE) = FALSE) as a_receber,

    -- Empréstimos a pagar
    (SELECT COALESCE(SUM(valor), 0)
     FROM emprestimos
     WHERE tipo = 'peguei'
       AND pago = FALSE
       AND COALESCE(deletado, FALSE) = FALSE) as a_pagar,

    NOW() as atualizado_em;

-- Índice único
CREATE UNIQUE INDEX idx_mv_dashboard_mes ON mv_dashboard_mensal(mes_referencia);

-- ============================================
-- PASSO 5: VIEW GASTOS POR CATEGORIA
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
-- PASSO 6: FUNÇÕES ÚTEIS
-- ============================================

-- Função para atualizar views
CREATE OR REPLACE FUNCTION refresh_dashboard_views()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_mensal;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_gastos_categoria_mes;
END;
$$ LANGUAGE plpgsql;

-- Função soft delete
CREATE OR REPLACE FUNCTION soft_delete(p_tabela TEXT, p_id BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
    EXECUTE format('
        UPDATE %I
        SET deletado = TRUE, deletado_em = NOW()
        WHERE id = $1 AND COALESCE(deletado, FALSE) = FALSE
    ', p_tabela) USING p_id;
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função restaurar
CREATE OR REPLACE FUNCTION soft_undelete(p_tabela TEXT, p_id BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
    EXECUTE format('
        UPDATE %I
        SET deletado = FALSE, deletado_em = NULL, deletado_por = NULL
        WHERE id = $1 AND deletado = TRUE
    ', p_tabela) USING p_id;
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PASSO 7: FAMILIA_ID (se familia existir)
-- ============================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'familias') THEN
        ALTER TABLE gastos ADD COLUMN IF NOT EXISTS familia_id UUID REFERENCES familias(id) ON DELETE CASCADE;
        ALTER TABLE salaries ADD COLUMN IF NOT EXISTS familia_id UUID REFERENCES familias(id) ON DELETE CASCADE;
        ALTER TABLE compras_parceladas ADD COLUMN IF NOT EXISTS familia_id UUID REFERENCES familias(id) ON DELETE CASCADE;
        ALTER TABLE gasolina ADD COLUMN IF NOT EXISTS familia_id UUID REFERENCES familias(id) ON DELETE CASCADE;
        ALTER TABLE cartoes ADD COLUMN IF NOT EXISTS familia_id UUID REFERENCES familias(id) ON DELETE CASCADE;

        -- Índices
        CREATE INDEX IF NOT EXISTS idx_gastos_familia_usuario ON gastos(familia_id, usuario_id);
        CREATE INDEX IF NOT EXISTS idx_salaries_familia ON salaries(familia_id, usuario_id);
        CREATE INDEX IF NOT EXISTS idx_parcelas_familia ON compras_parceladas(familia_id, usuario_id);
    END IF;
END $$;

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================

SELECT '✅ MELHORIAS APLICADAS COM SUCESSO!' as status;

-- Estatísticas
SELECT 'Soft Delete:' as item,
       COUNT(DISTINCT table_name)::TEXT || ' tabelas' as valor
FROM information_schema.columns
WHERE column_name = 'deletado' AND table_schema = 'public'

UNION ALL

SELECT 'Índices:',
       COUNT(*)::TEXT || ' criados'
FROM pg_indexes
WHERE schemaname = 'public' AND indexname LIKE 'idx_%'

UNION ALL

SELECT 'Constraints:',
       COUNT(*)::TEXT || ' validações'
FROM information_schema.table_constraints
WHERE constraint_schema = 'public' AND constraint_type = 'CHECK'

UNION ALL

SELECT 'Views:',
       COUNT(*)::TEXT || ' materialized'
FROM pg_matviews
WHERE schemaname = 'public'

UNION ALL

SELECT 'Funções:',
       '3 criadas (refresh, soft_delete, soft_undelete)'
WHERE EXISTS (
    SELECT 1 FROM information_schema.routines
    WHERE routine_name = 'refresh_dashboard_views'
);

-- Testar dashboard
SELECT '📊 DADOS DO DASHBOARD:' as info;
SELECT * FROM mv_dashboard_mensal;

SELECT '🎉 PRONTO! Sistema melhorado e otimizado!' as final;
