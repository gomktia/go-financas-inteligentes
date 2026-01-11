# 🎯 Implementação Completa dos Desafios

## 🚀 Visão Geral

Este documento detalha a implementação completa de todas as funcionalidades solicitadas.

---

## 1. 📧 SISTEMA DE CONVITES

### **Como funciona:**

#### **Enviar Convite:**
```typescript
// Pai cria família
createFamilia({
  nome: 'Família Silva',
  modo_calculo: 'familiar'
})

// Envia convite para esposa
createConvite({
  familia_id: 1,
  email: 'esposa@email.com',
  dias_validade: 7
})

// Sistema gera:
// - Código: XPTO12ABCD
// - Link: https://seu-app.com/convite/XPTO12ABCD
// - Expira em: 7 dias
```

#### **Aceitar Convite:**
```typescript
// Esposa recebe email com link
// Clica no link
// → Tela de aceitar convite
// → Mostra: "Você foi convidado para Família Silva"
// → Botão: Aceitar / Recusar

// Ao aceitar:
aceitarConvite({
  conviteId: 123,
  usuarioId: 5
})

// Resultado:
// - Esposa adicionada como 'membro'
// - Acesso total ao dashboard familiar
// - Pode adicionar gastos
```

### **Implementado:**
- ✅ Hook `useConvites()`
- ✅ Criar convite com email
- ✅ Código único
- ✅ Data de expiração
- ✅ Aceitar/Recusar
- ✅ Link compartilhável
- 🟡 Página `/convite/[codigo]` (a criar)
- 🟡 Envio de email (opcional)

---

## 2. 👶 CADASTRO DE DEPENDENTES

### **Como funciona:**

```typescript
// Pai adiciona filhos
addMembro({
  familia_id: 1,
  usuario_id: 10, // ID do filho criado
  papel: 'dependente'
})

// Filho criado com tipo especial
createUser({
  nome: 'João Silva Jr',
  email: 'joao.jr@email.com', // opcional
  tipo: 'pessoa',
  idade: 12, // menor de idade
  responsavel_id: 1 // ID do pai
})
```

### **Permissões de Dependente:**
- ✅ Ver dashboard familiar
- ✅ Adicionar gastos (ex: mesada gasta)
- ❌ Não pode deletar gastos de outros
- ❌ Não pode ver valores de salário
- ❌ Não pode remover membros
- ❌ Não pode mudar configurações

### **Implementado:**
- ✅ Campo `papel` em `familia_membros`
- ✅ Papel 'dependente' no hook
- ✅ Listagem de dependentes
- 🟡 Permissões granulares (RLS no Supabase)
- 🟡 UI de cadastro de dependente

---

## 3. 💰 SOMA DE SALÁRIOS DA FAMÍLIA

### **Como funciona:**

#### **Cadastro de Salários:**
```typescript
// Pai
createSalario({
  usuario_id: 1,
  valor: 5000,
  mes: '2025-10',
  familia_id: 1,
  visivel_familia: true  // ← Incluir na soma
})

// Mãe
createSalario({
  usuario_id: 2,
  valor: 4000,
  mes: '2025-10',
  familia_id: 1,
  visivel_familia: true
})

// Dashboard familiar:
// Receitas Total: R$ 9.000 (5k + 4k)
```

#### **Cálculo Automático:**
```sql
-- Materialized view atualizada
SELECT 
  SUM(s.valor) as receitas_total
FROM salaries s
INNER JOIN familia_membros fm ON s.usuario_id = fm.usuario_id
WHERE fm.familia_id = 1
  AND s.visivel_familia = true
  AND s.mes = current_month()
```

### **Implementado:**
- ✅ Campo `familia_id` em salaries
- ✅ Campo `visivel_familia` (bool)
- ✅ View agregada
- 🟡 UI para gerenciar salários
- 🟡 Toggle "Incluir na família"

---

## 4. 📊 DASHBOARD PESSOAL vs FAMILIAR

### **Como funciona:**

