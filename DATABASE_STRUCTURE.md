# 🗄️ Estrutura de Banco de Dados - Sistema Financeiro

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Estrutura Atual (LocalStorage)](#estrutura-atual)
3. [Modelo Relacional (SQL)](#modelo-relacional-sql)
4. [Modelo NoSQL (MongoDB)](#modelo-nosql-mongodb)
5. [Relacionamentos](#relacionamentos)
6. [Índices e Performance](#índices-e-performance)
7. [Queries Importantes](#queries-importantes)
8. [Migrações Futuras](#migrações-futuras)
9. [Scripts SQL](#scripts-sql)

---

## 🎯 Visão Geral

O sistema atualmente usa **LocalStorage** (armazenamento do navegador), mas pode ser migrado para um banco de dados real quando necessário escalar ou adicionar funcionalidades como:
- Sincronização multi-dispositivo
- Backup automático em nuvem
- Acesso web de qualquer lugar
- Colaboração em tempo real
- Histórico e auditoria completa

---

## 📦 Estrutura Atual (LocalStorage)

### Formato JSON Atual:
```json
{
  "users": [],
  "salaries": [],
  "exp": [],
  "subs": [],
  "bills": [],
  "cards": [],
  "goals": [],
  "budgets": [],
  "investments": [],
  "assets": [],
  "debts": [],
  "loans": [],
  "tools": [],
  "parcelas": [],
  "gasolina": []
}
```

---

## 🗃️ Modelo Relacional (SQL)

### 1. **Tabela: users** (Usuários)
Armazena os membros da família/organização.

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cor VARCHAR(7) NOT NULL DEFAULT '#007AFF', -- Cor em hexadecimal
    email VARCHAR(255) UNIQUE,
    foto_url VARCHAR(500),
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Campos:**
- `id`: Identificador único
- `nome`: Nome do usuário (ex: "Você", "Esposa")
- `cor`: Cor de identificação visual
- `email`: Email (para login futuro)
- `foto_url`: URL da foto de perfil
- `ativo`: Se o usuário está ativo
- `data_criacao`: Quando foi criado
- `data_atualizacao`: Última atualização

---

### 2. **Tabela: salaries** (Salários)
Armazena os salários de cada usuário.

```sql
CREATE TABLE salaries (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    valor DECIMAL(15, 2) NOT NULL,
    descricao VARCHAR(255),
    mes_referencia DATE, -- Mês de referência do salário
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valor_positivo CHECK (valor >= 0)
);
```

**Campos:**
- `id`: Identificador único
- `usuario_id`: Referência ao usuário
- `valor`: Valor do salário
- `descricao`: Descrição (ex: "Salário Principal", "Freelance")
- `mes_referencia`: Mês de referência (permite histórico mensal)

---

### 3. **Tabela: categorias** (Categorias de Gastos)
Categorias reutilizáveis para organização.

```sql
CREATE TABLE categorias (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    icone VARCHAR(50), -- Emoji ou nome do ícone
    cor VARCHAR(7) DEFAULT '#007AFF',
    tipo VARCHAR(50) NOT NULL, -- 'gasto', 'parcela', 'outros'
    ativa BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Dados Iniciais:**
```sql
INSERT INTO categorias (nome, icone, tipo) VALUES
('Alimentação', '🍔', 'gasto'),
('Transporte', '🚗', 'gasto'),
('Saúde', '🏥', 'gasto'),
('Educação', '📚', 'gasto'),
('Lazer', '🎮', 'gasto'),
('Vestuário', '👕', 'gasto'),
('Moradia', '🏠', 'gasto'),
('Outros', '📦', 'gasto'),
('Eletrodomésticos', '🔌', 'parcela'),
('Eletrônicos', '📱', 'parcela'),
('Móveis', '🛋️', 'parcela'),
('Veículo', '🚗', 'parcela'),
('Reforma', '🔨', 'parcela');
```

---

### 4. **Tabela: gastos** (Gastos Variáveis)
Gastos do dia a dia.

```sql
CREATE TABLE gastos (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    categoria_id BIGINT REFERENCES categorias(id) ON DELETE SET NULL,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(15, 2) NOT NULL,
    data DATE NOT NULL,
    observacoes TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valor_positivo CHECK (valor >= 0)
);
```

**Índices:**
```sql
CREATE INDEX idx_gastos_usuario ON gastos(usuario_id);
CREATE INDEX idx_gastos_data ON gastos(data);
CREATE INDEX idx_gastos_categoria ON gastos(categoria_id);
CREATE INDEX idx_gastos_usuario_data ON gastos(usuario_id, data);
```

---

### 5. **Tabela: compras_parceladas** (Compras Parceladas)
Compras divididas em parcelas.

```sql
CREATE TABLE compras_parceladas (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    categoria_id BIGINT REFERENCES categorias(id) ON DELETE SET NULL,
    produto VARCHAR(255) NOT NULL,
    valor_total DECIMAL(15, 2) NOT NULL,
    total_parcelas INTEGER NOT NULL,
    valor_parcela DECIMAL(15, 2) NOT NULL,
    parcelas_pagas INTEGER DEFAULT 0,
    data_compra DATE NOT NULL,
    primeira_parcela DATE, -- Data de vencimento da primeira parcela
    dia_vencimento INTEGER, -- Dia do mês que vence (1-31)
    observacoes TEXT,
    finalizada BOOLEAN DEFAULT FALSE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT total_parcelas_valido CHECK (total_parcelas > 0),
    CONSTRAINT parcelas_pagas_valido CHECK (parcelas_pagas >= 0 AND parcelas_pagas <= total_parcelas),
    CONSTRAINT valor_total_positivo CHECK (valor_total > 0),
    CONSTRAINT valor_parcela_positivo CHECK (valor_parcela > 0)
);
```

**Índices:**
```sql
CREATE INDEX idx_parcelas_usuario ON compras_parceladas(usuario_id);
CREATE INDEX idx_parcelas_finalizada ON compras_parceladas(finalizada);
CREATE INDEX idx_parcelas_data ON compras_parceladas(data_compra);
```

---

### 6. **Tabela: gasolina** (Abastecimentos)
Registro de abastecimentos de veículos.

```sql
CREATE TABLE gasolina (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    veiculo VARCHAR(50) NOT NULL, -- 'carro' ou 'moto'
    valor DECIMAL(15, 2) NOT NULL,
    litros DECIMAL(10, 3), -- Opcional, em litros
    preco_litro DECIMAL(10, 3), -- Calculado: valor / litros
    local VARCHAR(255),
    km_atual INTEGER, -- Quilometragem atual do veículo
    data DATE NOT NULL,
    observacoes TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT veiculo_valido CHECK (veiculo IN ('carro', 'moto')),
    CONSTRAINT valor_positivo CHECK (valor > 0),
    CONSTRAINT litros_positivo CHECK (litros IS NULL OR litros > 0)
);
```

**Trigger para calcular preço por litro:**
```sql
CREATE OR REPLACE FUNCTION calcular_preco_litro()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.litros IS NOT NULL AND NEW.litros > 0 THEN
        NEW.preco_litro := NEW.valor / NEW.litros;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calcular_preco_litro
    BEFORE INSERT OR UPDATE ON gasolina
    FOR EACH ROW
    EXECUTE FUNCTION calcular_preco_litro();
```

**Índices:**
```sql
CREATE INDEX idx_gasolina_usuario ON gasolina(usuario_id);
CREATE INDEX idx_gasolina_veiculo ON gasolina(veiculo);
CREATE INDEX idx_gasolina_data ON gasolina(data);
```

---

### 7. **Tabela: assinaturas** (Assinaturas e Serviços)
Netflix, Spotify, etc.

```sql
CREATE TABLE assinaturas (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    valor DECIMAL(15, 2) NOT NULL,
    ativa BOOLEAN DEFAULT TRUE,
    periodicidade VARCHAR(20) DEFAULT 'mensal', -- 'mensal', 'anual', 'trimestral'
    dia_vencimento INTEGER, -- Dia do mês que cobra (1-31)
    data_inicio DATE,
    data_cancelamento DATE,
    url VARCHAR(500), -- URL do serviço
    observacoes TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valor_positivo CHECK (valor > 0),
    CONSTRAINT periodicidade_valida CHECK (periodicidade IN ('mensal', 'anual', 'trimestral', 'semestral'))
);
```

---

### 8. **Tabela: contas_fixas** (Contas Fixas)
Aluguel, luz, água, internet, etc.

```sql
CREATE TABLE contas_fixas (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    valor DECIMAL(15, 2) NOT NULL,
    dia_vencimento INTEGER NOT NULL, -- Dia do mês que vence
    categoria VARCHAR(100), -- 'moradia', 'utilidades', 'servicos'
    ativa BOOLEAN DEFAULT TRUE,
    observacoes TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valor_positivo CHECK (valor > 0),
    CONSTRAINT dia_valido CHECK (dia_vencimento >= 1 AND dia_vencimento <= 31)
);
```

---

### 9. **Tabela: cartoes** (Cartões de Crédito)
Controle de cartões de crédito.

```sql
CREATE TABLE cartoes (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    bandeira VARCHAR(50), -- 'visa', 'mastercard', 'elo', etc
    limite DECIMAL(15, 2) NOT NULL,
    gasto_atual DECIMAL(15, 2) DEFAULT 0,
    dia_fechamento INTEGER, -- Dia que fecha a fatura
    dia_vencimento INTEGER, -- Dia que vence a fatura
    ultimos_digitos VARCHAR(4), -- Últimos 4 dígitos do cartão
    ativo BOOLEAN DEFAULT TRUE,
    observacoes TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT limite_positivo CHECK (limite > 0),
    CONSTRAINT gasto_valido CHECK (gasto_atual >= 0)
);
```

---

### 10. **Tabela: metas** (Metas Financeiras)
Objetivos de economia.

```sql
CREATE TABLE metas (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    valor_alvo DECIMAL(15, 2) NOT NULL,
    valor_atual DECIMAL(15, 2) DEFAULT 0,
    cor VARCHAR(7) DEFAULT '#007AFF',
    prazo_final DATE,
    descricao TEXT,
    concluida BOOLEAN DEFAULT FALSE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valor_alvo_positivo CHECK (valor_alvo > 0),
    CONSTRAINT valor_atual_valido CHECK (valor_atual >= 0)
);
```

---

### 11. **Tabela: orcamentos** (Orçamentos por Categoria)
Limites de gasto por categoria.

```sql
CREATE TABLE orcamentos (
    id BIGSERIAL PRIMARY KEY,
    categoria_id BIGINT REFERENCES categorias(id) ON DELETE CASCADE,
    limite DECIMAL(15, 2) NOT NULL,
    mes_referencia DATE, -- NULL = orçamento geral
    alerta_percentual INTEGER DEFAULT 80, -- Alerta quando atingir % do limite
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT limite_positivo CHECK (limite > 0),
    CONSTRAINT alerta_valido CHECK (alerta_percentual >= 0 AND alerta_percentual <= 100)
);
```

---

### 12. **Tabela: ferramentas** (Ferramentas IA/Dev)
Controle de assinaturas de ferramentas de desenvolvimento.

```sql
CREATE TABLE ferramentas (
    id BIGSERIAL PRIMARY KEY,
    ferramenta VARCHAR(255) NOT NULL,
    valor DECIMAL(15, 2) NOT NULL,
    ativa BOOLEAN DEFAULT TRUE,
    tipo VARCHAR(100), -- 'ia', 'dev', 'design', 'cloud', etc
    url VARCHAR(500),
    observacoes TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valor_positivo CHECK (valor > 0)
);
```

---

### 13. **Tabela: investimentos** (Investimentos)
Aplicações financeiras.

```sql
CREATE TABLE investimentos (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(100) NOT NULL, -- 'Renda Fixa', 'Ações', 'FIIs', etc
    valor DECIMAL(15, 2) NOT NULL,
    rendimento_percentual DECIMAL(10, 4), -- % de rendimento
    data_aplicacao DATE,
    data_vencimento DATE,
    instituicao VARCHAR(255), -- Banco/Corretora
    liquidez VARCHAR(50), -- 'diária', 'mensal', 'vencimento'
    observacoes TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valor_positivo CHECK (valor > 0)
);
```

---

### 14. **Tabela: patrimonio** (Patrimônio/Bens)
Imóveis, veículos e outros bens.

```sql
CREATE TABLE patrimonio (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(100) NOT NULL, -- 'Imóvel', 'Veículo', 'Eletrônico', etc
    valor DECIMAL(15, 2) NOT NULL,
    data_aquisicao DATE,
    valor_aquisicao DECIMAL(15, 2), -- Valor original de compra
    depreciacao_anual DECIMAL(10, 4), -- % de depreciação anual
    observacoes TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valor_positivo CHECK (valor > 0)
);
```

---

### 15. **Tabela: dividas** (Dívidas)
Financiamentos e dívidas parceladas.

```sql
CREATE TABLE dividas (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    valor_total DECIMAL(15, 2) NOT NULL,
    valor_pago DECIMAL(15, 2) DEFAULT 0,
    total_parcelas INTEGER NOT NULL,
    parcelas_pagas INTEGER DEFAULT 0,
    valor_parcela DECIMAL(15, 2),
    taxa_juros DECIMAL(10, 4), -- % de juros
    dia_vencimento INTEGER,
    instituicao VARCHAR(255), -- Banco/Financeira
    tipo VARCHAR(100), -- 'Financiamento', 'Empréstimo', 'Cheque Especial'
    data_contratacao DATE,
    observacoes TEXT,
    quitada BOOLEAN DEFAULT FALSE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valor_total_positivo CHECK (valor_total > 0),
    CONSTRAINT valor_pago_valido CHECK (valor_pago >= 0 AND valor_pago <= valor_total),
    CONSTRAINT parcelas_validas CHECK (parcelas_pagas >= 0 AND parcelas_pagas <= total_parcelas)
);
```

---

### 16. **Tabela: emprestimos** (Empréstimos)
Dinheiro emprestado para/de terceiros.

```sql
CREATE TABLE emprestimos (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL, -- Nome da pessoa
    tipo VARCHAR(20) NOT NULL, -- 'emprestei' ou 'peguei'
    valor DECIMAL(15, 2) NOT NULL,
    data_emprestimo DATE NOT NULL,
    data_vencimento DATE,
    pago BOOLEAN DEFAULT FALSE,
    data_pagamento DATE,
    observacoes TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT tipo_valido CHECK (tipo IN ('emprestei', 'peguei')),
    CONSTRAINT valor_positivo CHECK (valor > 0)
);
```

---

## 🔗 Relacionamentos

### Diagrama de Relacionamentos (ER):

```
users (1) ──── (N) salaries
users (1) ──── (N) gastos
users (1) ──── (N) compras_parceladas
users (1) ──── (N) gasolina
users (1) ──── (N) cartoes

categorias (1) ──── (N) gastos
categorias (1) ──── (N) compras_parceladas
categorias (1) ──── (N) orcamentos
```

### Chaves Estrangeiras:
- `salaries.usuario_id` → `users.id`
- `gastos.usuario_id` → `users.id`
- `gastos.categoria_id` → `categorias.id`
- `compras_parceladas.usuario_id` → `users.id`
- `compras_parceladas.categoria_id` → `categorias.id`
- `gasolina.usuario_id` → `users.id`
- `cartoes.usuario_id` → `users.id`
- `orcamentos.categoria_id` → `categorias.id`

---

## 🚀 Índices e Performance

### Índices Essenciais:

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_ativo ON users(ativo);

-- Gastos
CREATE INDEX idx_gastos_mes ON gastos(EXTRACT(YEAR FROM data), EXTRACT(MONTH FROM data));
CREATE INDEX idx_gastos_usuario_mes ON gastos(usuario_id, EXTRACT(YEAR FROM data), EXTRACT(MONTH FROM data));

-- Compras Parceladas
CREATE INDEX idx_parcelas_ativas ON compras_parceladas(finalizada) WHERE finalizada = FALSE;

-- Gasolina
CREATE INDEX idx_gasolina_mes ON gasolina(EXTRACT(YEAR FROM data), EXTRACT(MONTH FROM data));

-- Cartões
CREATE INDEX idx_cartoes_usuario_ativo ON cartoes(usuario_id, ativo);
```

---

## 📊 Queries Importantes

### 1. Total de Gastos do Mês por Usuário:
```sql
SELECT 
    u.nome,
    COALESCE(SUM(g.valor), 0) as total_gastos
FROM users u
LEFT JOIN gastos g ON u.id = g.usuario_id
WHERE EXTRACT(YEAR FROM g.data) = EXTRACT(YEAR FROM CURRENT_DATE)
  AND EXTRACT(MONTH FROM g.data) = EXTRACT(MONTH FROM CURRENT_DATE)
GROUP BY u.id, u.nome
ORDER BY total_gastos DESC;
```

### 2. Resumo Mensal Completo:
```sql
SELECT 
    'Gastos' as tipo,
    COALESCE(SUM(valor), 0) as total
FROM gastos
WHERE EXTRACT(YEAR FROM data) = EXTRACT(YEAR FROM CURRENT_DATE)
  AND EXTRACT(MONTH FROM data) = EXTRACT(MONTH FROM CURRENT_DATE)

UNION ALL

SELECT 
    'Parcelas' as tipo,
    COALESCE(SUM(valor_parcela), 0) as total
FROM compras_parceladas
WHERE finalizada = FALSE

UNION ALL

SELECT 
    'Gasolina' as tipo,
    COALESCE(SUM(valor), 0) as total
FROM gasolina
WHERE EXTRACT(YEAR FROM data) = EXTRACT(YEAR FROM CURRENT_DATE)
  AND EXTRACT(MONTH FROM data) = EXTRACT(MONTH FROM CURRENT_DATE)

UNION ALL

SELECT 
    'Assinaturas' as tipo,
    COALESCE(SUM(valor), 0) as total
FROM assinaturas
WHERE ativa = TRUE

UNION ALL

SELECT 
    'Contas Fixas' as tipo,
    COALESCE(SUM(valor), 0) as total
FROM contas_fixas
WHERE ativa = TRUE

UNION ALL

SELECT 
    'Ferramentas' as tipo,
    COALESCE(SUM(valor), 0) as total
FROM ferramentas
WHERE ativa = TRUE;
```

### 3. Gastos por Categoria (Mês Atual):
```sql
SELECT 
    c.nome as categoria,
    c.icone,
    COUNT(g.id) as quantidade,
    COALESCE(SUM(g.valor), 0) as total
FROM categorias c
LEFT JOIN gastos g ON c.id = g.categoria_id
    AND EXTRACT(YEAR FROM g.data) = EXTRACT(YEAR FROM CURRENT_DATE)
    AND EXTRACT(MONTH FROM g.data) = EXTRACT(MONTH FROM CURRENT_DATE)
WHERE c.tipo = 'gasto'
GROUP BY c.id, c.nome, c.icone
HAVING COUNT(g.id) > 0
ORDER BY total DESC;
```

### 4. Patrimônio Líquido:
```sql
SELECT 
    (SELECT COALESCE(SUM(valor), 0) FROM patrimonio WHERE ativo = TRUE) +
    (SELECT COALESCE(SUM(valor), 0) FROM investimentos WHERE ativo = TRUE) -
    (SELECT COALESCE(SUM(valor_total - valor_pago), 0) FROM dividas WHERE quitada = FALSE)
    as patrimonio_liquido;
```

### 5. Alertas de Orçamento:
```sql
SELECT 
    c.nome as categoria,
    o.limite,
    COALESCE(SUM(g.valor), 0) as gasto_atual,
    o.limite - COALESCE(SUM(g.valor), 0) as disponivel,
    ROUND((COALESCE(SUM(g.valor), 0) / o.limite) * 100, 2) as percentual_usado
FROM orcamentos o
JOIN categorias c ON o.categoria_id = c.id
LEFT JOIN gastos g ON c.id = g.categoria_id
    AND EXTRACT(YEAR FROM g.data) = EXTRACT(YEAR FROM CURRENT_DATE)
    AND EXTRACT(MONTH FROM g.data) = EXTRACT(MONTH FROM CURRENT_DATE)
WHERE o.mes_referencia IS NULL 
   OR (EXTRACT(YEAR FROM o.mes_referencia) = EXTRACT(YEAR FROM CURRENT_DATE)
   AND EXTRACT(MONTH FROM o.mes_referencia) = EXTRACT(MONTH FROM CURRENT_DATE))
GROUP BY c.id, c.nome, o.limite, o.alerta_percentual
HAVING (COALESCE(SUM(g.valor), 0) / o.limite) * 100 >= o.alerta_percentual
ORDER BY percentual_usado DESC;
```

### 6. Previsão de Gastos Mensais Fixos:
```sql
SELECT 
    tipo,
    SUM(valor) as total
FROM (
    SELECT 'Assinaturas' as tipo, valor FROM assinaturas WHERE ativa = TRUE
    UNION ALL
    SELECT 'Contas Fixas' as tipo, valor FROM contas_fixas WHERE ativa = TRUE
    UNION ALL
    SELECT 'Ferramentas' as tipo, valor FROM ferramentas WHERE ativa = TRUE
    UNION ALL
    SELECT 'Parcelas' as tipo, valor_parcela FROM compras_parceladas WHERE finalizada = FALSE
) as gastos_fixos
GROUP BY tipo
ORDER BY total DESC;
```

---

## 🔮 Migrações Futuras

### Fase 1: Funcionalidades Básicas (Atual)
✅ Todas as tabelas principais
✅ Relacionamentos básicos
✅ Índices essenciais

### Fase 2: Histórico e Auditoria
```sql
-- Tabela de auditoria genérica
CREATE TABLE auditoria (
    id BIGSERIAL PRIMARY KEY,
    tabela VARCHAR(100) NOT NULL,
    registro_id BIGINT NOT NULL,
    acao VARCHAR(20) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    usuario_id BIGINT REFERENCES users(id),
    dados_antigos JSONB,
    dados_novos JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    data_acao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_auditoria_tabela ON auditoria(tabela, registro_id);
CREATE INDEX idx_auditoria_usuario ON auditoria(usuario_id);
CREATE INDEX idx_auditoria_data ON auditoria(data_acao);
```

### Fase 3: Notificações e Lembretes
```sql
CREATE TABLE notificacoes (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL, -- 'alerta_orcamento', 'vencimento_conta', etc
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT,
    link VARCHAR(500),
    lida BOOLEAN DEFAULT FALSE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lembretes (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    data_lembrete TIMESTAMP NOT NULL,
    recorrente BOOLEAN DEFAULT FALSE,
    intervalo VARCHAR(20), -- 'diario', 'semanal', 'mensal', 'anual'
    enviado BOOLEAN DEFAULT FALSE,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Fase 4: Relatórios Personalizados
```sql
CREATE TABLE relatorios (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(100), -- 'gastos', 'receitas', 'comparativo', etc
    filtros JSONB, -- Filtros em formato JSON
    agendamento VARCHAR(50), -- 'diario', 'semanal', 'mensal'
    formato VARCHAR(20), -- 'pdf', 'excel', 'json'
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Fase 5: Compartilhamento e Colaboração
```sql
CREATE TABLE grupos (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    admin_id BIGINT REFERENCES users(id),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE grupo_membros (
    id BIGSERIAL PRIMARY KEY,
    grupo_id BIGINT REFERENCES grupos(id) ON DELETE CASCADE,
    usuario_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    papel VARCHAR(50) DEFAULT 'membro', -- 'admin', 'membro', 'visualizador'
    data_entrada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(grupo_id, usuario_id)
);

CREATE TABLE compartilhamentos (
    id BIGSERIAL PRIMARY KEY,
    usuario_origem_id BIGINT REFERENCES users(id),
    usuario_destino_id BIGINT REFERENCES users(id),
    tipo_recurso VARCHAR(100), -- 'meta', 'orcamento', 'relatorio'
    recurso_id BIGINT NOT NULL,
    permissao VARCHAR(50) DEFAULT 'leitura', -- 'leitura', 'edicao'
    data_compartilhamento TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Fase 6: Metas Avançadas
```sql
CREATE TABLE meta_historico (
    id BIGSERIAL PRIMARY KEY,
    meta_id BIGINT REFERENCES metas(id) ON DELETE CASCADE,
    valor_adicionado DECIMAL(15, 2),
    valor_anterior DECIMAL(15, 2),
    valor_novo DECIMAL(15, 2),
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE meta_contribuicoes (
    id BIGSERIAL PRIMARY KEY,
    meta_id BIGINT REFERENCES metas(id) ON DELETE CASCADE,
    usuario_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    valor DECIMAL(15, 2) NOT NULL,
    data_contribuicao DATE NOT NULL,
    observacoes TEXT
);
```

### Fase 7: Análise Preditiva
```sql
CREATE TABLE previsoes (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT REFERENCES users(id),
    tipo VARCHAR(100), -- 'gastos', 'receitas', 'saldo'
    mes_referencia DATE NOT NULL,
    valor_previsto DECIMAL(15, 2),
    valor_real DECIMAL(15, 2),
    acuracia DECIMAL(10, 4), -- % de precisão
    modelo VARCHAR(100), -- Modelo de ML usado
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE padroes_gastos (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT REFERENCES users(id),
    categoria_id BIGINT REFERENCES categorias(id),
    media_mensal DECIMAL(15, 2),
    tendencia VARCHAR(50), -- 'alta', 'baixa', 'estavel'
    sazonalidade JSONB, -- Padrões sazonais em JSON
    ultima_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🗂️ Modelo NoSQL (MongoDB)

Se preferir usar MongoDB (NoSQL):

### Collection: users
```javascript
{
  "_id": ObjectId("..."),
  "nome": "Você",
  "cor": "#007AFF",
  "email": "user@email.com",
  "foto_url": "",
  "ativo": true,
  "salarios": [
    {
      "valor": 5000,
      "descricao": "Salário Principal",
      "mes_referencia": ISODate("2025-10-01")
    }
  ],
  "data_criacao": ISODate("2025-10-01"),
  "data_atualizacao": ISODate("2025-10-02")
}
```

### Collection: gastos
```javascript
{
  "_id": ObjectId("..."),
  "usuario_id": ObjectId("..."),
  "categoria": {
    "nome": "Alimentação",
    "icone": "🍔"
  },
  "descricao": "Mercado",
  "valor": 450.00,
  "data": ISODate("2025-10-01"),
  "observacoes": "",
  "data_criacao": ISODate("2025-10-01")
}
```

### Collection: compras_parceladas
```javascript
{
  "_id": ObjectId("..."),
  "usuario_id": ObjectId("..."),
  "produto": "TV Samsung 55\"",
  "categoria": {
    "nome": "Eletrônicos",
    "icone": "📱"
  },
  "valor_total": 3000.00,
  "total_parcelas": 10,
  "valor_parcela": 300.00,
  "parcelas": [
    {
      "numero": 1,
      "paga": true,
      "data_pagamento": ISODate("2025-10-05"),
      "valor": 300.00
    },
    {
      "numero": 2,
      "paga": false,
      "data_vencimento": ISODate("2025-11-05"),
      "valor": 300.00
    }
  ],
  "data_compra": ISODate("2025-09-15"),
  "finalizada": false
}
```

### Collection: gasolina
```javascript
{
  "_id": ObjectId("..."),
  "usuario_id": ObjectId("..."),
  "veiculo": "carro",
  "valor": 250.00,
  "litros": 45.5,
  "preco_litro": 5.49,
  "local": "Shell Avenida Principal",
  "km_atual": 35000,
  "data": ISODate("2025-10-01"),
  "data_criacao": ISODate("2025-10-01")
}
```

---

## 🎯 Vantagens de Cada Modelo

### SQL (PostgreSQL, MySQL)
✅ Relacionamentos claros e integridade referencial  
✅ Queries complexas otimizadas  
✅ Transações ACID  
✅ Ideal para dados estruturados e relatórios  
✅ Melhor para análises financeiras complexas  

### NoSQL (MongoDB)
✅ Flexibilidade de schema  
✅ Fácil de escalar horizontalmente  
✅ Consultas rápidas por documento  
✅ Ideal para dados aninhados  
✅ Melhor para apps com muitas escritas  

---

## 📝 Recomendação

Para um sistema financeiro, **recomendo SQL (PostgreSQL)** porque:
1. ✅ Integridade de dados é crítica
2. ✅ Relacionamentos bem definidos
3. ✅ Necessidade de relatórios complexos
4. ✅ Transações financeiras requerem ACID
5. ✅ Auditoria e histórico precisos

---

## 🚀 Próximos Passos

1. **Escolher banco de dados** (PostgreSQL recomendado)
2. **Criar script de migração** do LocalStorage para SQL
3. **Implementar API REST** (Node.js + Express ou Python + FastAPI)
4. **Adicionar autenticação** (JWT)
5. **Implementar sincronização** em tempo real
6. **Deploy em nuvem** (AWS, Google Cloud, ou Vercel)

---

**Estrutura completa e pronta para produção! 🎉**

