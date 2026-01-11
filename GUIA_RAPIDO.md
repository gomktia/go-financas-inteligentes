# 🚀 Guia Rápido - 5 Minutos

## Setup em 3 Passos

### 1️⃣ Configurar Supabase (2 min)

```bash
# 1. Crie projeto em https://supabase.com
# 2. SQL Editor → Cole e execute ../EXECUTAR_AGORA.sql
# 3. Copie URL e Anon Key de Settings → API
```

### 2️⃣ Configurar Projeto (1 min)

```bash
# Clone ou navegue até a pasta
cd financeiro-nextjs

# Copie o arquivo de ambiente
cp .env.local.example .env.local

# Edite .env.local e cole suas credenciais:
# NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-aqui
```

### 3️⃣ Instalar e Rodar (2 min)

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Abrir http://localhost:3000
```

## ✅ Pronto!

Agora você tem:
- ✅ Dashboard funcionando
- ✅ CRUD de gastos
- ✅ Lixeira com restore
- ✅ Dark/Light mode
- ✅ Performance otimizada

## 🎯 Primeiro Teste

1. Acesse http://localhost:3000
2. Clique em **"Gastos"** → **"+ Novo Gasto"**
3. Adicione: `Mercado`, `R$ 250,00`, `Alimentação`, `PIX`
4. Volte ao **Dashboard** → Veja o valor atualizado!
5. Delete o gasto → Vá na **Lixeira** → Restaure!

## 📚 Mais Informações

Veja o **README.md** completo para:
- Estrutura detalhada do projeto
- Como adicionar novas features
- Deploy para produção
- Troubleshooting

---

**Divirta-se! 🎉**
