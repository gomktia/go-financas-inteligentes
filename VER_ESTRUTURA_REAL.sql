-- Ver a estrutura REAL da tabela cartao_transacoes
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'cartao_transacoes'
ORDER BY ordinal_position;

