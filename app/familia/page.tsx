'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Users, PieChart, Home, Receipt } from 'lucide-react'
import { useFamilia, SharedExpense } from '@/hooks/use-familia' // We'll fix this import shortly
import { formatCurrency, formatDateTime } from '@/lib/utils'

export default function FamiliaPage() {
    const { expenses, stats, isLoading } = useFamilia()

    if (isLoading) {
        return (
            <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="text-muted-foreground">Carregando dados da família...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Users className="h-8 w-8 text-primary" />
                        Gastos Familiares
                    </h2>
                    <p className="text-muted-foreground">
                        Acompanhe as despesas compartilhadas e a contribuição de cada membro
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Total Card */}
                <Card className="bg-primary text-primary-foreground border-none">
                    <CardHeader>
                        <CardTitle className="text-lg font-medium opacity-90">Total Compartilhado (Mês)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{formatCurrency(stats.totalMes)}</div>
                        <p className="opacity-80 mt-2 text-sm">Soma de todos os gastos marcados como "Família"</p>
                    </CardContent>
                </Card>

                {/* Contributions Card */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Divisão de Custos</CardTitle>
                        <CardDescription>Quem está pagando o quê este mês</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.porUsuario.map((user, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="flex justify-between text-sm font-medium">
                                        <span>{user.nome}</span>
                                        <span className="text-muted-foreground">{formatCurrency(user.valor)} ({user.percentual}%)</span>
                                    </div>
                                    <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500 ease-out"
                                            style={{ width: `${user.percentual}%`, backgroundColor: user.cor }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Expenses List */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Detalhamento</h3>
                <Card>
                    <CardContent className="p-0">
                        {expenses.length === 0 ? (
                            <div className="py-12 flex flex-col items-center justify-center text-center text-muted-foreground">
                                <Home className="h-12 w-12 mb-4 opacity-20" />
                                <p>Nenhum gasto compartilhado encontrado.</p>
                                <p className="text-sm">Marque itens como "Compartilhado" ao criar gastos ou contas.</p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {expenses.map((item) => (
                                    <div key={`${item.tipo_item}-${item.id}`} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                                                {item.tipo_item === 'gasto' ? <Receipt className="h-5 w-5" /> : <Home className="h-5 w-5" />}
                                            </div>
                                            <div>
                                                <p className="font-medium">{item.descricao}</p>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    {formatDateTime(item.data)} • Pago por <span className="font-semibold text-primary">{item.usuario_nome}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="font-bold">
                                            {formatCurrency(item.valor)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
