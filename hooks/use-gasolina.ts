'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface Gasolina {
  id: number
  veiculo: 'carro' | 'moto'
  valor: number
  litros: number
  preco_litro: number
  local?: string
  km_atual?: number
  usuario_id: number
  data: string
  observacoes?: string
  deletado: boolean
  deletado_em: string | null
  deletado_por: number | null
  created_at: string
}

export interface InsertGasolina {
  veiculo: 'carro' | 'moto'
  valor: number
  litros: number
  preco_litro: number
  local?: string
  km_atual?: number
  usuario_id: number
  data: string
  observacoes?: string
}

export function useGasolina() {
  const queryClient = useQueryClient()

  // Fetch gasolina
  const { data: abastecimentos = [], isLoading, error } = useQuery({
    queryKey: ['gasolina'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gasolina')
        .select('*')
        .eq('deletado', false)
        .order('data', { ascending: false })

      if (error) throw error
      return data as Gasolina[]
    },
  })

  // Create gasolina
  const createGasolina = useMutation({
    mutationFn: async (gasolina: InsertGasolina) => {
      const { data, error } = await supabase
        .from('gasolina')
        // @ts-expect-error - Table exists in DB but not in generated types
        .insert(gasolina)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gasolina'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      refreshDashboard()
    },
  })

  // Update gasolina
  const updateGasolina = useMutation({
    mutationFn: async ({ id, ...gasolina }: Partial<Gasolina> & { id: number }) => {
      const { data, error } = await supabase
        .from('gasolina')
        // @ts-expect-error - Table exists in DB but not in generated types
        .update(gasolina)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gasolina'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      refreshDashboard()
    },
  })

  // Soft delete gasolina
  const deleteGasolina = useMutation({
    mutationFn: async (id: number) => {
      // @ts-expect-error - RPC function types not generated
      const { error } = await supabase.rpc('soft_delete', {
        p_tabela: 'gasolina',
        p_id: id,
      })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gasolina'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['lixeira'] })
      refreshDashboard()
    },
  })

  // Helper to refresh dashboard
  const refreshDashboard = async () => {
    await supabase.rpc('refresh_dashboard_views')
  }

  // Calculate stats
  const stats = {
    gastoTotal: abastecimentos.reduce((sum, a) => sum + Number(a.valor), 0),
    litrosTotais: abastecimentos.reduce((sum, a) => sum + (Number(a.litros) || 0), 0),
    precoMedio: abastecimentos.length > 0
      ? abastecimentos.reduce((sum, a) => sum + (Number(a.preco_litro) || 0), 0) / abastecimentos.length
      : 0,
    totalAbastecimentos: abastecimentos.length,
  }

  return {
    abastecimentos,
    stats,
    isLoading,
    error,
    createGasolina: createGasolina.mutate,
    updateGasolina: updateGasolina.mutate,
    deleteGasolina: deleteGasolina.mutate,
    isCreating: createGasolina.isPending,
    isUpdating: updateGasolina.isPending,
    isDeleting: deleteGasolina.isPending,
  }
}