#### **No Header - Toggle:**
```tsx
<ToggleGroup>
  <Button active={modo === 'pessoal'}>
    👤 Meus Gastos
  </Button>
  <Button active={modo === 'familiar'}>
    👨‍👩‍👧‍👦 Família
  </Button>
</ToggleGroup>
```

#### **Dashboard Pessoal:**
```typescript
// Mostra apenas gastos do usuário atual
const { data } = useQuery({
  queryKey: ['dashboard-pessoal', userId],
  queryFn: () => supabase
    .from('gastos')
    .select('*')
    .eq('usuario_id', userId)
    .eq('deletado', false)
})

// Receitas: Apenas meu salário
// Despesas: Apenas meus gastos
// Saldo: Meu saldo individual
```

#### **Dashboard Familiar:**
```typescript
// Mostra gastos de todos os membros
const { data } = useQuery({
  queryKey: ['dashboard-familiar', familiaId],
  queryFn: () => supabase
    .from('gastos')
    .select('*')
    .eq('familia_id', familiaId)
    .eq('visivel_familia', true) // ← Apenas não-privados
    .eq('deletado', false)
})

// Receitas: Soma de todos salários
// Despesas: Soma de todos gastos
// Saldo: Saldo da família
```

#### **Ao Adicionar Gasto:**
```tsx
<Checkbox 
  label="Incluir no dashboard familiar"
  checked={incluirFamilia}
  onChange={setIncluirFamilia}
/>

// Se marcado:
// - visivel_familia = true
// - Aparece no dashboard familiar

// Se desmarcado:
// - visivel_familia = false  
// - Apenas no dashboard pessoal
```

### **Implementado:**
- ✅ Tipos atualizados
- ✅ Campo `visivel_familia`
- 🟡 Toggle no header
- 🟡 Dashboard pessoal
- 🟡 Checkbox em formulários

---

## 5. 🔒 GASTOS PRIVADOS

### **Como funciona:**

#### **Ao Criar Gasto:**
```tsx
<form>
  <Input name="descricao" />
  <Input name="valor" />
  
  <Checkbox 
    label="🔒 Privado (só eu vejo)"
    checked={privado}
    onChange={setPrivado}
  />
</form>

// Se marcado:
createGasto({
  descricao: 'Compra íntima',
  valor: 150,
  privado: true,           // ← Apenas criador vê
  visivel_familia: false   // ← Não aparece para família
})
```

#### **Filtros Automáticos:**
```typescript
// Quando outros membros listam gastos:
const { data } = await supabase
  .from('gastos')
  .select('*')
  .eq('familia_id', familiaId)
  .or(`privado.eq.false,usuario_id.eq.${currentUserId}`)
  // ↑ Mostra: gastos não-privados OU meus gastos privados
```

#### **Indicador Visual:**
```tsx
{gasto.privado && (
  <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
    🔒 Privado
  </span>
)}
```

### **Implementado:**
- ✅ Campo `privado` no tipo
- ✅ Tipo TypeScript atualizado
- 🟡 Checkbox em formulários
- 🟡 Filtros nas queries
- 🟡 Indicador visual
- 🟡 RLS policies (Supabase)

---

## 6. 🏢 PERFIL DE EMPRESA

### **Como funciona:**

#### **Estrutura:**
```typescript
Usuário: João
├── Perfil 1: Pessoal
│   └── Família Silva
├── Perfil 2: MEI Tech (Empresa)
│   └── Gastos profissionais
└── Perfil 3: Startup XYZ (Sócio)
    └── Gastos da startup
```

#### **Seletor de Perfil no Header:**
```tsx
<Select>
  <Option value="pessoal">
    🏠 Pessoal (Família Silva)
  </Option>
  <Option value="mei">
    🏢 MEI Tech (Empresa)
  </Option>
  <Option value="startup">
    💼 Startup XYZ (Sócio)
  </Option>
</Select>
```

