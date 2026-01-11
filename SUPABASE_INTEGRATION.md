# 🚀 Integração Frontend com Supabase

## 📋 Informações do Projeto

**Project ID:** `sfemmeczjhleyqeegwhs`  
**URL:** `https://sfemmeczjhleyqeegwhs.supabase.co`  
**Status:** ✅ Tabelas criadas

---

## 🎯 Passo a Passo

### 1. Adicionar Supabase ao HTML

Abra `index.html` e adicione o script do Supabase ANTES do React:

```html
<!-- Adicione esta linha após o <title> e antes dos scripts React -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

### 2. Inicializar Supabase

No início do seu código React (dentro da tag `<script type="text/babel">`), adicione:

```javascript
const { useState, useEffect } = React;

// CONFIGURAÇÃO SUPABASE
const SUPABASE_URL = 'https://sfemmeczjhleyqeegwhs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmZW1tZWN6amhsZXlxZWVnd2hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNjQxODcsImV4cCI6MjA3NDk0MDE4N30.T6JcEj7zZalMa7QIvU58ZQvK5c0_ChfNrc0VT5n1lds';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

---

## 📝 Migração das Funções

### Função: Carregar Dados

**ANTES (LocalStorage):**
```javascript
useEffect(() => {
    const d = localStorage.getItem('finData');
    if (d) {
        try { setData(JSON.parse(d)); } catch (e) { }
    }
}, []);
```

**DEPOIS (Supabase):**
```javascript
useEffect(() => {
    carregarDados();
}, []);

async function carregarDados() {
    try {
        // Carregar todos os dados em paralelo
        const [
            { data: users },
            { data: salaries },
            { data: gastos },
            { data: parcelas },
            { data: gasolina },
            { data: assinaturas },
            { data: contas },
            { data: cartoes },
            { data: metas },
            { data: orcamentos },
            { data: ferramentas },
            { data: investimentos },
            { data: patrimonio },
            { data: dividas },
            { data: emprestimos }
        ] = await Promise.all([
            supabase.from('users').select('*'),
            supabase.from('salaries').select('*'),
            supabase.from('gastos').select('*, categorias(nome, icone), users(nome)'),
            supabase.from('compras_parceladas').select('*, categorias(nome, icone)'),
            supabase.from('gasolina').select('*'),
            supabase.from('assinaturas').select('*'),
            supabase.from('contas_fixas').select('*'),
            supabase.from('cartoes').select('*, users(nome)'),
            supabase.from('metas').select('*'),
            supabase.from('orcamentos').select('*, categorias(nome)'),
            supabase.from('ferramentas').select('*'),
            supabase.from('investimentos').select('*'),
            supabase.from('patrimonio').select('*'),
            supabase.from('dividas').select('*'),
            supabase.from('emprestimos').select('*')
        ]);

        setData({
            users: users || [],
            salaries: salaries || [],
            exp: gastos || [],
            parcelas: parcelas || [],
            gasolina: gasolina || [],
            subs: assinaturas || [],
            bills: contas || [],
            cards: cartoes || [],
            goals: metas || [],
            budgets: orcamentos || [],
            tools: ferramentas || [],
            investments: investimentos || [],
            assets: patrimonio || [],
            debts: dividas || [],
            loans: emprestimos || []
        });
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        alert('Erro ao carregar dados do banco.');
    }
}
```

---

### Função: Salvar Dados

**ANTES (LocalStorage):**
```javascript
const save = () => {
    const id = editing?.id || Date.now();
    const item = { id, ...form };
    const keyMap = { exp: 'exp', sub: 'subs', ... };
    const key = keyMap[modal];
    const list = data[key];
    setData({ ...data, [key]: editing ? list.map(i => i.id === id ? item : i) : [...list, item] });
    close();
};
```

