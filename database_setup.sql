-- ============================================
-- SISTEMA FINANCEIRO - SETUP COMPLETO
-- Database: PostgreSQL 14+
-- ============================================

-- Drop existing tables (cuidado em produção!)
DROP TABLE IF EXISTS auditoria CASCADE;
DROP TABLE IF EXISTS meta_contribuicoes CASCADE;
DROP TABLE IF EXISTS meta_historico CASCADE;
DROP TABLE IF EXISTS emprestimos CASCADE;
DROP TABLE IF EXISTS dividas CASCADE;
DROP TABLE IF EXISTS patrimonio CASCADE;
DROP TABLE IF EXISTS investimentos CASCADE;
DROP TABLE IF EXISTS ferramentas CASCADE;
DROP TABLE IF EXISTS orcamentos CASCADE;
DROP TABLE IF EXISTS metas CASCADE;
DROP TABLE IF EXISTS cartoes CASCADE;
DROP TABLE IF EXISTS contas_fixas CASCADE;
DROP TABLE IF EXISTS assinaturas CASCADE;
DROP TABLE IF EXISTS gasolina CASCADE;
DROP TABLE IF EXISTS compras_parceladas CASCADE;
DROP TABLE IF EXISTS gastos CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;
DROP TABLE IF EXISTS salaries CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- TABELA: users
-- ============================================
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cor VARCHAR(7) NOT NULL DEFAULT '#007AFF',
    email VARCHAR(255) UNIQUE,
    senha_hash VARCHAR(255), -- Para autenticação futura
    foto_url VARCHAR(500),
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_ativo ON users(ativo);

COMMENT ON TABLE users IS 'Usuários do sistema (membros da família)';

-- ============================================
-- TABELA: salaries
-- ============================================
CREATE TABLE salaries (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    valor DECIMAL(15, 2) NOT NULL,
    descricao VARCHAR(255),
    mes_referencia DATE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valor_positivo CHECK (valor >= 0)
);

CREATE INDEX idx_salaries_usuario ON salaries(usuario_id);
CREATE INDEX idx_salaries_mes ON salaries(mes_referencia);

COMMENT ON TABLE salaries IS 'Salários e receitas dos usuários';

-- ============================================
-- TABELA: categorias
-- ============================================
CREATE TABLE categorias (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    icone VARCHAR(50),
    cor VARCHAR(7) DEFAULT '#007AFF',
    tipo VARCHAR(50) NOT NULL,
    ativa BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT categorias_nome_tipo_key UNIQUE (nome, tipo)
);

CREATE INDEX idx_categorias_tipo ON categorias(tipo);
CREATE INDEX idx_categorias_ativa ON categorias(ativa);

COMMENT ON TABLE categorias IS 'Categorias para organização de gastos e parcelas';

-- Inserir categorias padrão
INSERT INTO categorias (nome, icone, tipo) VALUES
-- Categorias de Gastos
('Alimentação', '🍔', 'gasto'),
('Transporte', '🚗', 'gasto'),
('Saúde', '🏥', 'gasto'),
('Educação', '📚', 'gasto'),
('Lazer', '🎮', 'gasto'),
('Vestuário', '👕', 'gasto'),
('Moradia', '🏠', 'gasto'),
('Outros', '📦', 'gasto'),
-- Categorias de Parcelas
('Eletrodomésticos', '🔌', 'parcela'),
('Eletrônicos', '📱', 'parcela'),
('Móveis', '🛋️', 'parcela'),
('Veículo', '🚗', 'parcela'),
('Reforma', '🔨', 'parcela'),
('Outros', '📦', 'parcela');

-- ============================================
-- TABELA: gastos
-- ============================================
CREATE TABLE gastos (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    categoria_id BIGINT REFERENCES categorias(id) ON DELETE SET NULL,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(15, 2) NOT NULL,
    data DATE NOT NULL,
    observacoes TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valor_positivo CHECK (valor >= 0)
);

CREATE INDEX idx_gastos_usuario ON gastos(usuario_id);
CREATE INDEX idx_gastos_data ON gastos(data);
CREATE INDEX idx_gastos_categoria ON gastos(categoria_id);
CREATE INDEX idx_gastos_usuario_data ON gastos(usuario_id, data);
CREATE INDEX idx_gastos_mes ON gastos(EXTRACT(YEAR FROM data), EXTRACT(MONTH FROM data));

