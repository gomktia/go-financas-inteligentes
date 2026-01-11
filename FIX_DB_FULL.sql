-- =================================================================
-- SCRIPT DE CORREÇÃO E LIMPEZA TOTAL DO BANCO DE DADOS
-- DATA: 10/01/2026
-- OBJETIVO: Remover tabelas obsoletas, padronizar nomes e garantir
-- estrutura para Módulos Financeiro, Família e Empresa.
-- =================================================================

-- 1. DROP DAS TABELAS OBSOLETAS (GAMIFICAÇÃO, FILHOS, ETC)
-- =================================================================
DROP VIEW IF EXISTS vw_ranking_gamification CASCADE;
DROP VIEW IF EXISTS vw_desafios_ativos CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_dashboard_mensal CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_gastos_categoria_mes CASCADE;

DROP TABLE IF EXISTS filho_conquistas CASCADE;
DROP TABLE IF EXISTS gastos_filhos CASCADE;
DROP TABLE IF EXISTS perfis_filhos CASCADE;
DROP TABLE IF EXISTS mesada_ajustes CASCADE;
DROP TABLE IF EXISTS mesadas CASCADE;

DROP TABLE IF EXISTS desafios_familia CASCADE;
DROP TABLE IF EXISTS desafio_progresso CASCADE;
DROP TABLE IF EXISTS desafio_regras CASCADE;

DROP TABLE IF EXISTS conquistas CASCADE;
DROP TABLE IF EXISTS user_gamification CASCADE;
DROP TABLE IF EXISTS score_financeiro CASCADE;
DROP TABLE IF EXISTS score_historico CASCADE;

DROP TABLE IF EXISTS lista_desejos_contribuicoes CASCADE;
DROP TABLE IF EXISTS lista_desejos_votacao CASCADE;
DROP TABLE IF EXISTS lista_desejos CASCADE;

DROP TABLE IF EXISTS tarefas_concluidas CASCADE;
DROP TABLE IF EXISTS tarefas CASCADE;

DROP TABLE IF EXISTS acerto_contas CASCADE;
DROP TABLE IF EXISTS alertas_inteligentes CASCADE;
DROP TABLE IF EXISTS ferramentas CASCADE; -- Módulo removido
DROP TABLE IF EXISTS ferramentas_ia_dev CASCADE;

-- Drops de Backups e Tags excessivas
DROP TABLE IF EXISTS gastos_backup CASCADE;
DROP TABLE IF EXISTS users_backup CASCADE;
DROP TABLE IF EXISTS users_backup_bigserial CASCADE;
DROP TABLE IF EXISTS assinaturas_tags CASCADE;
DROP TABLE IF EXISTS contas_fixas_tags CASCADE;
DROP TABLE IF EXISTS gastos_tags CASCADE;
DROP TABLE IF EXISTS orcamento_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;

