-- ============================================
-- SUPABASE V2 - SETUP COMPLETO
-- Resolve os 4 desafios + empréstimos parcelados
-- ============================================

-- ============================================
-- 1. ATUALIZAR TABELAS EXISTENTES
-- ============================================

-- Adicionar tipo em users (pessoa/empresa)
ALTER TABLE users ADD COLUMN IF NOT EXISTS tipo VARCHAR(20) DEFAULT 'pessoa';
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS tipo_valido CHECK (tipo IN ('pessoa', 'empresa'));

-- Adicionar tipo_pagamento em gastos
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS tipo_pagamento VARCHAR(50);

-- Adicionar tipo_pagamento em compras_parceladas  
ALTER TABLE compras_parceladas ADD COLUMN IF NOT EXISTS tipo_pagamento VARCHAR(50);

-- Adicionar tipo_pagamento em gasolina
ALTER TABLE gasolina ADD COLUMN IF NOT EXISTS tipo_pagamento VARCHAR(50);

-- Empréstimos parcelados
ALTER TABLE emprestimos ADD COLUMN IF NOT EXISTS parcelado BOOLEAN DEFAULT FALSE;
ALTER TABLE emprestimos ADD COLUMN IF NOT EXISTS total_parcelas INTEGER DEFAULT 1;
ALTER TABLE emprestimos ADD COLUMN IF NOT EXISTS parcelas_pagas INTEGER DEFAULT 0;
ALTER TABLE emprestimos ADD COLUMN IF NOT EXISTS valor_parcela DECIMAL(15,2);

-- ============================================
-- 2. CRIAR TABELA DE FAMÍLIAS (Desafio 2)
-- ============================================
CREATE TABLE IF NOT EXISTS familias (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  admin_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  modo_calculo VARCHAR(20) DEFAULT 'familiar',
  codigo_convite VARCHAR(20) UNIQUE,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT modo_valido CHECK (modo_calculo IN ('familiar', 'individual'))
);

CREATE INDEX IF NOT EXISTS idx_familias_admin ON familias(admin_id);
CREATE INDEX IF NOT EXISTS idx_familias_codigo ON familias(codigo_convite);

COMMENT ON TABLE familias IS 'Grupos familiares para compartilhamento de dados';
COMMENT ON COLUMN familias.modo_calculo IS 'familiar = pote comum, individual = cada um paga suas contas';

-- ============================================
-- 3. CRIAR TABELA DE MEMBROS DA FAMÍLIA
-- ============================================
CREATE TABLE IF NOT EXISTS familia_membros (
  familia_id BIGINT REFERENCES familias(id) ON DELETE CASCADE,
  usuario_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  papel VARCHAR(50) DEFAULT 'membro',
  aprovado BOOLEAN DEFAULT FALSE,
  data_entrada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (familia_id, usuario_id),
  CONSTRAINT papel_valido CHECK (papel IN ('admin', 'membro', 'dependente', 'visualizador'))
);

CREATE INDEX IF NOT EXISTS idx_membros_familia ON familia_membros(familia_id);
CREATE INDEX IF NOT EXISTS idx_membros_usuario ON familia_membros(usuario_id);

COMMENT ON TABLE familia_membros IS 'Relacionamento entre usuários e famílias';
COMMENT ON COLUMN familia_membros.papel IS 'admin = administrador, membro = pode editar, dependente = menor de idade, visualizador = só visualiza';