COMMENT ON TABLE gastos IS 'Gastos variáveis do dia a dia';

-- ============================================
-- TABELA: compras_parceladas
-- ============================================
CREATE TABLE compras_parceladas (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    categoria_id BIGINT REFERENCES categorias(id) ON DELETE SET NULL,
    produto VARCHAR(255) NOT NULL,
    valor_total DECIMAL(15, 2) NOT NULL,
    total_parcelas INTEGER NOT NULL,
    valor_parcela DECIMAL(15, 2) NOT NULL,
    parcelas_pagas INTEGER DEFAULT 0,
    data_compra DATE NOT NULL,
    primeira_parcela DATE,
    dia_vencimento INTEGER,
    observacoes TEXT,
    finalizada BOOLEAN DEFAULT FALSE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT total_parcelas_valido CHECK (total_parcelas > 0),
    CONSTRAINT parcelas_pagas_valido CHECK (parcelas_pagas >= 0 AND parcelas_pagas <= total_parcelas),
    CONSTRAINT valor_total_positivo CHECK (valor_total > 0),
    CONSTRAINT valor_parcela_positivo CHECK (valor_parcela > 0)
);

CREATE INDEX idx_parcelas_usuario ON compras_parceladas(usuario_id);
CREATE INDEX idx_parcelas_finalizada ON compras_parceladas(finalizada);
CREATE INDEX idx_parcelas_data ON compras_parceladas(data_compra);
CREATE INDEX idx_parcelas_ativas ON compras_parceladas(finalizada) WHERE finalizada = FALSE;

COMMENT ON TABLE compras_parceladas IS 'Compras parceladas (TV, geladeira, etc)';

-- ============================================
-- TABELA: gasolina
-- ============================================
CREATE TABLE gasolina (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    veiculo VARCHAR(50) NOT NULL,
    valor DECIMAL(15, 2) NOT NULL,
    litros DECIMAL(10, 3),
    preco_litro DECIMAL(10, 3),
    local VARCHAR(255),
    km_atual INTEGER,
    data DATE NOT NULL,
    observacoes TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT veiculo_valido CHECK (veiculo IN ('carro', 'moto')),
    CONSTRAINT valor_positivo CHECK (valor > 0),
    CONSTRAINT litros_positivo CHECK (litros IS NULL OR litros > 0)
);

CREATE INDEX idx_gasolina_usuario ON gasolina(usuario_id);
CREATE INDEX idx_gasolina_veiculo ON gasolina(veiculo);
CREATE INDEX idx_gasolina_data ON gasolina(data);
CREATE INDEX idx_gasolina_mes ON gasolina(EXTRACT(YEAR FROM data), EXTRACT(MONTH FROM data));

COMMENT ON TABLE gasolina IS 'Abastecimentos de veículos (carro e moto)';

-- Trigger para calcular preço por litro automaticamente
CREATE OR REPLACE FUNCTION calcular_preco_litro()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.litros IS NOT NULL AND NEW.litros > 0 THEN
        NEW.preco_litro := ROUND((NEW.valor / NEW.litros)::numeric, 3);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calcular_preco_litro
    BEFORE INSERT OR UPDATE ON gasolina
    FOR EACH ROW
    EXECUTE FUNCTION calcular_preco_litro();

-- ============================================
-- TABELA: assinaturas
-- ============================================
CREATE TABLE assinaturas (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    valor DECIMAL(15, 2) NOT NULL,
    ativa BOOLEAN DEFAULT TRUE,
    periodicidade VARCHAR(20) DEFAULT 'mensal',
    dia_vencimento INTEGER,
    data_inicio DATE,
    data_cancelamento DATE,
    url VARCHAR(500),
    observacoes TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valor_positivo CHECK (valor > 0),
    CONSTRAINT periodicidade_valida CHECK (periodicidade IN ('mensal', 'anual', 'trimestral', 'semestral'))
);

CREATE INDEX idx_assinaturas_ativa ON assinaturas(ativa);

