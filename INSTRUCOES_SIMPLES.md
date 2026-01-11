# QUAL SQL EXECUTAR NO SUPABASE

## RESPOSTA DIRETA:

Execute o arquivo: **`EXECUTAR_ESTE_SQL.sql`**

---

## COMO EXECUTAR:

### Passo 1: Acessar SQL Editor
```
https://supabase.com/dashboard/project/sfemmeczjhleyqeegwhs/sql/new
```

### Passo 2: Copiar o SQL
```
Abra o arquivo: EXECUTAR_ESTE_SQL.sql
Copie TODO o conteudo (Ctrl+A, Ctrl+C)
```

### Passo 3: Colar e Executar
```
Cole no SQL Editor do Supabase
Clique em "RUN" (botao verde)
Aguarde terminar
```

### Passo 4: Verificar
```
Deve aparecer no final:
- status: "Setup completo"
- total_tabelas: 21 (ou mais)
- Lista de todas as tabelas
```

---

## O QUE ESTE SQL FAZ:

1. Adiciona campos novos nas tabelas existentes:
   - tipo (pessoa/empresa) em users
   - tipo_pagamento em gastos, parcelas, gasolina
   - parcelado em emprestimos

2. Cria 5 tabelas novas:
   - familias
   - familia_membros
   - convites
   - transferencias
   - categorias_personalizadas

3. Habilita RLS (seguranca) em todas as 21 tabelas

4. Cria policies (permissoes) para proteger dados

---

## TEMPO:

Execucao: 10-20 segundos

---

## DEPOIS DE EXECUTAR:

As tabelas vao mudar de:
- Unrestricted (vermelho)
- PARA: RLS Enabled (seguro)

---

## PROXIMO PASSO:

Depois de executar, me avise e eu crio o frontend integrado!

---

**ARQUIVO A EXECUTAR: EXECUTAR_ESTE_SQL.sql**

