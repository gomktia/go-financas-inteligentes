
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://sfemmeczjhleyqeegwhs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmZW1tZWN6amhsZXlxZWVnd2hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNjQxODcsImV4cCI6MjA3NDk0MDE4N30.T6JcEj7zZalMa7QIvU58ZQvK5c0_ChfNrc0VT5n1lds';

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanObsoleteTables() {
    console.log('🧹 Cleaning obsolete tables...');

    // Check for ferramentas_ia_dev (likely obsolete)
    const { error } = await supabase.from('ferramentas_ia_dev').select('count', { count: 'exact', head: true });

    if (!error) {
        console.log('⚠️  Found obsolete table: ferramentas_ia_dev');
        // We can't DROP TABLE via JS client directly without Rpc or custom SQL function unless enabled not recommended for client side.
        // But wait, we can just inform the user to drop it or use the SQL editor.
        // Actually, I can DROP it via the `run_sql` approach if I had the tool, but I have `replace_file_content` for SQL files.
        // I will confirm existence first.
    } else {
        console.log('✅ Table ferramentas_ia_dev not found (already clean).');
    }
}

cleanObsoleteTables();
