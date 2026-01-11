# 🚀 Setup Supabase - PASSO A PASSO

## 📋 Informações do Projeto

```
✅ Project ID: sfemmeczjhleyqeegwhs
✅ URL: https://sfemmeczjhleyqeegwhs.supabase.co
✅ Anon Key: Configurada ✓
✅ Service Role: Configurada ✓
```

---

## 🎯 PASSO 1: Executar SQL no Supabase

### 1.1. Acesse o Supabase:
```
https://supabase.com/dashboard/project/sfemmeczjhleyqeegwhs
```

### 1.2. Vá em "SQL Editor"
- Menu lateral → SQL Editor
- Ou: https://supabase.com/dashboard/project/sfemmeczjhleyqeegwhs/sql

### 1.3. Criar tabelas base:
```sql
-- Cole e execute o arquivo: database_setup.sql
```

### 1.4. Adicionar novas colunas (v2.0):
```sql
-- Execute o arquivo: supabase.config.js (SQL dentro dele)
-- Ou cole manualmente:

-- Tipo em users (pessoa/empresa)
ALTER TABLE users ADD COLUMN IF NOT EXISTS tipo VARCHAR(20) DEFAULT 'pessoa';

-- Tipo de pagamento
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS tipo_pagamento VARCHAR(50);
ALTER TABLE compras_parceladas ADD COLUMN IF NOT EXISTS tipo_pagamento VARCHAR(50);
ALTER TABLE gasolina ADD COLUMN IF NOT EXISTS tipo_pagamento VARCHAR(50);

-- Empréstimos parcelados
ALTER TABLE emprestimos ADD COLUMN IF NOT EXISTS parcelado BOOLEAN DEFAULT FALSE;
ALTER TABLE emprestimos ADD COLUMN IF NOT EXISTS total_parcelas INTEGER DEFAULT 1;
ALTER TABLE emprestimos ADD COLUMN IF NOT EXISTS parcelas_pagas INTEGER DEFAULT 0;
ALTER TABLE emprestimos ADD COLUMN IF NOT EXISTS valor_parcela DECIMAL(15,2);
```

### 1.5. Criar tabelas novas (v2.1):
```sql
-- Copie e execute todo o SQL de INTEGRACAO_SUPABASE.md
-- Isso cria:
- familias
- familia_membros
- convites
- transferencias
- categorias_personalizadas
```

---

## 🎯 PASSO 2: Habilitar Row Level Security (RLS)

### 2.1. Para cada tabela:
```sql
-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE compras_parceladas ENABLE ROW LEVEL SECURITY;
-- ... etc para todas

-- Policy: Usuário vê apenas seus dados
CREATE POLICY "Users can view own data" ON users
  FOR SELECT
  USING (auth.uid()::text = id::text);

-- Policy: Membros da família vêem dados da família
CREATE POLICY "Family members can view" ON gastos
  FOR SELECT
  USING (
    usuario_id IN (
      SELECT usuario_id FROM familia_membros 
      WHERE familia_id IN (
        SELECT familia_id FROM familia_membros 
        WHERE usuario_id = auth.uid()::bigint
      )
    )
  );
```

---

## 🎯 PASSO 3: Configurar Autenticação

### 3.1. Habilitar Email/Password:
```
Dashboard → Authentication → Providers
☑ Email
☑ Password (mínimo 6 caracteres)
```

### 3.2. Configurar Email Templates:
```
Dashboard → Authentication → Email Templates

- Confirm Signup
- Reset Password
- Invite User (para convites!)
```

### 3.3. Testar criação de usuário:
```sql
-- No SQL Editor:
INSERT INTO auth.users (email) VALUES ('teste@email.com');
```

---

## 🎯 PASSO 4: Integrar no Frontend

### 4.1. Criar `index-supabase-v2.html`:

Baseado no `index.html` atual, adicionar:

```javascript
// 1. Inicializar Supabase
const supabase = window.supabase.createClient(
  'https://sfemmeczjhleyqeegwhs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
);

// 2. Verificar autenticação
const { data: { user } } = await supabase.auth.getUser();

if (!user) {
  // Mostrar tela de login
  return <LoginScreen />;
}

// 3. Carregar dados do banco
useEffect(() => {
  const loadData = async () => {
    const [users, gastos, parcelas, ...] = await Promise.all([
      supabase.from('users').select('*'),
      supabase.from('gastos').select('*'),
      supabase.from('compras_parceladas').select('*'),
      // ... etc
    ]);
    
    setData({
      users: users.data,
      exp: gastos.data,
      parcelas: parcelas.data,
      // ... etc
    });
  };
  
  loadData();
}, []);

// 4. Salvar no banco ao invés de localStorage
const save = async () => {
  await supabase.from('gastos').upsert({
    usuario_id: user.id,
    descricao: form.descricao,
    valor: form.valor,
    // ...
  });
  
  // Recarregar dados
  loadData();
};
```

---

## 🎯 PASSO 5: Implementar Funcionalidades Avançadas

### 5.1. Sistema de Convites:

```javascript
// Gerar convite
const gerarConvite = async () => {
  const codigo = Math.random().toString(36).substring(7).toUpperCase();
  
  const { data } = await supabase.from('convites').insert({
    familia_id: minhaFamilia.id,
    email: 'esposa@email.com',
    codigo: codigo,
    expira_em: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  }).select().single();
  
  // Copiar link para enviar
  const link = `${window.location.origin}/convite/${codigo}`;
  navigator.clipboard.writeText(link);
  alert('Link copiado! Envie para a pessoa.');
};

// Aceitar convite
const aceitarConvite = async (codigo) => {
  const { data: convite } = await supabase
    .from('convites')
    .select('*, familias(*)')
    .eq('codigo', codigo)
    .single();
    
  if (convite && new Date(convite.expira_em) > new Date()) {
    // Adicionar à família
    await supabase.from('familia_membros').insert({
      familia_id: convite.familia_id,
      usuario_id: user.id
    });
    
    // Marcar convite como aceito
    await supabase.from('convites').update({ aceito: true }).eq('id', convite.id);
    
    alert(`Você entrou na família ${convite.familias.nome}!`);
  }
};
```

### 5.2. Transferências Internas:

```javascript
// Adicionar transferência
const addTransferencia = async () => {
  await supabase.from('transferencias').insert({
    de_usuario_id: eu.id,          // Quem gastou
    para_usuario_id: esposa.id,    // De quem é o cartão
    valor: 200,
    descricao: 'Compra no mercado',
    categoria: 'Alimentação',
    tipo_pagamento: 'cartao_credito',
    data: new Date(),
    pago: false
  });
};

// No dashboard do usuário
const minhasTransferencias = await supabase
  .from('transferencias')
  .select('*')
  .eq('de_usuario_id', user.id)
  .eq('pago', false);

// Mostra: "Você deve R$ X para [pessoa]"
```

### 5.3. Modo de Cálculo:

```javascript
// Toggle no dashboard
const toggleModo = async () => {
  const novoModo = modoAtual === 'familiar' ? 'individual' : 'familiar';
  
  await supabase.from('familias').update({
    modo_calculo: novoModo
  }).eq('id', familia.id);
  
  setModoCalculo(novoModo);
};

// Cálculo de receitas
const calcularReceita = async () => {
  if (modoCalculo === 'familiar') {
    // Soma TODOS da família
    const { data } = await supabase
      .from('salaries')
      .select('valor')
      .in('usuario_id', membrosDaFamilia);
      
    return data.reduce((a, s) => a + s.valor, 0);
  } else {
    // Apenas do usuário
    const { data } = await supabase
      .from('salaries')
      .select('valor')
      .eq('usuario_id', user.id);
      
    return data.reduce((a, s) => a + s.valor, 0);
  }
};
```

---

## 🔒 Segurança

### Policies Recomendadas:

```sql
-- Gastos: só da sua família
CREATE POLICY "View family expenses" ON gastos
  FOR SELECT
  USING (
    usuario_id IN (
      SELECT usuario_id FROM familia_membros 
      WHERE familia_id IN (
        SELECT familia_id FROM familia_membros 
        WHERE usuario_id = auth.uid()::bigint
      )
    )
  );

-- Inserir: apenas seus gastos
CREATE POLICY "Insert own expenses" ON gastos
  FOR INSERT
  WITH CHECK (usuario_id = auth.uid()::bigint);

-- Editar: apenas seus gastos
CREATE POLICY "Update own expenses" ON gastos
  FOR UPDATE
  USING (usuario_id = auth.uid()::bigint);
```

---

## 📱 Fluxo Completo de Uso

### 1. Primeiro Acesso (Admin):
```
1. Cria conta (email/senha)
2. Cria família "Família Silva"
3. Adiciona dados iniciais
4. Gera convites para esposa/filhos
```

### 2. Membros Aceitam Convite:
```
1. Recebem link: app.com/convite/ABC123
2. Clicam no link
3. Se não têm conta: criam
4. Se já têm: fazem login
5. Automaticamente entram na família
```

### 3. Uso Diário:
```
1. Login (email/senha)
2. Dashboard mostra dados da família
3. Adiciona gastos
4. Cria transferências (usou cartão de outro)
5. Dados sincronizam em tempo real
```

---

## 🎊 Vantagens do Supabase

✅ **Autenticação real** (email/senha, Google, etc.)
✅ **Dados na nuvem** (acesso de qualquer lugar)
✅ **Tempo real** (updates automáticos)
✅ **Segurança** (RLS protege dados)
✅ **Escalabilidade** (milhares de usuários)
✅ **Convites** (compartilhar com família)
✅ **Transferências** (quem pagou vs quem gastou)
✅ **Multi-dispositivo** (celular + computador)

---

## 📊 Próximos Passos

### Opção A: Migração Gradual
1. ✅ Manter LocalStorage
2. ✅ Adicionar botão "Salvar na Nuvem"
3. ✅ Sincronizar sob demanda

### Opção B: Full Supabase (Recomendado)
1. ✅ Criar `index-supabase-v2.html`
2. ✅ Implementar autenticação
3. ✅ Migrar tudo para banco

---

## 🔧 Comandos SQL para Copiar

Arquivo criado: **`INTEGRACAO_SUPABASE.md`**

Execute no SQL Editor do Supabase:
1. `database_setup.sql` (base)
2. SQL do `INTEGRACAO_SUPABASE.md` (extensões)

---

## 🎉 Resultado Final

Com Supabase você terá:
- 🔐 Login/cadastro real
- 👨‍👩‍👧‍👦 Sistema de família com convites
- 💸 Transferências entre membros
- ☁️ Dados na nuvem
- 📱 Acesso multi-dispositivo
- 🔄 Sincronização em tempo real

**Seus 4 desafios RESOLVIDOS! 🚀**

---

**Quer que eu crie agora o `index-supabase-v2.html` completo com tudo integrado?**

