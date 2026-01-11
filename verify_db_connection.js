
const { createClient } = require('@supabase/supabase-js');

// Manually using the credentials provided by the user
const supabaseUrl = 'https://sfemmeczjhleyqeegwhs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmZW1tZWN6amhsZXlxZWVnd2hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNjQxODcsImV4cCI6MjA3NDk0MDE4N30.T6JcEj7zZalMa7QIvU58ZQvK5c0_ChfNrc0VT5n1lds';

const supabase = createClient(supabaseUrl, supabaseKey);

const tablesToCheck = [
    'users',
    'salaries',
    'categorias',
    'gastos',
    'compras_parceladas',
    'gasolina',
    'assinaturas',
    'contas_fixas',
    'ferramentas_ia_dev', // Note: name in code might be different from expected
    'ferramentas', // checking both just in case
    'cartoes',
    'metas',
    'investimentos',
    'dividas',
    'emprestimos',
    'orcamentos',
    'patrimonio'
];

async function checkTables() {
    console.log("Iniciando verificação de tabelas...");
    const results = {};

    for (const table of tablesToCheck) {
        try {
            const { data, error } = await supabase.from(table).select('*').limit(1);
            if (error) {
                results[table] = { status: 'ERROR', message: error.message };
            } else {
                results[table] = { status: 'OK', count: data.length };
            }
        } catch (err) {
            results[table] = { status: 'EXCEPTION', message: err.message };
        }
    }

    console.log(JSON.stringify(results, null, 2));

    // Also try to list categories to see if data is populated
    console.log("\nVerificando Categorias...");
    const { data: catData, error: catError } = await supabase.from('categorias').select('tipo, nome');
    if (catError) {
        console.log("Erro ao buscar categorias:", catError.message);
    } else {
        console.log(`Encontradas ${catData.length} categorias.`);
        const types = {};
        catData.forEach(c => {
            types[c.tipo] = (types[c.tipo] || 0) + 1;
        });
        console.log("Contagem por tipo:", types);
    }
}

checkTables();
