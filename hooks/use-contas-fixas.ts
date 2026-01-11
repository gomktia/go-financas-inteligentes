'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface ContaFixa {
  id: number
  nome: string
  valor: number
  dia_vencimento: number
  usuario_id: number
  categoria: string
  status: string
  observacoes?: string
  deletado: boolean
  deletado_em: string | null
  deletado_por: number | null
  created_at: string
}

export interface InsertContaFixa {
  nome: string
  valor: number
  dia_vencimento: number
  usuario_id: number
  categoria: string
  status?: string
  observacoes?: string
}

export function useContasFixas() {
  const queryClient = useQueryClient()

  // Fetch contas fixas
  const { data: contas = [], isLoading, error } = useQuery({
    queryKey: ['contas-fixas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contas_fixas')
        .select('*')
        .eq('deletado', false)
        .order('dia_vencimento', { ascending: true })

      if (error) throw error
      return data as ContaFixa[]
    },
  })

  // Create conta fixa
  const createContaFixa = useMutation({
    mutationFn: async (conta: InsertContaFixa) => {
      const { data, error } = await supabase
        .from('contas_fixas')
        // @ts-expect-error - Table exists in DB but not in generated types
        .insert(conta)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contas-fixas'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      refreshDashboard()
    },
  })

  // Update conta fixa
  const updateContaFixa = useMutation({
    mutationFn: async ({ id, ...conta }: Partial<ContaFixa> & { id: number }) => {
      const { data, error } = await supabase
        .from('contas_fixas')
        // @ts-expect-error - Table exists in DB but not in generated types
        .update(conta)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contas-fixas'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      refreshDashboard()
    },
  })

  // Soft delete conta fixa
  const deleteContaFixa = useMutation({
    mutationFn: async (id: number) => {
      // @ts-expect-error - RPC function types not generated
      const { error } = await supabase.rpc('soft_delete', {
        p_tabela: 'contas_fixas',
        p_id: id,
      })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contas-fixas'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['lixeira'] })
      refreshDashboard()
    },
  })

  // Helper to refresh dashboard
  const refreshDashboard = async () => {
    await supabase.rpc('refresh_dashboard_views')
  }

  // Calculate stats by category
  const stats = {
    totalMensal: contas.reduce((sum, c) => sum + c.valor, 0),
    energia: contas.filter(c => c.categoria === 'energia').reduce((sum, c) => sum + c.valor, 0),
    agua: contas.filter(c => c.categoria === 'agua').reduce((sum, c) => sum + c.valor, 0),
    internet: contas.filter(c => c.categoria === 'internet').reduce((sum, c) => sum + c.valor, 0),
    telefone: contas.filter(c => c.categoria === 'telefone').reduce((sum, c) => sum + c.valor, 0),
  }

  return {
    contas,
    stats,
    isLoading,
    error,
    createContaFixa: createContaFixa.mutate,
    updateContaFixa: updateContaFixa.mutate,
    deleteContaFixa: deleteContaFixa.mutate,
    isCreating: createContaFixa.isPending,
    isUpdating: updateContaFixa.isPending,
    isDeleting: deleteContaFixa.isPending,
  }
}

