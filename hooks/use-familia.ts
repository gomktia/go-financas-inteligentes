'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface SharedExpense {
    id: number
    tipo_item: 'gasto' | 'parcela' | 'assinatura' | 'conta_fixa' | 'gasolina'
    descricao: string
    valor: number
    data: string
    usuario_nome: string
    usuario_foto?: string
    categoria?: string
}

export function useFamilia() {

    const { data: expenses = [], isLoading } = useQuery({
        queryKey: ['familia_gastos'],
        queryFn: async () => {
            // Fetch from multiple tables where compartilhado = true
            // Note: This requires the SQL migration to have run to add 'compartilhado' columns

            const promises = [
                supabase.from('gastos').select('*, users(nome, foto_url)').eq('compartilhado', true),
                supabase.from('assinaturas').select('*').eq('compartilhado', true), // Assinaturas don't link to user directly in current schema? Need to check. Assume seeded with owner.
                supabase.from('contas_fixas').select('*').eq('compartilhado', true),
            ]

            const [gastosRes, assinaturasRes, contasRes] = await Promise.all(promises)

            const formatted: SharedExpense[] = []

            // Normalize Gastos
            if (gastosRes.data) {
                formatted.push(...gastosRes.data.map((g: any) => ({
                    id: g.id,
                    tipo_item: 'gasto' as const,
                    descricao: g.descricao,
                    valor: g.valor,
                    data: g.data,
                    usuario_nome: g.users?.nome || 'Alguém',
                    usuario_foto: g.users?.foto_url,
                    categoria: g.categoria
                })))
            }

            // Normalize Assinaturas
            if (assinaturasRes.data) {
                formatted.push(...assinaturasRes.data.map((a: any) => ({
                    id: a.id,
                    tipo_item: 'assinatura' as const,
                    descricao: a.nome,
                    valor: a.valor,
                    data: a.data_inicio || new Date().toISOString(), // Use current month's due date logic ideally
                    usuario_nome: 'Família', // Shared subscription
                    categoria: 'Assinatura'
                })))
            }

            // Normalize Contas Fixas
            if (contasRes.data) {
                formatted.push(...contasRes.data.map((c: any) => ({
                    id: c.id,
                    tipo_item: 'conta_fixa' as const,
                    descricao: c.nome,
                    valor: c.valor,
                    data: new Date().toISOString(), // Placeholder for "this month"
                    usuario_nome: 'Família',
                    categoria: c.categoria || 'Habitação'
                })))
            }

            // Sort by date desc
            return formatted.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
        }
    })

    // Calculate totals
    const totalMes = expenses.reduce((acc, curr) => acc + curr.valor, 0)

    // Mock contribution data (since we don't have multiple users yet)
    const stats = {
        totalMes,
        porUsuario: [
            { nome: 'Você', valor: totalMes * 0.6, percentual: 60, cor: '#007AFF' },
            { nome: 'Conjugê / Outros', valor: totalMes * 0.4, percentual: 40, cor: '#FF2D55' }
        ]
    }

    return {
        expenses,
        stats,
        isLoading
    }
}
