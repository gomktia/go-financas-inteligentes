# ✅ Checklist de Testes - Sistema v3.0

## 📋 Pré-requisitos

### 1. Configuração Supabase
- [ ] Criar projeto no Supabase (https://supabase.com)
- [ ] Executar `EXECUTAR_AGORA.sql` no SQL Editor
- [ ] Verificar se todas as tabelas foram criadas
- [ ] Verificar se materialized view `mv_dashboard_mensal` existe
- [ ] Verificar se funções `soft_delete` e `soft_undelete` foram criadas
- [ ] Copiar URL do projeto (Settings → API)
- [ ] Copiar chave anon/public (Settings → API)

### 2. Configuração Frontend
- [ ] Abrir `index-v3.html`
- [ ] Substituir `SUPABASE_CONFIG.url` com sua URL real
- [ ] Substituir `SUPABASE_CONFIG.anonKey` com sua chave real
- [ ] Salvar arquivo

### 3. Dados Iniciais
- [ ] Criar pelo menos 1 usuário na tabela `users`
- [ ] Adicionar pelo menos 1 salário em `salaries`

---

## 🧪 Testes Funcionais

### Dashboard
- [ ] Abre sem erros no console
- [ ] Mostra loading spinner inicial
- [ ] Exibe cards de Receitas, Despesas e Saldo
- [ ] Valores são formatados em R$
- [ ] Mostra "Última atualização" com data/hora
- [ ] Cards de detalhamento aparecem corretamente
- [ ] Cores estão corretas (verde para positivo, vermelho para negativo)

### Tema (Dark/Light)
- [ ] Botão de tema (☀️/🌙) funciona
- [ ] Tema persiste após reload da página
- [ ] Todos os elementos mudam de cor corretamente
- [ ] Inputs são legíveis em ambos os temas

### Seleção de Usuário
- [ ] Dropdown mostra todos os usuários
- [ ] Mostra nome e tipo (Pessoa/Empresa)
- [ ] Seleção persiste durante a sessão

### Sidebar
- [ ] Menu lateral é visível em desktop
- [ ] Menu pode ser ocultado/mostrado em mobile
- [ ] Botão Dashboard funciona
- [ ] Botão Gastos funciona
- [ ] Botão Lixeira funciona
- [ ] Item ativo fica destacado em azul

---

## 💸 Testes CRUD - Gastos

### Criar Gasto
- [ ] Botão "+ Novo Gasto" abre modal
- [ ] Campos obrigatórios validam
- [ ] Salvar insere no Supabase
- [ ] Lista atualiza automaticamente
- [ ] Spinner "Salvando..." aparece
- [ ] Modal fecha após sucesso

### Listar Gastos
- [ ] Todos os gastos aparecem
- [ ] Ordenação por data (mais recente primeiro)
- [ ] Mostra descrição, categoria, tipo pagamento e data
- [ ] Valores formatados corretamente
- [ ] Não mostra gastos deletados

### Deletar Gasto (Soft Delete)
- [ ] Botão 🗑️ funciona
- [ ] Confirma antes de deletar
- [ ] Mensagem menciona "pode ser restaurado"
- [ ] Item desaparece da lista
- [ ] Dashboard atualiza valores
- [ ] Item aparece na Lixeira

---

## 🗑️ Testes Lixeira

### Ver Itens Deletados
- [ ] Aba Lixeira carrega sem erros
- [ ] Lista todos os itens deletados (últimos 30 dias)
- [ ] Mostra tipo (Gasto, Parcela, etc.)
- [ ] Mostra data/hora da exclusão
- [ ] Mostra descrição e valor
- [ ] Ordenado por mais recente

### Restaurar Item
- [ ] Botão "↺ Restaurar" funciona
- [ ] Confirma antes de restaurar
- [ ] Item volta para lista original
- [ ] Item desaparece da Lixeira
- [ ] Dashboard atualiza valores
- [ ] Mensagem de sucesso aparece

### Deletar Permanentemente
- [ ] Botão "🗑️ Deletar" funciona
- [ ] Aviso de "⚠️ ATENÇÃO!" aparece
- [ ] Menciona "NÃO pode ser desfeita"
- [ ] Item é removido do banco
- [ ] Item desaparece da Lixeira
- [ ] Não pode ser recuperado

### Lixeira Vazia
- [ ] Mostra emoji 🎉
- [ ] Mensagem "Nenhum item na lixeira"
- [ ] Não trava nem dá erro

---

## 📊 Testes Materialized View

### Dashboard com Cached Data
- [ ] Dashboard carrega RÁPIDO (< 1 segundo)
- [ ] Valores batem com cálculos manuais
- [ ] Mostra timestamp de atualização
- [ ] Após insert/update/delete, valores atualizam
- [ ] Função `refresh_dashboard_views` é chamada

### Fallback para Cálculo Manual
- [ ] Se MV não existe, usa reduce() manual
- [ ] Não quebra o app
- [ ] Valores continuam corretos

---

## 🔄 Testes de Performance

### Carregamento Inicial
- [ ] App carrega em < 3 segundos
- [ ] Spinner aparece enquanto carrega
- [ ] Dados aparecem de uma vez (não por partes)

### Operações CRUD
- [ ] Salvar leva < 1 segundo
- [ ] Deletar leva < 1 segundo
- [ ] Restaurar leva < 1 segundo
- [ ] Feedback visual imediato

### Refresh Dashboard
- [ ] Atualização leva < 500ms
- [ ] Não trava a UI

---

## 🔒 Testes de Segurança

### RLS (Row Level Security)
- [ ] Políticas RLS estão ativas no Supabase
- [ ] Usuários só veem seus próprios dados (se configurado)
- [ ] Não é possível editar dados de outros

### Validações
- [ ] Campos obrigatórios funcionam
- [ ] Valores numéricos não aceitam texto
- [ ] Datas inválidas são rejeitadas

---

## 📱 Testes Responsivos

### Desktop (>1024px)
- [ ] Layout em 3 colunas funciona
- [ ] Sidebar sempre visível
- [ ] Cards bem distribuídos

### Tablet (768-1024px)
- [ ] Layout em 2 colunas
- [ ] Sidebar pode ocultar
- [ ] Menu hambúrguer funciona

### Mobile (<768px)
- [ ] Layout em 1 coluna
- [ ] Sidebar esconde por padrão
- [ ] Botão ☰ abre/fecha menu
- [ ] Cards empilham verticalmente
- [ ] Texto legível

---

## 🌐 Testes de Navegadores

### Chrome/Edge
- [ ] Funciona sem erros
- [ ] Estilos corretos
- [ ] Animações suaves

### Firefox
- [ ] Funciona sem erros
- [ ] Estilos corretos

### Safari (iOS/macOS)
- [ ] Funciona sem erros
- [ ] Select customizado funciona
- [ ] Fontes carregam

---

## 🐛 Testes de Erros

### Sem Conexão Internet
- [ ] Mostra erro amigável
- [ ] Não trava o app
- [ ] Permite tentar novamente

### Supabase Offline
- [ ] Mostra mensagem de erro
- [ ] Console.log tem detalhes
- [ ] Não perde dados não salvos

### Dados Corrompidos
- [ ] Não quebra a UI
- [ ] Valores NULL são tratados (COALESCE)
- [ ] Erros aparecem no console

### Ações Simultâneas
- [ ] Não permite duplo-clique em salvar
- [ ] Spinner bloqueia ações durante save
- [ ] Estado mantém consistência

---

## ✨ Testes de UX

### Feedbacks Visuais
- [ ] Hover nos cards funciona
- [ ] Botões mudam cor ao passar mouse
- [ ] Loading spinner aparece
- [ ] Transições são suaves

### Confirmações
- [ ] Delete pede confirmação
- [ ] Restaurar pede confirmação
- [ ] Delete permanente tem aviso forte

### Mensagens
- [ ] Sucesso: "Item restaurado!"
- [ ] Erro: mensagem clara do problema
- [ ] Loading: "Carregando dados..."

---

## 🔧 Testes Técnicos

### Console do Navegador
- [ ] Sem erros vermelhos
- [ ] Warnings mínimos
- [ ] Network requests bem-sucedidas (200/201)

### DevTools → Network
- [ ] Requisições Supabase funcionam
- [ ] Headers corretos (Authorization)
- [ ] Respostas em JSON válido

### DevTools → Application
- [ ] localStorage tem 'theme'
- [ ] Sem dados sensíveis no localStorage

### React DevTools
- [ ] State atualiza corretamente
- [ ] Componentes re-renderizam quando necessário
- [ ] Sem loops infinitos

---

## 📦 Comparação com v2.0

### Melhorias Implementadas
- [ ] ✅ Usa Supabase (vs localStorage)
- [ ] ✅ Soft delete (vs hard delete)
- [ ] ✅ Lixeira funcional (30 dias)
- [ ] ✅ Materialized views (30-40x mais rápido)
- [ ] ✅ Auditoria (quem deletou, quando)
- [ ] ✅ Loading states em todas operações
- [ ] ✅ Conversão camelCase ↔ snake_case
- [ ] ✅ Refresh automático do dashboard

### Recursos Mantidos
- [ ] ✅ Modo escuro/claro
- [ ] ✅ Múltiplos usuários
- [ ] ✅ Layout responsivo
- [ ] ✅ Design moderno

---

## 🚀 Deploy

### Antes de Publicar
- [ ] Remover console.logs de debug
- [ ] Trocar React development por production
- [ ] Minificar código (se necessário)
- [ ] Testar em ambiente de produção
- [ ] Documentar credenciais Supabase

### Pós-Deploy
- [ ] URL funciona
- [ ] HTTPS ativo
- [ ] Performance OK (Lighthouse >90)
- [ ] Sem erros no console

---

## 📊 Métricas de Sucesso

### Performance
- [ ] Carregamento inicial < 3s
- [ ] Dashboard atualiza < 1s
- [ ] CRUD operations < 1s
- [ ] Lighthouse Performance >90

### Funcionalidade
- [ ] 100% das features funcionam
- [ ] 0 erros críticos no console
- [ ] Soft delete 100% funcional
- [ ] Lixeira 100% funcional

### UX
- [ ] Feedback em todas ações
- [ ] Nenhuma ação sem confirmação
- [ ] Todas mensagens são claras

---

## 🎯 Próximos Passos (Após v3.0)

- [ ] Adicionar modais completos para todas entidades
- [ ] Implementar filtros e busca (v2.3)
- [ ] Adicionar exportação CSV/PDF
- [ ] Gráfico de evolução mensal
- [ ] Notificações de vencimento
- [ ] Recorrência automática

---

## ✅ Sign-Off

**Testado por:** _________________
**Data:** _________________
**Versão:** 3.0
**Status:** [ ] Aprovado [ ] Reprovado

**Observações:**
```
_________________________________________
_________________________________________
_________________________________________
```

---

**🎉 PRONTO PARA PRODUÇÃO quando todos os checkboxes estiverem marcados!**