-- ============================================
-- 4. CRIAR TABELA DE CONVITES (Desafio 2)
-- ============================================
CREATE TABLE IF NOT EXISTS convites (
  id BIGSERIAL PRIMARY KEY,
  familia_id BIGINT REFERENCES familias(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  expira_em TIMESTAMP NOT NULL,
  aceito BOOLEAN DEFAULT FALSE,
  aceito_por BIGINT REFERENCES users(id) ON DELETE SET NULL,
  data_aceite TIMESTAMP,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_convites_codigo ON convites(codigo);
CREATE INDEX IF NOT EXISTS idx_convites_email ON convites(email);
CREATE INDEX IF NOT EXISTS idx_convites_familia ON convites(familia_id);
CREATE INDEX IF NOT EXISTS idx_convites_ativos ON convites(aceito) WHERE aceito = FALSE;

COMMENT ON TABLE convites IS 'Convites para membros entrarem na família';

-- ============================================
-- 5. CRIAR TABELA DE TRANSFERÊNCIAS (Desafio 3)
-- ============================================
CREATE TABLE IF NOT EXISTS transferencias (
  id BIGSERIAL PRIMARY KEY,
  familia_id BIGINT REFERENCES familias(id) ON DELETE CASCADE,
  de_usuario_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  para_usuario_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  valor DECIMAL(15,2) NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  categoria VARCHAR(100),
  tipo_pagamento VARCHAR(50),
  data DATE NOT NULL,
  pago BOOLEAN DEFAULT FALSE,
  data_pagamento DATE,
  observacoes TEXT,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valor_positivo CHECK (valor > 0),
  CONSTRAINT usuarios_diferentes CHECK (de_usuario_id != para_usuario_id)
);

CREATE INDEX IF NOT EXISTS idx_transf_de ON transferencias(de_usuario_id);
CREATE INDEX IF NOT EXISTS idx_transf_para ON transferencias(para_usuario_id);
CREATE INDEX IF NOT EXISTS idx_transf_familia ON transferencias(familia_id);
CREATE INDEX IF NOT EXISTS idx_transf_pago ON transferencias(pago);

COMMENT ON TABLE transferencias IS 'Gastos cruzados: quando um membro usa cartão/dinheiro de outro';
COMMENT ON COLUMN transferencias.de_usuario_id IS 'Quem fez o gasto (devedor)';
COMMENT ON COLUMN transferencias.para_usuario_id IS 'De quem era o cartão/dinheiro (credor)';

-- ============================================
-- 6. CRIAR TABELA DE CATEGORIAS PERSONALIZADAS (Desafio 1)
-- ============================================
CREATE TABLE IF NOT EXISTS categorias_personalizadas (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  familia_id BIGINT REFERENCES familias(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  cor VARCHAR(7) DEFAULT '#007AFF',
  tipo VARCHAR(50) NOT NULL,
  ativa BOOLEAN DEFAULT TRUE,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(familia_id, nome, tipo),
  CONSTRAINT tipo_categoria_valido CHECK (tipo IN ('gasto', 'parcela', 'outro'))
);

CREATE INDEX IF NOT EXISTS idx_cat_custom_usuario ON categorias_personalizadas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_cat_custom_familia ON categorias_personalizadas(familia_id);
CREATE INDEX IF NOT EXISTS idx_cat_custom_tipo ON categorias_personalizadas(tipo);

COMMENT ON TABLE categorias_personalizadas IS 'Categorias criadas pelos usuários';

-- ============================================
-- 7. FUNCTIONS ÚTEIS
-- ============================================

-- Function: Gerar código de convite único
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

-- Function: Verificar se convite é válido
CREATE OR REPLACE FUNCTION validar_convite(p_codigo TEXT)
RETURNS TABLE(valido BOOLEAN, familia_id BIGINT, familia_nome VARCHAR) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (c.expira_em > NOW() AND c.aceito = FALSE) as valido,
    c.familia_id,
    f.nome as familia_nome
  FROM convites c
  JOIN familias f ON c.familia_id = f.id
  WHERE c.codigo = p_codigo;
END;
$$ LANGUAGE plpgsql;

-- Function: Aceitar convite
CREATE OR REPLACE FUNCTION aceitar_convite(
  p_codigo TEXT,
  p_usuario_id BIGINT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_familia_id BIGINT;
  v_valido BOOLEAN;
BEGIN
  -- Verificar se convite é válido
  SELECT familia_id, (expira_em > NOW() AND aceito = FALSE)
  INTO v_familia_id, v_valido
  FROM convites
  WHERE codigo = p_codigo;
  
  IF NOT v_valido THEN
    RETURN FALSE;
  END IF;
  
  -- Adicionar à família
  INSERT INTO familia_membros (familia_id, usuario_id, aprovado)
  VALUES (v_familia_id, p_usuario_id, TRUE)
  ON CONFLICT (familia_id, usuario_id) DO NOTHING;
  
  -- Marcar convite como aceito
  UPDATE convites
  SET aceito = TRUE, aceito_por = p_usuario_id, data_aceite = NOW()
  WHERE codigo = p_codigo;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function: Calcular saldo do usuário
CREATE OR REPLACE FUNCTION calcular_saldo_usuario(
  p_usuario_id BIGINT,
  p_familia_id BIGINT,
  p_modo_calculo VARCHAR DEFAULT 'familiar'
)
RETURNS TABLE(
  receita DECIMAL,
  despesas DECIMAL,
  saldo DECIMAL,
  transferencias_deve DECIMAL,
  transferencias_recebe DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH 
  receitas AS (
    SELECT COALESCE(SUM(valor), 0) as total
    FROM salaries
    WHERE CASE 
      WHEN p_modo_calculo = 'familiar' THEN
        usuario_id IN (SELECT usuario_id FROM familia_membros WHERE familia_id = p_familia_id)
      ELSE
        usuario_id = p_usuario_id
    END
  ),
  gastos_total AS (
    SELECT COALESCE(SUM(valor), 0) as total
    FROM gastos
    WHERE usuario_id = p_usuario_id
      AND EXTRACT(MONTH FROM data) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(YEAR FROM data) = EXTRACT(YEAR FROM CURRENT_DATE)
  ),
  transf_deve AS (
    SELECT COALESCE(SUM(valor), 0) as total
    FROM transferencias
    WHERE de_usuario_id = p_usuario_id AND pago = FALSE
  ),
  transf_recebe AS (
    SELECT COALESCE(SUM(valor), 0) as total
    FROM transferencias
    WHERE para_usuario_id = p_usuario_id AND pago = FALSE
  )
  SELECT 
    r.total as receita,
    g.total as despesas,
    r.total - g.total as saldo,
    td.total as transferencias_deve,
    tr.total as transferencias_recebe
  FROM receitas r, gastos_total g, transf_deve td, transf_recebe tr;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. TRIGGERS
-- ============================================

-- Trigger: Atualizar data_atualizacao automaticamente
CREATE OR REPLACE FUNCTION atualizar_data_modificacao()
RETURNS TRIGGER AS $$
BEGIN
  NEW.data_atualizacao = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar em todas as tabelas
DO $$
DECLARE
  tabela TEXT;
BEGIN
  FOR tabela IN 
    SELECT table_name 
    FROM information_schema.columns 
    WHERE column_name = 'data_atualizacao' 
      AND table_schema = 'public'
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS trigger_atualizar_data ON %I;
      CREATE TRIGGER trigger_atualizar_data
        BEFORE UPDATE ON %I
        FOR EACH ROW
        EXECUTE FUNCTION atualizar_data_modificacao();
    ', tabela, tabela);
  END LOOP;
END;
$$;

-- ============================================
-- 9. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE compras_parceladas ENABLE ROW LEVEL SECURITY;
ALTER TABLE gasolina ENABLE ROW LEVEL SECURITY;
ALTER TABLE transferencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE familias ENABLE ROW LEVEL SECURITY;
ALTER TABLE familia_membros ENABLE ROW LEVEL SECURITY;
ALTER TABLE convites ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_personalizadas ENABLE ROW LEVEL SECURITY;

-- Policies para USERS
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Policies para GASTOS (apenas da família)
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

CREATE POLICY "Insert own expenses" ON gastos
  FOR INSERT WITH CHECK (usuario_id::text = auth.uid()::text);

CREATE POLICY "Update own expenses" ON gastos
  FOR UPDATE USING (usuario_id::text = auth.uid()::text);

CREATE POLICY "Delete own expenses" ON gastos
  FOR DELETE USING (usuario_id::text = auth.uid()::text);

-- Policies para TRANSFERÊNCIAS
CREATE POLICY "View own transfers" ON transferencias
  FOR SELECT USING (
    de_usuario_id::text = auth.uid()::text OR 
    para_usuario_id::text = auth.uid()::text
  );

CREATE POLICY "Insert transfers" ON transferencias
  FOR INSERT WITH CHECK (de_usuario_id::text = auth.uid()::text);

CREATE POLICY "Update own transfers" ON transferencias
  FOR UPDATE USING (
    de_usuario_id::text = auth.uid()::text OR 
    para_usuario_id::text = auth.uid()::text
  );

-- Policies para CONVITES
CREATE POLICY "View family invites" ON convites
  FOR SELECT USING (
    familia_id IN (
      SELECT familia_id FROM familia_membros 
      WHERE usuario_id::text = auth.uid()::text
        AND papel = 'admin'
    )
  );

CREATE POLICY "Admin can create invites" ON convites
  FOR INSERT WITH CHECK (
    familia_id IN (
      SELECT familia_id FROM familia_membros 
      WHERE usuario_id::text = auth.uid()::text
        AND papel = 'admin'
    )
  );

-- Policies para CATEGORIAS PERSONALIZADAS
CREATE POLICY "View family categories" ON categorias_personalizadas
  FOR SELECT USING (
    familia_id IN (
      SELECT familia_id FROM familia_membros 
      WHERE usuario_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Create family categories" ON categorias_personalizadas
  FOR INSERT WITH CHECK (
    familia_id IN (
      SELECT familia_id FROM familia_membros 
      WHERE usuario_id::text = auth.uid()::text
    )
  );

-- ============================================
-- 10. VIEWS ATUALIZADAS
-- ============================================

-- View: Dashboard da Família
CREATE OR REPLACE VIEW vw_dashboard_familia AS
SELECT 
  f.id as familia_id,
  f.nome as familia_nome,
  f.modo_calculo,
  COUNT(DISTINCT fm.usuario_id) as total_membros,
  (SELECT COALESCE(SUM(s.valor), 0) 
   FROM salaries s 
   JOIN familia_membros fm2 ON s.usuario_id = fm2.usuario_id 
   WHERE fm2.familia_id = f.id) as receita_total,
  (SELECT COALESCE(SUM(g.valor), 0)
   FROM gastos g
   JOIN familia_membros fm3 ON g.usuario_id = fm3.usuario_id
   WHERE fm3.familia_id = f.id
     AND EXTRACT(MONTH FROM g.data) = EXTRACT(MONTH FROM CURRENT_DATE)
     AND EXTRACT(YEAR FROM g.data) = EXTRACT(YEAR FROM CURRENT_DATE)) as gastos_total
FROM familias f
LEFT JOIN familia_membros fm ON f.id = fm.familia_id
GROUP BY f.id, f.nome, f.modo_calculo;

-- View: Pendências de Transferências
CREATE OR REPLACE VIEW vw_transferencias_pendentes AS
SELECT 
  t.*,
  u1.nome as quem_gastou,
  u2.nome as quem_pagou
FROM transferencias t
JOIN users u1 ON t.de_usuario_id = u1.id
JOIN users u2 ON t.para_usuario_id = u2.id
WHERE t.pago = FALSE
ORDER BY t.data DESC;

-- ============================================
-- 11. DADOS EXEMPLO (OPCIONAL)
-- ============================================

-- Criar família exemplo (DESCOMENTAR SE QUISER)
/*
INSERT INTO familias (nome, admin_id, codigo_convite) VALUES
('Família Silva', 1, 'FAMILIA01')
RETURNING id;

INSERT INTO familia_membros (familia_id, usuario_id, papel, aprovado) VALUES
(1, 1, 'admin', TRUE),
(1, 2, 'membro', TRUE);
*/

-- ============================================
-- 12. FUNCTIONS PARA CONVITES
-- ============================================

-- Criar convite
CREATE OR REPLACE FUNCTION criar_convite(
  p_familia_id BIGINT,
  p_email VARCHAR,
  p_dias_expiracao INT DEFAULT 7
)
RETURNS TABLE(codigo TEXT, link TEXT) AS $$
DECLARE
  v_codigo TEXT;
BEGIN
  v_codigo := gerar_codigo_convite();
  
  INSERT INTO convites (familia_id, email, codigo, expira_em)
  VALUES (
    p_familia_id,
    p_email,
    v_codigo,
    NOW() + (p_dias_expiracao || ' days')::INTERVAL
  );
  
  RETURN QUERY SELECT 
    v_codigo as codigo,
    'https://seu-app.com/convite/' || v_codigo as link;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 13. VERIFICAÇÃO
-- ============================================

-- Verificar tabelas criadas
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as colunas
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Verificar policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- FIM DO SETUP
-- ============================================

SELECT '✅ Supabase V2 configurado com sucesso!' as status;
SELECT '✅ Tabelas criadas/atualizadas' as tabelas;
SELECT '✅ RLS habilitado' as seguranca;
SELECT '✅ Functions criadas' as funcoes;
SELECT '✅ Views atualizadas' as views;
SELECT '' as separador;
SELECT '🎉 Sistema pronto para:' as titulo;
SELECT '  1. Categorias personalizadas' as feature1;
SELECT '  2. Sistema de convites' as feature2;
SELECT '  3. Transferências entre membros' as feature3;
SELECT '  4. Modo familiar/individual' as feature4;
SELECT '  5. Empréstimos parcelados' as feature5;

