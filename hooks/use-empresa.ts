'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface Empresa {
    id: number
    nome: string
    cnpj?: string
    dono_id: number
    ramo_atividade?: string
}

export interface ContaEmpresa {
    id: number
    empresa_id: number
    nome_banco: string
    tipo_conta: string
    saldo_atual: number
    cor: string
    principal: boolean
}

export interface TransacaoEmpresa {
    id: number
    empresa_id: number
    conta_id?: number
    tipo: 'receita' | 'despesa'
    descricao: string
    valor: number
    data_transacao: string
    categoria?: string
    status: string
    observacoes?: string
}

export interface InsertTransacaoEmpresa {
    empresa_id: number
    conta_id?: number
    tipo: 'receita' | 'despesa'
    descricao: string
    valor: number
    data_transacao: string
    categoria?: string
    status?: string
    observacoes?: string
}

export function useEmpresa() {
    const queryClient = useQueryClient()
    const EMPRESA_ID = 1 // TODO: Dynamic selection if multiple businesses

    // Fetch Empresa Info
    const { data: empresa } = useQuery({
        queryKey: ['empresa', EMPRESA_ID],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('empresas')
                .select('*')
                .eq('id', EMPRESA_ID)
                .single()

            if (error) return null
            // If no company exists, we might need to handle creation, but let's assume seed data
            return data as Empresa
        }
    })

    // Fetch Contas
    const { data: contas = [], isLoading: loadingContas } = useQuery({
        queryKey: ['contas_empresa', EMPRESA_ID],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('contas_empresa')
                .select('*')
                .eq('empresa_id', EMPRESA_ID)
                .order('principal', { ascending: false })

            if (error) throw error
            return data as ContaEmpresa[]
        }
    })

    // Fetch Transações
    const { data: transacoes = [], isLoading: loadingTransacoes } = useQuery({
        queryKey: ['transacoes_empresa', EMPRESA_ID],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('transacoes_empresa')
                .select('*, contas_empresa(nome_banco)')
                .eq('empresa_id', EMPRESA_ID)
                .order('data_transacao', { ascending: false })

            if (error) throw error
            return data as (TransacaoEmpresa & { contas_empresa?: { nome_banco: string } })[]
        }
    })

    // Create Transacao
    const createTransacao = useMutation({
        mutationFn: async (transacao: InsertTransacaoEmpresa) => {
            const { data, error } = await supabase
                .from('transacoes_empresa')
                // @ts-expect-error - Table types not yet generated
                .insert(transacao)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transacoes_empresa'] })
            queryClient.invalidateQueries({ queryKey: ['contas_empresa'] }) // Update balances
        }
    })

    // Delete Transacao
    const deleteTransacao = useMutation({
        mutationFn: async (id: number) => {
            const { error } = await supabase
                .from('transacoes_empresa')
                .delete()
                .eq('id', id)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transacoes_empresa'] })
            queryClient.invalidateQueries({ queryKey: ['contas_empresa'] })
        }
    })

    // Calculate Stats
    const saldoTotal = contas.reduce((acc, c) => acc + c.saldo_atual, 0)

    const receitasMes = transacoes
        .filter(t => t.tipo === 'receita' && new Date(t.data_transacao).getMonth() === new Date().getMonth())
        .reduce((acc, t) => acc + t.valor, 0)

    const despesasMes = transacoes
        .filter(t => t.tipo === 'despesa' && new Date(t.data_transacao).getMonth() === new Date().getMonth())
        .reduce((acc, t) => acc + t.valor, 0)

    const lucroLiquido = receitasMes - despesasMes

    return {
        empresa,
        contas,
        transacoes,
        stats: { saldoTotal, receitasMes, despesasMes, lucroLiquido },
        createTransacao: createTransacao.mutate,
        deleteTransacao: deleteTransacao.mutate,
        isLoading: loadingContas || loadingTransacoes,
        isCreating: createTransacao.isPending
    }
}
