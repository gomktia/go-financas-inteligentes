# 🎯 COMO EXECUTAR OS SQLs NO SUPABASE

## 📍 Você está aqui:
Suas tabelas base já existem, mas faltam:
- ✅ Novas tabelas (familias, convites, transferencias, etc.)
- ✅ Novos campos (tipo_pagamento, parcelado, etc.)
- ✅ RLS e Policies (segurança)

---

## 🚀 EXECUTAR AGORA (2 passos)

### **PASSO 1: Adicionar Tabelas Novas**

1. **Acesse o SQL Editor:**
   ```
   https://supabase.com/dashboard/project/sfemmeczjhleyqeegwhs/sql/new
   ```

2. **Abra o arquivo no seu computador:**
   ```
   1_ADICIONAR_TABELAS_NOVAS.sql
   ```

3. **Copie TODO o conteúdo**

4. **Cole no SQL Editor do Supabase**

5. **Clique em "RUN" (ou Ctrl+Enter)**

6. **Aguarde a mensagem:**
   ```
   ✅ Tabelas novas criadas com sucesso!
   ```

**Tempo:** ~10 segundos

---

### **PASSO 2: Habilitar RLS e Segurança**

1. **No mesmo SQL Editor, limpe o campo**

2. **Abra o arquivo:**
   ```
   2_HABILITAR_RLS.sql
   ```

3. **Copie TODO o conteúdo**

4. **Cole no SQL Editor**

5. **Clique em "RUN"**

6. **Aguarde a mensagem:**
   ```
   ✅ RLS habilitado em todas as tabelas!
   ```

**Tempo:** ~5 segundos

---

## ✅ VERIFICAÇÃO

### 1. Checar Table Editor:

Acesse:
```
https://supabase.com/dashboard/project/sfemmeczjhleyqeegwhs/editor
```

**Você deve ver:**
- ✅ Todas as tabelas antigas (16)
- ✅ Novas tabelas:
  - `categorias_personalizadas`
  - `convites`
  - `familia_membros`
  - `familias`
  - `transferencias`

**Total esperado:** ~21 tabelas

### 2. Verificar RLS:

As tabelas devem mostrar status:
- 🔒 **RLS Enabled** (não mais "Unrestricted")

### 3. Testar no SQL:

```sql
-- Ver todas as tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Ver policies
SELECT COUNT(*) as total_policies
FROM pg_policies
WHERE schemaname = 'public';
```

**Esperado:** 15+ policies

---

## 🎨 O Que Cada SQL Faz

### **1_ADICIONAR_TABELAS_NOVAS.sql:**

```
✅ Adiciona campo tipo em users (pessoa/empresa)
✅ Adiciona tipo_pagamento em gastos, parcelas, gasolina
✅ Adiciona parcelamento em empréstimos
✅ Cria tabela familias (grupos)
✅ Cria tabela familia_membros (quem está em cada grupo)
✅ Cria tabela convites (para convidar pessoas)
✅ Cria tabela transferencias (gastos cruzados)
✅ Cria tabela categorias_personalizadas
✅ Cria function gerar_codigo_convite()
```

### **2_HABILITAR_RLS.sql:**

```
🔒 Habilita RLS em TODAS as 21 tabelas
🔒 Cria policies para:
   - Users: vê apenas perfil próprio e da família
   - Gastos: vê apenas da família, edita apenas seus
   - Transferências: vê apenas as suas (de/para você)
   - Convites: admin vê da família, user vê os seus
   - Categorias: família compartilha
   - Outros: permissões adequadas
```

---

## ⚠️ IMPORTANTE

### Se der erro:
1. Leia a mensagem de erro
2. Pode ser que alguma tabela já exista
3. É seguro executar novamente (usa IF NOT EXISTS)

### Se alguma policy já existir:
- O SQL usa `DROP POLICY IF EXISTS`
- Recria automaticamente
- Sem problemas!

---

## 📊 Resultado Esperado

### Antes (atual):
```
16 tabelas
Todas "Unrestricted" 
Sem sistema de família
Sem convites
Sem transferências
```

### Depois:
```
21+ tabelas ✅
Todas com RLS 🔒
Sistema de família ✅
Sistema de convites ✅
Transferências ✅
Categorias custom ✅
Segurança total ✅
```

---

## 🎉 Após Executar

Você terá:
- 🔐 **Segurança:** RLS em tudo
- 👨‍👩‍👧‍👦 **Famílias:** Com sistema de convites
- 💸 **Transferências:** Gastos cruzados
- 🎨 **Categorias:** Personalizáveis
- 💰 **Empréstimos:** Parcelados
- 📊 **Dashboard:** Modo familiar/individual

---

## 🚀 Próximo Passo

Depois de executar os 2 SQLs:

**Quer que eu crie o frontend integrado?**
- index-supabase-v2.html
- Com login/cadastro
- Com todas as funcionalidades

**Digite "SIM" e eu crio! 🎯**

---

## 📁 Arquivos Criados

1. ✅ `1_ADICIONAR_TABELAS_NOVAS.sql` ← Execute PRIMEIRO
2. ✅ `2_HABILITAR_RLS.sql` ← Execute DEPOIS
3. ✅ `COMO_EXECUTAR_SQL.md` ← Este guia

**Tempo total:** ~15 segundos de execução
**Complexidade:** Copiar e colar 2 vezes

**Simples assim! 🎉**

