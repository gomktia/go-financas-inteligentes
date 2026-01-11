# 🔄 Guia de Migração - LocalStorage para Banco de Dados

## 📋 Visão Geral

Este guia explica como migrar o sistema atual (que usa LocalStorage) para um backend completo com banco de dados.

---

## 🎯 Estratégias de Migração

### Opção 1: Big Bang (Tudo de uma vez)
- Migrar tudo de uma vez
- **Vantagem:** Rápido
- **Desvantagem:** Alto risco

### Opção 2: Gradual (Recomendado)
- Manter LocalStorage e adicionar backend gradualmente
- **Vantagem:** Baixo risco, pode reverter
- **Desvantagem:** Mais trabalho

### Opção 3: Paralelo
- Rodar ambos em paralelo por um tempo
- **Vantagem:** Seguro, permite validação
- **Desvantagem:** Duplicação de esforço

**👉 Recomendamos a Opção 2 (Gradual)**

---

## 🗺️ Roadmap de Migração

### Fase 1: Preparação (1-2 semanas)
1. ✅ Escolher stack de backend
2. ✅ Configurar ambiente de desenvolvimento
3. ✅ Criar banco de dados
4. ✅ Executar script `database_setup.sql`
5. ✅ Criar API básica com autenticação

### Fase 2: Migração de Leitura (2-3 semanas)
1. ✅ Implementar endpoints de leitura (GET)
2. ✅ Criar script de migração de dados
3. ✅ Migrar dados do LocalStorage para BD
4. ✅ Modificar frontend para ler do backend
5. ✅ Manter fallback para LocalStorage

### Fase 3: Migração de Escrita (2-3 semanas)
1. ✅ Implementar endpoints de escrita (POST, PUT, DELETE)
2. ✅ Modificar frontend para escrever no backend
3. ✅ Implementar sincronização
4. ✅ Testar exaustivamente

### Fase 4: Funcionalidades Avançadas (3-4 semanas)
1. ✅ Implementar autenticação completa
2. ✅ Adicionar multi-dispositivo
3. ✅ Implementar sincronização em tempo real
4. ✅ Adicionar backup automático

### Fase 5: Deploy e Monitoramento (1-2 semanas)
1. ✅ Deploy em produção
2. ✅ Configurar monitoramento
3. ✅ Configurar backups automáticos
4. ✅ Remover código de LocalStorage

**Total estimado: 9-14 semanas**

---

## 💻 Stack Recomendada

### Opção 1: JavaScript/TypeScript Full Stack ⭐ RECOMENDADO
```
Frontend: React (atual)
Backend: Node.js + Express + TypeScript
Database: PostgreSQL
ORM: Prisma ou TypeORM
Auth: JWT + bcrypt
Deploy: Vercel (frontend) + Railway/Render (backend)
```

**Vantagens:**
- ✅ Mesma linguagem (JavaScript)
- ✅ Fácil compartilhar tipos entre frontend e backend
- ✅ Grande comunidade
- ✅ Deploy fácil

**Desvantagens:**
- ❌ Node.js pode ser mais lento que outras linguagens
- ❌ Tipagem não tão forte quanto TypeScript compilado

### Opção 2: Python
```
Frontend: React (atual)
Backend: FastAPI + Python
Database: PostgreSQL
ORM: SQLAlchemy
Auth: JWT + passlib
Deploy: Vercel (frontend) + Render/Railway (backend)
```

**Vantagens:**
- ✅ Python é muito popular
- ✅ FastAPI é extremamente rápido
- ✅ Ótimo para futuras integrações com ML/IA
- ✅ Código limpo e legível

**Desvantagens:**
- ❌ Duas linguagens diferentes
- ❌ Deploy pode ser mais complexo

### Opção 3: Go
```
Frontend: React (atual)
Backend: Go + Gin/Echo
Database: PostgreSQL
ORM: GORM
Auth: JWT
Deploy: Vercel (frontend) + Fly.io (backend)
```

**Vantagens:**
- ✅ Extremamente rápido
- ✅ Baixo uso de memória
- ✅ Compilado (mais seguro)
- ✅ Ótimo para escalabilidade

**Desvantagens:**
- ❌ Curva de aprendizado
- ❌ Menos bibliotecas que JS/Python

---

## 📝 Script de Migração de Dados

### JavaScript (Node.js)

