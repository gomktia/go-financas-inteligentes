-- ============================================
-- SCRIPT DE VERIFICAÇÃO COMPLETA DO BANCO
-- Execute no Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. VERIFICAR TODAS AS TABELAS
-- ============================================
SELECT 
    '📊 RESUMO DE TABELAS' as secao,
    '' as detalhes;

SELECT 
    table_name as tabela,
    (SELECT COUNT(*) 
     FROM information_schema.columns 
     WHERE table_name = t.table_name 
     AND table_schema = 'public') as colunas,
    pg_size_pretty(pg_total_relation_size(quote_ident(table_name)::regclass)) as tamanho
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Resultado esperado: 16 tabelas
SELECT 
    COUNT(*) as total_tabelas,
    CASE 
        WHEN COUNT(*) = 16 THEN '✅ CORRETO'
        ELSE '❌ FALTAM TABELAS'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE';

-- ============================================
-- 2. VERIFICAR DADOS EM CADA TABELA
-- ============================================
SELECT 
    '📦 DADOS NAS TABELAS' as secao,
    '' as detalhes;

SELECT 'users' as tabela, COUNT(*) as registros FROM users
UNION ALL SELECT 'salaries', COUNT(*) FROM salaries
UNION ALL SELECT 'categorias', COUNT(*) FROM categorias
UNION ALL SELECT 'gastos', COUNT(*) FROM gastos
UNION ALL SELECT 'compras_parceladas', COUNT(*) FROM compras_parceladas
UNION ALL SELECT 'gasolina', COUNT(*) FROM gasolina
UNION ALL SELECT 'assinaturas', COUNT(*) FROM assinaturas
UNION ALL SELECT 'contas_fixas', COUNT(*) FROM contas_fixas
UNION ALL SELECT 'cartoes', COUNT(*) FROM cartoes
UNION ALL SELECT 'metas', COUNT(*) FROM metas
UNION ALL SELECT 'orcamentos', COUNT(*) FROM orcamentos
UNION ALL SELECT 'ferramentas', COUNT(*) FROM ferramentas
UNION ALL SELECT 'investimentos', COUNT(*) FROM investimentos
UNION ALL SELECT 'patrimonio', COUNT(*) FROM patrimonio
UNION ALL SELECT 'dividas', COUNT(*) FROM dividas
UNION ALL SELECT 'emprestimos', COUNT(*) FROM emprestimos
ORDER BY registros DESC;

-- ============================================
-- 3. VERIFICAR CATEGORIAS PADRÃO
-- ============================================
SELECT 
    '🏷️ CATEGORIAS' as secao,
    '' as detalhes;

SELECT 
    tipo,
    COUNT(*) as quantidade,
    STRING_AGG(nome, ', ' ORDER BY nome) as categorias
FROM categorias
GROUP BY tipo
ORDER BY tipo;

-- Esperado: 
-- gasto: 8 categorias
-- parcela: 6 categorias

SELECT 
    CASE 
        WHEN COUNT(*) >= 14 THEN '✅ Categorias OK'
        ELSE '❌ FALTAM CATEGORIAS'
    END as status,
    COUNT(*) as total
FROM categorias;

-- ============================================
-- 4. VERIFICAR FOREIGN KEYS (INTEGRIDADE)
-- ============================================
SELECT 
    '🔗 INTEGRIDADE REFERENCIAL' as secao,
    '' as detalhes;

-- Gastos com usuários inválidos
SELECT 
    'gastos → users' as relacao,
    COUNT(*) as orfaos,
    CASE WHEN COUNT(*) = 0 THEN '✅ OK' ELSE '❌ ERRO' END as status
FROM gastos g
LEFT JOIN users u ON g.usuario_id = u.id
WHERE u.id IS NULL;

-- Salários com usuários inválidos
SELECT 
    'salaries → users' as relacao,
    COUNT(*) as orfaos,
    CASE WHEN COUNT(*) = 0 THEN '✅ OK' ELSE '❌ ERRO' END as status
