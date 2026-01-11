
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://sfemmeczjhleyqeegwhs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmZW1tZWN6amhsZXlxZWVnd2hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNjQxODcsImV4cCI6MjA3NDk0MDE4N30.T6JcEj7zZalMa7QIvU58ZQvK5c0_ChfNrc0VT5n1lds';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
    console.log('🔍 Checking Family Tables...');

    const tables = ['familias', 'familia_membros', 'convites'];
    const results = {};

    for (const table of tables) {
        const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
        results[table] = error ? 'MISSING' : 'EXISTS';
    }

    console.log(JSON.stringify(results, null, 2));
}

checkTables();
