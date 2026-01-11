-- ============================================
-- PARTICIONAMENTO AVANÇADO
-- Para tabelas que crescem infinitamente
-- Execute APENAS se tiver muitos dados (>100k registros)
-- ============================================

-- ⚠️ ATENÇÃO: Este script reorganiza tabelas existentes.
-- Faça BACKUP antes de executar!

-- ============================================
-- 1. PARTICIONAR TABELA GASTOS POR MÊS/ANO
-- ============================================

-- Passo 1: Renomear tabela existente
ALTER TABLE IF EXISTS gastos RENAME TO gastos_old;

-- Passo 2: Criar nova tabela particionada
CREATE TABLE gastos (
    id BIGSERIAL,
    usuario_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    familia_id BIGINT REFERENCES familias(id) ON DELETE CASCADE,
    categoria_id BIGINT REFERENCES categorias(id) ON DELETE SET NULL,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(15, 2) NOT NULL,
    data DATE NOT NULL,
    tipo_pagamento VARCHAR(50),
    categoria VARCHAR(100),
    observacoes TEXT,
    deletado BOOLEAN DEFAULT FALSE,
    deletado_em TIMESTAMP,
    deletado_por BIGINT REFERENCES users(id),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valor_positivo CHECK (valor >= 0.01),
    PRIMARY KEY (id, data)
) PARTITION BY RANGE (data);

-- Passo 3: Criar partições para 2024-2026
CREATE TABLE gastos_2024 PARTITION OF gastos
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE gastos_2025 PARTITION OF gastos
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

CREATE TABLE gastos_2026 PARTITION OF gastos
    FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');

CREATE TABLE gastos_2027 PARTITION OF gastos
    FOR VALUES FROM ('2027-01-01') TO ('2028-01-01');

-- Partição padrão para datas futuras
CREATE TABLE gastos_futuro PARTITION OF gastos
    FOR VALUES FROM ('2028-01-01') TO (MAXVALUE);

-- Passo 4: Migrar dados antigos
INSERT INTO gastos SELECT * FROM gastos_old;

-- Passo 5: Dropar tabela antiga (CUIDADO!)
-- DROP TABLE gastos_old CASCADE;

-- Passo 6: Recriar índices nas partições
CREATE INDEX idx_gastos_usuario_data ON gastos(usuario_id, data DESC);
CREATE INDEX idx_gastos_familia_usuario ON gastos(familia_id, usuario_id, data DESC);
CREATE INDEX idx_gastos_categoria_data ON gastos(categoria_id, data DESC);
CREATE INDEX idx_gastos_deletado ON gastos(deletado) WHERE deletado = FALSE;

-- ============================================
-- 2. PARTICIONAR CARTAO_TRANSACOES POR ANO/MÊS
-- ============================================

-- Renomear existente
ALTER TABLE IF EXISTS cartao_transacoes RENAME TO cartao_transacoes_old;

-- Criar particionada
CREATE TABLE cartao_transacoes (
    id BIGSERIAL,
    cartao_id BIGINT NOT NULL REFERENCES cartoes(id) ON DELETE CASCADE,
    usuario_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    categoria_id BIGINT REFERENCES categorias(id),
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(15,2) NOT NULL,
    data_transacao DATE NOT NULL,
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
    deletado BOOLEAN DEFAULT FALSE,
    deletado_em TIMESTAMP,
    deletado_por BIGINT REFERENCES users(id),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valor_positivo CHECK (valor > 0),
    PRIMARY KEY (id, data_transacao)
) PARTITION BY RANGE (data_transacao);

-- Criar partições
CREATE TABLE cartao_transacoes_2024 PARTITION OF cartao_transacoes
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE cartao_transacoes_2025 PARTITION OF cartao_transacoes
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

CREATE TABLE cartao_transacoes_2026 PARTITION OF cartao_transacoes
    FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');

-- Migrar dados
-- INSERT INTO cartao_transacoes SELECT * FROM cartao_transacoes_old;

-- Recriar índices
CREATE INDEX idx_cartao_trans_cartao_data ON cartao_transacoes(cartao_id, data_transacao DESC);
CREATE INDEX idx_cartao_trans_fatura ON cartao_transacoes(cartao_id, ano_fatura, mes_fatura, pago);
CREATE INDEX idx_cartao_trans_pendentes ON cartao_transacoes(cartao_id, pago) WHERE pago = FALSE;

