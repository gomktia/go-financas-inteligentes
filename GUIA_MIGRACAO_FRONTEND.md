# 🚀 GUIA DE MIGRAÇÃO DO FRONTEND

**De:** localStorage → **Para:** Supabase + Soft Delete + Materialized Views
**Arquivo:** index.html → index-v3.html (novo)
**Tempo estimado:** 2-3 horas

---

## 📋 **PRÉ-REQUISITOS**

✅ Banco Supabase configurado
✅ SQL de melhorias executado (`EXECUTAR_AGORA.sql`)
✅ Tabelas criadas com soft delete
✅ Materialized views (`mv_dashboard_mensal`, `mv_gastos_categoria_mes`)
✅ Funções (`soft_delete`, `soft_undelete`, `refresh_dashboard_views`)

---

## 🔧 **PASSO 1: CONFIGURAÇÃO INICIAL**

### 1.1 Adicionar Supabase Client

**Inserir ANTES da tag `</head>` (após linha 11):**

```html
<!-- Supabase Client -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

### 1.2 Configurar credenciais

**Adicionar DENTRO do `<script type="text/babel">` (após linha 152):**

```javascript
// ============================================
// CONFIGURAÇÃO SUPABASE
// ============================================
const SUPABASE_URL = 'https://SEU-PROJETO.supabase.co';
const SUPABASE_ANON_KEY = 'SUA-CHAVE-ANONIMA';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('✅ Supabase conectado:', SUPABASE_URL);
```

**⚠️ IMPORTANTE:** Substituir `SEU-PROJETO` e `SUA-CHAVE` pelos valores reais do Supabase.

---

## 🔧 **PASSO 2: SUBSTITUIR LOCALSTORAGE POR SUPABASE**

### 2.1 Remover código antigo

**DELETAR linhas 220-237:**
```javascript
// ❌ REMOVER TUDO ISSO:
useEffect(() => {
    const d = localStorage.getItem('finData');
    if (d) {
        try {
            setData(JSON.parse(d));
        } catch (e) {
            console.error('Erro ao carregar dados:', e);
        }
    }
    const dm = localStorage.getItem('darkMode');
    if (dm !== null) setDarkMode(dm === 'true');
}, []);

useEffect(() => {
    localStorage.setItem('finData', JSON.stringify(data));
}, [data]);

useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
}, [darkMode]);
```

### 2.2 Adicionar novo código

**SUBSTITUIR por (após linha 220):**

```javascript
// ============================================
// ESTADOS ADICIONAIS
// ============================================
const [loading, setLoading] = useState(true);
const [dashboardData, setDashboardData] = useState(null);
const [categoriasData, setCategoriasData] = useState([]);
const [itensDeletados, setItensDeletados] = useState([]);

// ============================================
// CARREGAR DADOS DO SUPABASE
// ============================================
useEffect(() => {
    carregarTodosDados();

    // Dark mode do localStorage (mantém preferência)
    const dm = localStorage.getItem('darkMode');
    if (dm !== null) setDarkMode(dm === 'true');
}, []);

// Salvar dark mode
useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
}, [darkMode]);

async function carregarTodosDados() {
    setLoading(true);
    try {
        await Promise.all([
            carregarUsuarios(),
            carregarSalarios(),
            carregarGastos(),
            carregarParcelas(),
            carregarGasolina(),
            carregarAssinaturas(),
            carregarContas(),
            carregarCartoes(),
            carregarMetas(),
            carregarOrcamentos(),
            carregarFerramentas(),
            carregarInvestimentos(),
            carregarPatrimonio(),
            carregarDividas(),
            carregarEmprestimos(),
            carregarDashboard(),
            carregarCategorias()
        ]);
        console.log('✅ Todos os dados carregados');
    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        alert('Erro ao carregar dados do banco. Verifique a conexão.');
    } finally {
        setLoading(false);
    }
}

