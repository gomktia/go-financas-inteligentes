-- =================================================================
-- SCRIPT: HABILITAR MODO SAAS SEGURO (RLS & POLICIES)
-- DATA: 10/01/2026
-- OBJETIVO: Blindar o sistema para múltiplos usuários e criar estrutura de assinaturas.
-- =================================================================

-- 1. CONEXÃO AUTH.USERS -> PUBLIC.USERS
-- Adicionar coluna para vincular o usuário do Supabase Auth com nossa tabela de usuário
-- =================================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_id UUID REFERENCES auth.users(id);
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);

-- Trigger para criar usuário público automaticamente ao cadastrar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (auth_id, email, nome, cor, ativo)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    '#007AFF',
    TRUE
  )
  ON CONFLICT (email) DO UPDATE SET auth_id = new.id;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger ativa
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Atualizar usuários existentes (vincular por email se possível)
UPDATE users 
SET auth_id = au.id
FROM auth.users au
WHERE users.email = au.email AND users.auth_id IS NULL;


-- Adicionar usuario_id em tabelas que faltavam (Assinaturas e Contas Fixas eram orfãs no schema antigo)
ALTER TABLE assinaturas ADD COLUMN IF NOT EXISTS usuario_id BIGINT REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE contas_fixas ADD COLUMN IF NOT EXISTS usuario_id BIGINT REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE metas ADD COLUMN IF NOT EXISTS usuario_id BIGINT REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE investimentos ADD COLUMN IF NOT EXISTS usuario_id BIGINT REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE patrimonio ADD COLUMN IF NOT EXISTS usuario_id BIGINT REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE dividas ADD COLUMN IF NOT EXISTS usuario_id BIGINT REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE emprestimos ADD COLUMN IF NOT EXISTS usuario_id BIGINT REFERENCES users(id) ON DELETE CASCADE;

-- Se o usuário atual existir (admin), vamos atribuir essas contas órfãs a ele para não sumirem
DO $$
DECLARE
    admin_id BIGINT;
BEGIN
    SELECT id INTO admin_id FROM users ORDER BY id ASC LIMIT 1;
    IF admin_id IS NOT NULL THEN
        UPDATE assinaturas SET usuario_id = admin_id WHERE usuario_id IS NULL;
        UPDATE contas_fixas SET usuario_id = admin_id WHERE usuario_id IS NULL;
        UPDATE metas SET usuario_id = admin_id WHERE usuario_id IS NULL;
        UPDATE investimentos SET usuario_id = admin_id WHERE usuario_id IS NULL;
        UPDATE patrimonio SET usuario_id = admin_id WHERE usuario_id IS NULL;
        UPDATE dividas SET usuario_id = admin_id WHERE usuario_id IS NULL;
        UPDATE emprestimos SET usuario_id = admin_id WHERE usuario_id IS NULL;
    END IF;
END $$;

-- 2. HABILITAR RLS (ROW LEVEL SECURITY) EM TODAS AS TABELAS SENSÍVEIS
-- =================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE compras_parceladas ENABLE ROW LEVEL SECURITY;
ALTER TABLE salarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE assinaturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_fixas ENABLE ROW LEVEL SECURITY;
ALTER TABLE cartoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE metas ENABLE ROW LEVEL SECURITY;
ALTER TABLE gasolina ENABLE ROW LEVEL SECURITY;
ALTER TABLE investimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE patrimonio ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacoes_empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE familias ENABLE ROW LEVEL SECURITY;
ALTER TABLE dividas ENABLE ROW LEVEL SECURITY;
ALTER TABLE emprestimos ENABLE ROW LEVEL SECURITY;

-- 3. CRIAR POLÍTICAS DE SEGURANÇA (O USUÁRIO SÓ VÊ O QUE É DELE)
-- =================================================================

-- Policy Genérica para Users: Vê a si mesmo
CREATE POLICY "Users view own data" ON users
  FOR ALL USING (auth_id = auth.uid());

-- Helper function para pegar o ID numérico do usuário atual (public.users)
CREATE OR REPLACE FUNCTION get_my_user_id()
RETURNS BIGINT AS $$
  SELECT id FROM public.users WHERE auth_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Policies para Tabelas Financeiras (Gastos, etc)
-- "Eu vejo linhas onde usuario_id é igual ao meu ID público"