-- ============================================
-- 3. PARTICIONAR AUDITORIA POR MÊS
-- ============================================

-- Renomear
ALTER TABLE IF EXISTS auditoria RENAME TO auditoria_old;

-- Criar particionada
CREATE TABLE auditoria (
    id BIGSERIAL,
    tabela VARCHAR(100) NOT NULL,
    operacao VARCHAR(10) NOT NULL,
    registro_id BIGINT NOT NULL,
    usuario_id BIGINT REFERENCES users(id),
    dados_antigos JSONB,
    dados_novos JSONB,
    ip_address INET,
    user_agent TEXT,
    sessao_id TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id, data_criacao)
) PARTITION BY RANGE (data_criacao);

-- Criar partições mensais (últimos 12 meses)
DO $$
DECLARE
    mes_atual DATE;
    mes_proximo DATE;
    nome_tabela TEXT;
BEGIN
    FOR i IN 0..12 LOOP
        mes_atual := DATE_TRUNC('month', CURRENT_DATE) - (i || ' months')::INTERVAL;
        mes_proximo := mes_atual + INTERVAL '1 month';
        nome_tabela := 'auditoria_' || TO_CHAR(mes_atual, 'YYYY_MM');

        EXECUTE format('
            CREATE TABLE IF NOT EXISTS %I PARTITION OF auditoria
            FOR VALUES FROM (%L) TO (%L)
        ', nome_tabela, mes_atual, mes_proximo);
    END LOOP;
END;
$$;

-- Migrar dados
-- INSERT INTO auditoria SELECT * FROM auditoria_old;

-- Índices
CREATE INDEX idx_auditoria_tabela_registro ON auditoria(tabela, registro_id);
CREATE INDEX idx_auditoria_usuario ON auditoria(usuario_id);

-- ============================================
-- 4. AUTO-CRIAÇÃO DE PARTIÇÕES
-- ============================================

-- Function para criar partição automaticamente
CREATE OR REPLACE FUNCTION criar_particao_automatica()
RETURNS TRIGGER AS $$
DECLARE
    ano INT;
    mes INT;
    data_inicio DATE;
    data_fim DATE;
    nome_tabela TEXT;
BEGIN
    -- Para gastos e cartao_transacoes (por data)
    IF TG_TABLE_NAME IN ('gastos', 'cartao_transacoes') THEN
        ano := EXTRACT(YEAR FROM NEW.data);
        data_inicio := DATE_TRUNC('year', NEW.data::DATE);
        data_fim := data_inicio + INTERVAL '1 year';
        nome_tabela := TG_TABLE_NAME || '_' || ano;

        -- Criar partição se não existir
        BEGIN
            EXECUTE format('
                CREATE TABLE IF NOT EXISTS %I PARTITION OF %I
                FOR VALUES FROM (%L) TO (%L)
            ', nome_tabela, TG_TABLE_NAME, data_inicio, data_fim);
        EXCEPTION WHEN duplicate_table THEN
            NULL; -- Partição já existe
        END;
    END IF;

    -- Para auditoria (por mês)
    IF TG_TABLE_NAME = 'auditoria' THEN
        data_inicio := DATE_TRUNC('month', NEW.data_criacao);
        data_fim := data_inicio + INTERVAL '1 month';
        nome_tabela := 'auditoria_' || TO_CHAR(data_inicio, 'YYYY_MM');

        BEGIN
            EXECUTE format('
                CREATE TABLE IF NOT EXISTS %I PARTITION OF auditoria
                FOR VALUES FROM (%L) TO (%L)
            ', nome_tabela, data_inicio, data_fim);
        EXCEPTION WHEN duplicate_table THEN
            NULL;
        END;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers
DROP TRIGGER IF EXISTS trigger_auto_particao_gastos ON gastos;
CREATE TRIGGER trigger_auto_particao_gastos
    BEFORE INSERT ON gastos
    FOR EACH ROW
    EXECUTE FUNCTION criar_particao_automatica();

DROP TRIGGER IF EXISTS trigger_auto_particao_cartao ON cartao_transacoes;
CREATE TRIGGER trigger_auto_particao_cartao
    BEFORE INSERT ON cartao_transacoes
    FOR EACH ROW
    EXECUTE FUNCTION criar_particao_automatica();

DROP TRIGGER IF EXISTS trigger_auto_particao_audit ON auditoria;
CREATE TRIGGER trigger_auto_particao_audit
    BEFORE INSERT ON auditoria
    FOR EACH ROW
    EXECUTE FUNCTION criar_particao_automatica();

-- ============================================
-- 5. MANUTENÇÃO DE PARTIÇÕES
-- ============================================

-- Função para listar partições
CREATE OR REPLACE FUNCTION listar_particoes(p_tabela TEXT)
RETURNS TABLE(
    particao TEXT,
    valores TEXT,
    tamanho_mb NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.relname::TEXT,
        pg_get_expr(c.relpartbound, c.oid)::TEXT as valores,
        ROUND((pg_total_relation_size(c.oid) / 1024.0 / 1024.0)::numeric, 2) as tamanho
    FROM pg_class c
    JOIN pg_inherits i ON c.oid = i.inhrelid
    JOIN pg_class p ON i.inhparent = p.oid
    WHERE p.relname = p_tabela
    ORDER BY c.relname;
END;
$$ LANGUAGE plpgsql;

-- Função para dropar partições antigas (>2 anos)
CREATE OR REPLACE FUNCTION limpar_particoes_antigas(
    p_tabela TEXT,
    p_anos_manter INT DEFAULT 2
)
RETURNS TABLE(particao_removida TEXT) AS $$
DECLARE
    v_particao RECORD;
    v_data_limite DATE;
BEGIN
    v_data_limite := CURRENT_DATE - (p_anos_manter || ' years')::INTERVAL;

    FOR v_particao IN
        SELECT c.relname
        FROM pg_class c
        JOIN pg_inherits i ON c.oid = i.inhrelid
        JOIN pg_class p ON i.inhparent = p.oid
        WHERE p.relname = p_tabela
          AND c.relname ~ '\d{4}$' -- Termina com ano
          AND SUBSTRING(c.relname FROM '\d{4}$')::INT < EXTRACT(YEAR FROM v_data_limite)
    LOOP
        EXECUTE format('DROP TABLE IF EXISTS %I CASCADE', v_particao.relname);
        RETURN QUERY SELECT v_particao.relname::TEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. MONITORAMENTO DE PARTIÇÕES
-- ============================================

-- View de status das partições
CREATE OR REPLACE VIEW vw_status_particoes AS
SELECT
    schemaname,
    tablename as tabela,
    COUNT(*) as total_particoes,
    SUM(pg_total_relation_size(schemaname || '.' || tablename)::bigint) / 1024 / 1024 as tamanho_total_mb
FROM pg_tables
WHERE tablename LIKE '%\_20%'
GROUP BY schemaname, tablename
ORDER BY tamanho_total_mb DESC;

-- ============================================
-- 7. MIGRAÇÃO SEGURA (ROLLBACK)
-- ============================================

-- Se algo der errado, pode voltar assim:
/*
DROP TABLE gastos CASCADE;
ALTER TABLE gastos_old RENAME TO gastos;

DROP TABLE cartao_transacoes CASCADE;
ALTER TABLE cartao_transacoes_old RENAME TO cartao_transacoes;

DROP TABLE auditoria CASCADE;
ALTER TABLE auditoria_old RENAME TO auditoria;
*/

-- ============================================
-- VERIFICAÇÃO
-- ============================================

SELECT '✅ PARTICIONAMENTO CONFIGURADO!' as status;

-- Listar partições de gastos
SELECT '📊 Partições de GASTOS:' as info;
SELECT * FROM listar_particoes('gastos');

-- Estatísticas
SELECT
    'Total de partições criadas:' as metrica,
    COUNT(*)::TEXT as valor
FROM pg_tables
WHERE tablename LIKE 'gastos_%'
   OR tablename LIKE 'cartao_transacoes_%'
   OR tablename LIKE 'auditoria_%';

SELECT '🚀 Performance esperada com particionamento:' as info;
SELECT 'Queries em 1 partição (1 ano) vs tabela inteira' as comparacao,
       '10-100x mais rápido' as ganho;

SELECT '💡 Próximos passos:' as tipo, 'Executar: SELECT limpar_particoes_antigas(''gastos'', 2);' as acao
UNION ALL SELECT '💡 Próximos passos', 'Criar job CRON para auto-limpeza mensal'
UNION ALL SELECT '💡 Próximos passos', 'Monitorar: SELECT * FROM vw_status_particoes;';