FROM salaries s
LEFT JOIN users u ON s.usuario_id = u.id
WHERE u.id IS NULL;

-- Cartões com usuários inválidos
SELECT 
    'cartoes → users' as relacao,
    COUNT(*) as orfaos,
    CASE WHEN COUNT(*) = 0 THEN '✅ OK' ELSE '❌ ERRO' END as status
FROM cartoes c
LEFT JOIN users u ON c.usuario_id = u.id
WHERE u.id IS NULL;

-- Gastos com categorias inválidas (NULL é permitido)
SELECT 
    'gastos → categorias' as relacao,
    COUNT(*) as orfaos,
    CASE WHEN COUNT(*) = 0 THEN '✅ OK' ELSE '❌ ERRO' END as status
FROM gastos g
WHERE g.categoria_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM categorias c WHERE c.id = g.categoria_id);

-- ============================================
-- 5. VERIFICAR CONSTRAINTS
-- ============================================
SELECT 
    '⚠️ VALIDAÇÕES' as secao,
    '' as detalhes;

-- Valores negativos em gastos (não permitido)
SELECT 
    'Gastos negativos' as validacao,
    COUNT(*) as problemas,
    CASE WHEN COUNT(*) = 0 THEN '✅ OK' ELSE '❌ ERRO' END as status
FROM gastos
WHERE valor < 0;

-- Valores negativos em salários
SELECT 
    'Salários negativos' as validacao,
    COUNT(*) as problemas,
    CASE WHEN COUNT(*) = 0 THEN '✅ OK' ELSE '❌ ERRO' END as status
FROM salaries
WHERE valor < 0;

-- Parcelas pagas > total parcelas
SELECT 
    'Parcelas inconsistentes' as validacao,
    COUNT(*) as problemas,
    CASE WHEN COUNT(*) = 0 THEN '✅ OK' ELSE '❌ ERRO' END as status
FROM compras_parceladas
WHERE parcelas_pagas > total_parcelas;

-- Dívidas: valor pago > valor total
SELECT 
    'Dívidas inconsistentes' as validacao,
    COUNT(*) as problemas,
    CASE WHEN COUNT(*) = 0 THEN '✅ OK' ELSE '❌ ERRO' END as status
FROM dividas
WHERE valor_pago > valor_total;

-- Gasolina: veiculo deve ser 'carro' ou 'moto'
SELECT 
    'Veículos inválidos' as validacao,
    COUNT(*) as problemas,
    CASE WHEN COUNT(*) = 0 THEN '✅ OK' ELSE '❌ ERRO' END as status
FROM gasolina
WHERE veiculo NOT IN ('carro', 'moto');

-- ============================================
-- 6. VERIFICAR ÍNDICES
-- ============================================
SELECT 
    '📑 ÍNDICES' as secao,
    '' as detalhes;

SELECT 
    tablename as tabela,
    COUNT(*) as indices
FROM pg_indexes
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY indices DESC;

-- Total de índices
SELECT 
    COUNT(*) as total_indices,
    CASE 
        WHEN COUNT(*) >= 20 THEN '✅ ÍNDICES OK'
        ELSE '⚠️ POUCOS ÍNDICES'
    END as status
FROM pg_indexes
WHERE schemaname = 'public';

-- ============================================
-- 7. VERIFICAR VIEWS
-- ============================================
SELECT 
    '👁️ VIEWS' as secao,
    '' as detalhes;

SELECT 
    table_name as view_name,
    CASE 
        WHEN table_name IN ('vw_resumo_mensal', 'vw_patrimonio_liquido', 'vw_gastos_por_categoria') 
        THEN '✅ OK' 
        ELSE '📝 Personalizada' 
    END as tipo
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verificar se views esperadas existem
SELECT 
    CASE 
        WHEN COUNT(*) >= 3 THEN '✅ Views principais criadas'
        ELSE '❌ FALTAM VIEWS'
    END as status,
    COUNT(*) as total
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name IN ('vw_resumo_mensal', 'vw_patrimonio_liquido', 'vw_gastos_por_categoria');

