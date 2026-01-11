-- =================================================================
-- MÓDULO KIDS & EDUCAÇÃO FINANCEIRA
-- DATA: 11/01/2026
-- OBJETIVO: Gerenciar mesadas, tarefas remuneradas e cofrinhos dos filhos.
-- =================================================================

-- 1. TABELA DE PERFIS DOS FILHOS
-- =================================================================
CREATE TABLE IF NOT EXISTS kids_accounts (
    id BIGSERIAL PRIMARY KEY,
    parent_id BIGINT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    saldo DECIMAL(15, 2) DEFAULT 0,
    avatar VARCHAR(50) DEFAULT 'bear', -- bear, rabbit, cat, dog
    data_nascimento DATE,
    cor VARCHAR(7) DEFAULT '#FF9500',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TRANSAÇÕES DOS FILHOS (ENTRADAS E SAÍDAS)
-- =================================================================
CREATE TABLE IF NOT EXISTS kids_transactions (
    id BIGSERIAL PRIMARY KEY,
    kid_id BIGINT REFERENCES kids_accounts(id) ON DELETE CASCADE NOT NULL,
    tipo VARCHAR(10) CHECK (tipo IN ('entrada', 'saida')) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(15, 2) NOT NULL CHECK (valor > 0),
    data_transacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    categoria VARCHAR(50) DEFAULT 'Outros' -- Mesada, Presente, Lanche, Brinquedo
);

-- 3. TAREFAS REMUNERADAS (GAMIFICATION)
-- =================================================================
CREATE TABLE IF NOT EXISTS kids_tasks (
    id BIGSERIAL PRIMARY KEY,
    kid_id BIGINT REFERENCES kids_accounts(id) ON DELETE CASCADE NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    recompensa DECIMAL(15, 2) DEFAULT 0,
    frequencia VARCHAR(20) DEFAULT 'unica', -- unica, diaria, semanal
    concluida BOOLEAN DEFAULT FALSE,
    aprovada_pais BOOLEAN DEFAULT FALSE, -- Pai precisa aprovar para liberar o $
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. COFRINHOS (METAS DE POUPANÇA)
-- =================================================================
CREATE TABLE IF NOT EXISTS kids_goals (
    id BIGSERIAL PRIMARY KEY,
    kid_id BIGINT REFERENCES kids_accounts(id) ON DELETE CASCADE NOT NULL,
    nome VARCHAR(200) NOT NULL,
    valor_alvo DECIMAL(15, 2) NOT NULL,
    valor_atual DECIMAL(15, 2) DEFAULT 0,
    icone VARCHAR(50) DEFAULT 'star',
    concluida BOOLEAN DEFAULT FALSE
);

-- =================================================================
-- SEGURANÇA (RLS) - BLINDAGEM SAAS
-- =================================================================

-- Habilitar RLS
ALTER TABLE kids_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE kids_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE kids_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE kids_goals ENABLE ROW LEVEL SECURITY;

-- Funcao helper já existe: get_my_user_id()

-- POLICIES
-- Pais veem apenas seus filhos
CREATE POLICY "Pais veem seus filhos" ON kids_accounts
    FOR ALL USING (parent_id = get_my_user_id());

-- Transactions: Acesso via kid_id que pertence ao pai
CREATE POLICY "Pais veem transacoes filhos" ON kids_transactions
    FOR ALL USING (kid_id IN (SELECT id FROM kids_accounts WHERE parent_id = get_my_user_id()));

-- Tasks: Acesso via kid_id que pertence ao pai
CREATE POLICY "Pais veem tarefas filhos" ON kids_tasks
    FOR ALL USING (kid_id IN (SELECT id FROM kids_accounts WHERE parent_id = get_my_user_id()));

-- Goals: Acesso via kid_id que pertence ao pai
CREATE POLICY "Pais veem metas filhos" ON kids_goals
    FOR ALL USING (kid_id IN (SELECT id FROM kids_accounts WHERE parent_id = get_my_user_id()));

-- =================================================================
-- DADOS PRELIMINARES (EXEMPLO)
-- =================================================================
-- Inserir um filho de exemplo para o usuário atual (se existir)
DO $$
DECLARE
    meu_id BIGINT;
    filho_id BIGINT;
BEGIN
    SELECT id INTO meu_id FROM users WHERE auth_id = auth.uid() LIMIT 1;
    
    IF meu_id IS NOT NULL THEN
        -- Criar filho
        INSERT INTO kids_accounts (parent_id, nome, saldo, avatar)
        VALUES (meu_id, 'Junior', 50.00, 'bear')
        RETURNING id INTO filho_id;

        -- Criar transação exemplo
        INSERT INTO kids_transactions (kid_id, tipo, descricao, valor, categoria)
        VALUES (filho_id, 'entrada', 'Mesada Inicial', 50.00, 'Mesada');

        -- Criar tarefa exemplo
        INSERT INTO kids_tasks (kid_id, titulo, recompensa, frequencia)
        VALUES (filho_id, 'Arrumar o quarto', 5.00, 'semanal');
    END IF;
END $$;

SELECT 'Módulo Kids criado com sucesso!' as status;
