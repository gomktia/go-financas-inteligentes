# 🚀 Instruções de Setup - Sistema v3.0

## 📌 Visão Geral

Esta é a versão 3.0 do sistema de controle financeiro, com:
- ✅ Integração completa com **Supabase** (substituindo localStorage)
- ✅ **Soft Delete** (exclusão segura com possibilidade de restauração)
- ✅ **Lixeira** com retenção de 30 dias
- ✅ **Materialized Views** para dashboard 30-40x mais rápido
- ✅ **Auditoria** completa de quem fez o quê e quando
- ✅ **Loading states** e feedback visual

---

## 🛠️ Passo a Passo

### 1️⃣ Criar Projeto no Supabase

1. Acesse: https://supabase.com
2. Clique em **"New Project"**
3. Escolha:
   - **Nome:** `financeiro-familiar` (ou o que preferir)
   - **Database Password:** Crie uma senha forte
   - **Region:** `South America (São Paulo)` ou mais próxima
4. Aguarde ~2 minutos para provisionar
5. Anote:
   - **Project URL:** `https://SEU-PROJETO.supabase.co`
   - **API Key (anon/public):** encontrada em `Settings → API`

---

### 2️⃣ Configurar Banco de Dados

1. No Supabase, vá em **SQL Editor** (menu lateral)
2. Clique em **"New query"**
3. Abra o arquivo **`EXECUTAR_AGORA.sql`** (na raiz do projeto)
4. **Copie TODO o conteúdo** do arquivo
5. **Cole** no SQL Editor do Supabase
6. Clique em **"Run"** (ou pressione `Ctrl+Enter`)
7. Aguarde executar (~10 segundos)
8. Verifique se não há erros (deve aparecer mensagem de sucesso)

**O que este SQL faz:**
- Cria todas as tabelas (gastos, parcelas, gasolina, etc.)
- Adiciona colunas de soft delete (deletado, deletado_em, deletado_por)
- Cria índices para performance
- Cria materialized view para dashboard rápido
- Cria funções `soft_delete()` e `soft_undelete()`
- Adiciona constraints e validações

---

### 3️⃣ Configurar Frontend

1. Abra o arquivo **`index-v3.html`** em um editor de código
2. Encontre a seção (linhas ~95-99):

```javascript
const SUPABASE_CONFIG = {
    url: 'https://SEU-PROJETO.supabase.co',
    anonKey: 'SUA-CHAVE-ANONIMA-AQUI'
};
```

3. **Substitua:**
   - `url`: Cole a URL do seu projeto Supabase
   - `anonKey`: Cole a chave **anon/public** (não a chave **service_role**!)

4. Salve o arquivo

**Exemplo:**
```javascript
const SUPABASE_CONFIG = {
    url: 'https://xyzabc123.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSI...'
};
```

---

### 4️⃣ Inserir Dados Iniciais

Antes de abrir o app, insira pelo menos 1 usuário e 1 salário:

1. No Supabase, vá em **SQL Editor**
2. Execute este SQL:

```sql
-- Inserir usuário de teste
INSERT INTO users (nome, tipo, deletado)
VALUES ('João Silva', 'Pessoa', false);

-- Inserir salário (substitua usuario_id pelo ID retornado acima)
INSERT INTO salaries (valor, usuario_id, mes, deletado)
VALUES (5000.00, 1, '2025-10', false);
```

3. Clique em **"Run"**
4. Verifique na aba **"Table Editor"** se os dados foram inseridos

---

### 5️⃣ Abrir o Sistema

1. Abra o arquivo **`index-v3.html`** em um navegador moderno:
   - Google Chrome (recomendado)
   - Microsoft Edge
   - Firefox
   - Safari

2. Ou use um servidor local:
```bash
# Se tiver Python instalado:
python -m http.server 8000

# Se tiver Node.js:
npx live-server

# Depois acesse: http://localhost:8000/index-v3.html
```

---

### 6️⃣ Verificar Funcionamento

✅ **Checklist Rápido:**

- [ ] App abre sem erros no console (F12)
- [ ] Mostra loading spinner inicial
- [ ] Dashboard carrega com valores
- [ ] Seletor de usuário mostra "João Silva (Pessoa)"
- [ ] Botão de tema (☀️/🌙) funciona
- [ ] Menu lateral (Dashboard, Gastos, Lixeira) funciona

Se tudo estiver OK, **parabéns!** 🎉 Seu sistema está funcionando!

---

## 🧪 Testar Funcionalidades

### Teste 1: Criar Gasto

1. Clique em **"Gastos"** no menu lateral
2. Clique em **"+ Novo Gasto"**
3. Preencha:
   - Descrição: `Mercado`
   - Valor: `250.00`
   - Categoria: `Alimentação`
   - Tipo Pagamento: `PIX`
   - Data: Hoje
