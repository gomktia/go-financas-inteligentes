# ✅ Verificação Completa do Banco de Dados

## 🎯 Projeto Supabase
**ID:** `sfemmeczjhleyqeegwhs`  
**URL:** `https://sfemmeczjhleyqeegwhs.supabase.co`

---

## 📋 Checklist de Tabelas (16 no total)

### ✅ Tabelas Principais

#### 1. **users** - Usuários
```sql
-- Verificar estrutura
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

**Campos esperados:**
- [ ] `id` (BIGSERIAL PRIMARY KEY)
- [ ] `nome` (VARCHAR NOT NULL)
- [ ] `cor` (VARCHAR, default '#007AFF')
- [ ] `email` (VARCHAR UNIQUE)
- [ ] `senha_hash` (VARCHAR)
- [ ] `foto_url` (VARCHAR)
- [ ] `ativo` (BOOLEAN, default TRUE)
- [ ] `data_criacao` (TIMESTAMP)
- [ ] `data_atualizacao` (TIMESTAMP)

**Verificar dados:**
```sql
SELECT COUNT(*) as total, 
       COUNT(DISTINCT id) as usuarios_unicos
FROM users;
```

---

#### 2. **salaries** - Salários
```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'salaries';
```

**Campos esperados:**
- [ ] `id` (BIGSERIAL PRIMARY KEY)
- [ ] `usuario_id` (BIGINT FOREIGN KEY → users.id)
- [ ] `valor` (DECIMAL(15,2) NOT NULL)
- [ ] `descricao` (VARCHAR)
- [ ] `mes_referencia` (DATE)
- [ ] `data_criacao` (TIMESTAMP)
- [ ] `data_atualizacao` (TIMESTAMP)

**Verificar integridade:**
```sql
-- Verificar se todos os salários têm usuário válido
SELECT s.id, s.usuario_id, u.nome
FROM salaries s
LEFT JOIN users u ON s.usuario_id = u.id
WHERE u.id IS NULL;
-- Resultado esperado: 0 linhas (sem órfãos)
```

---

#### 3. **categorias** - Categorias
**Campos esperados:**
- [ ] `id` (BIGSERIAL PRIMARY KEY)
- [ ] `nome` (VARCHAR UNIQUE NOT NULL)
- [ ] `icone` (VARCHAR)
- [ ] `cor` (VARCHAR)
- [ ] `tipo` (VARCHAR NOT NULL)
- [ ] `ativa` (BOOLEAN)
- [ ] `data_criacao` (TIMESTAMP)

**Verificar categorias padrão:**
```sql
SELECT tipo, COUNT(*) as total
FROM categorias
GROUP BY tipo;
```

**Resultado esperado:**
- `gasto`: 8 categorias
- `parcela`: 6 categorias

**Listar todas:**
```sql
SELECT id, nome, icone, tipo 
FROM categorias 
ORDER BY tipo, nome;
```

---

#### 4. **gastos** - Gastos Variáveis
**Campos esperados:**
- [ ] `id` (BIGSERIAL PRIMARY KEY)
- [ ] `usuario_id` (BIGINT FOREIGN KEY → users.id)
- [ ] `categoria_id` (BIGINT FOREIGN KEY → categorias.id)
- [ ] `descricao` (VARCHAR NOT NULL)
- [ ] `valor` (DECIMAL(15,2) NOT NULL)
- [ ] `data` (DATE NOT NULL)
- [ ] `observacoes` (TEXT)
- [ ] `data_criacao` (TIMESTAMP)
- [ ] `data_atualizacao` (TIMESTAMP)

**Verificar constraints:**
```sql
-- Valor deve ser >= 0
SELECT COUNT(*) as gastos_negativos
FROM gastos
WHERE valor < 0;
-- Resultado esperado: 0
```

**Verificar índices:**
```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'gastos';
```

**Índices esperados:**
- `idx_gastos_usuario`
- `idx_gastos_data`
- `idx_gastos_categoria`
- `idx_gastos_usuario_data`
- `idx_gastos_mes`

---

#### 5. **compras_parceladas** - Compras Parceladas
**Campos esperados:**
- [ ] `id` (BIGSERIAL PRIMARY KEY)
- [ ] `usuario_id` (BIGINT FOREIGN KEY)
- [ ] `categoria_id` (BIGINT FOREIGN KEY)
- [ ] `produto` (VARCHAR NOT NULL)
- [ ] `valor_total` (DECIMAL(15,2) NOT NULL)
- [ ] `total_parcelas` (INTEGER NOT NULL)
- [ ] `valor_parcela` (DECIMAL(15,2) NOT NULL)
- [ ] `parcelas_pagas` (INTEGER DEFAULT 0)
- [ ] `data_compra` (DATE NOT NULL)
- [ ] `primeira_parcela` (DATE)
- [ ] `dia_vencimento` (INTEGER)
- [ ] `observacoes` (TEXT)
- [ ] `finalizada` (BOOLEAN DEFAULT FALSE)
- [ ] `data_criacao` (TIMESTAMP)
- [ ] `data_atualizacao` (TIMESTAMP)

**Verificar consistência:**
```sql
-- Parcelas pagas não pode ser maior que total
SELECT id, produto, parcelas_pagas, total_parcelas
FROM compras_parceladas
WHERE parcelas_pagas > total_parcelas;
-- Resultado esperado: 0 linhas