COMMENT ON TABLE assinaturas IS 'Assinaturas de serviços (Netflix, Spotify, etc)';

-- ============================================
-- TABELA: contas_fixas
-- ============================================
CREATE TABLE contas_fixas (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    valor DECIMAL(15, 2) NOT NULL,
    dia_vencimento INTEGER NOT NULL,
    categoria VARCHAR(100),
    ativa BOOLEAN DEFAULT TRUE,
    observacoes TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valor_positivo CHECK (valor > 0),
    CONSTRAINT dia_valido CHECK (dia_vencimento >= 1 AND dia_vencimento <= 31)
);

CREATE INDEX idx_contas_ativa ON contas_fixas(ativa);

COMMENT ON TABLE contas_fixas IS 'Contas fixas mensais (aluguel, luz, água)';

-- ============================================
-- TABELA: cartoes
-- ============================================
CREATE TABLE cartoes (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    bandeira VARCHAR(50),
    limite DECIMAL(15, 2) NOT NULL,
    gasto_atual DECIMAL(15, 2) DEFAULT 0,
    dia_fechamento INTEGER,
    dia_vencimento INTEGER,
    ultimos_digitos VARCHAR(4),
    ativo BOOLEAN DEFAULT TRUE,
    observacoes TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT limite_positivo CHECK (limite > 0),
    CONSTRAINT gasto_valido CHECK (gasto_atual >= 0)
);

CREATE INDEX idx_cartoes_usuario ON cartoes(usuario_id);
CREATE INDEX idx_cartoes_ativo ON cartoes(ativo);

COMMENT ON TABLE cartoes IS 'Cartões de crédito';

-- ============================================
-- TABELA: metas
-- ============================================
CREATE TABLE metas (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    valor_alvo DECIMAL(15, 2) NOT NULL,
    valor_atual DECIMAL(15, 2) DEFAULT 0,
    cor VARCHAR(7) DEFAULT '#007AFF',
    prazo_final DATE,
    descricao TEXT,
    concluida BOOLEAN DEFAULT FALSE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valor_alvo_positivo CHECK (valor_alvo > 0),
    CONSTRAINT valor_atual_valido CHECK (valor_atual >= 0)
);

CREATE INDEX idx_metas_concluida ON metas(concluida);

COMMENT ON TABLE metas IS 'Metas de economia e objetivos financeiros';

-- ============================================
-- TABELA: orcamentos
-- ============================================
CREATE TABLE orcamentos (
    id BIGSERIAL PRIMARY KEY,
    categoria_id BIGINT REFERENCES categorias(id) ON DELETE CASCADE,
    limite DECIMAL(15, 2) NOT NULL,
    mes_referencia DATE,
    alerta_percentual INTEGER DEFAULT 80,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT limite_positivo CHECK (limite > 0),
    CONSTRAINT alerta_valido CHECK (alerta_percentual >= 0 AND alerta_percentual <= 100)
);

CREATE INDEX idx_orcamentos_categoria ON orcamentos(categoria_id);
CREATE INDEX idx_orcamentos_mes ON orcamentos(mes_referencia);

COMMENT ON TABLE orcamentos IS 'Orçamentos por categoria';

-- ============================================
-- TABELA: ferramentas
-- ============================================
CREATE TABLE ferramentas (
    id BIGSERIAL PRIMARY KEY,
    ferramenta VARCHAR(255) NOT NULL,
    valor DECIMAL(15, 2) NOT NULL,
    ativa BOOLEAN DEFAULT TRUE,
    tipo VARCHAR(100),
    url VARCHAR(500),
    observacoes TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valor_positivo CHECK (valor > 0)
);

CREATE INDEX idx_ferramentas_ativa ON ferramentas(ativa);

COMMENT ON TABLE ferramentas IS 'Ferramentas de IA e desenvolvimento';

-- ============================================
-- TABELA: investimentos
-- ============================================
CREATE TABLE investimentos (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    valor DECIMAL(15, 2) NOT NULL,
    rendimento_percentual DECIMAL(10, 4),
    data_aplicacao DATE,
    data_vencimento DATE,
    instituicao VARCHAR(255),
    liquidez VARCHAR(50),
    observacoes TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valor_positivo CHECK (valor > 0)
);

