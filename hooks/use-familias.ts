'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { showToast } from '@/lib/toast'

export interface Familia {
  id: number
  nome: string
  admin_id: number | null
  modo_calculo: 'familiar' | 'individual'
  codigo_convite: string | null
  ativa: boolean
  data_criacao: string
  data_atualizacao: string
}

export interface FamiliaMembro {
  id: number
  familia_id: number
  usuario_id: number
  papel: 'admin' | 'membro' | 'dependente' | 'visualizador'
  aprovado: boolean
  data_entrada: string
  // Joined data
  usuario?: {
    id: number
    nome: string
    email?: string
    tipo: 'pessoa' | 'empresa'
  }
}

export interface InsertFamilia {
  nome: string
  admin_id?: number | null
  modo_calculo?: 'familiar' | 'individual'
  codigo_convite?: string
  ativa?: boolean
}

export interface InsertMembro {
  familia_id: number
  usuario_id: number
  papel?: 'admin' | 'membro' | 'dependente' | 'visualizador'
  aprovado?: boolean
}

export function useFamilias() {
  const queryClient = useQueryClient()

  // Fetch familias
  const { data: familias = [], isLoading, error } = useQuery({
    queryKey: ['familias'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('familias')
        .select('*')
        .eq('ativa', true)
        .order('nome', { ascending: true })

      if (error) throw error
      return data as Familia[]
    },
  })

  // Fetch membros de uma família
  const useMembros = (familiaId: number | null) => {
    return useQuery({
      queryKey: ['familia-membros', familiaId],
      queryFn: async () => {
        if (!familiaId) return []

        const { data, error } = await supabase
          .from('familia_membros')
          .select(`
            *,
            usuario:users!usuario_id (
              id,
              nome,
              email,
              tipo
            )
          `)
          .eq('familia_id', familiaId)
          .order('papel', { ascending: true })

        if (error) throw error
        return data as any[]
      },
      enabled: !!familiaId,
    })
  }

  // Create familia
  const createFamilia = useMutation({
    mutationFn: async (familia: InsertFamilia) => {
      // Gerar código de convite único
      const codigoConvite = Math.random().toString(36).substring(2, 10).toUpperCase()
      
      const { data, error } = await supabase
        .from('familias')
        // @ts-expect-error - Table exists in DB but not in generated types
        .insert({
          ...familia,
          codigo_convite: familia.codigo_convite || codigoConvite
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familias'] })
      showToast.success('Família criada com sucesso!')
    },
    onError: (error) => {
      showToast.error('Erro ao criar família: ' + error.message)
    },
  })

  // Update familia
  const updateFamilia = useMutation({
    mutationFn: async ({ id, ...familia }: Partial<Familia> & { id: number }) => {
      const { data, error } = await supabase
        .from('familias')
        // @ts-expect-error - Table exists in DB but not in generated types
        .update(familia)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familias'] })
      showToast.success('Família atualizada!')
    },
    onError: (error) => {
      showToast.error('Erro ao atualizar família: ' + error.message)
    },
  })

  // Add membro to familia
  const addMembro = useMutation({
    mutationFn: async (membro: InsertMembro) => {
      const { data, error } = await supabase
        .from('familia_membros')
        // @ts-expect-error - Table exists in DB but not in generated types
        .insert(membro)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['familia-membros', variables.familia_id] })
      showToast.success('Membro adicionado à família!')
    },
    onError: (error) => {
      showToast.error('Erro ao adicionar membro: ' + error.message)
    },
  })

  // Remove membro from familia
  const removeMembro = useMutation({
    mutationFn: async ({ familiaId, usuarioId }: { familiaId: number; usuarioId: number }) => {
      const { error } = await supabase
        .from('familia_membros')
        .delete()
        .eq('familia_id', familiaId)
        .eq('usuario_id', usuarioId)

      if (error) throw error
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['familia-membros', variables.familiaId] })
      showToast.success('Membro removido da família!')
    },
    onError: (error) => {
      showToast.error('Erro ao remover membro: ' + error.message)
    },
  })

  // Generate new invite code
  const generateInviteCode = useMutation({
    mutationFn: async (familiaId: number) => {
      const novoCodigo = Math.random().toString(36).substring(2, 10).toUpperCase()
      
      const { data, error } = await supabase
        .from('familias')
        // @ts-expect-error - Table exists in DB but not in generated types
        .update({ codigo_convite: novoCodigo })
        .eq('id', familiaId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familias'] })
      showToast.success('Novo código de convite gerado!')
    },
  })

  return {
    familias,
    isLoading,
    error,
    useMembros,
    createFamilia: createFamilia.mutate,
    updateFamilia: updateFamilia.mutate,
    addMembro: addMembro.mutate,
    removeMembro: removeMembro.mutate,
    generateInviteCode: generateInviteCode.mutate,
    isCreating: createFamilia.isPending,
    isUpdating: updateFamilia.isPending,
    isAddingMembro: addMembro.isPending,
    isRemovingMembro: removeMembro.isPending,
  }
}

