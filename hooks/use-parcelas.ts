'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface Parcela {
  id: number
  produto: string
  valor_total: number
  total_parcelas: number
  valor_parcela: number
  parcelas_pagas: number
  data_compra: string
  primeira_parcela?: string
  dia_vencimento?: number
  usuario_id: number
  categoria_id?: number
  observacoes?: string
  finalizada: boolean
  deletado: boolean
  deletado_em: string | null
  deletado_por: number | null
  created_at: string
}

export interface InsertParcela {
  produto: string
  valor_total: number
  total_parcelas: number
  valor_parcela: number
  parcelas_pagas?: number
  data_compra: string
  primeira_parcela?: string
  dia_vencimento?: number
  usuario_id: number
  categoria_id?: number
  observacoes?: string
  finalizada?: boolean
}

export function useParcelas() {
  const queryClient = useQueryClient()

  // Fetch parcelas
  const { data: parcelas = [], isLoading, error } = useQuery({
    queryKey: ['parcelas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compras_parceladas')
        .select(`
          *,
          categoria:categorias(id, nome, icone, cor)
        `)
        .eq('deletado', false)
        .order('data_compra', { ascending: false })

      if (error) throw error
      return data as (Parcela & { categoria?: { id: number, nome: string, icone: string, cor: string } })[]
    },
  })

  // Create parcela
  const createParcela = useMutation({
    mutationFn: async (parcela: InsertParcela) => {
      const { data, error } = await supabase
        .from('compras_parceladas')
        // @ts-expect-error - Table exists in DB but not in generated types
        .insert(parcela)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parcelas'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      refreshDashboard()
    },
  })

  // Update parcela
  const updateParcela = useMutation({
    mutationFn: async ({ id, ...parcela }: Partial<Parcela> & { id: number }) => {
      const { data, error } = await supabase
        .from('compras_parceladas')
        // @ts-expect-error - Table exists in DB but not in generated types
        .update(parcela)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parcelas'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      refreshDashboard()
    },
  })

  // Soft delete parcela
  const deleteParcela = useMutation({
    mutationFn: async (id: number) => {
      // @ts-expect-error - RPC function types not generated
      const { error } = await supabase.rpc('soft_delete', {
        p_tabela: 'compras_parceladas',
        p_id: id,
      })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parcelas'] })
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
    totalParcelado: parcelas.reduce((sum, p) => sum + Number(p.valor_total), 0),
    parcelaAtual: parcelas
      .filter(p => !p.finalizada)
      .reduce((sum, p) => sum + Number(p.valor_parcela), 0),
    parcelasAtivas: parcelas.filter(p => !p.finalizada).length,
    restantePagar: parcelas
      .filter(p => !p.finalizada)
      .reduce((sum, p) => sum + (Number(p.valor_parcela) * (Number(p.total_parcelas) - Number(p.parcelas_pagas))), 0),
  }

  return {
    parcelas,
    stats,
    isLoading,
    error,
    createParcela: createParcela.mutate,
    updateParcela: updateParcela.mutate,
    deleteParcela: deleteParcela.mutate,
    isCreating: createParcela.isPending,
    isUpdating: updateParcela.isPending,
    isDeleting: deleteParcela.isPending,
  }
}