CREATE INDEX idx_investimentos_ativo ON investimentos(ativo);
CREATE INDEX idx_investimentos_tipo ON investimentos(tipo);

COMMENT ON TABLE investimentos IS 'Investimentos financeiros';

-- ============================================
-- TABELA: patrimonio
-- ============================================
CREATE TABLE patrimonio (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    valor DECIMAL(15, 2) NOT NULL,
    data_aquisicao DATE,
    valor_aquisicao DECIMAL(15, 2),
    depreciacao_anual DECIMAL(10, 4),
    observacoes TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valor_positivo CHECK (valor > 0)
);

CREATE INDEX idx_patrimonio_ativo ON patrimonio(ativo);
CREATE INDEX idx_patrimonio_tipo ON patrimonio(tipo);

COMMENT ON TABLE patrimonio IS 'Bens e patrimônio (imóveis, veículos)';

-- ============================================
-- TABELA: dividas
-- ============================================
CREATE TABLE dividas (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    valor_total DECIMAL(15, 2) NOT NULL,
    valor_pago DECIMAL(15, 2) DEFAULT 0,
    total_parcelas INTEGER NOT NULL,
    parcelas_pagas INTEGER DEFAULT 0,
    valor_parcela DECIMAL(15, 2),
    taxa_juros DECIMAL(10, 4),
    dia_vencimento INTEGER,
    instituicao VARCHAR(255),
    tipo VARCHAR(100),
    data_contratacao DATE,
    observacoes TEXT,
    quitada BOOLEAN DEFAULT FALSE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valor_total_positivo CHECK (valor_total > 0),
    CONSTRAINT valor_pago_valido CHECK (valor_pago >= 0 AND valor_pago <= valor_total),
    CONSTRAINT parcelas_validas CHECK (parcelas_pagas >= 0 AND parcelas_pagas <= total_parcelas)
);

CREATE INDEX idx_dividas_quitada ON dividas(quitada);

COMMENT ON TABLE dividas IS 'Dívidas e financiamentos';

-- ============================================
-- TABELA: emprestimos
-- ============================================
CREATE TABLE emprestimos (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    valor DECIMAL(15, 2) NOT NULL,
    data_emprestimo DATE NOT NULL,
    data_vencimento DATE,
    pago BOOLEAN DEFAULT FALSE,
    data_pagamento DATE,
    observacoes TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT tipo_valido CHECK (tipo IN ('emprestei', 'peguei')),
    CONSTRAINT valor_positivo CHECK (valor > 0)
);

CREATE INDEX idx_emprestimos_tipo ON emprestimos(tipo);
CREATE INDEX idx_emprestimos_pago ON emprestimos(pago);

COMMENT ON TABLE emprestimos IS 'Empréstimos para/de terceiros';

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View: Resumo Mensal
CREATE OR REPLACE VIEW vw_resumo_mensal AS
SELECT 
    EXTRACT(YEAR FROM CURRENT_DATE) as ano,
    EXTRACT(MONTH FROM CURRENT_DATE) as mes,
    (SELECT COALESCE(SUM(valor), 0) FROM salaries) as receitas,
    (SELECT COALESCE(SUM(valor), 0) FROM gastos 
     WHERE EXTRACT(YEAR FROM data) = EXTRACT(YEAR FROM CURRENT_DATE)
       AND EXTRACT(MONTH FROM data) = EXTRACT(MONTH FROM CURRENT_DATE)) as gastos,
    (SELECT COALESCE(SUM(valor_parcela), 0) FROM compras_parceladas WHERE finalizada = FALSE) as parcelas,
    (SELECT COALESCE(SUM(valor), 0) FROM gasolina 
     WHERE EXTRACT(YEAR FROM data) = EXTRACT(YEAR FROM CURRENT_DATE)
       AND EXTRACT(MONTH FROM data) = EXTRACT(MONTH FROM CURRENT_DATE)) as gasolina,
    (SELECT COALESCE(SUM(valor), 0) FROM assinaturas WHERE ativa = TRUE) as assinaturas,
    (SELECT COALESCE(SUM(valor), 0) FROM contas_fixas WHERE ativa = TRUE) as contas_fixas,
    (SELECT COALESCE(SUM(valor), 0) FROM ferramentas WHERE ativa = TRUE) as ferramentas;

