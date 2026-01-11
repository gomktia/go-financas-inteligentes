-- Drop view first to allow column renames
DROP VIEW IF EXISTS vw_resumo_mensal CASCADE;

-- view com nomes compatíveis com o frontend
CREATE OR REPLACE VIEW vw_resumo_mensal AS
WITH calculos AS (
    SELECT 
        EXTRACT(YEAR FROM CURRENT_DATE) as ano,
        EXTRACT(MONTH FROM CURRENT_DATE) as mes,
        (SELECT COALESCE(SUM(valor), 0) FROM salarios) as receitas_total,
        (SELECT COALESCE(SUM(valor), 0) FROM gastos 
         WHERE EXTRACT(YEAR FROM data) = EXTRACT(YEAR FROM CURRENT_DATE)
           AND EXTRACT(MONTH FROM data) = EXTRACT(MONTH FROM CURRENT_DATE)) as gastos_mes,
        (SELECT COALESCE(SUM(valor_parcela), 0) FROM compras_parceladas WHERE finalizada = FALSE) as parcelas_mes,
        (SELECT COALESCE(SUM(valor), 0) FROM gasolina 
         WHERE EXTRACT(YEAR FROM data) = EXTRACT(YEAR FROM CURRENT_DATE)
           AND EXTRACT(MONTH FROM data) = EXTRACT(MONTH FROM CURRENT_DATE)) as gasolina_mes,
        (SELECT COALESCE(SUM(valor), 0) FROM assinaturas WHERE ativa = TRUE) as assinaturas_mes,
        (SELECT COALESCE(SUM(valor), 0) FROM contas_fixas WHERE ativa = TRUE) as contas_fixas_mes,
        0 as ferramentas_mes, -- Mantendo zerado para não quebrar tipagem
        0 as emprestimos_mes -- Mantendo zerado por enquanto
)
SELECT 
    *,
    (gastos_mes + parcelas_mes + gasolina_mes + assinaturas_mes + contas_fixas_mes) as total_saidas,
    (receitas_total - (gastos_mes + parcelas_mes + gasolina_mes + assinaturas_mes + contas_fixas_mes)) as saldo_final,
    NOW() as atualizado_em
FROM calculos;