**DEPOIS (Supabase):**
```javascript
const save = async () => {
    try {
        // Mapear modal para nome da tabela no Supabase
        const tableMap = {
            exp: 'gastos',
            sub: 'assinaturas',
            bill: 'contas_fixas',
            card: 'cartoes',
            goal: 'metas',
            budget: 'orcamentos',
            invest: 'investimentos',
            asset: 'patrimonio',
            debt: 'dividas',
            loan: 'emprestimos',
            tool: 'ferramentas',
            user: 'users',
            salary: 'salaries',
            parcela: 'compras_parceladas',
            gasolina: 'gasolina'
        };

        const tableName = tableMap[modal];
        
        // Preparar dados para Supabase (ajustar nomes de campos)
        const dataToSave = prepararDados(modal, form);

        if (editing) {
            // UPDATE
            const { error } = await supabase
                .from(tableName)
                .update(dataToSave)
                .eq('id', editing.id);
            
            if (error) throw error;
        } else {
            // INSERT
            const { error } = await supabase
                .from(tableName)
                .insert([dataToSave]);
            
            if (error) throw error;
        }

        // Recarregar dados
        await carregarDados();
        close();
    } catch (error) {
        console.error('Erro ao salvar:', error);
        alert('Erro ao salvar. Tente novamente.');
    }
};

// Função auxiliar para ajustar nomes de campos
function prepararDados(modal, form) {
    const data = { ...form };
    
    // Ajustar nomes de campos conforme a tabela
    switch(modal) {
        case 'exp':
            return {
                usuario_id: data.usuarioId,
                categoria_id: data.categoriaId || null,
                descricao: data.descricao,
                valor: data.valor,
                data: data.data,
                observacoes: data.observacoes || null
            };
        
        case 'parcela':
            return {
                usuario_id: data.usuarioId || null,
                categoria_id: data.categoriaId || null,
                produto: data.produto,
                valor_total: data.valorTotal,
                total_parcelas: data.totalParcelas,
                valor_parcela: data.valorParcela,
                parcelas_pagas: data.parcelasPagas || 0,
                data_compra: data.data,
                finalizada: data.parcelasPagas >= data.totalParcelas
            };
        
        case 'gasolina':
            return {
                usuario_id: data.usuarioId || null,
                veiculo: data.veiculo,
                valor: data.valor,
                litros: data.litros || null,
                local: data.local || null,
                km_atual: data.kmAtual || null,
                data: data.data
            };
        
        case 'card':
            return {
                usuario_id: data.usuarioId,
                nome: data.nome,
                bandeira: data.bandeira || null,
                limite: data.limite,
                gasto_atual: data.gasto || 0,
                dia_fechamento: data.diaFechamento || null,
                dia_vencimento: data.diaVencimento || null,
                ativo: true
            };
        
        case 'sub':
            return {
                nome: data.nome,
                valor: data.valor,
                ativa: data.ativa !== false,
                periodicidade: data.periodicidade || 'mensal',
                dia_vencimento: data.diaVencimento || null
            };
        
        case 'bill':
            return {
                nome: data.nome,
                valor: data.valor,
                dia_vencimento: data.diaVencimento || 5,
                categoria: data.categoria || null,
                ativa: true
            };
        
        case 'goal':
            return {
                nome: data.nome,
                valor_alvo: data.valorAlvo,
                valor_atual: data.valorAtual || 0,
                cor: data.cor || '#007AFF',
                prazo_final: data.prazoFinal || null,
                concluida: false
            };
        
        case 'budget':
            return {
                categoria_id: data.categoriaId,
                limite: data.limite,
                mes_referencia: data.mesReferencia || null
            };
        
        case 'tool':
            return {
                ferramenta: data.ferramenta,
                valor: data.valor,
                ativa: data.ativa !== false,
                tipo: data.tipo || null
            };
        
        case 'invest':
            return {
                nome: data.nome,
                tipo: data.tipo,
                valor: data.valor,
                rendimento_percentual: data.rendimento || null,
                data_aplicacao: data.dataAplicacao || null,
                ativo: true
            };
        
        case 'asset':
            return {
                nome: data.nome,
                tipo: data.tipo,
                valor: data.valor,
                data_aquisicao: data.dataAquisicao || null,
                ativo: true
            };
        
        case 'debt':
            return {
                nome: data.nome,
                valor_total: data.valorTotal,
                valor_pago: data.valorPago || 0,
                total_parcelas: data.parcelas,
                parcelas_pagas: data.parcelasPagas || 0,
                valor_parcela: data.valorParcela || null,
                quitada: false
            };
        
        case 'loan':
            return {
                nome: data.nome,
                tipo: data.tipo,
                valor: data.valor,
                data_emprestimo: data.data,
                pago: data.pago || false
            };
        
        case 'user':
            return {
                nome: data.nome,
                cor: data.cor || '#007AFF',
                email: data.email || null,
                ativo: true
            };
        
        case 'salary':
            return {
                usuario_id: data.usuarioId,
                valor: data.valor,
                descricao: data.descricao || null
            };
        
        default:
            return data;
    }
}
```

---

### Função: Deletar

