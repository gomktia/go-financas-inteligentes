# Relatório de Auditoria do Sistema Financeiro

*Data: 10/01/2026*
*Status: Análise Completa*

## 1. Visão Geral
O sistema apresenta uma discrepância significativa entre a estrutura de banco de dados (que contém muitas tabelas legadas ou experimentais) e a aplicação Frontend atual (que foca em gestão financeira pessoal, empresarial e familiar).

O banco de dados atual possui cerca de **50+ tabelas**, enquanto o sistema funcional utiliza apenas **~15 tabelas principais**. Isso causa confusão ("horrível") e dificulta a manutenção.

## 2. Auditoria Frontend (Funcionalidades Ativas)
Os seguintes módulos estão implementados e funcionais no código (`/app` e `/hooks`):

| Módulo | Status | Tabela Associada |
| :--- | :--- | :--- |
| **Dashboard** | ✅ Ativo | `views` (resumos) |
| **Gastos** | ✅ Ativo | `gastos` |
| **Receitas** | ⚠️ Parcial | `salaries` (Precisa padronizar para `salarios`) |
| **Parcelas** | ✅ Ativo | `compras_parceladas` |
| **Gasolina** | ✅ Ativo | `gasolina` |
| **Assinaturas** | ✅ Ativo | `assinaturas` |
| **Contas Fixas** | ✅ Ativo | `contas_fixas` |
| **Cartões** | ✅ Ativo | `cartoes` |
| **Metas** | ✅ Ativo | `metas` |
| **Investimentos**| ✅ Ativo | `investimentos` |
| **Empresa** | ✅ Novo | `empresas`, `contas_empresa`, `transacoes_empresa` |
| **Família** | ✅ Novo | `familias`, `familia_membros` |

## 3. Auditoria Banco de Dados (Problemas Identificados)

### 🔴 Tabelas Obsoletas / Lixo (Recomendação: REMOVER)
Estas tabelas não possuem código ativo no Frontend e estão poluindo o banco:
- 🗑️ **Gamificação**: `conquistas`, `user_gamification`, `score_financeiro`, `ranking_gamification`.
- 🗑️ **Modo Filhos/Kids**: `filho_conquistas`, `gastos_filhos`, `perfis_filhos`, `mesadas`, `mesada_ajustes`.
- 🗑️ **Desafios**: `desafios_familia`, `desafio_progresso`, `desafio_regras`.
- 🗑️ **Wishlist**: `lista_desejos`, `lista_desejos...`.
- 🗑️ **Tarefas**: `tarefas`, `tarefas_concluidas`.
- 🗑️ **Outros**: `ferramentas` (Módulo removido), `acerto_contas`, `alertas_inteligentes`.
- 🗑️ **Backups Desnecessários**: `gastos_backup`, `users_backup`, `users_backup_bigserial`.

### 🟡 Duplicações e Inconsistências
- **Salários**: Existem tabelas `salaries` (Inglês) e `salarios` (Português).
  - *Ação*: Manter apenas `salarios` (padrão PT) e migrar dados.
- **Tags**: Muitas tabelas de tags (`gastos_tags`, `assinaturas_tags` etc) não estão sendo usadas na interface simplificada atual.
  - *Ação*: Simplificar. Manter apenas coluna `categoria` ou tabela unificada se necessário.

### 🟢 Tabelas Essenciais (Manter e Otimizar)
`users`, `gastos`, `compras_parceladas`, `gasolina`, `assinaturas`, `contas_fixas`, `cartoes`, `metas`, `investimentos`, `patrimonio`, `familias`, `familia_membros`, `empresas`.

## 4. Plano de Ação (Script de Correção)

Preparei um script SQL (`FIX_DB_FULL.sql`) que fará o seguinte:

1.  **Limpeza Pesada**: Remove todas as tabelas de Gamificação, Filhos, Desafios e Backups.
2.  **Padronização**:
    - Unifica `salaries` -> `salarios`.
    - Garante que a coluna `compartilhado` (Família) exista em todas as tabelas de despesas.
    - Garante a estrutura do Módulo Empresa.
3.  **Views Otimizadas**: Recria as views `vw_resumo_mensal` e `vw_patrimonio_liquido` para olhar apenas para as tabelas limpas e corretas.

---

**Próximo Passo:** Execute o script `FIX_DB_FULL.sql` no Supabase para aplicar a auditoria.