#### **Funcionamento:**
```typescript
// Ao selecionar perfil:
setPerfilAtivo('mei')

// Todas as queries filtram por perfil:
const gastos = await supabase
  .from('gastos')
  .select('*')
  .eq('familia_id', perfilAtivo.familia_id)

// Dashboard mostra apenas dados daquele perfil
// Sidebar pode ter páginas diferentes por perfil
```

### **Implementado:**
- ✅ Tipo `PerfilUsuario`
- ✅ Campo `familia_id` em gastos
- 🟡 Tabela `perfis_usuario`
- 🟡 Hook `usePerfis()`
- 🟡 Seletor de perfil
- 🟡 Contexto de perfil ativo

---

## 7. 🎨 CATEGORIAS PERSONALIZADAS

### **Como funciona:**

#### **Criar Categoria:**
```typescript
const { createCategoria } = useCategorias()

createCategoria({
  nome: 'Educação dos Filhos',
  icone: '📚',
  cor: '#FF6B6B',
  ordem: 1
})

createCategoria({
  nome: 'Pet (Cachorro)',
  icone: '🐕',
  cor: '#4ECDC4',
  ordem: 2
})
```

#### **Usar em Gastos:**
```tsx
<Select name="categoria">
  {/* Categorias padrão */}
  <Option>Alimentação</Option>
  <Option>Transporte</Option>
  
  {/* Categorias personalizadas do usuário */}
  <Option>📚 Educação dos Filhos</Option>
  <Option>🐕 Pet (Cachorro)</Option>
</Select>
```

#### **Relatórios Automáticos:**
```typescript
// Sistema cria automaticamente:
// - Card no dashboard para cada categoria
// - Filtro por categoria
// - Gráfico por categoria
```

### **Implementado:**
- ✅ Tipo `CategoriaPersonalizada`
- 🟡 Tabela `categorias_personalizadas`
- 🟡 Hook `useCategorias()`
- 🟡 UI de gerenciar categorias
- 🟡 Select dinâmico

---

## 8. 📄 PÁGINAS PERSONALIZADAS

### **Como funciona:**

#### **Criar Página:**
```typescript
const { createPagina } = usePaginasPersonalizadas()

createPagina({
  nome: 'Educação',
  rota: '/educacao',
  categoria_relacionada: 'Educação dos Filhos',
  icone: '📚',
  cor: '#FF6B6B',
  ordem: 5
})

// Sistema automaticamente:
// - Cria rota /educacao
// - Adiciona à sidebar
// - Filtra gastos da categoria
// - Gera estatísticas
```

#### **Resultado na Sidebar:**
```tsx
Sidebar
├── Dashboard
├── Gastos
├── Parcelas
├── ... (páginas padrão)
├── ──────────────── (separador)
├── 📚 Educação        ← Nova página
├── 🐕 Pet            ← Nova página
└── 🎮 Hobbies        ← Nova página
```

#### **Conteúdo da Página:**
```tsx
// /educacao mostra automaticamente:
- Stats de gastos com educação
- Lista de gastos dessa categoria
- Gráfico de evolução
- Formulário para adicionar (já com categoria pré-selecionada)
```

### **Implementado:**
- ✅ Tipo `PaginaPersonalizada`
- 🟡 Tabela `paginas_personalizadas`
- 🟡 Hook `usePaginas()`
- 🟡 Geração dinâmica de rotas
- 🟡 Sidebar dinâmica
- 🟡 Template de página

---

## 📊 FLUXOS COMPLETOS

### **FLUXO 1: Pai Convida Esposa**

```
1. Pai → Cria família "Silva"
2. Pai → Configurações → "Convidar Membro"
3. Digita email da esposa
4. Clica "Enviar Convite"
5. Sistema:
   - Cria registro em 'convites'
   - Gera código XPTO1234
   - Gera link: /convite/XPTO1234
   - (Opcional) Envia email
6. Pai → Copia link
7. Pai → Envia pelo WhatsApp/Email
8. Esposa → Clica no link
9. Tela mostra:
   - "Você foi convidado para Família Silva"
   - "Modo: Pote Comum"
   - "Convidado por: João Silva"
   - [Aceitar] [Recusar]
10. Esposa → Clica "Aceitar"
11. Sistema:
    - Marca convite como aceito
    - Adiciona esposa como 'membro'
    - Redireciona para dashboard familiar
12. Esposa → Vê dashboard da família!
```