-- Valor da parcela deve ser valor_total / total_parcelas
SELECT id, produto, 
       valor_total, 
       total_parcelas, 
       valor_parcela,
       ROUND(valor_total / total_parcelas, 2) as calculado
FROM compras_parceladas
WHERE ABS(valor_parcela - (valor_total / total_parcelas)) > 0.01;
-- Resultado esperado: 0 ou poucos (diferenças de arredondamento)
```

---

#### 6. **gasolina** - Abastecimentos
**Campos esperados:**
- [ ] `id` (BIGSERIAL PRIMARY KEY)
- [ ] `usuario_id` (BIGINT FOREIGN KEY)
- [ ] `veiculo` (VARCHAR NOT NULL, CHECK: 'carro' ou 'moto')
- [ ] `valor` (DECIMAL(15,2) NOT NULL)
- [ ] `litros` (DECIMAL(10,3))
- [ ] `preco_litro` (DECIMAL(10,3))
- [ ] `local` (VARCHAR)
- [ ] `km_atual` (INTEGER)
- [ ] `data` (DATE NOT NULL)
- [ ] `observacoes` (TEXT)
- [ ] `data_criacao` (TIMESTAMP)

**Verificar trigger de cálculo:**
```sql
-- Inserir teste
INSERT INTO gasolina (veiculo, valor, litros, data)
VALUES ('carro', 250.00, 45.5, CURRENT_DATE);

-- Verificar se preco_litro foi calculado automaticamente
SELECT id, valor, litros, preco_litro, 
       ROUND(valor / litros, 3) as esperado
FROM gasolina
WHERE data = CURRENT_DATE
ORDER BY id DESC
LIMIT 1;

