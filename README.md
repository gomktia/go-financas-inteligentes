# 💰 Sistema de Controle Financeiro Familiar

![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Latest-green?style=for-the-badge&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.0-38bdf8?style=for-the-badge&logo=tailwind-css)

Sistema completo e moderno para controle financeiro familiar, desenvolvido com Next.js 15, TypeScript, Supabase e design inspirado nas Apple Human Interface Guidelines.

## ✨ Funcionalidades

### 📊 Dashboard Completo
- Visão geral de receitas e despesas
- Cards informativos com métricas em tempo real
- Detalhamento por categoria
- Atualização automática dos dados

### 💳 Gestão Financeira
- **Gastos Variáveis**: Controle de gastos do dia a dia
- **Parcelas**: Acompanhamento de compras parceladas
- **Gasolina**: Registro de abastecimentos e consumo
- **Assinaturas**: Gestão de serviços recorrentes (Netflix, Spotify, etc.)
- **Contas Fixas**: Luz, água, internet, telefone
- **Ferramentas**: Controle de softwares e ferramentas profissionais
- **Cartões**: Gerenciamento de cartões de crédito e débito
- **Metas**: Definição e acompanhamento de objetivos financeiros
- **Investimentos**: Acompanhamento de aplicações e rentabilidade
- **Relatórios**: Geração de relatórios detalhados em PDF/CSV

### 🎨 Design Moderno
- Interface inspirada no design da Apple
- Modo escuro/claro automático
- Animações suaves e responsivas
- Componentes reutilizáveis e elegantes
- Mobile-first e totalmente responsivo

### 🔒 Recursos Técnicos
- ✅ TypeScript para type safety completo
- ✅ React Query para gerenciamento de estado
- ✅ Supabase como backend (PostgreSQL)
- ✅ Soft delete com lixeira (restauração em 30 dias)
- ✅ Materialized views para performance
- ✅ Row Level Security (RLS)
- ✅ Hot reload em desenvolvimento

## 🚀 Começando

### Pré-requisitos

- Node.js 18+ instalado
- Conta no [Supabase](https://supabase.com)
- Git instalado

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/controle-financeiro-familiar.git
cd controle-financeiro-familiar
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o Supabase**

   a. Crie um projeto em [supabase.com](https://supabase.com)
   
   b. No SQL Editor, execute o script de configuração:
   ```bash
   # Execute o arquivo EXECUTAR_AGORA.sql ou database_setup.sql
   ```
   
   c. Copie as credenciais em Settings → API

4. **Configure as variáveis de ambiente**
```bash
cp .env.local.example .env.local
```

Edite `.env.local` com suas credenciais:
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-aqui
```

5. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

6. **Acesse o sistema**
```
http://localhost:3000
```

## 📁 Estrutura do Projeto

```
controle-financeiro-familiar/
├── app/                      # Páginas Next.js (App Router)
│   ├── page.tsx             # Dashboard principal
│   ├── gastos/              # Gestão de gastos
│   ├── parcelas/            # Compras parceladas
│   ├── gasolina/            # Controle de combustível
│   ├── assinaturas/         # Serviços recorrentes
│   ├── contas-fixas/        # Contas mensais
│   ├── ferramentas/         # Softwares profissionais
│   ├── cartoes/             # Cartões de crédito
│   ├── metas/               # Objetivos financeiros
│   ├── investimentos/       # Aplicações
│   ├── relatorios/          # Relatórios
│   ├── lixeira/             # Itens excluídos
│   └── globals.css          # Estilos globais
├── components/              # Componentes React
│   ├── ui/                  # Componentes base
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── sheet.tsx
│   │   └── drawer.tsx
│   ├── sidebar.tsx          # Navegação lateral
│   ├── header.tsx           # Cabeçalho
│   ├── gasto-sheet.tsx      # Modal de gastos
│   └── theme-provider.tsx   # Tema dark/light
├── hooks/                   # React Hooks customizados
│   ├── use-gastos.ts        # Hook para gastos
│   ├── use-dashboard.ts     # Hook para dashboard
│   └── use-lixeira.ts       # Hook para lixeira
├── lib/                     # Utilitários
│   ├── supabase.ts          # Cliente Supabase
│   └── utils.ts             # Funções auxiliares
├── types/                   # Definições TypeScript
│   ├── database.types.ts    # Types do Supabase
│   └── index.ts             # Types customizados
└── public/                  # Arquivos estáticos
```

## 🛠️ Stack Tecnológica

### Frontend
- **Next.js 15.2.4**: Framework React com App Router
- **React 18**: Biblioteca UI
- **TypeScript 5.3**: Type safety
- **Tailwind CSS 3.4**: Estilização utility-first
- **Lucide React**: Ícones modernos

### Backend & Database
- **Supabase**: Backend as a Service
- **PostgreSQL**: Banco de dados relacional
- **Row Level Security**: Segurança de dados

### Gerenciamento de Estado
- **TanStack React Query 5**: Cache e sincronização
- **Next Themes**: Gerenciamento de tema

## 📊 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento

# Produção
npm run build        # Build para produção
npm run start        # Inicia servidor de produção

# Qualidade de Código
npm run lint         # Executa ESLint
```

## 🎨 Design System

O projeto segue os princípios do **Apple Human Interface Guidelines**:

- **Cores**: Apple Blue (#007AFF) como cor primária
- **Tipografia**: SF Pro Display/Text (fallback para system fonts)
- **Border Radius**: 12px padrão (Apple-style)
- **Animações**: Cubic-bezier ease-out
- **Espaçamento**: Sistema baseado em 4px

## 📱 Responsividade

- ✅ Desktop (1920x1080+)
- ✅ Laptop (1366x768+)
- ✅ Tablet (768x1024)
- ✅ Mobile (375x667+)

## 🚀 Deploy

### Vercel (Recomendado)

1. Faça push do código para o GitHub
2. Importe o projeto no [Vercel](https://vercel.com)
3. Configure as variáveis de ambiente
4. Deploy automático! 🎉

[![Deploy com Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

### Outros Provedores
- Netlify
- AWS Amplify
- Railway
- Render

## 📖 Documentação Adicional

- [GUIA_RAPIDO.md](./GUIA_RAPIDO.md) - Setup em 5 minutos
- [APPLE_DESIGN_GUIDE.md](./APPLE_DESIGN_GUIDE.md) - Guia de design
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Documentação da API
- [DATABASE_STRUCTURE.md](./DATABASE_STRUCTURE.md) - Estrutura do banco
- [CHANGELOG_APPLE_DESIGN.md](./CHANGELOG_APPLE_DESIGN.md) - Mudanças de design

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abrir um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Geison Hoehr**

## 🙏 Agradecimentos

- Next.js Team pelo excelente framework
- Supabase pela plataforma incrível
- Vercel pelo hosting gratuito
- Comunidade open source

---

**Desenvolvido com ❤️ e Next.js**

Se este projeto foi útil, considere dar uma ⭐!