-- View: Patrimônio Líquido
CREATE OR REPLACE VIEW vw_patrimonio_liquido AS
SELECT 
    (SELECT COALESCE(SUM(valor), 0) FROM patrimonio WHERE ativo = TRUE) as bens,
    (SELECT COALESCE(SUM(valor), 0) FROM investimentos WHERE ativo = TRUE) as investimentos,
    (SELECT COALESCE(SUM(valor_total - valor_pago), 0) FROM dividas WHERE quitada = FALSE) as dividas,
    (SELECT COALESCE(SUM(valor), 0) FROM patrimonio WHERE ativo = TRUE) +
    (SELECT COALESCE(SUM(valor), 0) FROM investimentos WHERE ativo = TRUE) -
    (SELECT COALESCE(SUM(valor_total - valor_pago), 0) FROM dividas WHERE quitada = FALSE) as patrimonio_liquido;

-- View: Gastos por Categoria (Mês Atual)
CREATE OR REPLACE VIEW vw_gastos_por_categoria AS
SELECT 
    c.nome as categoria,
    c.icone,
    COUNT(g.id) as quantidade,
    COALESCE(SUM(g.valor), 0) as total
FROM categorias c
LEFT JOIN gastos g ON c.id = g.categoria_id
    AND EXTRACT(YEAR FROM g.data) = EXTRACT(YEAR FROM CURRENT_DATE)
    AND EXTRACT(MONTH FROM g.data) = EXTRACT(MONTH FROM CURRENT_DATE)
WHERE c.tipo = 'gasto'
GROUP BY c.id, c.nome, c.icone
ORDER BY total DESC;

-- ============================================
-- FUNCTIONS ÚTEIS
-- ============================================

-- Function: Total de Despesas Mensais
CREATE OR REPLACE FUNCTION total_despesas_mes(ano INT, mes INT)
RETURNS DECIMAL(15, 2) AS $$
DECLARE
    total DECIMAL(15, 2);
BEGIN
    SELECT 
        COALESCE(SUM(valor), 0) +
        (SELECT COALESCE(SUM(valor_parcela), 0) FROM compras_parceladas WHERE finalizada = FALSE) +
        (SELECT COALESCE(SUM(valor), 0) FROM assinaturas WHERE ativa = TRUE) +
        (SELECT COALESCE(SUM(valor), 0) FROM contas_fixas WHERE ativa = TRUE) +
        (SELECT COALESCE(SUM(valor), 0) FROM ferramentas WHERE ativa = TRUE)
    INTO total
    FROM gastos 
    WHERE EXTRACT(YEAR FROM data) = ano
      AND EXTRACT(MONTH FROM data) = mes;
    
    RETURN COALESCE(total, 0);
END;
$$ LANGUAGE plpgsql;

-- Function: Saldo do Mês
CREATE OR REPLACE FUNCTION saldo_mes(ano INT, mes INT)
RETURNS DECIMAL(15, 2) AS $$
DECLARE
    receitas DECIMAL(15, 2);
    despesas DECIMAL(15, 2);
BEGIN
    SELECT COALESCE(SUM(valor), 0) INTO receitas FROM salaries;
    SELECT total_despesas_mes(ano, mes) INTO despesas;
    
    RETURN receitas - despesas;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DADOS DE EXEMPLO
-- ============================================

-- Inserir usuários exemplo
INSERT INTO users (nome, cor, email) VALUES
('Você', '#007AFF', 'voce@email.com'),
('Esposa', '#FF2D55', 'esposa@email.com');

-- Inserir salários exemplo
INSERT INTO salaries (usuario_id, valor, descricao) VALUES
(1, 5000.00, 'Salário Principal'),
(2, 4000.00, 'Salário Esposa');

-- ============================================
-- GRANTS (se necessário)
-- ============================================
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO seu_usuario;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO seu_usuario;

-- ============================================
-- FIM DO SETUP
-- ============================================

-- Verificar instalação
SELECT 'Database setup completo!' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

