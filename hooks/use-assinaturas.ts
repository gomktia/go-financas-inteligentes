'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface Assinatura {
  id: number
  nome: string
  valor: number
  periodicidade: string
  dia_vencimento: number
  usuario_id: number
  categoria?: string
  status: string
  url?: string
  data_inicio: string
  data_cancelamento?: string | null
  observacoes?: string
  deletado: boolean
  deletado_em: string | null
  deletado_por: number | null
  created_at: string
}

export interface InsertAssinatura {
  nome: string
  valor: number
  periodicidade: string
  dia_vencimento: number
  usuario_id: number
  categoria?: string
  status?: string
  url?: string
  data_inicio: string
  data_cancelamento?: string | null
  observacoes?: string
}

export function useAssinaturas() {
  const queryClient = useQueryClient()

  // Fetch assinaturas
  const { data: assinaturas = [], isLoading, error } = useQuery({
    queryKey: ['assinaturas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assinaturas')
        .select('*')
        .eq('deletado', false)
        .order('dia_vencimento', { ascending: true })

      if (error) throw error
      return data as Assinatura[]
    },
  })

  // Create assinatura
  const createAssinatura = useMutation({
    mutationFn: async (assinatura: InsertAssinatura) => {
      const { data, error } = await supabase
        .from('assinaturas')
        // @ts-expect-error - Table exists in DB but not in generated types
        .insert(assinatura)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assinaturas'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      refreshDashboard()
    },
  })

  // Update assinatura
  const updateAssinatura = useMutation({
    mutationFn: async ({ id, ...assinatura }: Partial<Assinatura> & { id: number }) => {
      const { data, error } = await supabase
        .from('assinaturas')
        // @ts-expect-error - Table exists in DB but not in generated types
        .update(assinatura)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assinaturas'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      refreshDashboard()
    },
  })

  // Soft delete assinatura
  const deleteAssinatura = useMutation({
    mutationFn: async (id: number) => {
      // @ts-expect-error - RPC function types not generated
      const { error } = await supabase.rpc('soft_delete', {
        p_tabela: 'assinaturas',
        p_id: id,
      })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assinaturas'] })
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
  const assinaturasAtivas = assinaturas.filter(a => a.status === 'ativa')
  const stats = {
    gastoMensal: assinaturasAtivas.reduce((sum, a) => sum + a.valor, 0),
    assinaturasAtivas: assinaturasAtivas.length,
    proximoVencimento: getProximoVencimento(assinaturasAtivas),
    gastoAnual: assinaturasAtivas.reduce((sum, a) => sum + a.valor, 0) * 12,
  }

  function getProximoVencimento(assinaturas: Assinatura[]) {
    if (assinaturas.length === 0) return null

    const hoje = new Date()
    const diaHoje = hoje.getDate()

    const proximas = assinaturas
      .map(a => ({
        ...a,
        diasRestantes: a.dia_vencimento >= diaHoje
          ? a.dia_vencimento - diaHoje
          : (30 - diaHoje) + a.dia_vencimento
      }))
      .sort((a, b) => a.diasRestantes - b.diasRestantes)

    return proximas[0]
  }

  return {
    assinaturas,
    stats,
    isLoading,
    error,
    createAssinatura: createAssinatura.mutate,
    updateAssinatura: updateAssinatura.mutate,
    deleteAssinatura: deleteAssinatura.mutate,
    isCreating: createAssinatura.isPending,
    isUpdating: updateAssinatura.isPending,
    isDeleting: deleteAssinatura.isPending,
  }
}

