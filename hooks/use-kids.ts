import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { KidAccount, KidTransaction, KidTask } from '@/types'
import { toast } from 'react-hot-toast'

export function useKids() {
    const queryClient = useQueryClient()

    // 1. Fetch Kids Accounts
    const { data: kids, isLoading } = useQuery({
        queryKey: ['kids'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('kids_accounts')
                .select('*')
                .order('criado_em', { ascending: true })

            if (error) throw error
            return data as KidAccount[]
        }
    })

    // 2. Add New Kid
    const addKid = useMutation({
        mutationFn: async (newKid: { nome: string, avatar: string, saldo_inicial: number }) => {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('User not found')

            // Get public user id
            const { data: publicUser } = await supabase
                .from('users')
                .select('id')
                .eq('auth_id', user.id)
                .single()

            if (!publicUser) throw new Error('Public user not found')

            const { data, error } = await supabase
                .from('kids_accounts')
                .insert({
                    parent_id: publicUser.id,
                    nome: newKid.nome,
                    avatar: newKid.avatar,
                    saldo: newKid.saldo_inicial
                })
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['kids'] })
            toast.success('Perfil criado com sucesso!')
        },
        onError: (err) => {
            toast.error('Erro ao criar perfil: ' + err.message)
        }
    })

    // 3. Add Transaction (Mesada/Gasto)
    const addTransaction = useMutation({
        mutationFn: async (trx: { kid_id: number, tipo: 'entrada' | 'saida', valor: number, descricao: string }) => {
            // 1. Insert Transaction
            const { error: trxError } = await supabase
                .from('kids_transactions')
                .insert({
                    kid_id: trx.kid_id,
                    tipo: trx.tipo,
                    valor: trx.valor,
                    descricao: trx.descricao
                })

            if (trxError) throw trxError

            // 2. Update Balance
            const { data: kid } = await supabase.from('kids_accounts').select('saldo').eq('id', trx.kid_id).single()
            const currentBalance = kid?.saldo || 0
            const newBalance = trx.tipo === 'entrada' ? currentBalance + trx.valor : currentBalance - trx.valor

            const { error: updateError } = await supabase
                .from('kids_accounts')
                .update({ saldo: newBalance })
                .eq('id', trx.kid_id)

            if (updateError) throw updateError
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['kids'] })
            toast.success('Transação realizada!')
        },
        onError: (err) => {
            toast.error('Erro ao realizar transação: ' + err.message)
        }
    })

    return {
        kids,
        isLoading,
        addKid: addKid.mutate,
        addTransaction: addTransaction.mutate
    }
}