**ANTES (LocalStorage):**
```javascript
const del = (key, id) => {
    if (confirm('Excluir?')) 
        setData({ ...data, [key]: data[key].filter(i => i.id !== id) });
};
```

**DEPOIS (Supabase):**
```javascript
const del = async (key, id) => {
    if (!confirm('Excluir?')) return;
    
    try {
        const tableMap = {
            exp: 'gastos',
            subs: 'assinaturas',
            bills: 'contas_fixas',
            cards: 'cartoes',
            goals: 'metas',
            budgets: 'orcamentos',
            investments: 'investimentos',
            assets: 'patrimonio',
            debts: 'dividas',
            loans: 'emprestimos',
            tools: 'ferramentas',
            users: 'users',
            salaries: 'salaries',
            parcelas: 'compras_parceladas',
            gasolina: 'gasolina'
        };
        
        const { error } = await supabase
            .from(tableMap[key])
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        // Recarregar dados
        await carregarDados();
    } catch (error) {
        console.error('Erro ao deletar:', error);
        alert('Erro ao deletar. Tente novamente.');
    }
};
```

---

## 🔧 Script de Migração de Dados

Para migrar seus dados do LocalStorage para o Supabase:

```html
<!-- Adicione este botão temporário no seu HTML -->
<button onclick="migrarParaSupabase()" style="position: fixed; top: 10px; right: 10px; z-index: 9999; padding: 10px 20px; background: #ff4444; color: white; border: none; border-radius: 8px; cursor: pointer;">
    Migrar para Supabase
</button>

<script type="text/babel">
async function migrarParaSupabase() {
    if (!confirm('Isso vai migrar todos os dados do LocalStorage para o Supabase. Continuar?')) {
        return;
    }

    try {
        console.log('🚀 Iniciando migração...');
        
        // 1. Ler dados do LocalStorage
        const localData = localStorage.getItem('finData');
        if (!localData) {
            alert('Nenhum dado encontrado no LocalStorage');
            return;
        }
        
        const dados = JSON.parse(localData);
        console.log('📦 Dados carregados:', dados);

        // 2. Migrar usuários
        console.log('👥 Migrando usuários...');
        for (const user of dados.users || []) {
            await supabase.from('users').upsert({
                id: user.id,
                nome: user.nome,
                cor: user.cor,
                ativo: true
            });
        }

        // 3. Migrar salários
        console.log('💰 Migrando salários...');
        for (const salary of dados.salaries || []) {
            await supabase.from('salaries').insert({
                usuario_id: salary.usuarioId,
                valor: salary.valor,
                descricao: salary.descricao || null
            });
        }

        // 4. Migrar gastos
        console.log('💸 Migrando gastos...');
        for (const gasto of dados.exp || []) {
            // Buscar categoria por nome se existir
            let categoriaId = null;
            if (gasto.categoria) {
                const { data: cats } = await supabase
                    .from('categorias')
                    .select('id')
                    .eq('nome', gasto.categoria)
                    .single();
                categoriaId = cats?.id;
            }

            await supabase.from('gastos').insert({
                usuario_id: gasto.usuarioId,
                categoria_id: categoriaId,
                descricao: gasto.descricao,
                valor: gasto.valor,
                data: gasto.data,
                observacoes: gasto.observacoes || null
            });
        }

        // 5. Migrar compras parceladas
        console.log('🛍️ Migrando compras parceladas...');
        for (const parcela of dados.parcelas || []) {
            let categoriaId = null;
            if (parcela.categoria) {
                const { data: cats } = await supabase
                    .from('categorias')
                    .select('id')
                    .eq('nome', parcela.categoria)
                    .single();
                categoriaId = cats?.id;
            }

            await supabase.from('compras_parceladas').insert({
                usuario_id: parcela.usuarioId || null,
                categoria_id: categoriaId,
                produto: parcela.produto,
                valor_total: parcela.valorTotal,
                total_parcelas: parcela.totalParcelas,
                valor_parcela: parcela.valorParcela,
                parcelas_pagas: parcela.parcelasPagas || 0,
                data_compra: parcela.data,
                finalizada: parcela.parcelasPagas >= parcela.totalParcelas
            });
        }

        // 6. Migrar gasolina
        console.log('⛽ Migrando gasolina...');
        for (const gas of dados.gasolina || []) {
            await supabase.from('gasolina').insert({
                usuario_id: gas.usuarioId || null,
                veiculo: gas.veiculo,
                valor: gas.valor,
                litros: gas.litros || null,
                local: gas.local || null,
                km_atual: gas.kmAtual || null,
                data: gas.data
            });
        }

        // 7. Migrar assinaturas
        console.log('📺 Migrando assinaturas...');
        for (const sub of dados.subs || []) {
            await supabase.from('assinaturas').insert({
                nome: sub.nome,
                valor: sub.valor,
                ativa: sub.ativa
            });
        }

        // 8. Migrar contas fixas
        console.log('🏠 Migrando contas fixas...');
        for (const conta of dados.bills || []) {
            await supabase.from('contas_fixas').insert({
                nome: conta.nome,
                valor: conta.valor,
                dia_vencimento: 5,
                ativa: true
            });
        }

        // 9. Migrar cartões
        console.log('💳 Migrando cartões...');
        for (const card of dados.cards || []) {
            await supabase.from('cartoes').insert({
                usuario_id: card.usuarioId,
                nome: card.nome,
                limite: card.limite,
                gasto_atual: card.gasto || 0,
                ativo: true
            });
        }

        // 10. Migrar metas
        console.log('🎯 Migrando metas...');
        for (const meta of dados.goals || []) {
            await supabase.from('metas').insert({
                nome: meta.nome,
                valor_alvo: meta.valorAlvo,
                valor_atual: meta.valorAtual || 0,
                cor: meta.cor,
                concluida: false
            });
        }

        // 11. Migrar orçamentos
        console.log('📊 Migrando orçamentos...');
        for (const budget of dados.budgets || []) {
            const { data: cats } = await supabase
                .from('categorias')
                .select('id')
                .eq('nome', budget.categoria)
                .single();
            
            if (cats) {
                await supabase.from('orcamentos').insert({
                    categoria_id: cats.id,
                    limite: budget.limite
                });
            }
        }

        // 12. Migrar ferramentas
        console.log('🛠️ Migrando ferramentas...');
        for (const tool of dados.tools || []) {
            await supabase.from('ferramentas').insert({
                ferramenta: tool.ferramenta,
                valor: tool.valor,
                ativa: tool.ativa
            });
        }

        // 13. Migrar investimentos
        console.log('📈 Migrando investimentos...');
        for (const invest of dados.investments || []) {
            await supabase.from('investimentos').insert({
                nome: invest.nome,
                tipo: invest.tipo,
                valor: invest.valor,
                rendimento_percentual: invest.rendimento || null,
                ativo: true
            });
        }

        // 14. Migrar patrimônio
        console.log('🏛️ Migrando patrimônio...');
        for (const asset of dados.assets || []) {
            await supabase.from('patrimonio').insert({
                nome: asset.nome,
                tipo: asset.tipo,
                valor: asset.valor,
                ativo: true
            });
        }

        // 15. Migrar dívidas
        console.log('💳 Migrando dívidas...');
        for (const debt of dados.debts || []) {
            await supabase.from('dividas').insert({
                nome: debt.nome,
                valor_total: debt.valorTotal,
                valor_pago: debt.valorPago || 0,
                total_parcelas: debt.parcelas,
                parcelas_pagas: debt.parcelasPagas || 0,
                quitada: false
            });
        }

        // 16. Migrar empréstimos
        console.log('💰 Migrando empréstimos...');
        for (const loan of dados.loans || []) {
            await supabase.from('emprestimos').insert({
                nome: loan.nome,
                tipo: loan.tipo,
                valor: loan.valor,
                data_emprestimo: loan.data,
                pago: loan.pago || false
            });
        }

        console.log('✅ Migração concluída!');
        alert('✅ Migração concluída com sucesso!\n\nRecarregue a página para ver os dados do Supabase.');
        
    } catch (error) {
        console.error('❌ Erro na migração:', error);
        alert('Erro na migração: ' + error.message);
    }
}
</script>
```

