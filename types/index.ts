// Categorias padrão
export const CATEGORIAS = [
  'Alimentação',
  'Transporte',
  'Saúde',
  'Educação',
  'Lazer',
  'Vestuário',
  'Moradia',
  'Outros',
] as const

export type Categoria = typeof CATEGORIAS[number]

// Tipos de pagamento
export const TIPOS_PAGAMENTO = ['PIX', 'Débito', 'Crédito'] as const
export type TipoPagamento = typeof TIPOS_PAGAMENTO[number]

// User types
export const TIPOS_USUARIO = ['Pessoa', 'Empresa'] as const
export type TipoUsuario = typeof TIPOS_USUARIO[number]

// Database types
export interface Gasto {
  id: number
  descricao: string
  valor: number
  usuario_id: number
  data: string
  categoria: string
  tipo_pagamento: string
  privado?: boolean              // ← NOVO: Gasto privado
  visivel_familia?: boolean      // ← NOVO: Incluir no dashboard familiar
  familia_id?: number | null     // ← NOVO: A qual família pertence
  deletado: boolean
  deletado_em: string | null
  deletado_por: number | null
  created_at: string
}

export interface InsertGasto {
  descricao: string
  valor: number
  usuario_id: number
  data: string
  categoria: string
  tipo_pagamento: string
  privado?: boolean
  visivel_familia?: boolean
  familia_id?: number | null
}

export interface DashboardData {
  receitas_total: number
  total_saidas: number
  saldo_final: number
  gastos_mes: number
  parcelas_mes: number
  gasolina_mes: number
  assinaturas_mes: number
  contas_fixas_mes: number
  ferramentas_mes: number
  emprestimos_mes: number
  atualizado_em: string
}

export interface DeletedItem {
  id: number
  tabela: string
  tipoLabel: string
  deletado_em: string
  [key: string]: any
}

// ============================================
// NOVOS TIPOS - SISTEMA AVANÇADO
// ============================================

// Perfis do usuário
export const TIPOS_PERFIL = ['pessoal', 'empresa'] as const
export type TipoPerfil = typeof TIPOS_PERFIL[number]

export interface PerfilUsuario {
  id: number
  usuario_id: number
  tipo: TipoPerfil
  nome: string                    // "Pessoal" ou "MEI Tech"
  familia_id?: number | null
  ativo: boolean
  cor?: string
  icone?: string
}

// Categorias personalizadas
export interface CategoriaPersonalizada {
  id: number
  usuario_id: number
  nome: string
  icone?: string
  cor?: string
  ordem: number
  ativa: boolean
}

// Páginas personalizadas
export interface PaginaPersonalizada {
  id: number
  usuario_id: number
  nome: string
  rota: string                    // Ex: "/educacao"
  categoria_relacionada?: string
  icone?: string
  cor?: string
  ordem: number
  ativa: boolean
}

// Salários com contexto
export interface Salario {
  id: number
  usuario_id: number
  valor: number
  mes: string
  tipo: 'principal' | 'extra' | 'bonus'
  familia_id?: number | null      // A qual família pertence
  visivel_familia: boolean        // Incluir na soma familiar
}

// Configurações de privacidade
export interface ConfigPrivacidade {
  usuario_id: number
  mostrar_salario_familia: boolean
  mostrar_gastos_pessoais: boolean
  permitir_edicao_outros: boolean
  notificar_novos_gastos: boolean
}

// ============================================
// MÓDULO KIDS
// ============================================

export interface KidAccount {
  id: number
  parent_id: number
  nome: string
  saldo: number
  avatar: string // 'bear', 'rabbit', 'cat', 'dog'
  cor: string
  criado_em: string
}

export interface KidTransaction {
  id: number
  kid_id: number
  tipo: 'entrada' | 'saida'
  descricao: string
  valor: number
  data_transacao: string
  categoria: string
}

export interface KidTask {
  id: number
  kid_id: number
  titulo: string
  recompensa: number
  frequencia: 'unica' | 'diaria' | 'semanal'
  concluida: boolean
  aprovada_pais: boolean
}