-- ASSINATURAS
CREATE POLICY "Assinaturas user isolation" ON assinaturas
  FOR ALL USING (usuario_id = get_my_user_id());

-- CONTAS FIXAS
CREATE POLICY "Contas Fixas user isolation" ON contas_fixas
  FOR ALL USING (usuario_id = get_my_user_id());

-- Policies para Tabelas Financeiras (Gastos, etc)
-- "Eu vejo linhas onde usuario_id é igual ao meu ID público"

-- GASTOS
CREATE POLICY "Gastos user isolation" ON gastos
  FOR ALL USING (usuario_id = get_my_user_id());

-- SALARIOS
CREATE POLICY "Salarios user isolation" ON salarios
  FOR ALL USING (usuario_id = get_my_user_id());

-- CARTÕES
CREATE POLICY "Cartoes user isolation" ON cartoes
  FOR ALL USING (usuario_id = get_my_user_id());

-- PARCELAS
CREATE POLICY "Parcelas user isolation" ON compras_parceladas
  FOR ALL USING (usuario_id = get_my_user_id());

-- METAS
CREATE POLICY "Metas user isolation" ON metas
  FOR ALL USING (usuario_id = get_my_user_id());

-- INVESTIMENTOS
CREATE POLICY "Investimentos user isolation" ON investimentos
  FOR ALL USING (usuario_id = get_my_user_id());

-- PATRIMONIO
CREATE POLICY "Patrimonio user isolation" ON patrimonio
  FOR ALL USING (usuario_id = get_my_user_id());

-- GASOLINA
CREATE POLICY "Gasolina user isolation" ON gasolina
  FOR ALL USING (usuario_id = get_my_user_id());

-- EMPRESAS (Dono vê)
CREATE POLICY "Empresas owner isolation" ON empresas
  FOR ALL USING (dono_id = get_my_user_id());

-- CONTAS EMPRESA
CREATE POLICY "Contas Empresa isolation" ON contas_empresa
  FOR ALL USING (empresa_id IN (SELECT id FROM empresas WHERE dono_id = get_my_user_id()));

-- TRANSACOES EMPRESA
CREATE POLICY "Transacoes Empresa isolation" ON transacoes_empresa
  FOR ALL USING (empresa_id IN (SELECT id FROM empresas WHERE dono_id = get_my_user_id()));

-- DÍVIDAS
CREATE POLICY "Dividas user isolation" ON dividas
  FOR ALL USING (usuario_id = get_my_user_id());

-- EMPRÉSTIMOS
CREATE POLICY "Emprestimos user isolation" ON emprestimos
  FOR ALL USING (usuario_id = get_my_user_id());

-- Notas sobre views:
-- Views em SaaS devem ser SECURITY INVOKER (padrão) para respeitar o RLS das tabelas base.
-- Como recriamos as views recentemente, elas já devem respeitar isso se as tabelas base tiverem RLS.

-- 4. ESTRUTURA DE PLANOS E ASSINATURAS (SAAS)
-- =================================================================
CREATE TABLE IF NOT EXISTS saas_planos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL, -- Free, Pro, Family
    preco_mensal DECIMAL(10, 2) NOT NULL,
    descricao TEXT,
    recursos JSONB, -- { "limite_gastos": 1000, "empresas": false }
    ativo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS saas_assinaturas (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT REFERENCES users(id) NOT NULL,
    plano_id INTEGER REFERENCES saas_planos(id),
    status VARCHAR(20) DEFAULT 'active', -- active, past_due, canceled
    gateway VARCHAR(20) DEFAULT 'stripe',
    gateway_subscription_id VARCHAR(100),
    data_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_fim TIMESTAMP,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE saas_assinaturas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Assinaturas own view" ON saas_assinaturas
  FOR SELECT USING (usuario_id = get_my_user_id());

-- Inserir planos padrão
INSERT INTO saas_planos (nome, preco_mensal, descricao, recursos) VALUES
('Free', 0.00, 'Plano gratuito para controle básico', '{"limite_gastos": 50, "empresas": false, "familia": false}'),
('Pro', 29.90, 'Controle total ilimitado + Empresa', '{"limite_gastos": -1, "empresas": true, "familia": false}'),
('Family', 49.90, 'Para toda a família + Empresa', '{"limite_gastos": -1, "empresas": true, "familia": true}')
ON CONFLICT DO NOTHING;

-- Notificar sucesso
SELECT 'Sistema convertido para SaaS com Sucesso!' as status;