---

### **FLUXO 2: Cadastrar Filhos**

```
1. Pai → Configurações
2. Clica "Adicionar Dependente"
3. Formulário:
   - Nome: Ana Silva
   - Idade: 12 anos
   - Tipo: Dependente
   - Email: (opcional)
   - Senha: (opcional ou gerada)
4. Clica "Adicionar"
5. Sistema:
   - Cria usuário tipo 'pessoa'
   - Adiciona como 'dependente'
   - Permissões limitadas
6. Filho pode:
   - Login com email/senha
   - Ver dashboard familiar
   - Adicionar gastos (mesada)
   - NÃO pode: deletar, configurar
```

---

### **FLUXO 3: Soma de Salários**

```
1. Pai → Adiciona salário:
   - R$ 5.000
   - [✓] Incluir no pote familiar

2. Mãe → Adiciona salário:
   - R$ 4.000
   - [✓] Incluir no pote familiar

3. Dashboard Familiar mostra:
   ┌─────────────────────┐
   │ Receitas da Família │
   ├─────────────────────┤
   │ Pai: R$ 5.000      │
   │ Mãe: R$ 4.000      │
   │ ────────────────── │
   │ Total: R$ 9.000 ✓  │
   └─────────────────────┘

4. Cálculo de saldo:
   Receitas: R$ 9.000
   Despesas: R$ 6.500 (de todos)
   Saldo: R$ 2.500
```

---

### **FLUXO 4: Dashboard Pessoal vs Familiar**

```
1. Usuário → Header → Toggle
   [👤 Pessoal] [👨‍👩‍👧‍👦 Familiar]

2. Modo Pessoal:
   ┌────────────────┐
   │ Meus Gastos    │
   ├────────────────┤
   │ Receita: R$ 5k │ (só meu salário)
   │ Gastos: R$ 2k  │ (só meus gastos)
   │ Saldo: R$ 3k   │ (meu saldo)
   └────────────────┘

3. Modo Familiar:
   ┌────────────────┐
   │ Gastos Família │
   ├────────────────┤
   │ Receita: R$ 9k │ (todos salários)
   │ Gastos: R$ 6.5k│ (todos gastos)
   │ Saldo: R$ 2.5k │ (saldo familiar)
   └────────────────┘

4. Ao adicionar gasto:
   ┌──────────────────────┐
   │ Novo Gasto           │
   ├──────────────────────┤
   │ Descrição: Mercado   │
   │ Valor: R$ 250        │
   │                      │
   │ [✓] Incluir na família │
   │ [ ] Privado          │
   └──────────────────────┘
```

---

### **FLUXO 5: Gasto Privado**

```
1. Pai → Adiciona gasto
   - Descrição: "Presente surpresa"
   - Valor: R$ 300
   - [✓] Privado

2. Sistema salva:
   privado: true
   visivel_familia: false

3. Visualização:
   Pai → Vê o gasto normalmente
   Mãe → NÃO vê o gasto
   Filhos → NÃO veem

4. Dashboard Familiar:
   - Não inclui R$ 300
   - Saldo da família não afetado
   
5. Dashboard Pessoal do Pai:
   - Inclui R$ 300
   - Saldo pessoal afetado
```

---

### **FLUXO 6: Usuário com Empresa**

```
1. João cria 2 famílias:
   ┌────────────────────┐
   │ 🏠 Família Silva   │ (Pessoal)
   │ 🏢 MEI Tech        │ (Empresa)
   └────────────────────┘

2. Header → Seletor:
   [🏠 Família Silva ▼]

3. Ao trocar para MEI Tech:
   - Dashboard muda
   - Gastos filtrados
   - Sidebar pode ter páginas diferentes

4. Adiciona gasto:
   Em: 🏠 Família Silva
   → Mercado R$ 200 (pessoal)
   
   Muda para: 🏢 MEI Tech
   → Hospedagem R$ 50 (profissional)

5. Relatórios separados:
   - Impostos apenas no perfil empresa
   - Despesas pessoais apenas na família
```

