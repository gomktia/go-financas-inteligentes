# 🚀 API REST - Sistema Financeiro

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Autenticação](#autenticação)
3. [Endpoints](#endpoints)
4. [Exemplos de Implementação](#exemplos-de-implementação)
5. [Estrutura de Resposta](#estrutura-de-resposta)
6. [Códigos de Status](#códigos-de-status)

---

## 🎯 Visão Geral

API RESTful para o sistema de controle financeiro familiar.

**Base URL:** `https://api.seudominio.com/v1`

**Formato:** JSON

**Autenticação:** JWT (JSON Web Token)

---

## 🔐 Autenticação

### POST /auth/register
Registrar novo usuário

**Request:**
```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "senha123",
  "cor": "#007AFF"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nome": "João Silva",
    "email": "joao@email.com",
    "cor": "#007AFF",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /auth/login
Fazer login

**Request:**
```json
{
  "email": "joao@email.com",
  "senha": "senha123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "nome": "João Silva",
      "email": "joao@email.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Headers para Requisições Autenticadas:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📊 Endpoints

### 👥 Usuários

#### GET /users
Listar usuários

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nome": "Você",
      "cor": "#007AFF",
      "email": "voce@email.com",
      "ativo": true
    },
    {
      "id": 2,
      "nome": "Esposa",
      "cor": "#FF2D55",
      "email": "esposa@email.com",
      "ativo": true
    }
  ]
}
```

#### GET /users/:id
Obter usuário específico

#### PUT /users/:id
Atualizar usuário

#### DELETE /users/:id
Deletar usuário

---

### 💰 Salários

#### GET /salaries
Listar todos os salários

**Query Params:**
- `usuario_id` (opcional)

#### POST /salaries
Criar novo salário

**Request:**
```json
{
  "usuario_id": 1,
  "valor": 5000.00,
  "descricao": "Salário Principal",
  "mes_referencia": "2025-10-01"
}
```

#### PUT /salaries/:id
Atualizar salário

#### DELETE /salaries/:id
Deletar salário

---

### 💸 Gastos

#### GET /gastos
Listar gastos

**Query Params:**
- `usuario_id` (opcional)
- `categoria_id` (opcional)
- `data_inicio` (opcional) - formato: YYYY-MM-DD
- `data_fim` (opcional)
- `mes` (opcional) - formato: YYYY-MM

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "usuario": {
        "id": 1,
        "nome": "Você"
      },
      "categoria": {
        "id": 1,
        "nome": "Alimentação",
        "icone": "🍔"
      },
      "descricao": "Mercado",
      "valor": 450.00,
      "data": "2025-10-01",
      "observacoes": null
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 50,
    "total_pages": 3
  }
}
```

#### POST /gastos
Criar novo gasto

**Request:**
```json
{
  "usuario_id": 1,
  "categoria_id": 1,
  "descricao": "Mercado",
  "valor": 450.00,
  "data": "2025-10-01",
  "observacoes": "Compras do mês"
}
```

#### GET /gastos/:id
Obter gasto específico

#### PUT /gastos/:id
Atualizar gasto

#### DELETE /gastos/:id
Deletar gasto

#### GET /gastos/resumo/mes
Resumo de gastos do mês

**Query Params:**
- `ano` (opcional, padrão: ano atual)
- `mes` (opcional, padrão: mês atual)

**Response:**
```json
{
  "success": true,
  "data": {
    "ano": 2025,
    "mes": 10,
    "total": 2450.00,
    "por_categoria": [
      {
        "categoria": "Alimentação",
        "total": 1200.00,
        "percentual": 48.98
      },
      {
        "categoria": "Transporte",
        "total": 800.00,
        "percentual": 32.65
      }
    ],
    "por_usuario": [
      {
        "usuario": "Você",
        "total": 1500.00
      },
      {
        "usuario": "Esposa",
        "total": 950.00
      }
    ]
  }
}
```

---

### 🛍️ Compras Parceladas

#### GET /parcelas
Listar compras parceladas

**Query Params:**
- `usuario_id` (opcional)
- `finalizada` (opcional) - true/false

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "usuario": {
        "id": 1,
        "nome": "Você"
      },
      "categoria": {
        "id": 10,
        "nome": "Eletrônicos",
        "icone": "📱"
      },
      "produto": "TV Samsung 55\"",
      "valor_total": 3000.00,
      "total_parcelas": 10,
      "valor_parcela": 300.00,
      "parcelas_pagas": 2,
      "data_compra": "2025-09-15",
      "finalizada": false,
      "progresso_percentual": 20.0
    }
  ]
}
```

#### POST /parcelas
Criar nova compra parcelada

**Request:**
```json
{
  "usuario_id": 1,
  "categoria_id": 10,
  "produto": "TV Samsung 55\"",
  "valor_total": 3000.00,
  "total_parcelas": 10,
  "parcelas_pagas": 0,
  "data_compra": "2025-09-15",
  "dia_vencimento": 5
}
```

#### PUT /parcelas/:id
Atualizar compra parcelada

#### DELETE /parcelas/:id
Deletar compra parcelada

#### PATCH /parcelas/:id/pagar
Registrar pagamento de parcela

**Request:**
```json
{
  "quantidade": 1
}
```

---

### ⛽ Gasolina

#### GET /gasolina
Listar abastecimentos

**Query Params:**
- `usuario_id` (opcional)
- `veiculo` (opcional) - carro/moto
- `mes` (opcional)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "usuario": {
        "id": 1,
        "nome": "Você"
      },
      "veiculo": "carro",
      "valor": 250.00,
      "litros": 45.5,
      "preco_litro": 5.49,
      "local": "Shell Avenida Principal",
      "km_atual": 35000,
      "data": "2025-10-01"
    }
  ],
  "estatisticas": {
    "total_mes": 500.00,
    "litros_mes": 91.0,
    "media_preco_litro": 5.49,
    "consumo_medio": 12.5
  }
}
```

