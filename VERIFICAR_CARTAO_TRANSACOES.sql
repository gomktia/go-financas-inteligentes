-- ============================================
-- VERIFICAR ESTRUTURA DA TABELA cartao_transacoes
-- ============================================

-- Ver todas as colunas da tabela
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'cartao_transacoes'
ORDER BY ordinal_position;

-- Ver constraints (chaves, checks, etc)
SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'cartao_transacoes';

-- Ver indices
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'cartao_transacoes';

-- Ver dados (primeiras 5 linhas)
SELECT * FROM cartao_transacoes LIMIT 5;

-- Contar registros
SELECT COUNT(*) as total_registros FROM cartao_transacoes;