---

## 📊 Queries Otimizadas

### Dashboard com Cálculos
```javascript
async function carregarDashboard() {
    try {
        // Total de receitas
        const { data: salarios } = await supabase
            .from('salaries')
            .select('valor');
        const receitas = salarios.reduce((acc, s) => acc + parseFloat(s.valor), 0);

        // Total de gastos do mês
        const mesAtual = new Date().toISOString().slice(0, 7); // YYYY-MM
        
        const { data: gastos } = await supabase
            .from('gastos')
            .select('valor')
            .gte('data', `${mesAtual}-01`)
            .lte('data', `${mesAtual}-31`);
        const gastosTotal = gastos.reduce((acc, g) => acc + parseFloat(g.valor), 0);

        // Total de parcelas ativas
        const { data: parcelas } = await supabase
            .from('compras_parceladas')
            .select('valor_parcela')
            .eq('finalizada', false);
        const parcelasTotal = parcelas.reduce((acc, p) => acc + parseFloat(p.valor_parcela), 0);

        // Total de gasolina do mês
        const { data: gasolina } = await supabase
            .from('gasolina')
            .select('valor')
            .gte('data', `${mesAtual}-01`)
            .lte('data', `${mesAtual}-31`);
        const gasolinaTotal = gasolina.reduce((acc, g) => acc + parseFloat(g.valor), 0);

        // Total de assinaturas ativas
        const { data: assinaturas } = await supabase
            .from('assinaturas')
            .select('valor')
            .eq('ativa', true);
        const subsTotal = assinaturas.reduce((acc, s) => acc + parseFloat(s.valor), 0);

        // Total de contas fixas
        const { data: contas } = await supabase
            .from('contas_fixas')
            .select('valor')
            .eq('ativa', true);
        const contasTotal = contas.reduce((acc, c) => acc + parseFloat(c.valor), 0);

        // Total de ferramentas
        const { data: ferramentas } = await supabase
            .from('ferramentas')
            .select('valor')
            .eq('ativa', true);
        const toolsTotal = ferramentas.reduce((acc, t) => acc + parseFloat(t.valor), 0);

        const despesasTotal = gastosTotal + parcelasTotal + gasolinaTotal + subsTotal + contasTotal + toolsTotal;
        const saldo = receitas - despesasTotal;

        return {
            receitas,
            despesas: despesasTotal,
            saldo,
            resumo: {
                gastos: gastosTotal,
                parcelas: parcelasTotal,
                gasolina: gasolinaTotal,
                assinaturas: subsTotal,
                contas: contasTotal,
                ferramentas: toolsTotal
            }
        };
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        return null;
    }
}
```