#### POST /gasolina
Criar novo abastecimento

**Request:**
```json
{
  "usuario_id": 1,
  "veiculo": "carro",
  "valor": 250.00,
  "litros": 45.5,
  "local": "Shell",
  "km_atual": 35000,
  "data": "2025-10-01"
}
```

#### GET /gasolina/estatisticas
Estatísticas de consumo

---

### 📺 Assinaturas

#### GET /assinaturas
Listar assinaturas

**Query Params:**
- `ativa` (opcional) - true/false

#### POST /assinaturas
Criar assinatura

**Request:**
```json
{
  "nome": "Netflix",
  "valor": 55.90,
  "ativa": true,
  "periodicidade": "mensal",
  "dia_vencimento": 15,
  "url": "https://netflix.com"
}
```

---

### 🏠 Contas Fixas

#### GET /contas
Listar contas fixas

#### POST /contas
Criar conta fixa

**Request:**
```json
{
  "nome": "Aluguel",
  "valor": 1200.00,
  "dia_vencimento": 5,
  "categoria": "moradia"
}
```

---

### 💳 Cartões de Crédito

#### GET /cartoes
Listar cartões

**Query Params:**
- `usuario_id` (opcional)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "usuario": {
        "id": 1,
        "nome": "Você"
      },
      "nome": "Nubank",
      "bandeira": "mastercard",
      "limite": 5000.00,
      "gasto_atual": 1200.00,
      "disponivel": 3800.00,
      "percentual_usado": 24.0,
      "dia_fechamento": 15,
      "dia_vencimento": 22
    }
  ]
}
```

#### POST /cartoes
Criar cartão

#### PATCH /cartoes/:id/gasto
Atualizar gasto do cartão

**Request:**
```json
{
  "gasto_atual": 1500.00
}
```

---

### 🎯 Metas

#### GET /metas
Listar metas

#### POST /metas
Criar meta

**Request:**
```json
{
  "nome": "Viagem Disney",
  "valor_alvo": 20000.00,
  "valor_atual": 5000.00,
  "cor": "#FF9500",
  "prazo_final": "2026-12-31"
}
```

#### PATCH /metas/:id/contribuir
Adicionar valor à meta

**Request:**
```json
{
  "valor": 500.00
}
```

---

### 📊 Dashboard

#### GET /dashboard
Obter dados do dashboard

**Query Params:**
- `usuario_id` (opcional) - para filtrar por usuário
- `mes` (opcional)

**Response:**
```json
{
  "success": true,
  "data": {
    "receitas": 9000.00,
    "despesas": 6500.00,
    "saldo": 2500.00,
    "patrimonio_liquido": 398000.00,
    "resumo_mensal": {
      "gastos": 2450.00,
      "parcelas": 600.00,
      "gasolina": 500.00,
      "assinaturas": 150.00,
      "contas_fixas": 1800.00,
      "ferramentas": 378.00
    },
    "gastos_por_categoria": [
      {
        "categoria": "Alimentação",
        "total": 1200.00,
        "percentual": 18.46
      }
    ],
    "metas": [
      {
        "nome": "Viagem Disney",
        "percentual": 25.0,
        "falta": 15000.00
      }
    ]
  }
}
```

---

### 📈 Relatórios

#### GET /relatorios/mensal
Relatório mensal completo

**Query Params:**
- `ano` (obrigatório)
- `mes` (obrigatório)
- `formato` (opcional) - json/pdf/excel

#### GET /relatorios/anual
Relatório anual

**Query Params:**
- `ano` (obrigatório)

#### GET /relatorios/comparativo
Comparativo entre meses

**Query Params:**
- `mes_inicio` (formato: YYYY-MM)
- `mes_fim` (formato: YYYY-MM)

**Response:**
```json
{
  "success": true,
  "data": {
    "periodos": [
      {
        "mes": "2025-08",
        "receitas": 9000.00,
        "despesas": 7200.00,
        "saldo": 1800.00
      },
      {
        "mes": "2025-09",
        "receitas": 9000.00,
        "despesas": 6800.00,
        "saldo": 2200.00
      },
      {
        "mes": "2025-10",
        "receitas": 9000.00,
        "despesas": 6500.00,
        "saldo": 2500.00
      }
    ],
    "tendencia": "melhorando",
    "economia_media": 2166.67
  }
}
```

---

## 💻 Exemplos de Implementação

### Node.js + Express + PostgreSQL

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: 'localhost',
  database: 'financeiro',
  user: 'postgres',
  password: 'senha',
  port: 5432,
});

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Token não fornecido' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// GET /gastos
app.get('/v1/gastos', authenticateToken, async (req, res) => {
  try {
    const { usuario_id, categoria_id, mes } = req.query;
    
    let query = `
      SELECT 
        g.*,
        u.nome as usuario_nome,
        c.nome as categoria_nome,
        c.icone as categoria_icone
      FROM gastos g
      LEFT JOIN users u ON g.usuario_id = u.id
      LEFT JOIN categorias c ON g.categoria_id = c.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (usuario_id) {
      params.push(usuario_id);
      query += ` AND g.usuario_id = $${params.length}`;
    }
    
    if (categoria_id) {
      params.push(categoria_id);
      query += ` AND g.categoria_id = $${params.length}`;
    }
    
    if (mes) {
      const [ano, mesNum] = mes.split('-');
      query += ` AND EXTRACT(YEAR FROM g.data) = ${ano} AND EXTRACT(MONTH FROM g.data) = ${mesNum}`;
    }
    
    query += ` ORDER BY g.data DESC LIMIT 50`;
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar gastos'
    });
  }
});

