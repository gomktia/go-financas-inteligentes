-- ============================================
-- SUPABASE V2 - SETUP COMPLETO
-- Execute este arquivo no SQL Editor do Supabase
-- ============================================

-- ============================================
-- 1. ATUALIZAR TABELAS EXISTENTES
-- ============================================

-- Adicionar tipo em users (pessoa/empresa)
ALTER TABLE users ADD COLUMN IF NOT EXISTS tipo VARCHAR(20) DEFAULT 'pessoa';
ALTER TABLE users DROP CONSTRAINT IF EXISTS tipo_valido;
ALTER TABLE users ADD CONSTRAINT tipo_valido CHECK (tipo IN ('pessoa', 'empresa'));

-- Adicionar tipo_pagamento em gastos
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS tipo_pagamento VARCHAR(50);
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS categoria VARCHAR(100);

-- Adicionar tipo_pagamento em compras_parceladas  
ALTER TABLE compras_parceladas ADD COLUMN IF NOT EXISTS tipo_pagamento VARCHAR(50);

-- Adicionar tipo_pagamento em gasolina
ALTER TABLE gasolina ADD COLUMN IF NOT EXISTS tipo_pagamento VARCHAR(50);

-- Emprestimos parcelados
ALTER TABLE emprestimos ADD COLUMN IF NOT EXISTS parcelado BOOLEAN DEFAULT FALSE;
ALTER TABLE emprestimos ADD COLUMN IF NOT EXISTS total_parcelas INTEGER DEFAULT 1;
ALTER TABLE emprestimos ADD COLUMN IF NOT EXISTS parcelas_pagas INTEGER DEFAULT 0;
ALTER TABLE emprestimos ADD COLUMN IF NOT EXISTS valor_parcela DECIMAL(15,2);

-- ============================================
-- 2. CRIAR TABELA DE FAMILIAS
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
-- 3. CRIAR TABELA DE MEMBROS DA FAMILIA
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
-- 4. CRIAR TABELA DE CONVITES
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
-- 5. CRIAR TABELA DE TRANSFERENCIAS
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
-- 6. CRIAR TABELA DE CATEGORIAS PERSONALIZADAS
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
-- 7. HABILITAR RLS EM TODAS AS TABELAS
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE compras_parceladas ENABLE ROW LEVEL SECURITY;
ALTER TABLE gasolina ENABLE ROW LEVEL SECURITY;
ALTER TABLE assinaturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_fixas ENABLE ROW LEVEL SECURITY;
ALTER TABLE cartoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE metas ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ferramentas ENABLE ROW LEVEL SECURITY;
ALTER TABLE investimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE patrimonio ENABLE ROW LEVEL SECURITY;
ALTER TABLE dividas ENABLE ROW LEVEL SECURITY;
ALTER TABLE emprestimos ENABLE ROW LEVEL SECURITY;
ALTER TABLE familias ENABLE ROW LEVEL SECURITY;
ALTER TABLE familia_membros ENABLE ROW LEVEL SECURITY;
ALTER TABLE convites ENABLE ROW LEVEL SECURITY;
ALTER TABLE transferencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_personalizadas ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 8. POLICIES: USERS
-- ============================================
DROP POLICY IF EXISTS "Users can view own data" ON users;
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (
    auth.uid()::text = id::text OR
    id IN (
      SELECT usuario_id FROM familia_membros 
      WHERE familia_id IN (
        SELECT familia_id FROM familia_membros 
        WHERE usuario_id::text = auth.uid()::text
      )
    )
  );

DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- ============================================
-- 9. POLICIES: GASTOS
-- ============================================
DROP POLICY IF EXISTS "View family expenses" ON gastos;
CREATE POLICY "View family expenses" ON gastos
  FOR SELECT USING (
    usuario_id IN (
      SELECT usuario_id FROM familia_membros 
      WHERE familia_id IN (
        SELECT familia_id FROM familia_membros 
        WHERE usuario_id::text = auth.uid()::text
      )
    )
  );

