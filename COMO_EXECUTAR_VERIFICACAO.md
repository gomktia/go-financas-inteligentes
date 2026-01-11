# 🔍 Como Executar a Verificação do Banco de Dados

## 📋 Passo a Passo

### 1. Acesse o Supabase SQL Editor

👉 **URL Direta:**
```
https://app.supabase.com/project/sfemmeczjhleyqeegwhs/sql/new
```

Ou:
1. Acesse: https://app.supabase.com
2. Selecione seu projeto: `sfemmeczjhleyqeegwhs`
3. No menu lateral, clique em **"SQL Editor"**

---

### 2. Abra o Arquivo de Verificação

Abra o arquivo: `verificacao_banco.sql`

---

### 3. Copiar e Colar

1. Selecione **TODO** o conteúdo do arquivo `verificacao_banco.sql`
2. Copie (Ctrl+C)
3. Cole no SQL Editor do Supabase (Ctrl+V)

---

### 4. Executar

1. Clique no botão **"Run"** (ou pressione Ctrl+Enter)
2. Aguarde alguns segundos
3. Os resultados aparecerão abaixo

---

## 📊 O que o Script Verifica

### ✅ Estrutura
- [x] 16 tabelas criadas
- [x] Colunas corretas em cada tabela
- [x] Tamanho de cada tabela

### ✅ Dados
- [x] Quantidade de registros em cada tabela
- [x] Categorias padrão (14 categorias)
- [x] Usuários cadastrados

### ✅ Integridade
- [x] Foreign keys válidas
- [x] Sem dados órfãos
- [x] Relacionamentos corretos

### ✅ Validações
- [x] Sem valores negativos
- [x] Parcelas consistentes
- [x] Dívidas válidas
- [x] Veículos corretos (carro/moto)

### ✅ Performance
- [x] Índices criados (~25 índices)
- [x] Distribuição de índices

### ✅ Funcionalidades
- [x] Views criadas (3 views)
- [x] Functions criadas (2+ functions)
- [x] Triggers funcionando (gasolina)

### ✅ Cálculos
- [x] Total de receitas
- [x] Total de gastos
- [x] Parcelas ativas
- [x] Patrimônio líquido

### ✅ Alertas
- [x] Cartões com alta utilização
- [x] Metas próximas do prazo
- [x] Orçamentos estourados

### ✅ Estatísticas
- [x] Top 5 categorias de gastos
- [x] Usuário que mais gasta

---

## 📈 Interpretando os Resultados

### ✅ Status: OK
Indica que tudo está correto e funcionando.

### ❌ Status: ERRO
Indica que há um problema que precisa ser corrigido.

### ⚠️ Status: AVISO
Indica algo que merece atenção, mas não é crítico.

---

## 🔧 Exemplos de Resultados Esperados

### 1. Tabelas
```
total_tabelas | status
--------------|-----------------
16            | ✅ CORRETO
```

### 2. Categorias
```
tipo    | quantidade | categorias
--------|------------|------------------------
gasto   | 8          | Alimentação, Transporte...
parcela | 6          | Eletrônicos, Móveis...
```

### 3. Integridade Referencial
```
relacao           | orfaos | status
------------------|--------|--------
gastos → users    | 0      | ✅ OK
salaries → users  | 0      | ✅ OK
```

### 4. Validações
```
validacao                | problemas | status
------------------------|-----------|--------
Gastos negativos        | 0         | ✅ OK
Parcelas inconsistentes | 0         | ✅ OK
```

### 5. Índices
```
total_indices | status
--------------|------------------
25            | ✅ ÍNDICES OK
```

### 6. Views
```
view_name               | tipo
------------------------|--------
vw_resumo_mensal        | ✅ OK
vw_patrimonio_liquido   | ✅ OK
vw_gastos_por_categoria | ✅ OK
```

---

## 🐛 Problemas Comuns

### ❌ "Tabela não encontrada"
**Solução:** Certifique-se de que executou o `database_setup.sql` antes

### ❌ "Views não existem"
**Solução:** Execute a seção de criação de views do `database_setup.sql`

### ❌ "Function não encontrada"
**Solução:** Execute a seção de criação de functions do `database_setup.sql`

### ❌ "Dados órfãos encontrados"
**Solução:** Execute as queries de limpeza:
```sql
-- Deletar gastos sem usuário válido
DELETE FROM gastos 
WHERE usuario_id NOT IN (SELECT id FROM users);

-- Deletar salários sem usuário válido
DELETE FROM salaries 
WHERE usuario_id NOT IN (SELECT id FROM users);
```

---

## 📝 Executar Seções Individuais

Se quiser executar apenas uma parte da verificação:

### Apenas Estrutura
```sql
-- Copie apenas as linhas 1-30 do verificacao_banco.sql
```

### Apenas Integridade
```sql
-- Copie apenas as linhas 60-100 do verificacao_banco.sql
```

### Apenas Cálculos
```sql
-- Copie apenas as linhas 180-230 do verificacao_banco.sql
```

---

## 💾 Salvar Resultados

### Opção 1: Copy/Paste
1. Selecione os resultados
2. Copie e cole em um arquivo `.txt` ou `.csv`

### Opção 2: Screenshot
1. Tire um print dos resultados importantes
2. Guarde para referência

### Opção 3: Exportar (se disponível)
1. Alguns resultados podem ter botão "Export"
2. Salve como CSV

---

## 🔄 Quando Executar

Execute a verificação:

- ✅ **Após criar o banco** (primeira vez)
- ✅ **Após migrar dados** do LocalStorage
- ✅ **Mensalmente** para manutenção
- ✅ **Antes de fazer backup**
- ✅ **Após mudanças grandes** na estrutura
- ✅ **Se houver problemas** no sistema

---

## 📊 Relatório Resumido

Após executar, você terá:

```
📊 RESUMO FINAL
━━━━━━━━━━━━━━━━━━━━━━
✅ Tabelas:    16/16
✅ Categorias: 14/14
✅ Usuários:   2/1+
✅ Views:      3/3
✅ Functions:  3/2+
✅ Índices:    25/20+
━━━━━━━━━━━━━━━━━━━━━━
Status: ✅ TUDO OK
```

---

## 🎯 Próximos Passos

Depois da verificação:

1. ✅ Se tudo estiver OK → Pode fazer deploy!
2. ❌ Se houver erros → Corrija antes de continuar
3. ⚠️ Se houver avisos → Analise e decida se é importante

---

## 📞 Suporte

Se encontrar erros que não sabe corrigir:

1. Copie a mensagem de erro
2. Copie a query que deu erro
3. Anote qual seção (estrutura, integridade, etc.)
4. Peça ajuda com esses detalhes

---

## ✅ Checklist Pós-Verificação

- [ ] Executei o script completo
- [ ] Revisei todos os resultados
- [ ] Não há erros (❌)
- [ ] Corrigi os problemas encontrados
- [ ] Salvei os resultados importantes
- [ ] Banco está pronto para produção

---

**Tudo verificado? Seu banco está pronto! 🎉**