-- Limpar teste
DELETE FROM gasolina WHERE data = CURRENT_DATE AND valor = 250.00;
```

**Verificar veículos:**
```sql
SELECT veiculo, COUNT(*) as total, SUM(valor) as total_gasto
FROM gasolina
GROUP BY veiculo;
```

---

#### 7. **assinaturas** - Assinaturas
**Campos esperados:**
- [ ] `id` (BIGSERIAL PRIMARY KEY)
- [ ] `nome` (VARCHAR NOT NULL)
- [ ] `valor` (DECIMAL(15,2) NOT NULL)
- [ ] `ativa` (BOOLEAN DEFAULT TRUE)
- [ ] `periodicidade` (VARCHAR DEFAULT 'mensal')
- [ ] `dia_vencimento` (INTEGER)
- [ ] `data_inicio` (DATE)
- [ ] `data_cancelamento` (DATE)
- [ ] `url` (VARCHAR)
- [ ] `observacoes` (TEXT)
- [ ] `data_criacao` (TIMESTAMP)

**Verificar periodicidade:**
```sql
-- Deve aceitar apenas: mensal, anual, trimestral, semestral
SELECT DISTINCT periodicidade
FROM assinaturas;
```

---

#### 8. **contas_fixas** - Contas Fixas
**Campos esperados:**
- [ ] `id` (BIGSERIAL PRIMARY KEY)
- [ ] `nome` (VARCHAR NOT NULL)
- [ ] `valor` (DECIMAL(15,2) NOT NULL)
- [ ] `dia_vencimento` (INTEGER NOT NULL, CHECK: 1-31)
- [ ] `categoria` (VARCHAR)
- [ ] `ativa` (BOOLEAN DEFAULT TRUE)
- [ ] `observacoes` (TEXT)
- [ ] `data_criacao` (TIMESTAMP)

**Verificar dias de vencimento:**
```sql
SELECT nome, dia_vencimento
FROM contas_fixas
WHERE dia_vencimento < 1 OR dia_vencimento > 31;
-- Resultado esperado: 0 linhas
```

---

#### 9. **cartoes** - Cartões de Crédito
**Campos esperados:**
- [ ] `id` (BIGSERIAL PRIMARY KEY)
- [ ] `usuario_id` (BIGINT FOREIGN KEY NOT NULL)
- [ ] `nome` (VARCHAR NOT NULL)
- [ ] `bandeira` (VARCHAR)
- [ ] `limite` (DECIMAL(15,2) NOT NULL)
- [ ] `gasto_atual` (DECIMAL(15,2) DEFAULT 0)
- [ ] `dia_fechamento` (INTEGER)
- [ ] `dia_vencimento` (INTEGER)
- [ ] `ultimos_digitos` (VARCHAR(4))
- [ ] `ativo` (BOOLEAN DEFAULT TRUE)
- [ ] `observacoes` (TEXT)
- [ ] `data_criacao` (TIMESTAMP)

**Verificar utilização:**
```sql
SELECT nome, 
       limite, 
       gasto_atual,
       ROUND((gasto_atual / limite) * 100, 2) as percentual_usado
FROM cartoes
WHERE ativo = TRUE
ORDER BY percentual_usado DESC;
```

**Alertas (> 80%):**
```sql
SELECT nome, 
       limite, 
       gasto_atual,
       ROUND((gasto_atual / limite) * 100, 2) as percentual
FROM cartoes
WHERE ativo = TRUE 
  AND (gasto_atual / limite) > 0.8;
```

---

#### 10. **metas** - Metas Financeiras
**Campos esperados:**
- [ ] `id` (BIGSERIAL PRIMARY KEY)
- [ ] `nome` (VARCHAR NOT NULL)
- [ ] `valor_alvo` (DECIMAL(15,2) NOT NULL)
- [ ] `valor_atual` (DECIMAL(15,2) DEFAULT 0)
- [ ] `cor` (VARCHAR DEFAULT '#007AFF')
- [ ] `prazo_final` (DATE)
- [ ] `descricao` (TEXT)
- [ ] `concluida` (BOOLEAN DEFAULT FALSE)
- [ ] `data_criacao` (TIMESTAMP)

**Verificar progresso:**
```sql
SELECT nome,
       valor_alvo,
       valor_atual,
       ROUND((valor_atual / valor_alvo) * 100, 2) as progresso_percent,
       valor_alvo - valor_atual as falta
FROM metas
WHERE concluida = FALSE
ORDER BY progresso_percent DESC;
```

---

#### 11. **orcamentos** - Orçamentos
**Campos esperados:**
- [ ] `id` (BIGSERIAL PRIMARY KEY)
- [ ] `categoria_id` (BIGINT FOREIGN KEY)
- [ ] `limite` (DECIMAL(15,2) NOT NULL)
- [ ] `mes_referencia` (DATE)
- [ ] `alerta_percentual` (INTEGER DEFAULT 80)
- [ ] `data_criacao` (TIMESTAMP)

**Verificar com gastos:**
```sql
SELECT c.nome as categoria,
       o.limite,
       COALESCE(SUM(g.valor), 0) as gasto_atual,
       o.limite - COALESCE(SUM(g.valor), 0) as disponivel,
       ROUND((COALESCE(SUM(g.valor), 0) / o.limite) * 100, 2) as percentual
FROM orcamentos o
LEFT JOIN categorias c ON o.categoria_id = c.id
LEFT JOIN gastos g ON c.id = g.categoria_id
  AND EXTRACT(YEAR FROM g.data) = EXTRACT(YEAR FROM CURRENT_DATE)
  AND EXTRACT(MONTH FROM g.data) = EXTRACT(MONTH FROM CURRENT_DATE)
