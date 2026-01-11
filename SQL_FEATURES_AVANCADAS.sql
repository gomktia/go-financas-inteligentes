-- ============================================
-- FEATURES AVANÇADAS - SISTEMA FINANCEIRO
-- Execute este SQL no Supabase após o setup básico
-- ============================================

-- ============================================
-- 1. ADICIONAR CAMPOS DE PRIVACIDADE EM GASTOS
-- ============================================

ALTER TABLE gastos ADD COLUMN IF NOT EXISTS privado BOOLEAN DEFAULT FALSE;
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS visivel_familia BOOLEAN DEFAULT TRUE;
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS familia_id BIGINT REFERENCES familias(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_gastos_privado ON gastos(privado);
CREATE INDEX IF NOT EXISTS idx_gastos_familia ON gastos(familia_id);
CREATE INDEX IF NOT EXISTS idx_gastos_visivel ON gastos(visivel_familia);

COMMENT ON COLUMN gastos.privado IS 'Gasto privado - apenas o criador vê';
COMMENT ON COLUMN gastos.visivel_familia IS 'Incluir no dashboard familiar';
COMMENT ON COLUMN gastos.familia_id IS 'A qual família/empresa pertence este gasto';

-- ============================================
-- 2. ADICIONAR CAMPOS EM SALARIES
-- ============================================

ALTER TABLE salaries ADD COLUMN IF NOT EXISTS visivel_familia BOOLEAN DEFAULT TRUE;
ALTER TABLE salaries ADD COLUMN IF NOT EXISTS familia_id BIGINT REFERENCES familias(id) ON DELETE SET NULL;
ALTER TABLE salaries ADD COLUMN IF NOT EXISTS tipo VARCHAR(20) DEFAULT 'principal';

ALTER TABLE salaries DROP CONSTRAINT IF EXISTS tipo_salario_valido;
ALTER TABLE salaries ADD CONSTRAINT tipo_salario_valido CHECK (tipo IN ('principal', 'extra', 'bonus', '13_salario'));

CREATE INDEX IF NOT EXISTS idx_salaries_familia ON salaries(familia_id);
CREATE INDEX IF NOT EXISTS idx_salaries_visivel ON salaries(visivel_familia);

COMMENT ON COLUMN salaries.visivel_familia IS 'Incluir na soma familiar';
COMMENT ON COLUMN salaries.familia_id IS 'A qual família pertence este salário';
COMMENT ON COLUMN salaries.tipo IS 'Tipo de receita: principal, extra, bonus, 13_salario';

-- ============================================
-- 3. CRIAR TABELA DE CATEGORIAS PERSONALIZADAS
-- ============================================

CREATE TABLE IF NOT EXISTS categorias_personalizadas (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  icone VARCHAR(10) DEFAULT '📁',
  cor VARCHAR(7) DEFAULT '#007AFF',
  descricao TEXT,
  ordem INTEGER DEFAULT 0,
  ativa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(usuario_id, nome)
);

CREATE INDEX IF NOT EXISTS idx_categorias_usuario ON categorias_personalizadas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_categorias_ativa ON categorias_personalizadas(ativa);

COMMENT ON TABLE categorias_personalizadas IS 'Categorias customizadas criadas pelos usuários';

-- ============================================
-- 4. CRIAR TABELA DE PÁGINAS PERSONALIZADAS
-- ============================================

CREATE TABLE IF NOT EXISTS paginas_personalizadas (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  rota VARCHAR(100) NOT NULL,
  categoria_relacionada VARCHAR(100),
  icone VARCHAR(10) DEFAULT '📄',
  cor VARCHAR(7) DEFAULT '#007AFF',
  descricao TEXT,
  ordem INTEGER DEFAULT 0,
  ativa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(usuario_id, rota)
);

CREATE INDEX IF NOT EXISTS idx_paginas_usuario ON paginas_personalizadas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_paginas_ativa ON paginas_personalizadas(ativa);

COMMENT ON TABLE paginas_personalizadas IS 'Páginas customizadas criadas pelos usuários';

-- ============================================
-- 5. CRIAR TABELA DE PERFIS DE USUÁRIO
-- ============================================

CREATE TABLE IF NOT EXISTS perfis_usuario (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL DEFAULT 'pessoal',
  nome VARCHAR(100) NOT NULL,
  familia_id BIGINT REFERENCES familias(id) ON DELETE CASCADE,
  ativo BOOLEAN DEFAULT TRUE,
  cor VARCHAR(7) DEFAULT '#007AFF',
  icone VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT tipo_perfil_valido CHECK (tipo IN ('pessoal', 'empresa', 'freelancer')),
  UNIQUE(usuario_id, familia_id)
);

CREATE INDEX IF NOT EXISTS idx_perfis_usuario ON perfis_usuario(usuario_id);
CREATE INDEX IF NOT EXISTS idx_perfis_familia ON perfis_usuario(familia_id);
CREATE INDEX IF NOT EXISTS idx_perfis_ativo ON perfis_usuario(ativo);

COMMENT ON TABLE perfis_usuario IS 'Múltiplos perfis por usuário (pessoal, empresa, etc)';
COMMENT ON COLUMN perfis_usuario.tipo IS 'Tipo: pessoal, empresa, freelancer';

-- ============================================
-- 6. CRIAR TABELA DE CONFIGURAÇÕES DE PRIVACIDADE
-- ============================================

CREATE TABLE IF NOT EXISTS config_privacidade (
  usuario_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  mostrar_salario_familia BOOLEAN DEFAULT TRUE,
  mostrar_gastos_pessoais BOOLEAN DEFAULT TRUE,
  permitir_edicao_outros BOOLEAN DEFAULT FALSE,
  notificar_novos_gastos BOOLEAN DEFAULT TRUE,
  notificar_convites BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE config_privacidade IS 'Configurações de privacidade por usuário';

-- ============================================
-- 7. ATUALIZAR OUTRAS TABELAS COM PRIVACIDADE
-- ============================================

-- Parcelas
ALTER TABLE compras_parceladas ADD COLUMN IF NOT EXISTS privado BOOLEAN DEFAULT FALSE;
ALTER TABLE compras_parceladas ADD COLUMN IF NOT EXISTS visivel_familia BOOLEAN DEFAULT TRUE;
ALTER TABLE compras_parceladas ADD COLUMN IF NOT EXISTS familia_id BIGINT REFERENCES familias(id);

-- Gasolina
ALTER TABLE gasolina ADD COLUMN IF NOT EXISTS privado BOOLEAN DEFAULT FALSE;
ALTER TABLE gasolina ADD COLUMN IF NOT EXISTS visivel_familia BOOLEAN DEFAULT TRUE;
ALTER TABLE gasolina ADD COLUMN IF NOT EXISTS familia_id BIGINT REFERENCES familias(id);

-- Assinaturas
ALTER TABLE assinaturas ADD COLUMN IF NOT EXISTS privado BOOLEAN DEFAULT FALSE;
ALTER TABLE assinaturas ADD COLUMN IF NOT EXISTS visivel_familia BOOLEAN DEFAULT TRUE;
ALTER TABLE assinaturas ADD COLUMN IF NOT EXISTS familia_id BIGINT REFERENCES familias(id);

-- Contas Fixas
ALTER TABLE contas_fixas ADD COLUMN IF NOT EXISTS privado BOOLEAN DEFAULT FALSE;
ALTER TABLE contas_fixas ADD COLUMN IF NOT EXISTS visivel_familia BOOLEAN DEFAULT TRUE;
ALTER TABLE contas_fixas ADD COLUMN IF NOT EXISTS familia_id BIGINT REFERENCES familias(id);

-- Ferramentas
ALTER TABLE ferramentas_ia_dev ADD COLUMN IF NOT EXISTS privado BOOLEAN DEFAULT FALSE;
ALTER TABLE ferramentas_ia_dev ADD COLUMN IF NOT EXISTS visivel_familia BOOLEAN DEFAULT TRUE;
ALTER TABLE ferramentas_ia_dev ADD COLUMN IF NOT EXISTS familia_id BIGINT REFERENCES familias(id);

-- Metas
ALTER TABLE metas ADD COLUMN IF NOT EXISTS privado BOOLEAN DEFAULT FALSE;
ALTER TABLE metas ADD COLUMN IF NOT EXISTS visivel_familia BOOLEAN DEFAULT TRUE;
ALTER TABLE metas ADD COLUMN IF NOT EXISTS familia_id BIGINT REFERENCES familias(id);

-- Investimentos
ALTER TABLE investimentos ADD COLUMN IF NOT EXISTS privado BOOLEAN DEFAULT FALSE;
ALTER TABLE investimentos ADD COLUMN IF NOT EXISTS visivel_familia BOOLEAN DEFAULT TRUE;
ALTER TABLE investimentos ADD COLUMN IF NOT EXISTS familia_id BIGINT REFERENCES familias(id);

-- ============================================
-- 8. CRIAR FUNÇÃO PARA DASHBOARD PESSOAL
-- ============================================

CREATE OR REPLACE FUNCTION get_dashboard_pessoal(p_usuario_id BIGINT, p_mes DATE DEFAULT CURRENT_DATE)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'receitas_total', (
      SELECT COALESCE(SUM(valor), 0)
      FROM salaries
      WHERE usuario_id = p_usuario_id
        AND DATE_TRUNC('month', mes::DATE) = DATE_TRUNC('month', p_mes)
        AND deletado = FALSE
    ),
    'despesas_total', (
      SELECT COALESCE(SUM(valor), 0)
      FROM gastos
      WHERE usuario_id = p_usuario_id
        AND DATE_TRUNC('month', data::DATE) = DATE_TRUNC('month', p_mes)
        AND deletado = FALSE
    ),
    'gastos_privados', (
      SELECT COALESCE(SUM(valor), 0)
      FROM gastos
      WHERE usuario_id = p_usuario_id
        AND DATE_TRUNC('month', data::DATE) = DATE_TRUNC('month', p_mes)
        AND privado = TRUE
        AND deletado = FALSE
    ),
    'gastos_compartilhados', (
      SELECT COALESCE(SUM(valor), 0)
      FROM gastos
      WHERE usuario_id = p_usuario_id
        AND DATE_TRUNC('month', data::DATE) = DATE_TRUNC('month', p_mes)
        AND visivel_familia = TRUE
        AND deletado = FALSE
    )
  ) INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. CRIAR FUNÇÃO PARA DASHBOARD FAMILIAR
-- ============================================

CREATE OR REPLACE FUNCTION get_dashboard_familiar(p_familia_id BIGINT, p_mes DATE DEFAULT CURRENT_DATE)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'receitas_total', (
      SELECT COALESCE(SUM(s.valor), 0)
      FROM salaries s
      INNER JOIN familia_membros fm ON s.usuario_id = fm.usuario_id
      WHERE fm.familia_id = p_familia_id
        AND s.visivel_familia = TRUE
        AND DATE_TRUNC('month', s.mes::DATE) = DATE_TRUNC('month', p_mes)
        AND s.deletado = FALSE
    ),
    'despesas_total', (
      SELECT COALESCE(SUM(g.valor), 0)
      FROM gastos g
      WHERE g.familia_id = p_familia_id
        AND g.visivel_familia = TRUE
        AND g.privado = FALSE
        AND DATE_TRUNC('month', g.data::DATE) = DATE_TRUNC('month', p_mes)
        AND g.deletado = FALSE
    ),
    'total_membros', (
      SELECT COUNT(*)
      FROM familia_membros
      WHERE familia_id = p_familia_id
        AND aprovado = TRUE
    )
  ) INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 10. POLÍTICAS RLS PARA PRIVACIDADE
