# 📋 Comandos Úteis

## Desenvolvimento

```bash
# Rodar em modo desenvolvimento (com hot reload)
npm run dev

# Rodar em modo desenvolvimento em porta diferente
npm run dev -- -p 3001

# Type checking (sem build)
npm run type-check

# Lint (verificar código)
npm run lint
```

## Build & Produção

```bash
# Criar build de produção
npm run build

# Rodar build de produção localmente
npm start

# Build + Start
npm run build && npm start
```

## Instalação & Atualização

```bash
# Instalar todas as dependências
npm install

# Atualizar dependências (cuidado!)
npm update

# Limpar node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install

# Adicionar nova dependência
npm install nome-do-pacote

# Adicionar dependência de desenvolvimento
npm install -D nome-do-pacote
```

## Supabase

```bash
# Instalar Supabase CLI (opcional)
npm install -g supabase

# Login no Supabase
supabase login

# Gerar types do Supabase automaticamente
supabase gen types typescript --project-id seu-projeto-id > types/database.types.ts
```

## Git

```bash
# Inicializar repositório
git init
git add .
git commit -m "Initial commit"

# Criar branch
git checkout -b feature/nova-feature

# Commit
git add .
git commit -m "Add nova feature"

# Push
git push origin main
```

## Deploy

### Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy para produção
vercel --prod
```

### Netlify

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy
```

## Troubleshooting

```bash
# Limpar cache do Next.js
rm -rf .next

# Limpar tudo e reinstalar
rm -rf .next node_modules package-lock.json
npm install

# Verificar versão do Node
node -v  # Deve ser 18+

# Verificar versão do npm
npm -v
```

## Atalhos VSCode

```
Ctrl+Shift+P       → Command Palette
Ctrl+`             → Terminal
Ctrl+B             → Toggle Sidebar
Ctrl+Shift+F       → Buscar em todos os arquivos
F2                 → Renomear símbolo
Ctrl+D             → Selecionar próxima ocorrência
Alt+↑/↓            → Mover linha
Shift+Alt+↑/↓      → Duplicar linha
Ctrl+/             → Comentar linha
```

## TypeScript

```bash
# Reiniciar TypeScript server no VSCode
Ctrl+Shift+P → "TypeScript: Restart TS Server"

# Verificar erros sem build
npx tsc --noEmit

# Gerar declarações de tipos
npx tsc --declaration --emitDeclarationOnly
```

## Performance

```bash
# Analisar bundle size
npm run build
# Veja o output do build para tamanhos

# Analisar com bundle analyzer (se instalado)
npm install -D @next/bundle-analyzer
# Configure em next.config.js
```

## Testes (se configurado)

```bash
# Rodar testes
npm test

# Rodar testes em watch mode
npm test -- --watch

# Rodar com coverage
npm test -- --coverage
```

## Banco de Dados

```bash
# Backup do banco (via Supabase Dashboard)
# Settings → Database → Backup & Restore

# Executar SQL custom
# SQL Editor → New Query → Cole seu SQL

# Ver logs
# Logs → All logs
```

## Dicas

### Desenvolvimento Rápido

```bash
# Terminal 1: Rodar app
npm run dev

# Terminal 2: Type checking contínuo
npx tsc --watch --noEmit
```

### Antes de Commitar

```bash
npm run type-check  # Verificar tipos
npm run lint        # Verificar código
npm run build       # Garantir que builda
```

### Reset Completo

```bash
# ⚠️ Cuidado! Apaga tudo e reinstala
rm -rf .next node_modules package-lock.json .env.local
cp .env.local.example .env.local
# Edite .env.local com suas credenciais
npm install
npm run dev
```

---

**Dica:** Adicione esses comandos ao seu `package.json` scripts para acesso rápido!