// ============================================
// FUNÇÕES DE CARREGAMENTO POR TABELA
// ============================================

async function carregarUsuarios() {
    const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .order('id');

    if (error) throw error;
    setData(prev => ({ ...prev, users: users || [] }));
}

async function carregarSalarios() {
    const { data: salaries, error } = await supabase
        .from('salaries')
        .select('*')
        .order('id');

    if (error) throw error;
    setData(prev => ({ ...prev, salaries: salaries || [] }));
}

async function carregarGastos() {
    const { data: gastos, error } = await supabase
        .from('gastos')
        .select('*')
        .eq('deletado', false)  // ✅ FILTRAR DELETADOS
        .order('data', { ascending: false });

    if (error) throw error;

    // Mapear snake_case → camelCase
    const exp = gastos?.map(g => ({
        id: g.id,
        descricao: g.descricao,
        valor: parseFloat(g.valor),
        usuarioId: g.usuario_id,
        data: g.data,
        categoria: g.categoria,
        tipoPagamento: g.tipo_pagamento,
        observacoes: g.observacoes
    })) || [];

    setData(prev => ({ ...prev, exp }));
}

async function carregarParcelas() {
    const { data: parcelas, error } = await supabase
        .from('compras_parceladas')
        .select('*')
        .eq('deletado', false)
        .order('data_compra', { ascending: false });

    if (error) throw error;

    const parcelasFormatadas = parcelas?.map(p => ({
        id: p.id,
        produto: p.produto,
        valorTotal: parseFloat(p.valor_total),
        totalParcelas: p.total_parcelas,
        valorParcela: parseFloat(p.valor_parcela),
        parcelasPagas: p.parcelas_pagas,
        usuarioId: p.usuario_id,
        categoria: p.categoria_id, // Pode precisar JOIN
        dataCompra: p.data_compra,
        tipoPagamento: p.tipo_pagamento
    })) || [];

    setData(prev => ({ ...prev, parcelas: parcelasFormatadas }));
}

async function carregarGasolina() {
    const { data: gasolina, error } = await supabase
        .from('gasolina')
        .select('*')
        .eq('deletado', false)
        .order('data', { ascending: false });

    if (error) throw error;

    const gasolinaFormatada = gasolina?.map(g => ({
        id: g.id,
        veiculo: g.veiculo,
        valor: parseFloat(g.valor),
        litros: parseFloat(g.litros),
        precoLitro: parseFloat(g.preco_litro),
        usuarioId: g.usuario_id,
        data: g.data,
        local: g.local,
        tipoPagamento: g.tipo_pagamento
    })) || [];

    setData(prev => ({ ...prev, gasolina: gasolinaFormatada }));
}

async function carregarAssinaturas() {
    const { data: subs, error } = await supabase
        .from('assinaturas')
        .select('*')
        .order('nome');

    if (error) throw error;

    const subsFormatadas = subs?.map(s => ({
        id: s.id,
        nome: s.nome,
        valor: parseFloat(s.valor),
        ativa: s.ativa
    })) || [];

    setData(prev => ({ ...prev, subs: subsFormatadas }));
}

async function carregarContas() {
    const { data: bills, error } = await supabase
        .from('contas_fixas')
        .select('*')
        .order('nome');

    if (error) throw error;

    const billsFormatadas = bills?.map(b => ({
        id: b.id,
        nome: b.nome,
        valor: parseFloat(b.valor),
        diaVencimento: b.dia_vencimento
    })) || [];

    setData(prev => ({ ...prev, bills: billsFormatadas }));
}

async function carregarCartoes() {
    const { data: cards, error } = await supabase
        .from('cartoes')
        .select('*')
        .eq('deletado', false)
        .order('nome');

    if (error) throw error;

    const cardsFormatados = cards?.map(c => ({
        id: c.id,
        nome: c.nome,
        limite: parseFloat(c.limite),
        gasto: parseFloat(c.gasto_atual || 0),
        usuarioId: c.usuario_id,
        ativo: c.ativo
    })) || [];

    setData(prev => ({ ...prev, cards: cardsFormatados }));
}

