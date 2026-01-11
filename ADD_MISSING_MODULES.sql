-- ============================================
-- MÓDULO: FAMÍLIA (GASTOS EM CONJUNTO)
-- ============================================

-- Tabela para agrupar usuários em uma família
CREATE TABLE IF NOT EXISTS familias (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de vinculação Usuário <-> Família
CREATE TABLE IF NOT EXISTS familia_membros (
    id BIGSERIAL PRIMARY KEY,
    familia_id BIGINT REFERENCES familias(id) ON DELETE CASCADE,
    usuario_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'membro', -- 'admin', 'membro'
    entrou_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(familia_id, usuario_id)
);

-- Adicionar flag de "Compartilhado" nas tabelas financeiras principais
-- Se TRUE, o item é considerado um gasto da família/conjunto
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS compartilhado BOOLEAN DEFAULT FALSE;
ALTER TABLE compras_parceladas ADD COLUMN IF NOT EXISTS compartilhado BOOLEAN DEFAULT FALSE;
ALTER TABLE assinaturas ADD COLUMN IF NOT EXISTS compartilhado BOOLEAN DEFAULT FALSE;
ALTER TABLE contas_fixas ADD COLUMN IF NOT EXISTS compartilhado BOOLEAN DEFAULT FALSE;
ALTER TABLE gasolina ADD COLUMN IF NOT EXISTS compartilhado BOOLEAN DEFAULT FALSE;

-- ============================================
-- MÓDULO: EMPRESA (CONTAS CORPORATIVAS)
-- ============================================

CREATE TABLE IF NOT EXISTS empresas (
    id BIGSERIAL PRIMARY KEY,
    dono_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    nome VARCHAR(200) NOT NULL,
    cnpj VARCHAR(20),
    ramo_atividade VARCHAR(100),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contas Bancárias da Empresa (ex: Inter PJ, Nubank PJ)
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

-- Movimentações Financeiras da Empresa (Fluxo de Caixa)
CREATE TABLE IF NOT EXISTS transacoes_empresa (
    id BIGSERIAL PRIMARY KEY,
    empresa_id BIGINT REFERENCES empresas(id) ON DELETE CASCADE,
    conta_id BIGINT REFERENCES contas_empresa(id) ON DELETE SET NULL,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('receita', 'despesa')),
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(15, 2) NOT NULL CHECK (valor >= 0),
    data_transacao DATE NOT NULL,
    categoria VARCHAR(100), -- Ex: 'Impostos', 'Fornecedores', 'Vendas'
    status VARCHAR(20) DEFAULT 'pago', -- 'pago', 'pendente'
    observacoes TEXT,
    anexo_url VARCHAR(500), -- Para nota fiscal
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_transacoes_empresa_data ON transacoes_empresa(data_transacao);
CREATE INDEX IF NOT EXISTS idx_transacoes_empresa_tipo ON transacoes_empresa(tipo);

-- Comentários
COMMENT ON TABLE familias IS 'Grupos familiares para compartilhamento de despesas';
COMMENT ON TABLE empresas IS 'Cadastros de empresas (PJ) do usuário';
COMMENT ON TABLE transacoes_empresa IS 'Ledger unificado de receitas e despesas da empresa';

-- Inserir dados de exemplo (se não existirem)
INSERT INTO familias (nome)
SELECT 'Família Principal'
WHERE NOT EXISTS (SELECT 1 FROM familias);

-- Assumindo que o usuário ID 1 existe (criado no setup anterior)
INSERT INTO familia_membros (familia_id, usuario_id, role)
SELECT 1, 1, 'admin'
WHERE NOT EXISTS (SELECT 1 FROM familia_membros WHERE usuario_id = 1);

INSERT INTO empresas (dono_id, nome, ramo_atividade)
SELECT 1, 'Minha Empresa Ltda', 'Tecnologia'
WHERE NOT EXISTS (SELECT 1 FROM empresas WHERE dono_id = 1);
