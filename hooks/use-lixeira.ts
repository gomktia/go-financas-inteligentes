'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { DeletedItem } from '@/types'
import { showToast } from '@/lib/toast'

const TABELAS = [
  { nome: 'gastos', label: 'Gasto' },
  { nome: 'compras_parceladas', label: 'Parcela' },
  { nome: 'gasolina', label: 'Gasolina' },
  { nome: 'assinaturas', label: 'Assinatura' },
  { nome: 'contas_fixas', label: 'Conta Fixa' },
  { nome: 'cartoes', label: 'Cartão' },
  { nome: 'dividas', label: 'Dívida' },
  { nome: 'emprestimos', label: 'Empréstimo' },
  { nome: 'metas', label: 'Meta' },
  { nome: 'orcamentos', label: 'Orçamento' },
  { nome: 'investimentos', label: 'Investimento' },
  { nome: 'patrimonio', label: 'Patrimônio' },
] as const

export function useLixeira() {
  const queryClient = useQueryClient()

  // Fetch deleted items
  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['lixeira'],
    queryFn: async () => {
      const todosItens: DeletedItem[] = []
      const dataLimite = new Date()
      dataLimite.setDate(dataLimite.getDate() - 30) // Last 30 days

      for (const tabela of TABELAS) {
        const { data } = await supabase
          .from(tabela.nome as any)
          .select('*')
          .eq('deletado', true)
          .gte('deletado_em', dataLimite.toISOString())

        if (data && data.length > 0) {
          todosItens.push(
            ...data.map((item: any) => ({
              ...item,
              tabela: tabela.nome,
              tipoLabel: tabela.label,
            }))
          )
        }
      }

      // Sort by deletion date (most recent first)
      todosItens.sort(
        (a, b) =>
          new Date(b.deletado_em).getTime() - new Date(a.deletado_em).getTime()
      )

      return todosItens
    },
    staleTime: 10000, // 10 seconds
  })

  // Restore item
  const restoreItem = useMutation({
    mutationFn: async ({ tabela, id }: { tabela: string; id: number }) => {
      // @ts-expect-error - RPC function types not generated
      const { error } = await supabase.rpc('soft_undelete', {
        p_tabela: tabela,
        p_id: id,
      })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lixeira'] })
      queryClient.invalidateQueries({ queryKey: ['gastos'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      refreshDashboard()
      showToast.success('Item restaurado com sucesso!')
    },
    onError: (error) => {
      showToast.error('Erro ao restaurar item: ' + error.message)
    },
  })

  // Permanently delete item
  const permanentlyDeleteItem = useMutation({
    mutationFn: async ({ tabela, id }: { tabela: string; id: number }) => {
      const { error } = await supabase.from(tabela as any).delete().eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lixeira'] })
    },
  })

  // Helper to refresh dashboard
  const refreshDashboard = async () => {
    await supabase.rpc('refresh_dashboard_views')
  }

  return {
    items,
    isLoading,
    error,
    restoreItem: restoreItem.mutate,
    permanentlyDeleteItem: permanentlyDeleteItem.mutate,
    isRestoring: restoreItem.isPending,
    isDeleting: permanentlyDeleteItem.isPending,
  }
}