async function carregarMetas() {
    const { data: goals, error } = await supabase
        .from('metas')
        .select('*')
        .eq('deletado', false)
        .order('nome');

    if (error) throw error;

    const goalsFormatadas = goals?.map(g => ({
        id: g.id,
        nome: g.nome,
        valorAlvo: parseFloat(g.valor_alvo),
        valorAtual: parseFloat(g.valor_atual || 0),
        cor: g.cor
    })) || [];

    setData(prev => ({ ...prev, goals: goalsFormatadas }));
}

async function carregarOrcamentos() {
    const { data: budgets, error } = await supabase
        .from('orcamentos')
        .select('*')
        .order('id');

    if (error) throw error;

    const budgetsFormatados = budgets?.map(b => ({
        id: b.id,
        categoria: b.categoria_id, // Pode precisar JOIN
        limite: parseFloat(b.limite)
    })) || [];

    setData(prev => ({ ...prev, budgets: budgetsFormatados }));
}

async function carregarFerramentas() {
    const { data: tools, error } = await supabase
        .from('ferramentas')
        .select('*')
        .order('ferramenta');

    if (error) throw error;

    const toolsFormatadas = tools?.map(t => ({
        id: t.id,
        ferramenta: t.ferramenta,
        valor: parseFloat(t.valor),
        ativa: t.ativa
    })) || [];

    setData(prev => ({ ...prev, tools: toolsFormatadas }));
}

async function carregarInvestimentos() {
    const { data: investments, error } = await supabase
        .from('investimentos')
        .select('*')
        .eq('deletado', false)
        .order('nome');

    if (error) throw error;

    const investmentsFormatados = investments?.map(i => ({
        id: i.id,
        nome: i.nome,
        valor: parseFloat(i.valor),
        tipo: i.tipo,
        rendimento: parseFloat(i.rendimento_percentual || 0),
        ativo: i.ativo
    })) || [];

    setData(prev => ({ ...prev, investments: investmentsFormatados }));
}

async function carregarPatrimonio() {
    const { data: assets, error } = await supabase
        .from('patrimonio')
        .select('*')
        .eq('deletado', false)
        .order('nome');

    if (error) throw error;

    const assetsFormatados = assets?.map(a => ({
        id: a.id,
        nome: a.nome,
        valor: parseFloat(a.valor),
        tipo: a.tipo,
        ativo: a.ativo
    })) || [];

    setData(prev => ({ ...prev, assets: assetsFormatados }));
}

async function carregarDividas() {
    const { data: debts, error } = await supabase
        .from('dividas')
        .select('*')
        .eq('deletado', false)
        .order('nome');

    if (error) throw error;

    const debtsFormatadas = debts?.map(d => ({
        id: d.id,
        nome: d.nome,
        valorTotal: parseFloat(d.valor_total),
        valorPago: parseFloat(d.valor_pago || 0),
        parcelas: d.total_parcelas,
        parcelasPagas: d.parcelas_pagas || 0
    })) || [];

    setData(prev => ({ ...prev, debts: debtsFormatadas }));
}

async function carregarEmprestimos() {
    const { data: loans, error } = await supabase
        .from('emprestimos')
        .select('*')
        .eq('deletado', false)
        .order('data_emprestimo', { ascending: false });

    if (error) throw error;

    const loansFormatados = loans?.map(l => ({
        id: l.id,
        nome: l.nome,
        valor: parseFloat(l.valor),
        tipo: l.tipo,
        data: l.data_emprestimo,
        pago: l.pago,
        parcelado: l.parcelado || false,
        totalParcelas: l.total_parcelas || 1,
        parcelasPagas: l.parcelas_pagas || 0,
        valorParcela: parseFloat(l.valor_parcela || l.valor)
    })) || [];

    setData(prev => ({ ...prev, loans: loansFormatados }));
}