WHERE o.mes_referencia IS NULL
GROUP BY c.nome, o.limite
ORDER BY percentual DESC;
```

---

#### 12. **ferramentas** - Ferramentas IA/Dev
**Campos esperados:**
- [ ] `id` (BIGSERIAL PRIMARY KEY)
- [ ] `ferramenta` (VARCHAR NOT NULL)
- [ ] `valor` (DECIMAL(15,2) NOT NULL)
- [ ] `ativa` (BOOLEAN DEFAULT TRUE)
- [ ] `tipo` (VARCHAR)
- [ ] `url` (VARCHAR)
- [ ] `observacoes` (TEXT)
- [ ] `data_criacao` (TIMESTAMP)

**Total mensal:**
```sql
SELECT SUM(valor) as total_ferramentas
FROM ferramentas
WHERE ativa = TRUE;
```

---

#### 13. **investimentos** - Investimentos
**Campos esperados:**
- [ ] `id` (BIGSERIAL PRIMARY KEY)
- [ ] `nome` (VARCHAR NOT NULL)
- [ ] `tipo` (VARCHAR NOT NULL)
- [ ] `valor` (DECIMAL(15,2) NOT NULL)
- [ ] `rendimento_percentual` (DECIMAL(10,4))
- [ ] `data_aplicacao` (DATE)
- [ ] `data_vencimento` (DATE)
- [ ] `instituicao` (VARCHAR)
- [ ] `liquidez` (VARCHAR)
- [ ] `observacoes` (TEXT)
- [ ] `ativo` (BOOLEAN DEFAULT TRUE)
- [ ] `data_criacao` (TIMESTAMP)

**Portfólio:**
```sql
SELECT tipo,
       COUNT(*) as quantidade,
       SUM(valor) as total,
       AVG(rendimento_percentual) as rendimento_medio
FROM investimentos
WHERE ativo = TRUE
GROUP BY tipo
ORDER BY total DESC;
```

---

#### 14. **patrimonio** - Patrimônio
**Campos esperados:**
- [ ] `id` (BIGSERIAL PRIMARY KEY)
- [ ] `nome` (VARCHAR NOT NULL)
- [ ] `tipo` (VARCHAR NOT NULL)
- [ ] `valor` (DECIMAL(15,2) NOT NULL)
- [ ] `data_aquisicao` (DATE)
- [ ] `valor_aquisicao` (DECIMAL(15,2))
- [ ] `depreciacao_anual` (DECIMAL(10,4))
- [ ] `observacoes` (TEXT)
- [ ] `ativo` (BOOLEAN DEFAULT TRUE)
- [ ] `data_criacao` (TIMESTAMP)

**Total por tipo:**
```sql
SELECT tipo,
       COUNT(*) as quantidade,
       SUM(valor) as total
FROM patrimonio
WHERE ativo = TRUE
GROUP BY tipo
ORDER BY total DESC;
```

---

#### 15. **dividas** - Dívidas
**Campos esperados:**
- [ ] `id` (BIGSERIAL PRIMARY KEY)
- [ ] `nome` (VARCHAR NOT NULL)
- [ ] `valor_total` (DECIMAL(15,2) NOT NULL)
- [ ] `valor_pago` (DECIMAL(15,2) DEFAULT 0)
- [ ] `total_parcelas` (INTEGER NOT NULL)
- [ ] `parcelas_pagas` (INTEGER DEFAULT 0)
- [ ] `valor_parcela` (DECIMAL(15,2))
- [ ] `taxa_juros` (DECIMAL(10,4))
- [ ] `dia_vencimento` (INTEGER)
- [ ] `instituicao` (VARCHAR)
- [ ] `tipo` (VARCHAR)
- [ ] `data_contratacao` (DATE)
- [ ] `observacoes` (TEXT)
- [ ] `quitada` (BOOLEAN DEFAULT FALSE)
- [ ] `data_criacao` (TIMESTAMP)

**Verificar consistência:**
```sql
-- Valor pago não pode ser maior que total
SELECT nome, valor_total, valor_pago
FROM dividas
WHERE valor_pago > valor_total;
-- Resultado esperado: 0 linhas

