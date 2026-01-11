'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface Investimento {
  id: number
  nome: string
  tipo: string
  valor_investido: number
  valor_atual: number
  usuario_id: number
  data_aplicacao: string
  observacoes?: string
  deletado: boolean
  deletado_em: string | null
  deletado_por: number | null
  created_at: string
}

export interface InsertInvestimento {
  nome: string
  tipo: string
  valor_investido: number
  valor_atual: number
  usuario_id: number
  data_aplicacao: string
  observacoes?: string
}

export function useInvestimentos() {
  const queryClient = useQueryClient()

  // Fetch investimentos
  const { data: investimentos = [], isLoading, error } = useQuery({
    queryKey: ['investimentos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('investimentos')
        .select('*')
        .eq('deletado', false)
        .order('data_aplicacao', { ascending: false })

      if (error) throw error
      return data as Investimento[]
    },
  })

  // Create investimento
  const createInvestimento = useMutation({
    mutationFn: async (investimento: InsertInvestimento) => {
      const { data, error } = await supabase
        .from('investimentos')
        // @ts-expect-error - Table exists in DB but not in generated types
        .insert(investimento)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investimentos'] })
    },
  })

  // Update investimento
  const updateInvestimento = useMutation({
    mutationFn: async ({ id, ...investimento }: Partial<Investimento> & { id: number }) => {
      const { data, error } = await supabase
        .from('investimentos')
        // @ts-expect-error - Table exists in DB but not in generated types
        .update(investimento)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investimentos'] })
    },
  })

  // Soft delete investimento
  const deleteInvestimento = useMutation({
    mutationFn: async (id: number) => {
      // @ts-expect-error - RPC function types not generated
      const { error } = await supabase.rpc('soft_delete', {
        p_tabela: 'investimentos',
        p_id: id,
      })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investimentos'] })
      queryClient.invalidateQueries({ queryKey: ['lixeira'] })
    },
  })

  // Calculate stats
  const totalInvestido = investimentos.reduce((sum, i) => sum + i.valor_investido, 0)
  const totalAtual = investimentos.reduce((sum, i) => sum + i.valor_atual, 0)
  const rendimento = totalAtual - totalInvestido
  const rentabilidade = totalInvestido > 0 ? ((rendimento / totalInvestido) * 100) : 0

  const stats = {
    totalInvestido,
    rentabilidade: rentabilidade.toFixed(2),
    investimentosAtivos: investimentos.length,
    rendimentoTotal: rendimento,
  }

  return {
    investimentos,
    stats,
    isLoading,
    error,
    createInvestimento: createInvestimento.mutate,
    updateInvestimento: updateInvestimento.mutate,
    deleteInvestimento: deleteInvestimento.mutate,
    isCreating: createInvestimento.isPending,
    isUpdating: updateInvestimento.isPending,
    isDeleting: deleteInvestimento.isPending,
  }
}

