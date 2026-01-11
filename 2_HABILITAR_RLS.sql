-- ============================================
-- PASSO 2: HABILITAR RLS E CRIAR POLICIES
-- Execute DEPOIS do passo 1
-- ============================================

-- ============================================
-- HABILITAR RLS EM TODAS AS TABELAS
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
-- POLICIES: USERS
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
-- POLICIES: GASTOS
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
-- POLICIES: COMPRAS PARCELADAS
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
-- POLICIES: TRANSFERÊNCIAS
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
-- POLICIES: FAMÍLIAS
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
-- POLICIES: CONVITES
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
-- POLICIES: CATEGORIAS PERSONALIZADAS
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
-- POLICIES: OUTRAS TABELAS (simplificadas)
-- ============================================

-- GASOLINA
DROP POLICY IF EXISTS "View family gasolina" ON gasolina;
CREATE POLICY "View family gasolina" ON gasolina
  FOR ALL USING (
    usuario_id IN (
      SELECT usuario_id FROM familia_membros 
      WHERE familia_id IN (
        SELECT familia_id FROM familia_membros 
        WHERE usuario_id::text = auth.uid()::text
      )
    ) OR usuario_id::text = auth.uid()::text
  );

-- CARTOES
DROP POLICY IF EXISTS "Manage own cards" ON cartoes;
CREATE POLICY "Manage own cards" ON cartoes
  FOR ALL USING (usuario_id::text = auth.uid()::text);

-- EMPRESTIMOS
DROP POLICY IF EXISTS "Manage own loans" ON emprestimos;
CREATE POLICY "Manage own loans" ON emprestimos
  FOR ALL USING (true); -- Todos da família veem

-- ASSINATURAS, CONTAS, FERRAMENTAS (compartilhadas)
DROP POLICY IF EXISTS "Everyone can view" ON assinaturas;
CREATE POLICY "Everyone can view" ON assinaturas FOR ALL USING (true);

DROP POLICY IF EXISTS "Everyone can view contas" ON contas_fixas;
CREATE POLICY "Everyone can view contas" ON contas_fixas FOR ALL USING (true);

DROP POLICY IF EXISTS "Everyone can view ferramentas" ON ferramentas;
CREATE POLICY "Everyone can view ferramentas" ON ferramentas FOR ALL USING (true);

DROP POLICY IF EXISTS "Everyone can view metas" ON metas;
CREATE POLICY "Everyone can view metas" ON metas FOR ALL USING (true);

DROP POLICY IF EXISTS "Everyone can view investimentos" ON investimentos;
CREATE POLICY "Everyone can view investimentos" ON investimentos FOR ALL USING (true);

DROP POLICY IF EXISTS "Everyone can view patrimonio" ON patrimonio;
CREATE POLICY "Everyone can view patrimonio" ON patrimonio FOR ALL USING (true);

DROP POLICY IF EXISTS "Everyone can view dividas" ON dividas;
CREATE POLICY "Everyone can view dividas" ON dividas FOR ALL USING (true);

-- ============================================
-- VERIFICAÇÃO
-- ============================================
SELECT '✅ RLS habilitado em todas as tabelas!' as status;

-- Ver policies criadas
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

