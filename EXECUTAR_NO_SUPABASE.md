# 🚀 EXECUTAR NO SUPABASE - PASSO A PASSO

## 🎯 Objetivo

Configurar o banco de dados Supabase com TODAS as funcionalidades novas:
- ✅ Categorias personalizadas
- ✅ Sistema de convites
- ✅ Transferências entre membros
- ✅ Modo familiar/individual
- ✅ Empréstimos parcelados
- ✅ Tipos de pagamento

---

## 📋 PASSO 1: Acessar Supabase SQL Editor

### 1. Acesse:
```
https://supabase.com/dashboard/project/sfemmeczjhleyqeegwhs/sql/new
```

### 2. Ou navegue:
```
Dashboard → Seu Projeto → SQL Editor → New Query
```

---

## 📋 PASSO 2: Executar SQL Base (se ainda não executou)

### 2.1. Cole e execute o arquivo completo:
```
database_setup.sql
```

**Isso cria:**
- 16 tabelas base
- Índices
- Views
- Functions básicas
- Dados de exemplo

**Tempo:** ~30 segundos

---

## 📋 PASSO 3: Executar SQL V2 (NOVAS FUNCIONALIDADES)

### 3.1. Cole e execute o arquivo:
```
supabase_v2_setup.sql
```

**Isso adiciona:**
- ✅ Campo `tipo` em users (pessoa/empresa)
- ✅ Campo `tipo_pagamento` em gastos, parcelas e gasolina
- ✅ Campos de parcelamento em empréstimos
- ✅ Tabela `familias`
- ✅ Tabela `familia_membros`
- ✅ Tabela `convites`
- ✅ Tabela `transferencias`
- ✅ Tabela `categorias_personalizadas`
- ✅ Functions para convites
- ✅ RLS (segurança)
- ✅ Policies

**Tempo:** ~1 minuto

### 3.2. Verificar sucesso:
Ao final, você verá:
```
✅ Supabase V2 configurado com sucesso!
✅ Tabelas criadas/atualizadas
✅ RLS habilitado
✅ Functions criadas
✅ Views atualizadas

🎉 Sistema pronto para:
  1. Categorias personalizadas
  2. Sistema de convites
  3. Transferências entre membros
  4. Modo familiar/individual
  5. Empréstimos parcelados
```

---

## 📋 PASSO 4: Configurar Autenticação

### 4.1. Habilitar Email/Password:
```
Dashboard → Authentication → Providers
☑ Email
☑ Password
```

### 4.2. Configurar confirmação de email:
```
Authentication → Email Templates
☑ Confirm Signup
☑ Magic Link
☑ Invite User
```

### 4.3. Desabilitar confirmação (desenvolvimento):
```
Authentication → Settings
☐ Enable email confirmations (desmarque temporariamente)
```

---

## 📋 PASSO 5: Testar no SQL Editor

### 5.1. Criar usuário teste:
```sql
-- Inserir usuário
INSERT INTO users (nome, cor, tipo, email) VALUES
('Teste', '#007AFF', 'pessoa', 'teste@email.com')
RETURNING *;

-- Criar família
INSERT INTO familias (nome, admin_id, modo_calculo, codigo_convite) VALUES
('Minha Família', 1, 'familiar', 'FAM001')
RETURNING *;

-- Adicionar à família
INSERT INTO familia_membros (familia_id, usuario_id, papel, aprovado) VALUES
(1, 1, 'admin', TRUE);
```

### 5.2. Gerar convite:
```sql
SELECT * FROM criar_convite(1, 'esposa@email.com', 7);
```

**Resultado esperado:**
```
codigo: ABC12345
link: https://seu-app.com/convite/ABC12345
```

### 5.3. Criar categoria personalizada:
```sql
INSERT INTO categorias_personalizadas (usuario_id, familia_id, nome, cor, tipo) VALUES
(1, 1, 'Pet Shop', '#FF6B6B', 'gasto')
RETURNING *;
```

### 5.4. Criar transferência:
```sql
INSERT INTO transferencias (
  familia_id, de_usuario_id, para_usuario_id, 
  valor, descricao, data
) VALUES
(1, 1, 2, 200.00, 'Comprei no cartão dela', CURRENT_DATE)
RETURNING *;
```

---

## 📋 PASSO 6: Verificar Instalação

### 6.1. Contar tabelas:
```sql
SELECT COUNT(*) as total_tabelas
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';
```

**Esperado:** 20+ tabelas

### 6.2. Listar todas:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

**Deve incluir:**
- categorias
- categorias_personalizadas ← NOVO
- compras_parceladas
- convites ← NOVO
- emprestimos
- familia_membros ← NOVO
- familias ← NOVO
- gastos
- gasolina
- salaries
- transferencias ← NOVO
- users
- ... (outras)

### 6.3. Verificar RLS:
```sql
SELECT tablename, COUNT(*) as policies
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
```

---