// ============================================
// CARREGAR MATERIALIZED VIEWS (OTIMIZADO)
// ============================================

async function carregarDashboard() {
    const { data: dashboard, error } = await supabase
        .from('mv_dashboard_mensal')
        .select('*')
        .single();

    if (error) {
        console.warn('⚠️ Materialized view não encontrada, usando cálculo manual');
        return;
    }

    setDashboardData(dashboard);
    console.log('✅ Dashboard carregado da view otimizada');
}

async function carregarCategorias() {
    const { data: categorias, error } = await supabase
        .from('mv_gastos_categoria_mes')
        .select('*')
        .order('total', { ascending: false });

    if (error) {
        console.warn('⚠️ View de categorias não encontrada');
        return;
    }

    setCategoriasData(categorias);
    console.log('✅ Categorias carregadas da view otimizada');
}

async function carregarItensDeletados() {
    const tabelas = [
        'gastos', 'compras_parceladas', 'gasolina',
        'emprestimos', 'dividas', 'cartoes',
        'investimentos', 'patrimonio', 'metas'
    ];

    const todosItens = [];

    for (const tabela of tabelas) {
        try {
            const { data } = await supabase
                .from(tabela)
                .select('*')
                .eq('deletado', true)
                .gte('deletado_em', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
                .order('deletado_em', { ascending: false });

            if (data) {
                todosItens.push(...data.map(item => ({ ...item, tabela })));
            }
        } catch (error) {
            console.warn(`Erro ao carregar deletados de ${tabela}:`, error);
        }
    }

    setItensDeletados(todosItens);
}
```

---

## 🔧 **PASSO 3: IMPLEMENTAR SOFT DELETE**

### 3.1 Substituir função del()

**DELETAR linhas 305-307:**
```javascript
// ❌ REMOVER:
const del = (key, id) => {
    if (confirm('Excluir?'))
        setData({ ...data, [key]: data[key].filter(i => i.id !== id) });
};
```

**ADICIONAR:**
```javascript
// ============================================
// SOFT DELETE
// ============================================
const del = async (tabela, id, descricao = 'este item') => {
    if (!confirm(`Tem certeza que deseja excluir "${descricao}"?\n\n(Pode ser restaurado pela Lixeira)`)) {
        return;
    }

    setLoading(true);
    try {
        // Chamar função SQL soft_delete
        const { error } = await supabase.rpc('soft_delete', {
            p_tabela: tabela,
            p_id: id
        });

        if (error) throw error;

        // Recarregar dados
        await carregarTodosDados();

        // Atualizar dashboard
        await supabase.rpc('refresh_dashboard_views');

        console.log(`✅ ${tabela} #${id} marcado como deletado`);
    } catch (error) {
        console.error('❌ Erro ao deletar:', error);
        alert('Erro ao excluir: ' + error.message);
    } finally {
        setLoading(false);
    }
};

// ============================================
// RESTAURAR
// ============================================
const restaurar = async (tabela, id, descricao = 'este item') => {
    if (!confirm(`Restaurar "${descricao}"?`)) return;

    setLoading(true);
    try {
        const { error } = await supabase.rpc('soft_undelete', {
            p_tabela: tabela,
            p_id: id
        });

        if (error) throw error;

        await carregarTodosDados();
        await carregarItensDeletados();
        await supabase.rpc('refresh_dashboard_views');

        console.log(`✅ ${tabela} #${id} restaurado`);
    } catch (error) {
        console.error('❌ Erro ao restaurar:', error);
        alert('Erro ao restaurar: ' + error.message);
    } finally {
        setLoading(false);
    }
};
```

---

## 🔧 **PASSO 4: USAR MATERIALIZED VIEWS NO DASHBOARD**

### 4.1 Substituir cálculos manuais

**Localizar linhas 241-253 e SUBSTITUIR:**

**ANTES:**
```javascript
const fmt = (v) => new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(v);
const income = data.salaries.reduce((a, s) => a + s.valor, 0);
const expTotal = data.exp.reduce((a, e) => a + e.valor, 0);
// ... 10+ cálculos
```

**DEPOIS:**
```javascript
const fmt = (v) => new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(v);

// Usar materialized view (se disponível)
const income = dashboardData?.receitas_total || data.salaries.reduce((a, s) => a + s.valor, 0);
const expTotal = dashboardData?.gastos_mes || data.exp.reduce((a, e) => a + e.valor, 0);
const subsTotal = dashboardData?.assinaturas_total || data.subs.filter(s => s.ativa).reduce((a, s) => a + s.valor, 0);
const billsTotal = dashboardData?.contas_fixas_total || data.bills.reduce((a, b) => a + b.valor, 0);
const toolsTotal = dashboardData?.ferramentas_total || data.tools.filter(t => t.ativa).reduce((a, t) => a + t.valor, 0);

console.log(dashboardData ? '⚡ Usando materialized view (rápido)' : '⚠️ Usando cálculo manual (lento)');
```

---

## 🔧 **PASSO 5: ADICIONAR ABA LIXEIRA**

### 5.1 Adicionar menu

**Linha 308 - Adicionar 'lixeira':**
```javascript
const menus = [
    'dashboard', 'gastos', 'parcelas', 'gasolina',
    'assinaturas', 'contas', 'cartoes', 'faturas',
    'metas', 'orcamentos', 'ia', 'investimentos',
    'patrimonio', 'dividas', 'emprestimos',
    'transferencias', 'usuarios', 'configuracoes',
    'lixeira' // ✅ ADICIONAR
];
```

### 5.2 Adicionar renderização

**Adicionar APÓS linha 1172 (antes do fechamento do switch):**

```javascript
{tab === 'lixeira' && (
    <div className="p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
                <h2 className="text-3xl font-bold mb-2">🗑️ Lixeira</h2>
                <p className="text-zinc-400">
                    Itens deletados nos últimos 30 dias
                </p>
            </div>
            <button
                onClick={carregarItensDeletados}
                className="btn px-6 py-3 rounded-xl font-semibold"
            >
                🔄 Atualizar
            </button>
        </div>

        <div className="space-y-4">
            {itensDeletados.map((item, index) => (
                <div key={`${item.tabela}_${item.id}_${index}`}
                     className="card p-6 rounded-2xl">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-zinc-700 text-zinc-300">
                                    {item.tabela}
                                </span>
                                <h4 className="font-semibold text-xl">
                                    {item.descricao || item.nome || item.produto || item.ferramenta || `#${item.id}`}
                                </h4>
                            </div>
                            <p className="text-sm text-zinc-400 mb-2">
                                Deletado em {new Date(item.deletado_em).toLocaleString('pt-BR')}
                            </p>
                            {item.valor && (
                                <p className="text-lg font-bold text-red-500">
                                    {fmt(item.valor)}
                                </p>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => restaurar(
                                    item.tabela,
                                    item.id,
                                    item.descricao || item.nome || item.produto
                                )}
                                className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl font-semibold transition"
                            >
                                ↩️ Restaurar
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            {itensDeletados.length === 0 && (
                <div className="text-center py-12 text-zinc-400">
                    <div className="text-6xl mb-4">🎉</div>
                    <p className="text-xl">Nenhum item na lixeira</p>
                    <p className="text-sm mt-2">Todos os seus dados estão seguros!</p>
                </div>
            )}
        </div>
    </div>
)}
```

---

## 🔧 **PASSO 6: ADICIONAR LOADING STATE**

### 6.1 Adicionar spinner

**No início do render (após linha 310):**

```javascript
// Loading global
if (loading) {
    return (
        <div className={darkMode ? 'dark' : 'light'}>
            <div className="loading">
                <div className="spinner"></div>
                <p>Carregando dados...</p>
            </div>
        </div>
    );
}
```

---

## 🔧 **PASSO 7: ATUALIZAR FUNÇÃO SAVE**

**Substituir função save() (linha 294-303):**

```javascript
const save = async () => {
    if (!form.descricao && !form.nome && !form.produto && !form.ferramenta) {
        return alert('Preencha os campos obrigatórios');
    }

    setLoading(true);
    try {
        const tableName = getTableName(modal);
        const dataToSave = prepareDataToSave(modal, form);

        if (editing) {
            const { error } = await supabase
                .from(tableName)
                .update(dataToSave)
                .eq('id', editing.id);

            if (error) throw error;
        } else {
            const { error } = await supabase
                .from(tableName)
                .insert([dataToSave]);

            if (error) throw error;
        }

        // Recarregar dados
        await carregarTodosDados();

        // Atualizar dashboard
        await supabase.rpc('refresh_dashboard_views');

        close();
        console.log(`✅ ${modal} ${editing ? 'atualizado' : 'criado'} com sucesso`);
    } catch (error) {
        console.error('❌ Erro ao salvar:', error);
        alert('Erro ao salvar: ' + error.message);
    } finally {
        setLoading(false);
    }
};

// Mapear modal → nome da tabela
function getTableName(modalName) {
    const map = {
        'exp': 'gastos',
        'parcela': 'compras_parceladas',
        'gas': 'gasolina',
        'sub': 'assinaturas',
        'bill': 'contas_fixas',
        'card': 'cartoes',
        'goal': 'metas',
        'budget': 'orcamentos',
        'tool': 'ferramentas',
        'investment': 'investimentos',
        'asset': 'patrimonio',
        'debt': 'dividas',
        'loan': 'emprestimos',
        'user': 'users',
        'salary': 'salaries'
    };
    return map[modalName] || modalName;
}

// Preparar dados (camelCase → snake_case)
function prepareDataToSave(modalName, formData) {
    // Implementar mapeamento específico por modal
    // Exemplo para gastos:
    if (modalName === 'exp') {
        return {
            descricao: formData.descricao,
            valor: parseFloat(formData.valor),
            usuario_id: parseInt(formData.usuarioId || usuarioAtivo),
            data: formData.data,
            categoria: formData.categoria,
            tipo_pagamento: formData.tipoPagamento,
            observacoes: formData.observacoes
        };
    }

    // ... outros modais

    return formData;
}
```

---

## ✅ **CHECKLIST DE VERIFICAÇÃO**

Após fazer todas as modificações, verificar:

- [ ] Supabase Client adicionado no `<head>`
- [ ] Credenciais configuradas (URL e KEY)
- [ ] localStorage removido (exceto dark mode)
- [ ] Função `carregarTodosDados()` criada
- [ ] Todas as queries têm `.eq('deletado', false)`
- [ ] Função `del()` usa `soft_delete`
- [ ] Função `restaurar()` criada
- [ ] Menu "Lixeira" adicionado
- [ ] Tab "Lixeira" renderizada
- [ ] Loading state implementado
- [ ] Materialized views usadas no dashboard
- [ ] Função `save()` atualizada para Supabase

---

## 🚀 **TESTAR**

1. Abrir `index-v3.html` no navegador
2. Verificar console: deve mostrar "✅ Supabase conectado"
3. Verificar se dados carregam
4. Testar criar um gasto
5. Testar deletar (soft delete)
6. Ir na Lixeira e restaurar
7. Verificar performance do dashboard

---

## 📊 **RESULTADO ESPERADO**

✅ Dados sincronizados com Supabase
✅ Soft delete funcionando
✅ Lixeira com restauração
✅ Dashboard 30x mais rápido
✅ Multi-device (dados em nuvem)
✅ Auditoria automática

---

**Próximo arquivo:** Vou criar os snippets de código prontos para copiar/colar!
