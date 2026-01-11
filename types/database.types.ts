export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: number
          nome: string
          tipo: string
          deletado: boolean
          deletado_em: string | null
          deletado_por: number | null
          created_at: string
        }
        Insert: {
          id?: number
          nome: string
          tipo: string
          deletado?: boolean
          deletado_em?: string | null
          deletado_por?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          nome?: string
          tipo?: string
          deletado?: boolean
          deletado_em?: string | null
          deletado_por?: number | null
          created_at?: string
        }
      }
      salaries: {
        Row: {
          id: number
          valor: number
          usuario_id: number
          mes: string
          deletado: boolean
          deletado_em: string | null
          deletado_por: number | null
          created_at: string
        }
        Insert: {
          id?: number
          valor: number
          usuario_id: number
          mes: string
          deletado?: boolean
          deletado_em?: string | null
          deletado_por?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          valor?: number
          usuario_id?: number
          mes?: string
          deletado?: boolean
          deletado_em?: string | null
          deletado_por?: number | null
          created_at?: string
        }
      }
      gastos: {
        Row: {
          id: number
          descricao: string
          valor: number
          usuario_id: number
          data: string
          categoria: string
          tipo_pagamento: string
          deletado: boolean
          deletado_em: string | null
          deletado_por: number | null
          created_at: string
        }
        Insert: {
          id?: number
          descricao: string
          valor: number
          usuario_id: number
          data: string
          categoria: string
          tipo_pagamento: string
          deletado?: boolean
          deletado_em?: string | null
          deletado_por?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          descricao?: string
          valor?: number
          usuario_id?: number
          data?: string
          categoria?: string
          tipo_pagamento?: string
          deletado?: boolean
          deletado_em?: string | null
          deletado_por?: number | null
          created_at?: string
        }
      }
      compras_parceladas: {
        Row: {
          id: number
          descricao: string
          valor_total: number
          valor_parcela: number
          total_parcelas: number
          parcelas_pagas: number
          usuario_id: number
          data_compra: string
          categoria: string
          finalizada: boolean
          deletado: boolean
          deletado_em: string | null
          deletado_por: number | null
          created_at: string
        }
        Insert: {
          id?: number
          descricao: string
          valor_total: number
          valor_parcela?: number
          total_parcelas: number
          parcelas_pagas?: number
          usuario_id: number
          data_compra: string
          categoria: string
          finalizada?: boolean
          deletado?: boolean
          deletado_em?: string | null
          deletado_por?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          descricao?: string
          valor_total?: number
          valor_parcela?: number
          total_parcelas?: number
          parcelas_pagas?: number
          usuario_id?: number
          data_compra?: string
          categoria?: string
          finalizada?: boolean
          deletado?: boolean
          deletado_em?: string | null
          deletado_por?: number | null
          created_at?: string
        }
      }
      gasolina: {
        Row: {
          id: number
          descricao: string
          valor: number
          litros: number
          usuario_id: number
          data: string
          deletado: boolean
          deletado_em: string | null
          deletado_por: number | null
          created_at: string
        }
        Insert: {
          id?: number
          descricao: string
          valor: number
          litros: number
          usuario_id: number
          data: string
          deletado?: boolean
          deletado_em?: string | null
          deletado_por?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          descricao?: string
          valor?: number
          litros?: number
          usuario_id?: number
          data?: string
          deletado?: boolean
          deletado_em?: string | null
          deletado_por?: number | null
          created_at?: string
        }
      }
      assinaturas: {
        Row: {
          id: number
          nome: string
          valor: number
          usuario_id: number
          ativa: boolean
          deletado: boolean
          deletado_em: string | null
          deletado_por: number | null
          created_at: string
        }
        Insert: {
          id?: number
          nome: string
          valor: number
          usuario_id: number
          ativa?: boolean
          deletado?: boolean
          deletado_em?: string | null
          deletado_por?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          nome?: string
          valor?: number
          usuario_id?: number
          ativa?: boolean
          deletado?: boolean
          deletado_em?: string | null
          deletado_por?: number | null
          created_at?: string
        }
      }
      contas_fixas: {
        Row: {
          id: number
          nome: string
          valor: number
          usuario_id: number
          deletado: boolean
          deletado_em: string | null
          deletado_por: number | null
          created_at: string
        }
        Insert: {
          id?: number
          nome: string
          valor: number
          usuario_id: number
          deletado?: boolean
          deletado_em?: string | null
          deletado_por?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          nome?: string
          valor?: number
          usuario_id?: number
          deletado?: boolean
          deletado_em?: string | null
          deletado_por?: number | null
          created_at?: string
        }
      }
      ferramentas_ia_dev: {
        Row: {
          id: number
          nome: string
          valor: number
          usuario_id: number
          deletado: boolean
          deletado_em: string | null
          deletado_por: number | null
          created_at: string
        }
        Insert: {
          id?: number
          nome: string
          valor: number
          usuario_id: number
          deletado?: boolean
          deletado_em?: string | null
          deletado_por?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          nome?: string
          valor?: number
          usuario_id?: number
          deletado?: boolean
          deletado_em?: string | null
          deletado_por?: number | null
          created_at?: string
        }
      }
      cartoes: {
        Row: {
          id: number
          nome: string
          limite: number
          usuario_id: number
          deletado: boolean
          deletado_em: string | null
          deletado_por: number | null
          created_at: string
        }
        Insert: {
          id?: number
          nome: string
          limite: number
          usuario_id: number
          deletado?: boolean
          deletado_em?: string | null
          deletado_por?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          nome?: string
          limite?: number
          usuario_id?: number
          deletado?: boolean
          deletado_em?: string | null
          deletado_por?: number | null
          created_at?: string
        }
      }
      dividas: {
        Row: {
          id: number
          nome: string
          valor: number
          usuario_id: number
          deletado: boolean
          deletado_em: string | null
          deletado_por: number | null
          created_at: string
        }
        Insert: {
          id?: number
          nome: string
          valor: number
          usuario_id: number
          deletado?: boolean
          deletado_em?: string | null
          deletado_por?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          nome?: string
          valor?: number
          usuario_id?: number
          deletado?: boolean
          deletado_em?: string | null
          deletado_por?: number | null
          created_at?: string
        }
      }
      emprestimos: {
        Row: {
          id: number
          descricao: string
          valor_total: number
          valor_parcela: number
          total_parcelas: number
          parcelas_pagas: number
          usuario_id: number
          quitado: boolean
          deletado: boolean
          deletado_em: string | null
          deletado_por: number | null
          created_at: string
        }
        Insert: {
          id?: number
          descricao: string
          valor_total: number
          valor_parcela: number
          total_parcelas: number
          parcelas_pagas?: number
          usuario_id: number
          quitado?: boolean
          deletado?: boolean
          deletado_em?: string | null
          deletado_por?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          descricao?: string
          valor_total?: number
          valor_parcela?: number
          total_parcelas?: number
          parcelas_pagas?: number
          usuario_id?: number
          quitado?: boolean
          deletado?: boolean
          deletado_em?: string | null
          deletado_por?: number | null
          created_at?: string
        }
      }
      metas: {
        Row: {
          id: number
          nome: string
          valor_alvo: number
          valor_atual: number
          usuario_id: number
          deletado: boolean
          deletado_em: string | null
          deletado_por: number | null
          created_at: string
        }
        Insert: {
          id?: number
          nome: string
          valor_alvo: number
          valor_atual?: number
          usuario_id: number
          deletado?: boolean
          deletado_em?: string | null
          deletado_por?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          nome?: string
          valor_alvo?: number
          valor_atual?: number
          usuario_id?: number
          deletado?: boolean
          deletado_em?: string | null
          deletado_por?: number | null
          created_at?: string
        }
      }
      orcamentos: {
        Row: {
          id: number
          categoria: string
          limite: number
          usuario_id: number
          deletado: boolean
          deletado_em: string | null
          deletado_por: number | null
          created_at: string
        }
        Insert: {
          id?: number
          categoria: string
          limite: number
          usuario_id: number
          deletado?: boolean
          deletado_em?: string | null
          deletado_por?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          categoria?: string
          limite?: number
          usuario_id?: number
          deletado?: boolean
          deletado_em?: string | null
          deletado_por?: number | null
          created_at?: string
        }
      }
      investimentos: {
        Row: {
          id: number
          nome: string
          valor: number
          tipo: string
          usuario_id: number
          deletado: boolean
          deletado_em: string | null
          deletado_por: number | null
          created_at: string
        }
        Insert: {
          id?: number
          nome: string
          valor: number
          tipo: string
          usuario_id: number
          deletado?: boolean
          deletado_em?: string | null
          deletado_por?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          nome?: string
          valor?: number
          tipo?: string
          usuario_id?: number
          deletado?: boolean
          deletado_em?: string | null
          deletado_por?: number | null
          created_at?: string
        }
      }
      patrimonio: {
        Row: {
          id: number
          nome: string
          valor: number
          tipo: string
          usuario_id: number
          deletado: boolean
          deletado_em: string | null
          deletado_por: number | null
          created_at: string
        }
        Insert: {
          id?: number
          nome: string
          valor: number
          tipo: string
          usuario_id: number
          deletado?: boolean
          deletado_em?: string | null
          deletado_por?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          nome?: string
          valor?: number
          tipo?: string
          usuario_id?: number
          deletado?: boolean
          deletado_em?: string | null
          deletado_por?: number | null
          created_at?: string
        }
      }
      mv_dashboard_mensal: {
        Row: {
          mes_referencia: string
          receitas_total: number
          gastos_mes: number
          parcelas_mes: number
          gasolina_mes: number
          assinaturas_mes: number
          contas_fixas_mes: number
          ferramentas_mes: number
          emprestimos_mes: number
          total_saidas: number
          saldo_final: number
          atualizado_em: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      soft_delete: {
        Args: {
          p_tabela: string
          p_id: number
        }
        Returns: boolean
      }
      soft_undelete: {
        Args: {
          p_tabela: string
          p_id: number
        }
        Returns: boolean
      }
      refresh_dashboard_views: {
        Args: Record<string, never>
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
