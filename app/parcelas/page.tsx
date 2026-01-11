'use client'

import { useState } from 'react'
import { useParcelas } from '@/hooks/use-parcelas'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, CreditCard, TrendingDown, Calendar, DollarSign, Package, Trash2, CheckCircle2 } from 'lucide-react'
import { ParcelaSheet } from '@/components/parcela-sheet'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

export default function ParcelasPage() {
  const { parcelas, stats, isLoading, deleteParcela } = useParcelas()
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

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Parcelas</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie suas compras parceladas
          </p>
        </div>
        <Button
          onClick={() => setShowAddDrawer(true)}
          className="h-12 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 w-full sm:w-auto"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nova Parcela
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/20 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Parcelado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalParcelado)}</div>
            <p className="text-xs text-muted-foreground">Valor original total</p>
          </CardContent>
        </Card>

        <Card className="border-orange-500/20 bg-orange-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parcela Mensal</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{formatCurrency(stats.parcelaAtual)}</div>
            <p className="text-xs text-muted-foreground">A pagar este mês</p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativas</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats.parcelasAtivas}</div>
            <p className="text-xs text-muted-foreground">Compras em aberto</p>
          </CardContent>
        </Card>

        <Card className="border-purple-500/20 bg-purple-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Restante</CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>

            <div className="text-2xl font-bold text-purple-500">{formatCurrency(stats.restantePagar || 0)}</div>
            <p className="text-xs text-muted-foreground">Ainda a pagar</p>
          </CardContent>
        </Card>
      </div>

      {/* List */}
      <h3 className="text-lg font-semibold">Suas Compras</h3>
      {parcelas.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">
              Nenhuma parcela cadastrada
            </h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              Cadastre suas compras parceladas para acompanhar o progresso dos pagamentos
            </p>
            <Button
              onClick={() => setShowAddDrawer(true)}
              variant="outline"
              className="h-11 border-primary text-primary hover:bg-primary/10"
            >
              Adicionar primeira compra
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {parcelas.map((item) => {
            const progresso = (item.parcelas_pagas / item.total_parcelas) * 100

            return (
              <Card key={item.id} className={`group overflow-hidden transition-all hover:shadow-md border-l-4 ${item.finalizada ? 'border-l-green-500 opacity-75' : 'border-l-primary'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4 mb-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${item.finalizada ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'
                      }`}>
                      {item.finalizada ? <CheckCircle2 className="h-5 w-5" /> : <Package className="h-5 w-5" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className={`font-semibold text-base truncate ${item.finalizada ? 'line-through text-muted-foreground' : ''}`}>
                          {item.produto}
                        </h4>
                        <span className="font-bold text-base">
                          {formatCurrency(item.valor_parcela)}
                          <span className="text-xs font-normal text-muted-foreground ml-1">/mês</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatDateTime(item.data_compra).split(' ')[0]}</span>
                        <span>•</span>
                        <span>Total: {formatCurrency(item.valor_total)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Parcela {item.parcelas_pagas} de {item.total_parcelas}</span>
                      <span className="font-medium">{progresso.toFixed(0)}% pago</span>
                    </div>
                    <Progress value={progresso} className="h-2" />
                  </div>

                  <div className="flex justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        if (confirm('Tem certeza que deseja excluir?')) deleteParcela(item.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <ParcelaSheet
        open={showAddDrawer}
        onOpenChange={setShowAddDrawer}
      />
    </div>
  )
}