DROP POLICY IF EXISTS "Insert own expenses" ON gastos;
CREATE POLICY "Insert own expenses" ON gastos
  FOR INSERT WITH CHECK (usuario_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Update own expenses" ON gastos;
CREATE POLICY "Update own expenses" ON gastos
  FOR UPDATE USING (usuario_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Delete own expenses" ON gastos;
CREATE POLICY "Delete own expenses" ON gastos
  FOR DELETE USING (usuario_id::text = auth.uid()::text);

-- ============================================
-- 10. POLICIES: COMPRAS PARCELADAS
-- ============================================
DROP POLICY IF EXISTS "View family parcelas" ON compras_parceladas;
CREATE POLICY "View family parcelas" ON compras_parceladas
  FOR SELECT USING (
    usuario_id IN (
      SELECT usuario_id FROM familia_membros 
      WHERE familia_id IN (
        SELECT familia_id FROM familia_membros 
        WHERE usuario_id::text = auth.uid()::text
      )
    )
  );

DROP POLICY IF EXISTS "Manage own parcelas" ON compras_parceladas;
CREATE POLICY "Manage own parcelas" ON compras_parceladas
  FOR ALL USING (usuario_id::text = auth.uid()::text);

-- ============================================
-- 11. POLICIES: TRANSFERENCIAS
-- ============================================
DROP POLICY IF EXISTS "View own transfers" ON transferencias;
CREATE POLICY "View own transfers" ON transferencias
  FOR SELECT USING (
    de_usuario_id::text = auth.uid()::text OR 
    para_usuario_id::text = auth.uid()::text
  );

DROP POLICY IF EXISTS "Create transfers" ON transferencias;
CREATE POLICY "Create transfers" ON transferencias
  FOR INSERT WITH CHECK (de_usuario_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Update transfers" ON transferencias;
CREATE POLICY "Update transfers" ON transferencias
  FOR UPDATE USING (
    de_usuario_id::text = auth.uid()::text OR 
    para_usuario_id::text = auth.uid()::text
  );

-- ============================================
-- 12. POLICIES: FAMILIAS
-- ============================================
DROP POLICY IF EXISTS "View own family" ON familias;
CREATE POLICY "View own family" ON familias
  FOR SELECT USING (
    id IN (
      SELECT familia_id FROM familia_membros 
      WHERE usuario_id::text = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Admin can update family" ON familias;
CREATE POLICY "Admin can update family" ON familias
  FOR UPDATE USING (
    id IN (
      SELECT familia_id FROM familia_membros 
      WHERE usuario_id::text = auth.uid()::text
        AND papel = 'admin'
    )
  );

-- ============================================
-- 13. POLICIES: CONVITES
-- ============================================
DROP POLICY IF EXISTS "View family invites" ON convites;
CREATE POLICY "View family invites" ON convites
  FOR SELECT USING (
    familia_id IN (
      SELECT familia_id FROM familia_membros 
      WHERE usuario_id::text = auth.uid()::text
        AND papel = 'admin'
    ) OR
    email = auth.email()
  );

DROP POLICY IF EXISTS "Admin create invites" ON convites;
CREATE POLICY "Admin create invites" ON convites
  FOR INSERT WITH CHECK (
    familia_id IN (
      SELECT familia_id FROM familia_membros 
      WHERE usuario_id::text = auth.uid()::text
        AND papel = 'admin'
    )
  );

-- ============================================
-- 14. POLICIES: CATEGORIAS PERSONALIZADAS
-- ============================================
DROP POLICY IF EXISTS "View family categories" ON categorias_personalizadas;
CREATE POLICY "View family categories" ON categorias_personalizadas
  FOR SELECT USING (
    familia_id IN (
      SELECT familia_id FROM familia_membros 
      WHERE usuario_id::text = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Manage family categories" ON categorias_personalizadas;
CREATE POLICY "Manage family categories" ON categorias_personalizadas
  FOR ALL USING (
    familia_id IN (
      SELECT familia_id FROM familia_membros 
      WHERE usuario_id::text = auth.uid()::text
    )
  );

-- ============================================
-- 15. POLICIES: OUTRAS TABELAS
-- ============================================

-- GASOLINA
DROP POLICY IF EXISTS "Manage family gasolina" ON gasolina;
CREATE POLICY "Manage family gasolina" ON gasolina
  FOR ALL USING (
    usuario_id::text = auth.uid()::text OR
    usuario_id IN (
      SELECT usuario_id FROM familia_membros 
      WHERE familia_id IN (
        SELECT familia_id FROM familia_membros 
        WHERE usuario_id::text = auth.uid()::text
      )
    )
  );

-- CARTOES
DROP POLICY IF EXISTS "Manage own cards" ON cartoes;
CREATE POLICY "Manage own cards" ON cartoes
  FOR ALL USING (usuario_id::text = auth.uid()::text);

-- SALARIES
DROP POLICY IF EXISTS "View family salaries" ON salaries;
CREATE POLICY "View family salaries" ON salaries
  FOR ALL USING (
    usuario_id::text = auth.uid()::text OR
    usuario_id IN (
      SELECT usuario_id FROM familia_membros 
      WHERE familia_id IN (
        SELECT familia_id FROM familia_membros 
        WHERE usuario_id::text = auth.uid()::text
      )
    )
  );

-- TABELAS COMPARTILHADAS (todos da familia veem)
DROP POLICY IF EXISTS "Everyone can manage assinaturas" ON assinaturas;
CREATE POLICY "Everyone can manage assinaturas" ON assinaturas FOR ALL USING (true);

DROP POLICY IF EXISTS "Everyone can manage contas" ON contas_fixas;
CREATE POLICY "Everyone can manage contas" ON contas_fixas FOR ALL USING (true);

DROP POLICY IF EXISTS "Everyone can manage ferramentas" ON ferramentas;
CREATE POLICY "Everyone can manage ferramentas" ON ferramentas FOR ALL USING (true);

DROP POLICY IF EXISTS "Everyone can manage metas" ON metas;
CREATE POLICY "Everyone can manage metas" ON metas FOR ALL USING (true);

DROP POLICY IF EXISTS "Everyone can manage orcamentos" ON orcamentos;
CREATE POLICY "Everyone can manage orcamentos" ON orcamentos FOR ALL USING (true);

DROP POLICY IF EXISTS "Everyone can manage investimentos" ON investimentos;
CREATE POLICY "Everyone can manage investimentos" ON investimentos FOR ALL USING (true);

DROP POLICY IF EXISTS "Everyone can manage patrimonio" ON patrimonio;
CREATE POLICY "Everyone can manage patrimonio" ON patrimonio FOR ALL USING (true);

DROP POLICY IF EXISTS "Everyone can manage dividas" ON dividas;
CREATE POLICY "Everyone can manage dividas" ON dividas FOR ALL USING (true);

DROP POLICY IF EXISTS "Everyone can manage emprestimos" ON emprestimos;
CREATE POLICY "Everyone can manage emprestimos" ON emprestimos FOR ALL USING (true);

DROP POLICY IF EXISTS "Everyone can view categorias" ON categorias;
CREATE POLICY "Everyone can view categorias" ON categorias FOR SELECT USING (true);

-- ============================================
-- 16. FUNCTION: Gerar codigo de convite
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
-- VERIFICACAO FINAL
-- ============================================
SELECT 'Setup completo' as status;

-- Contar tabelas
SELECT COUNT(*) as total_tabelas
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE';

-- Listar tabelas criadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