## 📋 PASSO 7: Dados de Exemplo (Opcional)

### Criar cenário completo:
```sql
-- 1. Criar família
INSERT INTO familias (nome, admin_id, modo_calculo) VALUES
('Família Silva', 1, 'familiar');

-- 2. Adicionar membros
INSERT INTO familia_membros (familia_id, usuario_id, papel, aprovado) VALUES
(1, 1, 'admin', TRUE),
(1, 2, 'membro', TRUE);

-- 3. Criar categoria personalizada
INSERT INTO categorias_personalizadas (familia_id, nome, cor, tipo) VALUES
(1, 'Pets', '#FF6B6B', 'gasto'),
(1, 'Academia', '#4ECDC4', 'gasto');

-- 4. Gasto normal
INSERT INTO gastos (usuario_id, descricao, valor, data, tipo_pagamento) VALUES
(1, 'Mercado', 450.00, CURRENT_DATE, 'pix');

-- 5. Transferência (gastei no cartão dela)
INSERT INTO transferencias (
  familia_id, de_usuario_id, para_usuario_id, 
  valor, descricao, tipo_pagamento, data
) VALUES
(1, 1, 2, 200.00, 'Compras no cartão', 'cartao_credito', CURRENT_DATE);

-- 6. Empréstimo parcelado
INSERT INTO emprestimos (
  nome, tipo, valor, data_emprestimo, 
  parcelado, total_parcelas, parcelas_pagas, valor_parcela
) VALUES
('João', 'emprestei', 500.00, CURRENT_DATE, 
 TRUE, 5, 0, 100.00);

-- 7. Compra parcelada
INSERT INTO compras_parceladas (
  produto, valor_total, total_parcelas, valor_parcela, 
  parcelas_pagas, data_compra, tipo_pagamento
) VALUES
('TV Samsung', 3000.00, 12, 250.00, 0, CURRENT_DATE, 'cartao_credito');
```

---

## 🔒 PASSO 8: Segurança

### 8.1. NUNCA expor Service Role Key no frontend!
```javascript
// ❌ ERRADO:
const supabase = createClient(url, SERVICE_ROLE_KEY); // NO FRONTEND

// ✅ CORRETO:
const supabase = createClient(url, ANON_KEY); // Anon key é segura
```

### 8.2. Usar RLS sempre:
```
Todas as tabelas têm RLS habilitado
Policies garantem que cada usuário vê apenas seus dados
```

### 8.3. Validar no backend:
```javascript
// Use Edge Functions para lógica sensível
// Dashboard → Edge Functions
```

---

## 📊 PASSO 9: Testar Queries

### 9.1. Ver dados da família:
```sql
SELECT * FROM vw_dashboard_familia WHERE familia_id = 1;
```

### 9.2. Ver transferências pendentes:
```sql
SELECT * FROM vw_transferencias_pendentes;
```

### 9.3. Calcular saldo:
```sql
SELECT * FROM calcular_saldo_usuario(1, 1, 'familiar');
```

---

## ✅ CHECKLIST DE VERIFICAÇÃO

Marque após executar:

### Base:
- [ ] `database_setup.sql` executado
- [ ] 16 tabelas base criadas
- [ ] Dados de exemplo inseridos

### V2 (Novas features):
- [ ] `supabase_v2_setup.sql` executado
- [ ] Campo `tipo` em users
- [ ] Campos `tipo_pagamento` adicionados
- [ ] Tabela `familias` criada
- [ ] Tabela `familia_membros` criada
- [ ] Tabela `convites` criada
- [ ] Tabela `transferencias` criada
- [ ] Tabela `categorias_personalizadas` criada

### Segurança:
- [ ] RLS habilitado
- [ ] Policies criadas
- [ ] Email/Password habilitado

### Testes:
- [ ] Inseriu dados de teste
- [ ] Queries funcionando
- [ ] Views retornando dados

---

## 🎊 Resultado Final

Após executar tudo, você terá:

- 🗄️ **20+ tabelas** no Supabase
- 🔐 **Autenticação** funcionando
- 👨‍👩‍👧‍👦 **Sistema de famílias** com convites
- 💸 **Transferências** entre membros
- 🎨 **Categorias personalizadas**
- 📊 **Queries otimizadas**
- 🔒 **Segurança** com RLS

---

## 🚀 Próximo Passo

Após executar o SQL:

```
Quer que eu crie o index-supabase-v2.html com:
- Login/Cadastro
- Sistema de convites
- Transferências
- Categorias personalizadas
- Sincronização em tempo real
?
```

**Digite "SIM" para eu criar! 🚀**

---

**Arquivos criados:**
- ✅ `supabase.config.js` - Configuração
- ✅ `supabase_v2_setup.sql` - SQL completo
- ✅ `INTEGRACAO_SUPABASE.md` - Guia técnico
- ✅ `EXECUTAR_NO_SUPABASE.md` - Este guia

**Tempo total:** ~5 minutos para configurar tudo!

