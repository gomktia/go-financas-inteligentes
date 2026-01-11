'use client'

import { useState } from 'react'
import { useAssinaturas } from '@/hooks/use-assinaturas'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Calendar, TrendingDown, CreditCard, Repeat, ExternalLink, Trash2 } from 'lucide-react'
import { AssinaturaSheet } from '@/components/assinatura-sheet'
import { formatCurrency, formatDateTime } from '@/lib/utils'

export default function AssinaturasPage() {
  const { assinaturas, stats, isLoading, deleteAssinatura } = useAssinaturas()
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
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Assinaturas</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie suas assinaturas e serviços recorrentes
          </p>
        </div>
        <Button
          onClick={() => setShowAddDrawer(true)}
          className="h-12 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 w-full sm:w-auto"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nova Assinatura
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-orange-500/20 bg-orange-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gasto Mensal</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{formatCurrency(stats.gastoMensal)}</div>
            <p className="text-xs text-muted-foreground">Total por mês</p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
            <Repeat className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats.assinaturasAtivas}</div>
            <p className="text-xs text-muted-foreground">Em vigor</p>
          </CardContent>
        </Card>

        <Card className="border-purple-500/20 bg-purple-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próx. Vencimento</CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">{stats.proximoVencimento ? `Dia ${stats.proximoVencimento.dia_vencimento}` : '--'}</div>
            <p className="text-xs text-muted-foreground">
              {stats.proximoVencimento ? stats.proximoVencimento.nome : 'Nenhum'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-500/20 bg-green-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gasto Anual</CardTitle>
            <CreditCard className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{formatCurrency(stats.gastoAnual)}</div>
            <p className="text-xs text-muted-foreground">Projeção anual</p>
          </CardContent>
        </Card>
      </div>

      {/* List */}
      <h3 className="text-lg font-semibold">Seus Serviços</h3>
      {assinaturas.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">
              Nenhuma assinatura cadastrada
            </h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              Adicione Netflix, Spotify, academia e outras assinaturas para controlar gastos recorrentes
            </p>
            <Button
              onClick={() => setShowAddDrawer(true)}
              variant="outline"
              className="h-11 border-primary text-primary hover:bg-primary/10"
            >
              Adicionar primeira assinatura
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assinaturas.map((item) => (
            <Card key={item.id} className="group hover:shadow-md transition-all border-l-4 border-l-primary">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-lg">{item.nome}</h4>
                    <p className="text-sm text-muted-foreground capitalize">
                      {item.periodicidade} • Dia {item.dia_vencimento}
                    </p>
                  </div>
                  <div className="font-bold text-xl text-primary">
                    {formatCurrency(item.valor)}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex gap-2">
                    {item.url && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      if (confirm('Tem certeza que deseja remover esta assinatura?')) deleteAssinatura(item.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remover
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AssinaturaSheet
        open={showAddDrawer}
        onOpenChange={setShowAddDrawer}
      />
    </div>
  )
}
