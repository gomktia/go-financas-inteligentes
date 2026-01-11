# 🗄️ Integração com Supabase - Guia Completo

## ✅ Credenciais Configuradas

### 🔑 Informações do Projeto:
```
Project ID: sfemmeczjhleyqeegwhs
URL: https://sfemmeczjhleyqeegwhs.supabase.co
```

### 🎫 Chaves de API:
```javascript
// Chave Pública (Anon Key) - Use no frontend
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

// Chave Secreta (Service Role) - NUNCA exponha no frontend!
// Use apenas em backend/servidor
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

---

## 🚀 Implementação

### Opção 1: Arquivo Separado (Atual)

**Arquivo:** `supabase.config.js`
```javascript
const SUPABASE_CONFIG = {
  url: 'https://sfemmeczjhleyqeegwhs.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
};
```

**Uso no HTML:**
```html
<script src="supabase.config.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
  const supabase = supabase.createClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.anonKey
  );
</script>
```

---

### Opção 2: Integração Direta (Recomendado)

**Criar:** `index-com-supabase.html`

1. **Adicionar CDN do Supabase:**
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

2. **Inicializar Cliente:**
```javascript
const supabase = supabase.createClient(
  'https://sfemmeczjhleyqeegwhs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
);
```

3. **Substituir LocalStorage:**
```javascript
// Antes:
localStorage.setItem('finData', JSON.stringify(data));

// Depois:
await supabase.from('users').upsert(data.users);
await supabase.from('gastos').upsert(data.exp);
// ... etc
```

---

## 📊 Estrutura do Banco

### Tabelas Existentes (16 tabelas):
1. ✅ `users` - Usuários da família
2. ✅ `salaries` - Salários/receitas
3. ✅ `categorias` - Categorias (com personalizadas!)
4. ✅ `gastos` - Gastos variáveis
5. ✅ `compras_parceladas` - Parcelas
6. ✅ `gasolina` - Abastecimentos
7. ✅ `assinaturas` - Serviços
8. ✅ `contas_fixas` - Contas mensais
9. ✅ `cartoes` - Cartões de crédito
10. ✅ `metas` - Metas de economia
11. ✅ `orcamentos` - Orçamentos por categoria
12. ✅ `ferramentas` - IA/Dev tools
13. ✅ `investimentos` - Investimentos
14. ✅ `patrimonio` - Bens e imóveis
15. ✅ `dividas` - Dívidas/financiamentos
16. ✅ `emprestimos` - Empréstimos

---

## 🔄 Funcionalidades que o Supabase Resolve

### 1. ✅ **Autenticação Real**
```javascript
// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'usuario@email.com',
  password: 'senha'
});

// Registro
const { data, error } = await supabase.auth.signUp({
  email: 'usuario@email.com',
  password: 'senha'
});
```

### 2. ✅ **Sistema de Convites (Família)**
```javascript
// 1. Criar família/grupo
await supabase.from('familias').insert({
  nome: 'Família Silva',
  admin_id: user.id
});

// 2. Gerar convite
const convite = await supabase.from('convites').insert({
  familia_id: familia.id,
  email: 'esposa@email.com',
  codigo: generateCode(), // Ex: ABC123
  expira_em: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
});

// 3. Enviar email com link
// http://app.com/convite/ABC123

// 4. Aceitar convite
await supabase.from('familia_membros').insert({
  familia_id: familia.id,
  usuario_id: esposa.id
});
```

### 3. ✅ **Transferências Entre Membros**
```javascript
// Você gastou R$ 200 no cartão da esposa
await supabase.from('transferencias').insert({
  de_usuario_id: você.id,        // Quem deve
  para_usuario_id: esposa.id,    // Quem pagou
  valor: 200,
  descricao: 'Compra no cartão',
  tipo: 'pendente'
});

// No dashboard dela: não aparece como gasto dela
// No dashboard seu: aparece como pendência
```

### 4. ✅ **Modo de Cálculo (Individual vs Familiar)**
```javascript
// Configuração por família
await supabase.from('familias').update({
  modo_calculo: 'familiar' // ou 'individual'
}).eq('id', familia.id);

// Se familiar: soma todos os salários
// Se individual: cada um paga suas contas
```

---

## 🎯 Resolvendo os 4 Desafios com Supabase

### Desafio 1: Categorias Personalizadas ✅
```javascript
// Criar categoria personalizada
await supabase.from('categorias').insert({
  nome: 'Pet Shop',
  cor: '#FF6B6B',
  tipo: 'gasto',
  usuario_id: user.id  // Categoria do usuário
});

// Usar em dropdown
const { data } = await supabase
  .from('categorias')
  .select('*')
  .or(`usuario_id.eq.${user.id},usuario_id.is.null`);
```

### Desafio 2: Sistema de Convites ✅
```sql
-- Tabela de famílias
CREATE TABLE familias (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(255),
  admin_id BIGINT REFERENCES users(id),
  modo_calculo VARCHAR(20) DEFAULT 'familiar'
);

-- Tabela de membros
CREATE TABLE familia_membros (
  familia_id BIGINT REFERENCES familias(id),
  usuario_id BIGINT REFERENCES users(id),
  papel VARCHAR(50) DEFAULT 'membro',
  PRIMARY KEY (familia_id, usuario_id)
);