-- Parcelas pagas não pode ser maior que total
SELECT nome, total_parcelas, parcelas_pagas
FROM dividas
WHERE parcelas_pagas > total_parcelas;
-- Resultado esperado: 0 linhas
```

**Total de dívidas:**
```sql
SELECT SUM(valor_total - valor_pago) as divida_total,
       COUNT(*) as quantidade_dividas
FROM dividas
WHERE quitada = FALSE;
```

---

#### 16. **emprestimos** - Empréstimos
**Campos esperados:**
- [ ] `id` (BIGSERIAL PRIMARY KEY)
- [ ] `nome` (VARCHAR NOT NULL)
- [ ] `tipo` (VARCHAR NOT NULL, CHECK: 'emprestei' ou 'peguei')
- [ ] `valor` (DECIMAL(15,2) NOT NULL)
- [ ] `data_emprestimo` (DATE NOT NULL)
- [ ] `data_vencimento` (DATE)
- [ ] `pago` (BOOLEAN DEFAULT FALSE)
- [ ] `data_pagamento` (DATE)
- [ ] `observacoes` (TEXT)
- [ ] `data_criacao` (TIMESTAMP)

**Resumo:**
```sql
SELECT tipo,
       COUNT(*) as quantidade,
       SUM(valor) as total
FROM emprestimos
WHERE pago = FALSE
GROUP BY tipo;
```

---

## 🔍 Verificações de Integridade

### 1. Chaves Estrangeiras
```sql
-- Verificar TODAS as foreign keys
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name;
```

**Relacionamentos esperados:**
- `salaries.usuario_id` → `users.id`
- `gastos.usuario_id` → `users.id`
- `gastos.categoria_id` → `categorias.id`
- `compras_parceladas.usuario_id` → `users.id`
- `compras_parceladas.categoria_id` → `categorias.id`
- `gasolina.usuario_id` → `users.id`
- `cartoes.usuario_id` → `users.id`
- `orcamentos.categoria_id` → `categorias.id`

### 2. Índices
```sql
-- Listar TODOS os índices
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

**Índices mínimos esperados:** ~25 índices

### 3. Constraints
```sql
-- Listar todas as constraints
SELECT constraint_name, table_name, constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public'
ORDER BY table_name, constraint_type;
```

### 4. Triggers
```sql
-- Listar triggers
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public';
```

**Trigger esperado:**
- `trigger_calcular_preco_litro` na tabela `gasolina`

---

## 📊 Views

### Verificar Views Criadas
```sql
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public';
```

**Views esperadas:**
1. `vw_resumo_mensal`
2. `vw_patrimonio_liquido`
3. `vw_gastos_por_categoria`

### Testar Views

#### 1. Resumo Mensal
```sql
SELECT * FROM vw_resumo_mensal;
```

#### 2. Patrimônio Líquido
```sql
SELECT * FROM vw_patrimonio_liquido;
```

#### 3. Gastos por Categoria
```sql
SELECT * FROM vw_gastos_por_categoria;
```

---

## 🔧 Functions

### Verificar Functions Criadas
```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_type = 'FUNCTION';
```

**Functions esperadas:**
1. `calcular_preco_litro()`
2. `total_despesas_mes(ano, mes)`
3. `saldo_mes(ano, mes)`

### Testar Functions

#### 1. Total Despesas do Mês
```sql
SELECT total_despesas_mes(2025, 10) as despesas_outubro;
```

#### 2. Saldo do Mês
```sql
SELECT saldo_mes(2025, 10) as saldo_outubro;
```

---

## 📈 Relatórios de Verificação