// POST /gastos
app.post('/v1/gastos', authenticateToken, async (req, res) => {
  try {
    const { usuario_id, categoria_id, descricao, valor, data, observacoes } = req.body;
    
    const result = await pool.query(
      `INSERT INTO gastos (usuario_id, categoria_id, descricao, valor, data, observacoes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [usuario_id, categoria_id, descricao, valor, data, observacoes]
    );
    
    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar gasto'
    });
  }
});

// GET /dashboard
app.get('/v1/dashboard', authenticateToken, async (req, res) => {
  try {
    const { usuario_id } = req.query;
    
    // Receitas
    const receitasQuery = usuario_id 
      ? 'SELECT COALESCE(SUM(valor), 0) as total FROM salaries WHERE usuario_id = $1'
      : 'SELECT COALESCE(SUM(valor), 0) as total FROM salaries';
    const receitas = await pool.query(receitasQuery, usuario_id ? [usuario_id] : []);
    
    // Gastos do mês
    const gastosQuery = `
      SELECT COALESCE(SUM(valor), 0) as total 
      FROM gastos 
      WHERE EXTRACT(YEAR FROM data) = EXTRACT(YEAR FROM CURRENT_DATE)
        AND EXTRACT(MONTH FROM data) = EXTRACT(MONTH FROM CURRENT_DATE)
        ${usuario_id ? 'AND usuario_id = $1' : ''}
    `;
    const gastos = await pool.query(gastosQuery, usuario_id ? [usuario_id] : []);
    
    // Outros totais...
    
    res.json({
      success: true,
      data: {
        receitas: parseFloat(receitas.rows[0].total),
        despesas: parseFloat(gastos.rows[0].total),
        // ... mais dados
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar dashboard'
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});
```

---

### Python + FastAPI + SQLAlchemy

```python
# main.py
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import create_engine, Column, Integer, String, Numeric, Date, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date
import jwt

app = FastAPI(title="Sistema Financeiro API")

# Database
SQLALCHEMY_DATABASE_URL = "postgresql://user:pass@localhost/financeiro"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Models
class Gasto(Base):
    __tablename__ = "gastos"
    
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer)
    categoria_id = Column(Integer)
    descricao = Column(String)
    valor = Column(Numeric(15, 2))
    data = Column(Date)
    observacoes = Column(String)

# Schemas
class GastoCreate(BaseModel):
    usuario_id: int
    categoria_id: Optional[int]
    descricao: str
    valor: float
    data: date
    observacoes: Optional[str]

class GastoResponse(BaseModel):
    id: int
    usuario_id: int
    categoria_id: Optional[int]
    descricao: str
    valor: float
    data: date
    
    class Config:
        orm_mode = True

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Endpoints
@app.get("/v1/gastos", response_model=List[GastoResponse])
def listar_gastos(
    usuario_id: Optional[int] = None,
    mes: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Gasto)
    
    if usuario_id:
        query = query.filter(Gasto.usuario_id == usuario_id)
    
    if mes:
        ano, mes_num = mes.split('-')
        query = query.filter(
            extract('year', Gasto.data) == int(ano),
            extract('month', Gasto.data) == int(mes_num)
        )
    
    return query.order_by(Gasto.data.desc()).limit(50).all()

@app.post("/v1/gastos", response_model=GastoResponse, status_code=201)
def criar_gasto(gasto: GastoCreate, db: Session = Depends(get_db)):
    db_gasto = Gasto(**gasto.dict())
    db.add(db_gasto)
    db.commit()
    db.refresh(db_gasto)
    return db_gasto

@app.get("/v1/dashboard")
def obter_dashboard(db: Session = Depends(get_db)):
    # Implementar lógica do dashboard
    return {
        "success": True,
        "data": {
            "receitas": 9000.00,
            "despesas": 6500.00,
            "saldo": 2500.00
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

## 📦 Estrutura de Resposta Padrão

### Sucesso:
```json
{
  "success": true,
  "data": { ... }
}
```

### Erro:
```json
{
  "success": false,
  "error": "Mensagem de erro",
  "details": { ... }
}
```

---

## 🔢 Códigos de Status HTTP

- `200` - OK (Sucesso)
- `201` - Created (Recurso criado)
- `204` - No Content (Sucesso sem corpo de resposta)
- `400` - Bad Request (Erro no formato da requisição)
- `401` - Unauthorized (Não autenticado)
- `403` - Forbidden (Não autorizado)
- `404` - Not Found (Recurso não encontrado)
- `422` - Unprocessable Entity (Erro de validação)
- `500` - Internal Server Error (Erro no servidor)

---

## 🔒 Segurança

### Boas Práticas:
- ✅ Sempre usar HTTPS em produção
- ✅ Validar todos os inputs
- ✅ Usar prepared statements (evitar SQL injection)
- ✅ Implementar rate limiting
- ✅ Fazer sanitização de dados
- ✅ Usar CORS adequadamente
- ✅ Não expor informações sensíveis em erros

---

**API documentada e pronta para implementação! 🚀**