-- 2. PADRONIZAÇÃO (SALARIES -> SALARIOS)
-- =================================================================
-- Se existir 'salaries' e não 'salarios', renomear.
-- Se existirem ambos, mover dados de salaries para salarios e dropar salaries.

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'salaries') THEN
        IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'salarios') THEN
            ALTER TABLE salaries RENAME TO salarios;
        ELSE
            -- CONFLITO DE TIPOS DETECTADO (UUID vs BIGINT)
            -- A tabela salarios existente usa UUID, mas nosso sistema novo usa BIGINT
            -- Vamos renomear a antiga para backup e criar a nova correta
            ALTER TABLE salarios RENAME TO salarios_backup_uuid;
            
            -- Criar salarios correta
            CREATE TABLE salarios (
                id BIGSERIAL PRIMARY KEY,
                usuario_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
                valor DECIMAL(15, 2) NOT NULL,
                descricao VARCHAR(255),
                mes_referencia DATE,
                data_recebimento DATE DEFAULT CURRENT_DATE,
                observacoes TEXT,
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- Migrar dados da tabela salaries (que é BIGINT)
            INSERT INTO salarios (usuario_id, valor, descricao, data_criacao)
            SELECT usuario_id, valor, descricao, data_criacao FROM salaries;
            
            DROP TABLE salaries CASCADE;
        END IF;
    END IF;
END $$;

-- Garantir tabela salarios (caso não exista nenhuma)
CREATE TABLE IF NOT EXISTS salarios (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    valor DECIMAL(15, 2) NOT NULL,
    descricao VARCHAR(255),
    mes_referencia DATE,
    data_recebimento DATE DEFAULT CURRENT_DATE,
    observacoes TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. GARANTIA DE COLUNAS 'COMPARTILHADO' (MÓDULO FAMÍLIA)
-- =================================================================
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS compartilhado BOOLEAN DEFAULT FALSE;
ALTER TABLE compras_parceladas ADD COLUMN IF NOT EXISTS compartilhado BOOLEAN DEFAULT FALSE;
ALTER TABLE assinaturas ADD COLUMN IF NOT EXISTS compartilhado BOOLEAN DEFAULT FALSE;
ALTER TABLE contas_fixas ADD COLUMN IF NOT EXISTS compartilhado BOOLEAN DEFAULT FALSE;
ALTER TABLE gasolina ADD COLUMN IF NOT EXISTS compartilhado BOOLEAN DEFAULT FALSE;

-- 4. GARANTIA DO MÓDULO EMPRESA
-- =================================================================
CREATE TABLE IF NOT EXISTS empresas (
    id BIGSERIAL PRIMARY KEY,
    dono_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    nome VARCHAR(200) NOT NULL,
    cnpj VARCHAR(20),
    ramo_atividade VARCHAR(100),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contas_empresa (
    id BIGSERIAL PRIMARY KEY,
    empresa_id BIGINT REFERENCES empresas(id) ON DELETE CASCADE,
    nome_banco VARCHAR(100) NOT NULL,
    tipo_conta VARCHAR(50) DEFAULT 'Corrente',
    agencia VARCHAR(20),
    numero_conta VARCHAR(20),
    saldo_inicial DECIMAL(15,2) DEFAULT 0,
    saldo_atual DECIMAL(15,2) DEFAULT 0,
    cor VARCHAR(7) DEFAULT '#333333',
    principal BOOLEAN DEFAULT FALSE,
    ativa BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transacoes_empresa (
    id BIGSERIAL PRIMARY KEY,
    empresa_id BIGINT REFERENCES empresas(id) ON DELETE CASCADE,
    conta_id BIGINT REFERENCES contas_empresa(id) ON DELETE SET NULL,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('receita', 'despesa')),
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(15, 2) NOT NULL CHECK (valor >= 0),
    data_transacao DATE NOT NULL,
    categoria VARCHAR(100), 
    status VARCHAR(20) DEFAULT 'pago',
    observacoes TEXT,
    anexo_url VARCHAR(500),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. RECRIAÇÃO DE VIEWS OTIMIZADAS
-- =================================================================
DROP VIEW IF EXISTS vw_resumo_mensal CASCADE;

CREATE OR REPLACE VIEW vw_resumo_mensal AS
SELECT 
    EXTRACT(YEAR FROM CURRENT_DATE) as ano,
    EXTRACT(MONTH FROM CURRENT_DATE) as mes,
    (SELECT COALESCE(SUM(valor), 0) FROM salarios) as receitas,
    (SELECT COALESCE(SUM(valor), 0) FROM gastos 
     WHERE EXTRACT(YEAR FROM data) = EXTRACT(YEAR FROM CURRENT_DATE)
       AND EXTRACT(MONTH FROM data) = EXTRACT(MONTH FROM CURRENT_DATE)) as gastos,
    (SELECT COALESCE(SUM(valor_parcela), 0) FROM compras_parceladas WHERE finalizada = FALSE) as parcelas,
    (SELECT COALESCE(SUM(valor), 0) FROM gasolina 
     WHERE EXTRACT(YEAR FROM data) = EXTRACT(YEAR FROM CURRENT_DATE)
       AND EXTRACT(MONTH FROM data) = EXTRACT(MONTH FROM CURRENT_DATE)) as gasolina,
    (SELECT COALESCE(SUM(valor), 0) FROM assinaturas WHERE ativa = TRUE) as assinaturas,
    (SELECT COALESCE(SUM(valor), 0) FROM contas_fixas WHERE ativa = TRUE) as contas_fixas;

-- 6. INSERÇÃO DE DADOS INICIAIS (SE NECESSÁRIO)
-- =================================================================
-- Criar empresa padrão se não existir
INSERT INTO empresas (dono_id, nome, ramo_atividade)
SELECT id, 'Minha Empresa', 'Geral'
FROM users
ORDER BY id ASC
LIMIT 1;

-- Criar família padrão
INSERT INTO familias (nome)
VALUES ('Minha Família')
ON CONFLICT DO NOTHING;

-- Notificar sucesso
SELECT 'Limpeza e Otimização Concluídas com Sucesso!' as status;
