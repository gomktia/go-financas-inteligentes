'use client'

import { useState } from 'react'
import { useMetas } from '@/hooks/use-metas'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Target, TrendingUp, CheckCircle, Clock, Trash2, Calendar, Plane, Car, Home, AlertCircle, Laptop, Landmark, Package } from 'lucide-react'
import { MetaSheet } from '@/components/meta-sheet'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

export default function MetasPage() {
  const { metas, stats, isLoading, deleteMeta } = useMetas()
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

  const getCategoryIcon = (cat?: string) => {
    switch (cat) {
      case 'viagem': return <Plane className="h-5 w-5" />
      case 'veiculo': return <Car className="h-5 w-5" />
      case 'imovel': return <Home className="h-5 w-5" />
      case 'emergencia': return <AlertCircle className="h-5 w-5" />
      case 'eletronicos': return <Laptop className="h-5 w-5" />
      case 'investimento': return <Landmark className="h-5 w-5" />
      default: return <Package className="h-5 w-5" />
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Metas Financeiras</h2>
          <p className="text-sm text-muted-foreground">
            Defina e acompanhe suas metas de economia
          </p>
        </div>
        <Button
          onClick={() => setShowAddDrawer(true)}
          className="h-12 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 w-full sm:w-auto"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nova Meta
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/20 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total em Metas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalEmMetas)}</div>
            <p className="text-xs text-muted-foreground">Objetivo total</p>
          </CardContent>
        </Card>

        <Card className="border-green-500/20 bg-green-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Economizado</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{formatCurrency(stats.economizado)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalEmMetas > 0 ? ((stats.economizado / stats.totalEmMetas) * 100).toFixed(1) : 0}% da meta total
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Metas Ativas</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats.metasAtivas}</div>
            <p className="text-xs text-muted-foreground">Em andamento</p>
          </CardContent>
        </Card>

        <Card className="border-purple-500/20 bg-purple-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">{stats.metasConcluidas}</div>
            <p className="text-xs text-muted-foreground">Alcançadas</p>
          </CardContent>
        </Card>
      </div>

      {/* List */}
      <h3 className="text-lg font-semibold">Suas Metas</h3>
      {metas.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">
              Nenhuma meta definida
            </h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              Crie metas para viagem, carro novo, reserva de emergência ou qualquer objetivo financeiro
            </p>
            <Button
              onClick={() => setShowAddDrawer(true)}
              variant="outline"
              className="h-11 border-primary text-primary hover:bg-primary/10"
            >
              Criar primeira meta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {metas.map((meta) => {
            const progresso = Math.min((meta.valor_atual / meta.valor_objetivo) * 100, 100)

            return (
              <Card key={meta.id} className="group hover:shadow-md transition-all">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        {getCategoryIcon(meta.categoria)}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{meta.nome}</h4>
                        {meta.prazo && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Até {formatDateTime(meta.prazo).split(' ')[0]}
                          </p>
                        )}
                      </div>
                    </div>
                    {/* Add/Edit buttons could go here */}
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-sm text-muted-foreground">Atual</p>
                        <p className="text-2xl font-bold text-primary">{formatCurrency(meta.valor_atual)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Objetivo</p>
                        <p className="font-semibold">{formatCurrency(meta.valor_objetivo)}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Progress value={progresso} className="h-3" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{progresso.toFixed(0)}% concluído</span>
                        {meta.valor_objetivo - meta.valor_atual > 0 && (
                          <span>Faltam {formatCurrency(meta.valor_objetivo - meta.valor_atual)}</span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          if (confirm('Tem certeza que deseja remover esta meta?')) deleteMeta(meta.id)
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

      <MetaSheet
        open={showAddDrawer}
        onOpenChange={setShowAddDrawer}
      />
    </div>
  )
}