-- ============================================
-- 8. VERIFICAR FUNCTIONS
-- ============================================
SELECT 
    '⚙️ FUNCTIONS' as secao,
    '' as detalhes;

SELECT 
    routine_name as function_name,
    routine_type as tipo
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- ============================================
-- 9. VERIFICAR TRIGGERS
-- ============================================
SELECT 
    '🔄 TRIGGERS' as secao,
    '' as detalhes;

SELECT 
    trigger_name,
    event_object_table as tabela,
    event_manipulation as evento
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Verificar trigger de gasolina
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Trigger de gasolina OK'
        ELSE '❌ FALTA TRIGGER'
    END as status
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name LIKE '%gasolina%' OR event_object_table = 'gasolina';

-- ============================================
-- 10. TESTAR CÁLCULOS AUTOMÁTICOS
-- ============================================
SELECT 
    '🧮 CÁLCULOS' as secao,
    '' as detalhes;

-- Total de receitas
SELECT 
    'Receitas Totais' as metrica,
    COALESCE(SUM(valor), 0) as valor,
    COUNT(*) as quantidade
FROM salaries;

-- Total de gastos (mês atual)
SELECT 
    'Gastos Mês Atual' as metrica,
    COALESCE(SUM(valor), 0) as valor,
    COUNT(*) as quantidade
FROM gastos
WHERE EXTRACT(YEAR FROM data) = EXTRACT(YEAR FROM CURRENT_DATE)
  AND EXTRACT(MONTH FROM data) = EXTRACT(MONTH FROM CURRENT_DATE);

-- Total de parcelas ativas
SELECT 
    'Parcelas Ativas' as metrica,
    COALESCE(SUM(valor_parcela), 0) as valor_mensal,
    COUNT(*) as quantidade
FROM compras_parceladas
WHERE finalizada = FALSE;

-- Total de gasolina (mês atual)
SELECT 
    'Gasolina Mês Atual' as metrica,
    COALESCE(SUM(valor), 0) as valor,
    COUNT(*) as abastecimentos
FROM gasolina
WHERE EXTRACT(YEAR FROM data) = EXTRACT(YEAR FROM CURRENT_DATE)
  AND EXTRACT(MONTH FROM data) = EXTRACT(MONTH FROM CURRENT_DATE);

-- Patrimônio Líquido
SELECT 
    'Patrimônio Líquido' as metrica,
    (SELECT COALESCE(SUM(valor), 0) FROM patrimonio WHERE ativo = TRUE) +
    (SELECT COALESCE(SUM(valor), 0) FROM investimentos WHERE ativo = TRUE) -
    (SELECT COALESCE(SUM(valor_total - valor_pago), 0) FROM dividas WHERE quitada = FALSE) as valor,
    NULL::bigint as quantidade;

-- ============================================
-- 11. VERIFICAR PREÇO POR LITRO (TRIGGER)
-- ============================================
SELECT 
    '⛽ VERIFICAR TRIGGER GASOLINA' as secao,
    '' as detalhes;

-- Verificar se preço_litro está calculado corretamente
SELECT 
    id,
    veiculo,
    valor,
    litros,
    preco_litro,
    ROUND((valor / litros)::numeric, 3) as preco_esperado,
    CASE 
        WHEN preco_litro IS NULL AND litros IS NULL THEN '✅ OK (sem litros)'
        WHEN ABS(preco_litro - (valor / litros)) < 0.01 THEN '✅ OK'
        ELSE '❌ ERRO'
    END as status
FROM gasolina
WHERE litros IS NOT NULL
LIMIT 10;

-- ============================================
-- 12. RESUMO FINAL
-- ============================================
SELECT 
    '📊 RESUMO FINAL' as secao,
    '' as detalhes;

SELECT 
    '✅ Tabelas' as item,
    (SELECT COUNT(*) FROM information_schema.tables 
     WHERE table_schema = 'public' AND table_type = 'BASE TABLE') as quantidade,
    '16 esperadas' as esperado