4. Clique em **"Salvar"**
5. Gasto deve aparecer na lista

### Teste 2: Deletar Gasto (Soft Delete)

1. Na lista de gastos, clique no ícone **🗑️**
2. Confirme a exclusão
3. Gasto desaparece da lista
4. Clique em **"Lixeira"** no menu
5. Gasto deve aparecer lá com data de exclusão

### Teste 3: Restaurar Gasto

1. Na Lixeira, clique em **"↺ Restaurar"**
2. Confirme
3. Gasto volta para a lista de gastos
4. Dashboard atualiza valores

### Teste 4: Dashboard com Materialized View

1. Crie vários gastos, parcelas, etc.
2. Volte ao Dashboard
3. Valores devem aparecer instantaneamente (< 1 segundo)
4. Veja a data de "Última atualização" no topo

---

## 🔧 Solução de Problemas

### ❌ Erro: "Failed to fetch"

**Causa:** URL ou chave do Supabase incorretas

**Solução:**
1. Verifique se copiou corretamente a URL e chave
2. Verifique se o projeto Supabase está ativo
3. Abra o console (F12) e veja o erro detalhado

---

### ❌ Erro: "relation mv_dashboard_mensal does not exist"

**Causa:** SQL `EXECUTAR_AGORA.sql` não foi executado

**Solução:**
1. Vá no Supabase → SQL Editor
2. Execute o arquivo `EXECUTAR_AGORA.sql` novamente
3. Recarregue a página

---

### ❌ Erro: "function soft_delete does not exist"

**Causa:** Funções não foram criadas

**Solução:**
1. Execute `EXECUTAR_AGORA.sql` completo
2. Verifique se não há erros no SQL Editor

---

### ❌ Dashboard vazio

**Causa:** Nenhum usuário ou salário cadastrado

**Solução:**
1. Insira dados iniciais (Passo 4)
2. Recarregue a página

---

### ❌ Lixeira não mostra itens deletados

**Causa:** Itens deletados há mais de 30 dias ou query incorreta

**Solução:**
1. Delete um item novo
2. Vá na Lixeira
3. Deve aparecer imediatamente

---

### ❌ "Loading..." infinito

**Causa:** Erro de conexão com Supabase

**Solução:**
1. Abra console (F12)
2. Veja erro na aba "Network"
3. Verifique credenciais Supabase
4. Verifique internet

---

## 📚 Próximos Passos

Agora que o sistema está funcionando, você pode:

1. **Personalizar:** Adicione mais usuários, categorias, etc.
2. **Expandir:** Implemente modais completos para todas entidades
3. **Melhorar:** Adicione filtros, busca, exportação (veja `O_QUE_FALTA.md`)
4. **Deploy:** Hospede em Vercel, Netlify ou GitHub Pages

---

## 📖 Documentação Adicional

- **`GUIA_MIGRACAO_FRONTEND.md`** - Detalhes técnicos da migração
- **`CHECKLIST_TESTES.md`** - Checklist completo de testes
- **`ANALISE_FRONTEND.md`** - Análise das melhorias implementadas
- **`O_QUE_FALTA.md`** - Roadmap de features futuras

---

## 🆘 Suporte

Se encontrar problemas:

1. Verifique o console do navegador (F12)
2. Verifique a aba "Network" para ver requisições falhando
3. Verifique logs do Supabase (Logs → All logs)
4. Revise este guia passo a passo

---

## ✨ Diferenças entre v2.0 e v3.0

| Feature | v2.0 | v3.0 |
|---------|------|------|
| **Armazenamento** | localStorage | ☁️ Supabase Cloud |
| **Delete** | Hard (perda permanente) | 🔄 Soft (restaurável) |
| **Lixeira** | ❌ Não | ✅ 30 dias |
| **Performance** | Lenta (calcular tudo) | ⚡ 30-40x mais rápido (MV) |
| **Auditoria** | ❌ Não | ✅ Completa |
| **Multi-device** | ❌ Não (local) | ✅ Sim (cloud) |
| **Backup** | ❌ Manual | ✅ Automático (Supabase) |
| **Colaboração** | ❌ Não | ✅ Sim (multi-usuário) |

---

## 🎉 Conclusão

Você agora tem um sistema de controle financeiro:
- ✅ Profissional
- ✅ Escalável
- ✅ Seguro (soft delete + auditoria)
- ✅ Rápido (materialized views)
- ✅ Moderno (Supabase + React)

**Bom uso e controle financeiro! 💰📊**

---

**Versão:** 3.0
**Data:** Outubro 2025
**Autor:** Sistema de Controle Financeiro Familiar