### Dashboard Completo
```sql
SELECT 
    'Receitas' as tipo,
    (SELECT COALESCE(SUM(valor), 0) FROM salaries) as valor
UNION ALL
SELECT 
    'Gastos',
    (SELECT COALESCE(SUM(valor), 0) FROM gastos 
     WHERE EXTRACT(MONTH FROM data) = EXTRACT(MONTH FROM CURRENT_DATE))
UNION ALL
SELECT 
    'Parcelas',
    (SELECT COALESCE(SUM(valor_parcela), 0) FROM compras_parceladas WHERE finalizada = FALSE)
UNION ALL
SELECT 
    'Gasolina',
    (SELECT COALESCE(SUM(valor), 0) FROM gasolina 
     WHERE EXTRACT(MONTH FROM data) = EXTRACT(MONTH FROM CURRENT_DATE))
UNION ALL
SELECT 
    'Assinaturas',
    (SELECT COALESCE(SUM(valor), 0) FROM assinaturas WHERE ativa = TRUE)
UNION ALL
SELECT 
    'Contas Fixas',
    (SELECT COALESCE(SUM(valor), 0) FROM contas_fixas WHERE ativa = TRUE)
UNION ALL
SELECT 
    'Ferramentas',
    (SELECT COALESCE(SUM(valor), 0) FROM ferramentas WHERE ativa = TRUE);
```

### Patrimônio Líquido
```sql
SELECT 
    (SELECT COALESCE(SUM(valor), 0) FROM patrimonio WHERE ativo = TRUE) as bens,
    (SELECT COALESCE(SUM(valor), 0) FROM investimentos WHERE ativo = TRUE) as investimentos,
    (SELECT COALESCE(SUM(valor_total - valor_pago), 0) FROM dividas WHERE quitada = FALSE) as dividas,
    (SELECT COALESCE(SUM(valor), 0) FROM patrimonio WHERE ativo = TRUE) +
    (SELECT COALESCE(SUM(valor), 0) FROM investimentos WHERE ativo = TRUE) -
    (SELECT COALESCE(SUM(valor_total - valor_pago), 0) FROM dividas WHERE quitada = FALSE) as patrimonio_liquido;
```

---

## 🔒 Segurança (RLS)

### Verificar Row Level Security
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

### Verificar Policies
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

---

## ✅ Checklist Final

### Estrutura
- [ ] 16 tabelas criadas
- [ ] Todas as colunas presentes
- [ ] Tipos de dados corretos
- [ ] Constraints aplicadas (CHECK, NOT NULL)
- [ ] Primary Keys configuradas
- [ ] Foreign Keys configuradas

### Dados
- [ ] Categorias padrão inseridas (14 categorias)
- [ ] Sem dados órfãos (foreign keys válidas)
- [ ] Sem valores negativos onde não permitido
- [ ] Sem inconsistências (parcelas, valores)

### Performance
- [ ] ~25 índices criados
- [ ] Índices em foreign keys
- [ ] Índices em campos de busca (data, usuario_id)

### Funcionalidades
- [ ] 3 Views criadas e funcionando
- [ ] 3 Functions criadas e funcionando
- [ ] 1 Trigger criado (calcular_preco_litro)

### Segurança (Opcional)
- [ ] RLS habilitado (se necessário)
- [ ] Policies configuradas (se necessário)

---

## 🚀 Comandos Rápidos para Verificação

### No Supabase SQL Editor:

```sql
-- 1. Contar todas as tabelas
SELECT COUNT(*) as total_tabelas
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
-- Esperado: 16

-- 2. Contar todas as foreign keys
SELECT COUNT(*) as total_foreign_keys
FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY' AND table_schema = 'public';
-- Esperado: ~8

-- 3. Contar todos os índices
SELECT COUNT(*) as total_indices
FROM pg_indexes
WHERE schemaname = 'public';
-- Esperado: ~25-30

-- 4. Verificar se há dados
SELECT 
    'users' as tabela, COUNT(*) as registros FROM users
UNION ALL SELECT 'gastos', COUNT(*) FROM gastos
UNION ALL SELECT 'parcelas', COUNT(*) FROM compras_parceladas
UNION ALL SELECT 'gasolina', COUNT(*) FROM gasolina
UNION ALL SELECT 'categorias', COUNT(*) FROM categorias;
```

---

## 📝 Relatório de Status

Execute todas as queries acima e anote:

1. **Tabelas faltando:** __________
2. **Campos faltando:** __________
3. **Índices faltando:** __________
4. **Views faltando:** __________
5. **Functions faltando:** __________
6. **Triggers faltando:** __________
7. **Inconsistências encontradas:** __________

---

**Tudo verificado? Perfeito! Seu banco está pronto para produção! 🎉**