```javascript
// migrate-localstorage-to-db.js
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  host: 'localhost',
  database: 'financeiro',
  user: 'postgres',
  password: 'senha',
  port: 5432,
});

async function migrarDados() {
  console.log('🚀 Iniciando migração...');
  
  // 1. Ler dados do arquivo JSON exportado do LocalStorage
  const dados = JSON.parse(fs.readFileSync('dados_localstorage.json', 'utf8'));
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 2. Migrar usuários
    console.log('📝 Migrando usuários...');
    for (const user of dados.users) {
      await client.query(
        `INSERT INTO users (id, nome, cor, ativo) 
         VALUES ($1, $2, $3, TRUE) 
         ON CONFLICT (id) DO NOTHING`,
        [user.id, user.nome, user.cor]
      );
    }
    
    // 3. Migrar salários
    console.log('💰 Migrando salários...');
    for (const salary of dados.salaries) {
      await client.query(
        `INSERT INTO salaries (usuario_id, valor, descricao)
         VALUES ($1, $2, $3)`,
        [salary.usuarioId, salary.valor, salary.descricao || '']
      );
    }
    
    // 4. Migrar categorias (se não existirem)
    console.log('🏷️ Verificando categorias...');
    const categoriasMap = new Map();
    const categorias = await client.query('SELECT id, nome FROM categorias');
    categorias.rows.forEach(cat => {
      categoriasMap.set(cat.nome, cat.id);
    });
    
    // 5. Migrar gastos
    console.log('💸 Migrando gastos...');
    for (const gasto of dados.exp) {
      const categoriaId = gasto.categoria 
        ? categoriasMap.get(gasto.categoria) 
        : null;
      
      await client.query(
        `INSERT INTO gastos (usuario_id, categoria_id, descricao, valor, data)
         VALUES ($1, $2, $3, $4, $5)`,
        [gasto.usuarioId, categoriaId, gasto.descricao, gasto.valor, gasto.data]
      );
    }
    
    // 6. Migrar compras parceladas
    console.log('🛍️ Migrando compras parceladas...');
    for (const parcela of dados.parcelas || []) {
      const categoriaId = parcela.categoria 
        ? categoriasMap.get(parcela.categoria) 
        : null;
      
      await client.query(
        `INSERT INTO compras_parceladas 
         (usuario_id, categoria_id, produto, valor_total, total_parcelas, 
          valor_parcela, parcelas_pagas, data_compra, finalizada)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          parcela.usuario_id || null,
          categoriaId,
          parcela.produto,
          parcela.valorTotal,
          parcela.totalParcelas,
          parcela.valorParcela,
          parcela.parcelasPagas,
          parcela.data,
          parcela.parcelasPagas >= parcela.totalParcelas
        ]
      );
    }
    
    // 7. Migrar gasolina
    console.log('⛽ Migrando gasolina...');
    for (const gas of dados.gasolina || []) {
      await client.query(
        `INSERT INTO gasolina 
         (usuario_id, veiculo, valor, litros, local, km_atual, data)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          gas.usuario_id || null,
          gas.veiculo,
          gas.valor,
          gas.litros || null,
          gas.local || null,
          gas.km_atual || null,
          gas.data
        ]
      );
    }
    
    // 8. Migrar assinaturas
    console.log('📺 Migrando assinaturas...');
    for (const sub of dados.subs) {
      await client.query(
        `INSERT INTO assinaturas (nome, valor, ativa)
         VALUES ($1, $2, $3)`,
        [sub.nome, sub.valor, sub.ativa]
      );
    }
    
    // 9. Migrar contas fixas
    console.log('🏠 Migrando contas fixas...');
    for (const conta of dados.bills) {
      await client.query(
        `INSERT INTO contas_fixas (nome, valor, dia_vencimento, ativa)
         VALUES ($1, $2, $3, TRUE)`,
        [conta.nome, conta.valor, 5] // dia_vencimento padrão
      );
    }
    
    // 10. Migrar cartões
    console.log('💳 Migrando cartões...');
    for (const card of dados.cards) {
      await client.query(
        `INSERT INTO cartoes (usuario_id, nome, limite, gasto_atual, ativo)
         VALUES ($1, $2, $3, $4, TRUE)`,
        [card.usuarioId, card.nome, card.limite, card.gasto]
      );
    }
    
    // 11. Migrar metas
    console.log('🎯 Migrando metas...');
    for (const meta of dados.goals) {
      await client.query(
        `INSERT INTO metas (nome, valor_alvo, valor_atual, cor, concluida)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          meta.nome,
          meta.valorAlvo,
          meta.valorAtual,
          meta.cor,
          meta.valorAtual >= meta.valorAlvo
        ]
      );
    }
    
    // 12. Migrar orçamentos
    console.log('📊 Migrando orçamentos...');
    for (const budget of dados.budgets) {
      const categoriaId = categoriasMap.get(budget.categoria);
      if (categoriaId) {
        await client.query(
          `INSERT INTO orcamentos (categoria_id, limite)
           VALUES ($1, $2)`,
          [categoriaId, budget.limite]
        );
      }
    }
    
    // 13. Migrar ferramentas
    console.log('🛠️ Migrando ferramentas...');
    for (const tool of dados.tools) {
      await client.query(
        `INSERT INTO ferramentas (ferramenta, valor, ativa)
         VALUES ($1, $2, $3)`,
        [tool.ferramenta, tool.valor, tool.ativa]
      );
    }
    
    // 14. Migrar investimentos
    console.log('📈 Migrando investimentos...');
    for (const invest of dados.investments) {
      await client.query(
        `INSERT INTO investimentos (nome, tipo, valor, rendimento_percentual, ativo)
         VALUES ($1, $2, $3, $4, TRUE)`,
        [invest.nome, invest.tipo, invest.valor, invest.rendimento]
      );
    }
    
    // 15. Migrar patrimônio
    console.log('🏛️ Migrando patrimônio...');
    for (const asset of dados.assets) {
      await client.query(
        `INSERT INTO patrimonio (nome, tipo, valor, ativo)
         VALUES ($1, $2, $3, TRUE)`,
        [asset.nome, asset.tipo, asset.valor]
      );
    }
    
    // 16. Migrar dívidas
    console.log('💳 Migrando dívidas...');
    for (const debt of dados.debts) {
      await client.query(
        `INSERT INTO dividas 
         (nome, valor_total, valor_pago, total_parcelas, parcelas_pagas, quitada)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          debt.nome,
          debt.valorTotal,
          debt.valorPago,
          debt.parcelas,
          debt.parcelasPagas,
          debt.valorPago >= debt.valorTotal
        ]
      );
    }
    
    // 17. Migrar empréstimos
    console.log('💰 Migrando empréstimos...');
    for (const loan of dados.loans) {
      await client.query(
        `INSERT INTO emprestimos (nome, tipo, valor, data_emprestimo, pago)
         VALUES ($1, $2, $3, $4, $5)`,
        [loan.nome, loan.tipo, loan.valor, loan.data, loan.pago]
      );
    }
    
    await client.query('COMMIT');
    console.log('✅ Migração concluída com sucesso!');
    
    // Mostrar estatísticas
    const stats = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as usuarios,
        (SELECT COUNT(*) FROM gastos) as gastos,
        (SELECT COUNT(*) FROM compras_parceladas) as parcelas,
        (SELECT COUNT(*) FROM gasolina) as gasolina,
        (SELECT COUNT(*) FROM assinaturas) as assinaturas
    `);
    
    console.log('\n📊 Estatísticas:');
    console.log(`   Usuários: ${stats.rows[0].usuarios}`);
    console.log(`   Gastos: ${stats.rows[0].gastos}`);
    console.log(`   Parcelas: ${stats.rows[0].parcelas}`);
    console.log(`   Gasolina: ${stats.rows[0].gasolina}`);
    console.log(`   Assinaturas: ${stats.rows[0].assinaturas}`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro na migração:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Exportar dados do LocalStorage antes de rodar
console.log(`
📝 ANTES DE EXECUTAR:

1. Abra o sistema no navegador
2. Abra o Console (F12)
3. Execute este comando:
   
   const data = localStorage.getItem('finData');
   const blob = new Blob([data], {type: 'application/json'});
   const url = URL.createObjectURL(blob);
   const a = document.createElement('a');
   a.href = url;
   a.download = 'dados_localstorage.json';
   a.click();

4. Salve o arquivo como 'dados_localstorage.json'
5. Execute este script: node migrate-localstorage-to-db.js
`);

migrarDados()
  .then(() => {
    console.log('🎉 Tudo pronto!');
    process.exit(0);
  })
  .catch(err => {
    console.error('💥 Erro fatal:', err);
    process.exit(1);
  });
```

---

## 🔄 Modificações no Frontend

### Criar um arquivo `api.js`:

```javascript
// src/services/api.js
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/v1';

class API {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  async fetch(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Gastos
  async getGastos(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.fetch(`/gastos?${params}`);
  }

  async createGasto(gasto) {
    return this.fetch('/gastos', {
      method: 'POST',
      body: JSON.stringify(gasto),
    });
  }

  async updateGasto(id, gasto) {
    return this.fetch(`/gastos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(gasto),
    });
  }

  async deleteGasto(id) {
    return this.fetch(`/gastos/${id}`, {
      method: 'DELETE',
    });
  }

  // Compras Parceladas
  async getParcelas() {
    return this.fetch('/parcelas');
  }

  async createParcela(parcela) {
    return this.fetch('/parcelas', {
      method: 'POST',
      body: JSON.stringify(parcela),
    });
  }

  // Gasolina
  async getGasolina() {
    return this.fetch('/gasolina');
  }

  async createGasolina(abastecimento) {
    return this.fetch('/gasolina', {
      method: 'POST',
      body: JSON.stringify(abastecimento),
    });
  }

  // Dashboard
  async getDashboard(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.fetch(`/dashboard?${params}`);
  }
}

export default new API();
```

### Modificar o componente React:

```javascript
// Adicionar no início do App
import api from './services/api';

// Substituir localStorage por API
function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      
      // Carregar todos os dados do backend
      const [
        users,
        gastos,
        parcelas,
        gasolina,
        // ... outros
      ] = await Promise.all([
        api.fetch('/users'),
        api.fetch('/gastos'),
        api.fetch('/parcelas'),
        api.fetch('/gasolina'),
        // ... outros endpoints
      ]);

      setData({
        users: users.data,
        exp: gastos.data,
        parcelas: parcelas.data,
        gasolina: gasolina.data,
        // ... outros
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      // Fallback para localStorage se API falhar
      const localData = localStorage.getItem('finData');
      if (localData) {
        setData(JSON.parse(localData));
      }
    } finally {
      setLoading(false);
    }
  }

  // Modificar save para usar API
  const save = async () => {
    try {
      const item = { id: editing?.id || Date.now(), ...form };
      
      if (modal === 'exp') {
        if (editing) {
          await api.updateGasto(item.id, item);
        } else {
          await api.createGasto(item);
        }
      } else if (modal === 'parcela') {
        if (editing) {
          await api.fetch(`/parcelas/${item.id}`, {
            method: 'PUT',
            body: JSON.stringify(item),
          });
        } else {
          await api.createParcela(item);
        }
      }
      // ... outros tipos
      
      // Recarregar dados
      await loadData();
      close();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar. Tente novamente.');
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  // ... resto do componente
}
```

---

## 🚀 Deploy

### Backend (Node.js)

#### Railway:
```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Criar projeto
railway init

# 4. Adicionar PostgreSQL
railway add postgresql

# 5. Deploy
railway up
```

#### Render:
1. Conectar repositório GitHub
2. Selecionar "Web Service"
3. Configurar:
   - Build Command: `npm install`
   - Start Command: `node server.js`
4. Adicionar PostgreSQL (Add-on)
5. Deploy automático

### Frontend (React)

#### Vercel:
```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Deploy
vercel

# 3. Configurar variáveis de ambiente
# REACT_APP_API_URL=https://seu-backend.railway.app/v1
```

---

## 📊 Checklist de Migração

### Preparação
- [ ] Escolher stack de backend
- [ ] Configurar ambiente local
- [ ] Criar banco de dados
- [ ] Executar script de setup
- [ ] Testar conexão

### Desenvolvimento
- [ ] Implementar autenticação
- [ ] Criar endpoints de leitura
- [ ] Criar endpoints de escrita
- [ ] Criar script de migração
- [ ] Modificar frontend

### Testes
- [ ] Testar todos os endpoints
- [ ] Testar migração de dados
- [ ] Testar frontend completo
- [ ] Testar sincronização
- [ ] Testar em múltiplos dispositivos

### Deploy
- [ ] Deploy do backend
- [ ] Configurar banco em produção
- [ ] Migrar dados de produção
- [ ] Deploy do frontend
- [ ] Configurar domínio
- [ ] Configurar SSL/HTTPS

### Pós-Deploy
- [ ] Monitorar erros
- [ ] Configurar backups
- [ ] Documentar APIs
- [ ] Treinar usuários
- [ ] Remover código legado

---

## ⚠️ Cuidados Importantes

1. **Backup:** Sempre faça backup dos dados antes de migrar
2. **Testes:** Teste exaustivamente em ambiente de desenvolvimento
3. **Rollback:** Tenha um plano de rollback
4. **Monitoramento:** Configure logs e monitoramento
5. **Performance:** Monitore performance do banco
6. **Segurança:** Use HTTPS sempre
7. **Validação:** Valide todos os inputs

---

## 📞 Suporte

Se tiver problemas durante a migração:
1. Verifique os logs do backend
2. Verifique o console do navegador
3. Teste conexão com o banco
4. Verifique variáveis de ambiente
5. Consulte documentação da stack escolhida

---

**Boa sorte com a migração! 🚀**