UNION ALL
SELECT 
    '✅ Categorias',
    (SELECT COUNT(*) FROM categorias),
    '14+ esperadas'
UNION ALL
SELECT 
    '✅ Usuários',
    (SELECT COUNT(*) FROM users),
    '1+ esperado'
UNION ALL
SELECT 
    '✅ Views',
    (SELECT COUNT(*) FROM information_schema.views WHERE table_schema = 'public'),
    '3+ esperadas'
UNION ALL
SELECT 
    '✅ Functions',
    (SELECT COUNT(*) FROM information_schema.routines 
     WHERE routine_schema = 'public' AND routine_type = 'FUNCTION'),
    '2+ esperadas'
UNION ALL
SELECT 
    '✅ Índices',
    (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public'),
    '20+ esperados';

-- ============================================
-- 13. ALERTAS E RECOMENDAÇÕES
-- ============================================
SELECT 
    '⚠️ ALERTAS' as secao,
    '' as detalhes;

-- Cartões com alta utilização (> 80%)
SELECT 
    '🔴 Cartões acima de 80%' as alerta,
    nome,
    ROUND((gasto_atual / limite) * 100, 2) as percentual_usado
FROM cartoes
WHERE ativo = TRUE 
  AND (gasto_atual / limite) > 0.8
ORDER BY percentual_usado DESC;

-- Metas próximas do prazo
SELECT 
    '⏰ Metas com prazo próximo' as alerta,
    nome,
    prazo_final,
    ROUND((valor_atual / valor_alvo) * 100, 2) as progresso
FROM metas
WHERE concluida = FALSE
  AND prazo_final IS NOT NULL
  AND prazo_final <= CURRENT_DATE + INTERVAL '30 days'
ORDER BY prazo_final;

-- Orçamentos estourados
SELECT 
    '💸 Orçamentos estourados' as alerta,
    c.nome as categoria,
    o.limite,
    COALESCE(SUM(g.valor), 0) as gasto_atual
FROM orcamentos o
LEFT JOIN categorias c ON o.categoria_id = c.id
LEFT JOIN gastos g ON c.id = g.categoria_id
  AND EXTRACT(YEAR FROM g.data) = EXTRACT(YEAR FROM CURRENT_DATE)
  AND EXTRACT(MONTH FROM g.data) = EXTRACT(MONTH FROM CURRENT_DATE)
GROUP BY c.nome, o.limite
HAVING COALESCE(SUM(g.valor), 0) > o.limite;

-- ============================================
-- 14. ESTATÍSTICAS DE USO
-- ============================================
SELECT 
    '📈 ESTATÍSTICAS' as secao,
    '' as detalhes;

-- Gastos por categoria (top 5)
SELECT 
    'Top 5 Categorias' as tipo,
    c.nome as categoria,
    COUNT(g.id) as quantidade,
    SUM(g.valor) as total
FROM gastos g
JOIN categorias c ON g.categoria_id = c.id
WHERE EXTRACT(YEAR FROM g.data) = EXTRACT(YEAR FROM CURRENT_DATE)
  AND EXTRACT(MONTH FROM g.data) = EXTRACT(MONTH FROM CURRENT_DATE)
GROUP BY c.nome
ORDER BY total DESC
LIMIT 5;

-- Usuário que mais gasta
SELECT 
    'Usuário que mais gasta' as tipo,
    u.nome as usuario,
    COUNT(g.id) as transacoes,
    SUM(g.valor) as total
FROM gastos g
JOIN users u ON g.usuario_id = u.id
WHERE EXTRACT(YEAR FROM g.data) = EXTRACT(YEAR FROM CURRENT_DATE)
  AND EXTRACT(MONTH FROM g.data) = EXTRACT(MONTH FROM CURRENT_DATE)
GROUP BY u.nome
ORDER BY total DESC
LIMIT 1;

-- ============================================
-- FIM DA VERIFICAÇÃO
-- ============================================
SELECT 
    '🎉 VERIFICAÇÃO COMPLETA!' as mensagem,
    'Revise os resultados acima' as instrucao;