---

### **FLUXO 7: Categoria Personalizada**

```
1. Pai → Configurações → Categorias
2. Clica "Nova Categoria"
3. Preenche:
   - Nome: Educação dos Filhos
   - Ícone: 📚
   - Cor: #FF6B6B
4. Salva
5. Ao adicionar gasto:
   Categoria: [📚 Educação dos Filhos ▼]
6. Dashboard mostra:
   Card "📚 Educação": R$ 1.200
```

---

### **FLUXO 8: Página Personalizada**

```
1. Pai → Configurações → Páginas
2. Clica "Nova Página"
3. Preenche:
   - Nome: Educação
   - Categoria: Educação dos Filhos
   - Ícone: 📚
4. Salva
5. Sidebar atualiza:
   ├── ... páginas padrão
   ├── ─────────────
   ├── 📚 Educação    ← NOVA
   └── Lixeira

6. Clica em "Educação"
7. Página mostra:
   - Stats de gastos com educação
   - Lista de gastos
   - Gráfico de evolução
   - Botão "Novo Gasto de Educação"
```

---

## 🗄️ ALTERAÇÕES NO BANCO DE DADOS

### **SQL Necessário:**

```sql
-- 1. Adicionar campos de privacidade em gastos
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS privado BOOLEAN DEFAULT FALSE;
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS visivel_familia BOOLEAN DEFAULT TRUE;
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS familia_id BIGINT REFERENCES familias(id);

-- 2. Adicionar em salaries
ALTER TABLE salaries ADD COLUMN IF NOT EXISTS visivel_familia BOOLEAN DEFAULT TRUE;
ALTER TABLE salaries ADD COLUMN IF NOT EXISTS familia_id BIGINT REFERENCES familias(id);

-- 3. Criar tabela de categorias personalizadas
CREATE TABLE IF NOT EXISTS categorias_personalizadas (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  icone VARCHAR(10),
  cor VARCHAR(7),
  ordem INTEGER DEFAULT 0,
  ativa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Criar tabela de páginas personalizadas
CREATE TABLE IF NOT EXISTS paginas_personalizadas (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  rota VARCHAR(100) UNIQUE NOT NULL,
  categoria_relacionada VARCHAR(100),
  icone VARCHAR(10),
  cor VARCHAR(7),
  ordem INTEGER DEFAULT 0,
  ativa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Criar tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS perfis_usuario (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL, -- 'pessoal', 'empresa'
  nome VARCHAR(100) NOT NULL,
  familia_id BIGINT REFERENCES familias(id),
  ativo BOOLEAN DEFAULT TRUE,
  cor VARCHAR(7),
  icone VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(usuario_id, familia_id)
);

-- 6. Criar tabela de configurações de privacidade
CREATE TABLE IF NOT EXISTS config_privacidade (
  usuario_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  mostrar_salario_familia BOOLEAN DEFAULT TRUE,
  mostrar_gastos_pessoais BOOLEAN DEFAULT TRUE,
  permitir_edicao_outros BOOLEAN DEFAULT FALSE,
  notificar_novos_gastos BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🎯 IMPLEMENTAÇÃO PRÁTICA

Vou criar os arquivos principais agora para você testar:

### **Arquivos a Criar:**
1. ✅ `hooks/use-convites.ts` - Sistema de convites
2. ✅ `types/index.ts` - Tipos atualizados
3. 🔄 `SQL_FEATURES_AVANCADAS.sql` - SQL para rodar
4. 🔄 `components/perfil-selector.tsx` - Seletor de perfil
5. 🔄 `components/dashboard-toggle.tsx` - Toggle pessoal/familiar
6. 🔄 `hooks/use-dashboard-pessoal.ts` - Dashboard do usuário
7. 🔄 `hooks/use-categorias.ts` - Categorias customizadas

Vou começar agora! 🚀