---

## ⚡ Otimizações

### 1. Usar Realtime (Opcional)
```javascript
// Atualizar dados em tempo real quando houver mudanças
useEffect(() => {
    const subscription = supabase
        .channel('financeiro-changes')
        .on('postgres_changes', 
            { event: '*', schema: 'public' },
            (payload) => {
                console.log('Mudança detectada:', payload);
                carregarDados(); // Recarregar dados
            }
        )
        .subscribe();

    return () => {
        subscription.unsubscribe();
    };
}, []);
```

### 2. Cache Local
```javascript
// Ainda usar localStorage como cache
useEffect(() => {
    if (data) {
        localStorage.setItem('finData', JSON.stringify(data));
    }
}, [data]);

// Carregar do cache primeiro, depois atualizar do Supabase
useEffect(() => {
    // Carregar cache primeiro (rápido)
    const cached = localStorage.getItem('finData');
    if (cached) {
        setData(JSON.parse(cached));
    }
    
    // Depois carregar do Supabase (atualizado)
    carregarDados();
}, []);
```

---

## 🔒 Segurança (Row Level Security)

No Supabase Dashboard, configure RLS para cada tabela:

```sql
-- Exemplo: Permitir leitura pública, mas escrita apenas autenticada
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública" ON gastos
    FOR SELECT USING (true);

CREATE POLICY "Permitir inserção para todos" ON gastos
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização para todos" ON gastos
    FOR UPDATE USING (true);

CREATE POLICY "Permitir exclusão para todos" ON gastos
    FOR DELETE USING (true);
```

---

## ✅ Checklist de Implementação

- [ ] Adicionar script do Supabase no HTML
- [ ] Inicializar cliente Supabase
- [ ] Substituir `carregarDados()` por versão Supabase
- [ ] Substituir `save()` por versão Supabase
- [ ] Substituir `del()` por versão Supabase
- [ ] Adicionar botão de migração temporário
- [ ] Executar migração de dados
- [ ] Testar todas as funcionalidades
- [ ] Remover código de localStorage antigo
- [ ] Remover botão de migração
- [ ] Configurar RLS no Supabase (opcional)

---

## 🎉 Pronto!

Após seguir este guia, seu sistema estará **100% integrado com Supabase**!

**Benefícios:**
✅ Dados na nuvem  
✅ Sincronização automática  
✅ Acesso de qualquer dispositivo  
✅ Backup automático  
✅ Escalável  
✅ Gratuito até 500MB  

---

**Qualquer dúvida, consulte a documentação oficial: https://supabase.com/docs**

