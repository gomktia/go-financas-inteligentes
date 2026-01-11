'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Building2,
    ArrowUpCircle,
    ArrowDownCircle,
    Wallet,
    Plus,
    MoreHorizontal,
    TrendingUp,
    Briefcase
} from 'lucide-react'
import { useEmpresa } from '@/hooks/use-empresa'
import { EmpresaTransacaoSheet } from '@/components/empresa-transacao-sheet'
import { formatCurrency, formatDateTime } from '@/lib/utils'

export default function EmpresaPage() {
    const { empresa, contas, transacoes, stats, isLoading } = useEmpresa()
    const [showSheet, setShowSheet] = useState(false)

    if (isLoading) {
        return (
            <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="text-muted-foreground">Carregando dados da empresa...</p>
                </div>
            </div>
        )
    }

    // If no company data (should not happen if seed runs, but just in case)
    //   if (!empresa && !isLoading) {
    //       // Placeholder or create flow
    //   }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Building2 className="h-8 w-8 text-primary" />
                        {empresa?.nome || 'Minha Empresa'}
                    </h2>
                    <p className="text-muted-foreground">
                        Visão geral do fluxo de caixa e contas PJ
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setShowSheet(true)} className="h-12 px-6 rounded-xl shadow-lg shadow-primary/20">
                        <Plus className="mr-2 h-5 w-5" />
                        Nova Movimentação
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 text-white border-none shadow-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-300">Saldo Total</CardTitle>
                        <Wallet className="h-4 w-4 text-zinc-300" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.saldoTotal)}</div>
                        <p className="text-xs text-zinc-400 mt-1">Todas as contas</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Receitas (Mês)</CardTitle>
                        <ArrowUpCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.receitasMes)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Entradas confirmadas</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Despesas (Mês)</CardTitle>
                        <ArrowDownCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.despesasMes)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Saídas realizadas</p>
                    </CardContent>
                </Card>

                <Card className={`${stats.lucroLiquido >= 0 ? 'bg-green-50 dark:bg-green-950/10' : 'bg-red-50 dark:bg-red-950/10'}`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Resultado Líquido</CardTitle>
                        <TrendingUp className={`h-4 w-4 ${stats.lucroLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${stats.lucroLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(stats.lucroLiquido)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Balanço do mês</p>
                    </CardContent>
                </Card>
            </div>

            {/* Contas */}
            <div className="grid gap-4 md:grid-cols-3">
                {/* Placeholder for Accounts List - can expand later */}
                {contas.length === 0 ? (
                    <Card className="md:col-span-3 border-dashed">
                        <CardContent className="py-8 text-center text-muted-foreground">
                            <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            Nenhuma conta bancária cadastrada. O saldo será calculado apenas pelas transações.
                        </CardContent>
                    </Card>
                ) : (
                    contas.map(conta => (
                        <Card key={conta.id} className="border-l-4" style={{ borderLeftColor: conta.cor }}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">{conta.nome_banco}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl font-bold">{formatCurrency(conta.saldo_atual)}</div>
                                <p className="text-xs text-muted-foreground uppercase">{conta.tipo_conta}</p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Transactions List */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Últimas Movimentações</h3>
                <Card>
                    <CardContent className="p-0">
                        {transacoes.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground">
                                Nenhuma movimentação registrada.
                            </div>
                        ) : (
                            <div className="divide-y">
                                {transacoes.map((t) => (
                                    <div key={t.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-full ${t.tipo === 'receita' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                {t.tipo === 'receita' ? <ArrowUpCircle className="h-5 w-5" /> : <ArrowDownCircle className="h-5 w-5" />}
                                            </div>
                                            <div>
                                                <p className="font-medium">{t.descricao}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDateTime(t.data_transacao)} • {t.categoria}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`font-bold ${t.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                                            {t.tipo === 'receita' ? '+' : '-'}{formatCurrency(t.valor)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <EmpresaTransacaoSheet open={showSheet} onOpenChange={setShowSheet} />
        </div>
    )
}