-- ============================================

-- Gastos: Usuário vê seus gastos + gastos não-privados da família
DROP POLICY IF EXISTS gastos_view_policy ON gastos;
CREATE POLICY gastos_view_policy ON gastos
  FOR SELECT
  USING (
    usuario_id = auth.uid()::BIGINT  -- Meus gastos
    OR (
      privado = FALSE               -- Gastos não-privados
      AND familia_id IN (
        SELECT familia_id 
        FROM familia_membros 
        WHERE usuario_id = auth.uid()::BIGINT
      )
    )
  );

-- Salários: Usuário vê seu salário + salários marcados como visíveis
DROP POLICY IF EXISTS salaries_view_policy ON salaries;
CREATE POLICY salaries_view_policy ON salaries
  FOR SELECT
  USING (
    usuario_id = auth.uid()::BIGINT  -- Meu salário
    OR (
      visivel_familia = TRUE         -- Salários compartilhados
      AND familia_id IN (
        SELECT familia_id 
        FROM familia_membros 
        WHERE usuario_id = auth.uid()::BIGINT
      )
    )
  );

-- ============================================
-- 11. DADOS INICIAIS (OPCIONAL)
-- ============================================

-- Categorias padrão para todos usuários
INSERT INTO categorias_personalizadas (usuario_id, nome, icone, cor, ordem) VALUES
  (1, 'Educação', '📚', '#FF6B6B', 1),
  (1, 'Pet', '🐕', '#4ECDC4', 2),
  (1, 'Hobbies', '🎮', '#95E1D3', 3)
ON CONFLICT DO NOTHING;

-- ============================================
-- FIM DO SCRIPT
-- ============================================

-- Para verificar:
SELECT 'Setup de features avançadas concluído!' as status;

