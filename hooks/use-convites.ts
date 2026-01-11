'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { showToast } from '@/lib/toast'

export interface Convite {
  id: number
  familia_id: number
  email: string
  codigo: string
  expira_em: string
  aceito: boolean
  data_criacao: string
}

export interface InsertConvite {
  familia_id: number
  email: string
  dias_validade?: number
}

export interface ConviteWithFamilia extends Convite {
  familia?: {
    id: number
    nome: string
    modo_calculo: string
  }
}

export function useConvites() {
  const queryClient = useQueryClient()

  // Fetch convites de uma família
  const useConvitesFamilia = (familiaId: number | null) => {
    return useQuery({
      queryKey: ['convites', familiaId],
      queryFn: async () => {
        if (!familiaId) return []

        const { data, error } = await supabase
          .from('convites')
          .select('*')
          .eq('familia_id', familiaId)
          .order('data_criacao', { ascending: false })

        if (error) throw error
        return data as Convite[]
      },
      enabled: !!familiaId,
    })
  }

  // Fetch convites pendentes do usuário atual
  const useConvitesPendentes = (email: string | null) => {
    return useQuery({
      queryKey: ['convites-pendentes', email],
      queryFn: async () => {
        if (!email) return []

        const agora = new Date()

        const { data, error } = await supabase
          .from('convites')
          .select(`
            *,
            familia:familias (
              id,
              nome,
              modo_calculo
            )
          `)
          .eq('email', email)
          .eq('aceito', false)
          .gt('expira_em', agora.toISOString())

        if (error) throw error
        return data as any[]
      },
      enabled: !!email,
    })
  }

  // Criar convite
  const createConvite = useMutation({
    mutationFn: async ({ familia_id, email, dias_validade = 7 }: InsertConvite) => {
      // Gerar código único
      const codigo = Math.random().toString(36).substring(2, 12).toUpperCase()

      // Calcular data de expiração
      const expiraEm = new Date()
      expiraEm.setDate(expiraEm.getDate() + dias_validade)

      const { data, error } = await supabase
        .from('convites')
        // @ts-expect-error - Table exists in DB but not in generated types
        .insert({
          familia_id,
          email,
          codigo,
          expira_em: expiraEm.toISOString(),
          aceito: false
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['convites'] })
      showToast.success('Convite enviado com sucesso!')
    },
    onError: (error) => {
      showToast.error('Erro ao criar convite: ' + error.message)
    },
  })

  // Aceitar convite
  const aceitarConvite = useMutation({
    mutationFn: async ({ conviteId, usuarioId }: { conviteId: number; usuarioId: number }) => {
      // Buscar dados do convite
      const { data: convite, error: conviteError } = await supabase
        .from('convites')
        .select('*')
        .eq('id', conviteId)
        .single<{ familia_id: number }>()

      if (conviteError) throw conviteError

      // Marcar convite como aceito
      const { error: updateError } = await supabase
        .from('convites')
        // @ts-expect-error - Table exists in DB but not in generated types
        .update({ aceito: true })
        .eq('id', conviteId)

      if (updateError) throw updateError

      // Adicionar usuário à família
      const { error: membroError } = await supabase
        .from('familia_membros')
        // @ts-expect-error - Table exists in DB but not in generated types
        .insert({
          familia_id: convite.familia_id,
          usuario_id: usuarioId,
          papel: 'membro',
          aprovado: true
        })

      if (membroError) throw membroError

      return convite
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['convites-pendentes'] })
      queryClient.invalidateQueries({ queryKey: ['familias'] })
      queryClient.invalidateQueries({ queryKey: ['familia-membros'] })
      showToast.success('Convite aceito! Você agora faz parte da família!')
    },
    onError: (error) => {
      showToast.error('Erro ao aceitar convite: ' + error.message)
    },
  })

  // Recusar convite
  const recusarConvite = useMutation({
    mutationFn: async (conviteId: number) => {
      const { error } = await supabase
        .from('convites')
        .delete()
        .eq('id', conviteId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['convites-pendentes'] })
      showToast.success('Convite recusado')
    },
  })

  // Gerar link de convite
  const gerarLinkConvite = (codigo: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    return `${baseUrl}/convite/${codigo}`
  }

  // Fetch convite público pelo código
  const useConvitePorCodigo = (codigo: string) => {
    return useQuery({
      queryKey: ['convite-publico', codigo],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('convites')
          .select(`
            *,
            familia:familias (
              id,
              nome,
              modo_calculo
            )
          `)
          .eq('codigo', codigo)
          .single()

        if (error) throw error
        return data as ConviteWithFamilia
      },
      enabled: !!codigo,
      retry: false
    })
  }

  return {
    useConvitesFamilia,
    useConvitesPendentes,
    useConvitePorCodigo,
    createConvite: createConvite.mutate,
    aceitarConvite: aceitarConvite.mutate,
    recusarConvite: recusarConvite.mutate,
    gerarLinkConvite,
    isCreating: createConvite.isPending,
    isAccepting: aceitarConvite.isPending,
    isRejecting: recusarConvite.isPending,
  }
}

