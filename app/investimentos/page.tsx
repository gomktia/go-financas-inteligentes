'use client'

import { useState } from 'react'
import { useInvestimentos } from '@/hooks/use-investimentos'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, TrendingUp, DollarSign, PieChart, LineChart, Landmark, TrendingDown, Coins, Banknote, Wallet, Trash2 } from 'lucide-react'
import { InvestimentoSheet } from '@/components/investimento-sheet'
import { formatCurrency, formatDateTime } from '@/lib/utils'

export default function InvestimentosPage() {
  const { investimentos, stats, isLoading, deleteInvestimento } = useInvestimentos()
  const [showAddDrawer, setShowAddDrawer] = useState(false)

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    )
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'poupanca': return <Wallet className="h-5 w-5" />
      case 'cdb': return <Banknote className="h-5 w-5" />
      case 'acoes': return <TrendingUp className="h-5 w-5" />
      case 'fiis': return <Landmark className="h-5 w-5" />
      case 'crypto': return <Coins className="h-5 w-5" />
      default: return <PieChart className="h-5 w-5" />
    }
  }

  const isProfit = stats.rendimentoTotal >= 0

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Investimentos</h2>
          <p className="text-sm text-muted-foreground">
            Acompanhe seus investimentos e rentabilidade
          </p>
        </div>
        <Button
          onClick={() => setShowAddDrawer(true)}
          className="h-12 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 w-full sm:w-auto"
        >
          <Plus className="h-5 w-5 mr-2" />
          Novo Investimento
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/20 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investido</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalInvestido)}</div>
            <p className="text-xs text-muted-foreground">Valor aplicado</p>
          </CardContent>
        </Card>

        <Card className="border-green-500/20 bg-green-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patrimônio Atual</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {/* Calculate total current value */}
            <div className="text-2xl font-bold text-green-500">
              {formatCurrency(stats.totalInvestido + stats.rendimentoTotal)}
            </div>
            <p className="text-xs text-muted-foreground">Valor de mercado</p>
          </CardContent>
        </Card>

        <Card className={isProfit ? "border-blue-500/20 bg-blue-500/5" : "border-red-500/20 bg-red-500/5"}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rentabilidade</CardTitle>
            {isProfit ? <TrendingUp className="h-4 w-4 text-blue-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isProfit ? 'text-blue-500' : 'text-red-500'}`}>
              {isProfit ? '+' : ''}{stats.rentabilidade}%
            </div>
            <p className="text-xs text-muted-foreground">Retorno total</p>
          </CardContent>
        </Card>

        <Card className={isProfit ? "border-purple-500/20 bg-purple-500/5" : "border-red-500/20 bg-red-500/5"}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rendimento R$</CardTitle>
            <LineChart className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isProfit ? 'text-purple-500' : 'text-red-500'}`}>
              {isProfit ? '+' : ''}{formatCurrency(stats.rendimentoTotal)}
            </div>
            <p className="text-xs text-muted-foreground">Ganho/Perda de capital</p>
          </CardContent>
        </Card>
      </div>

      {/* List */}
      <h3 className="text-lg font-semibold">Seus Ativos</h3>
      {investimentos.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">
              Nenhum investimento cadastrado
            </h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              Registre suas ações, fundos, poupança, CDB e outros investimentos
            </p>
            <Button
              onClick={() => setShowAddDrawer(true)}
              variant="outline"
              className="h-11 border-primary text-primary hover:bg-primary/10"
            >
              Adicionar primeiro investimento
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {investimentos.map((item) => {
            const lucro = item.valor_atual - item.valor_investido
            const lucroPorcentagem = item.valor_investido > 0 ? (lucro / item.valor_investido) * 100 : 0
            const isPositive = lucro >= 0

            return (
              <Card key={item.id} className="group hover:shadow-md transition-all">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        {getTipoIcon(item.tipo)}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{item.nome}</h4>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 uppercase">
                          {item.tipo}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end border-b pb-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Valor Atual</p>
                        <p className="text-xl font-bold">{formatCurrency(item.valor_atual)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Resultado</p>
                        <p className={`font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                          {isPositive ? '+' : ''}{lucroPorcentagem.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Investido:</span>
                      <span className="font-medium">{formatCurrency(item.valor_investido)}</span>
                    </div>

                    <div className="pt-2 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          if (confirm('Tem certeza que deseja remover este investimento?')) deleteInvestimento(item.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remover
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <InvestimentoSheet
        open={showAddDrawer}
        onOpenChange={setShowAddDrawer}
      />
    </div>
  )
}
