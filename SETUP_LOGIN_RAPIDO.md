# 🚀 Setup Login - Guia Rápido (5 minutos)

## 1️⃣ Instalar Dependências

```bash
npm install @supabase/auth-helpers-nextjs
```

## 2️⃣ Criar Usuário Demo no Supabase

No Supabase SQL Editor, execute:

```sql
-- Criar usuário demo na tabela users
INSERT INTO users (id, nome, tipo, deletado)
VALUES (1, 'Demo User', 'Pessoa', false);
```

## 3️⃣ Configurar Auth no Supabase

1. Vá em **Authentication** → **Settings**
2. **Desabilite** "Enable email confirmations" (para testes)
3. **Deixe** "Enable sign ups" habilitado

## 4️⃣ Criar Conta Demo via Dashboard

No Supabase:
1. Vá em **Authentication** → **Users**
2. Clique em **"Add user"** → **"Create new user"**
3. Preencha:
   - Email: `demo@financeiro.com`
   - Password: `demo123`
   - Auto Confirm User: ✅ **SIM**
4. Clique em **"Create user"**

## 5️⃣ Testar

```bash
npm run dev
```

1. Acesse http://localhost:3000
2. Você será redirecionado para `/login`
3. Clique em **"Usar demo"**
4. Clique em **"Entrar"**
5. 🎉 Logado com sucesso!

---

## 🎯 Pronto para Produção

### Próximos Passos:

1. **Habilitar confirmação de email** (produção)
2. **Configurar RLS** (segurança)
3. **Atualizar componentes** para usar usuário real

```typescript
// Substituir hardcoded
usuario_id: 1

// Por usuário logado
const { user } = useAuth()
usuario_id: parseInt(user.id...)
```

---

## 📖 Docs Completas

- [SISTEMA_LOGIN.md](SISTEMA_LOGIN.md) - Documentação completa
- [APPLE_DESIGN_GUIDE.md](APPLE_DESIGN_GUIDE.md) - Guia de design

---

**Versão:** 3.1.0 com Auth 🔐