-- Tabela de convites
CREATE TABLE convites (
  id BIGSERIAL PRIMARY KEY,
  familia_id BIGINT REFERENCES familias(id),
  email VARCHAR(255),
  codigo VARCHAR(20) UNIQUE,
  expira_em TIMESTAMP,
  aceito BOOLEAN DEFAULT FALSE
);
```

### Desafio 3: Transferências/Dívidas Internas ✅
```sql
CREATE TABLE transferencias (
  id BIGSERIAL PRIMARY KEY,
  de_usuario_id BIGINT REFERENCES users(id),
  para_usuario_id BIGINT REFERENCES users(id),
  valor DECIMAL(15,2),
  descricao VARCHAR(255),
  tipo_gasto VARCHAR(100),
  data DATE,
  pago BOOLEAN DEFAULT FALSE
);
```

**Query para dashboard:**
```javascript
// Gastos que você fez (incluindo no cartão de outros)
const meusGastos = await supabase
  .from('transferencias')
  .select('*')
  .eq('de_usuario_id', user.id);

// Gastos que outros fizeram no seu cartão
const gastosNoMeuCartao = await supabase
  .from('transferencias')
  .select('*')
  .eq('para_usuario_id', user.id);
```

### Desafio 4: Modo Familiar/Individual ✅
```javascript
// No config da família
const familia = await supabase
  .from('familias')
  .select('modo_calculo')
  .eq('id', familia_id)
  .single();

if (familia.modo_calculo === 'familiar') {
  // Soma TODOS os salários da família
  const receita = await supabase
    .from('salaries')
    .select('valor')
    .in('usuario_id', membros_ids);
    
  // TODOS os gastos vêm do pote comum
} else {
  // Cada um paga suas contas individuais
  const receita = await supabase
    .from('salaries')
    .select('valor')
    .eq('usuario_id', user.id);
}
```

---

## 📋 Schema Completo Necessário

```sql
-- 1. Adicionar campo tipo em users
ALTER TABLE users ADD COLUMN tipo VARCHAR(20) DEFAULT 'pessoa';
ALTER TABLE users ADD CONSTRAINT tipo_valido CHECK (tipo IN ('pessoa', 'empresa'));

-- 2. Adicionar tipo_pagamento em gastos
ALTER TABLE gastos ADD COLUMN tipo_pagamento VARCHAR(50);

-- 3. Adicionar tipo_pagamento em compras_parceladas
ALTER TABLE compras_parceladas ADD COLUMN tipo_pagamento VARCHAR(50);

-- 4. Adicionar tipo_pagamento em gasolina
ALTER TABLE gasolina ADD COLUMN tipo_pagamento VARCHAR(50);

-- 5. Adicionar parcelamento em emprestimos
ALTER TABLE emprestimos ADD COLUMN parcelado BOOLEAN DEFAULT FALSE;
ALTER TABLE emprestimos ADD COLUMN total_parcelas INTEGER DEFAULT 1;
ALTER TABLE emprestimos ADD COLUMN parcelas_pagas INTEGER DEFAULT 0;
ALTER TABLE emprestimos ADD COLUMN valor_parcela DECIMAL(15,2);

-- 6. Criar tabela de famílias
CREATE TABLE familias (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  admin_id BIGINT REFERENCES users(id),
  modo_calculo VARCHAR(20) DEFAULT 'familiar',
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT modo_valido CHECK (modo_calculo IN ('familiar', 'individual'))
);

-- 7. Criar tabela de membros da família
CREATE TABLE familia_membros (
  familia_id BIGINT REFERENCES familias(id) ON DELETE CASCADE,
  usuario_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  papel VARCHAR(50) DEFAULT 'membro',
  data_entrada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (familia_id, usuario_id),
  CONSTRAINT papel_valido CHECK (papel IN ('admin', 'membro', 'dependente'))
);

-- 8. Criar tabela de convites
CREATE TABLE convites (
  id BIGSERIAL PRIMARY KEY,
  familia_id BIGINT REFERENCES familias(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  expira_em TIMESTAMP NOT NULL,
  aceito BOOLEAN DEFAULT FALSE,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_convites_codigo ON convites(codigo);
CREATE INDEX idx_convites_email ON convites(email);

-- 9. Criar tabela de transferências internas
CREATE TABLE transferencias (
  id BIGSERIAL PRIMARY KEY,
  de_usuario_id BIGINT REFERENCES users(id),
  para_usuario_id BIGINT REFERENCES users(id),
  valor DECIMAL(15,2) NOT NULL,
  descricao VARCHAR(255),
  categoria VARCHAR(100),
  tipo_pagamento VARCHAR(50),
  data DATE NOT NULL,
  pago BOOLEAN DEFAULT FALSE,
  observacoes TEXT,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valor_positivo CHECK (valor > 0),
  CONSTRAINT usuarios_diferentes CHECK (de_usuario_id != para_usuario_id)
);

CREATE INDEX idx_transferencias_de ON transferencias(de_usuario_id);
CREATE INDEX idx_transferencias_para ON transferencias(para_usuario_id);
CREATE INDEX idx_transferencias_pago ON transferencias(pago);

-- 10. Criar tabela de categorias personalizadas
CREATE TABLE categorias_personalizadas (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  cor VARCHAR(7) DEFAULT '#007AFF',
  tipo VARCHAR(50) NOT NULL,
  ativa BOOLEAN DEFAULT TRUE,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(usuario_id, nome, tipo)
);

CREATE INDEX idx_cat_custom_usuario ON categorias_personalizadas(usuario_id);
CREATE INDEX idx_cat_custom_tipo ON categorias_personalizadas(tipo);

