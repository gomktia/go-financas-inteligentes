-- ============================================
-- PASSO 1: ADICIONAR NOVAS TABELAS
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- 1. Atualizar tabela USERS (adicionar tipo pessoa/empresa)
ALTER TABLE users ADD COLUMN IF NOT EXISTS tipo VARCHAR(20) DEFAULT 'pessoa';
ALTER TABLE users DROP CONSTRAINT IF EXISTS tipo_valido;
ALTER TABLE users ADD CONSTRAINT tipo_valido CHECK (tipo IN ('pessoa', 'empresa'));

-- 2. Atualizar GASTOS (adicionar tipo_pagamento)
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS tipo_pagamento VARCHAR(50);
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS categoria VARCHAR(100);

-- 3. Atualizar COMPRAS_PARCELADAS (adicionar tipo_pagamento)
ALTER TABLE compras_parceladas ADD COLUMN IF NOT EXISTS tipo_pagamento VARCHAR(50);

-- 4. Atualizar GASOLINA (adicionar tipo_pagamento)
ALTER TABLE gasolina ADD COLUMN IF NOT EXISTS tipo_pagamento VARCHAR(50);

-- 5. Atualizar EMPRESTIMOS (adicionar parcelamento)
ALTER TABLE emprestimos ADD COLUMN IF NOT EXISTS parcelado BOOLEAN DEFAULT FALSE;
ALTER TABLE emprestimos ADD COLUMN IF NOT EXISTS total_parcelas INTEGER DEFAULT 1;
ALTER TABLE emprestimos ADD COLUMN IF NOT EXISTS parcelas_pagas INTEGER DEFAULT 0;
ALTER TABLE emprestimos ADD COLUMN IF NOT EXISTS valor_parcela DECIMAL(15,2);

-- ============================================
-- 6. CRIAR TABELA DE FAMÍLIAS
-- ============================================
CREATE TABLE IF NOT EXISTS familias (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  admin_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  modo_calculo VARCHAR(20) DEFAULT 'familiar',
  codigo_convite VARCHAR(20) UNIQUE,
  ativa BOOLEAN DEFAULT TRUE,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE familias DROP CONSTRAINT IF EXISTS modo_valido;
ALTER TABLE familias ADD CONSTRAINT modo_valido CHECK (modo_calculo IN ('familiar', 'individual'));

CREATE INDEX IF NOT EXISTS idx_familias_admin ON familias(admin_id);
CREATE INDEX IF NOT EXISTS idx_familias_codigo ON familias(codigo_convite);

-- ============================================
-- 7. CRIAR TABELA DE MEMBROS DA FAMÍLIA
-- ============================================
CREATE TABLE IF NOT EXISTS familia_membros (
  id BIGSERIAL PRIMARY KEY,
  familia_id BIGINT NOT NULL REFERENCES familias(id) ON DELETE CASCADE,
  usuario_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  papel VARCHAR(50) DEFAULT 'membro',
  aprovado BOOLEAN DEFAULT TRUE,
  data_entrada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(familia_id, usuario_id)
);

ALTER TABLE familia_membros DROP CONSTRAINT IF EXISTS papel_valido;
ALTER TABLE familia_membros ADD CONSTRAINT papel_valido CHECK (papel IN ('admin', 'membro', 'dependente', 'visualizador'));

CREATE INDEX IF NOT EXISTS idx_membros_familia ON familia_membros(familia_id);
CREATE INDEX IF NOT EXISTS idx_membros_usuario ON familia_membros(usuario_id);

-- ============================================
-- 8. CRIAR TABELA DE CONVITES
-- ============================================
CREATE TABLE IF NOT EXISTS convites (
  id BIGSERIAL PRIMARY KEY,
  familia_id BIGINT NOT NULL REFERENCES familias(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  expira_em TIMESTAMP NOT NULL,
  aceito BOOLEAN DEFAULT FALSE,
  aceito_por BIGINT REFERENCES users(id),
  data_aceite TIMESTAMP,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_convites_codigo ON convites(codigo);
CREATE INDEX IF NOT EXISTS idx_convites_email ON convites(email);
CREATE INDEX IF NOT EXISTS idx_convites_familia ON convites(familia_id);

-- ============================================
-- 9. CRIAR TABELA DE TRANSFERÊNCIAS
-- ============================================
CREATE TABLE IF NOT EXISTS transferencias (
  id BIGSERIAL PRIMARY KEY,
  familia_id BIGINT REFERENCES familias(id) ON DELETE CASCADE,
  de_usuario_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  para_usuario_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  valor DECIMAL(15,2) NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  categoria VARCHAR(100),
  tipo_pagamento VARCHAR(50),
  data DATE NOT NULL,
  pago BOOLEAN DEFAULT FALSE,
  data_pagamento DATE,
  observacoes TEXT,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE transferencias DROP CONSTRAINT IF EXISTS valor_positivo;
ALTER TABLE transferencias ADD CONSTRAINT valor_positivo CHECK (valor > 0);

ALTER TABLE transferencias DROP CONSTRAINT IF EXISTS usuarios_diferentes;
ALTER TABLE transferencias ADD CONSTRAINT usuarios_diferentes CHECK (de_usuario_id != para_usuario_id);

CREATE INDEX IF NOT EXISTS idx_transf_de ON transferencias(de_usuario_id);
CREATE INDEX IF NOT EXISTS idx_transf_para ON transferencias(para_usuario_id);
CREATE INDEX IF NOT EXISTS idx_transf_familia ON transferencias(familia_id);
CREATE INDEX IF NOT EXISTS idx_transf_pago ON transferencias(pago);

-- ============================================
-- 10. CRIAR TABELA DE CATEGORIAS PERSONALIZADAS
-- ============================================
CREATE TABLE IF NOT EXISTS categorias_personalizadas (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  familia_id BIGINT REFERENCES familias(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  cor VARCHAR(7) DEFAULT '#007AFF',
  tipo VARCHAR(50) NOT NULL,
  ativa BOOLEAN DEFAULT TRUE,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE categorias_personalizadas DROP CONSTRAINT IF EXISTS unique_cat_familia;
ALTER TABLE categorias_personalizadas ADD CONSTRAINT unique_cat_familia UNIQUE(familia_id, nome, tipo);

ALTER TABLE categorias_personalizadas DROP CONSTRAINT IF EXISTS tipo_categoria_valido;
ALTER TABLE categorias_personalizadas ADD CONSTRAINT tipo_categoria_valido CHECK (tipo IN ('gasto', 'parcela'));

CREATE INDEX IF NOT EXISTS idx_cat_custom_usuario ON categorias_personalizadas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_cat_custom_familia ON categorias_personalizadas(familia_id);
CREATE INDEX IF NOT EXISTS idx_cat_custom_tipo ON categorias_personalizadas(tipo);

-- ============================================
-- 11. FUNCTION: Gerar código de convite
-- ============================================
CREATE OR REPLACE FUNCTION gerar_codigo_convite()
RETURNS TEXT AS $$
DECLARE
  codigo TEXT;
  existe BOOLEAN;
BEGIN
  LOOP
    codigo := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    SELECT EXISTS(SELECT 1 FROM convites WHERE codigo = codigo) INTO existe;
    EXIT WHEN NOT existe;
  END LOOP;
  RETURN codigo;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VERIFICAÇÃO
-- ============================================
SELECT '✅ Tabelas novas criadas com sucesso!' as status;

-- Listar todas as tabelas
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as colunas
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

