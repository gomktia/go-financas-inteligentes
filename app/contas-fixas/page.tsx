'use client'

import { useState } from 'react'
import { useContasFixas } from '@/hooks/use-contas-fixas'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Building, Zap, Droplet, Wifi, Phone, Trash2, Calendar } from 'lucide-react'
import { ContaFixaSheet } from '@/components/conta-fixa-sheet'
import { formatCurrency } from '@/lib/utils'

export default function ContasFixasPage() {
  const { contas, stats, isLoading, deleteContaFixa } = useContasFixas()
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

  // Helper to map category to icon and color
  const getCategoryStyle = (cat: string) => {
    switch (cat) {
      case 'energia': return { icon: <Zap className="h-5 w-5" />, color: 'text-yellow-500', bg: 'bg-yellow-500/10' }
      case 'agua': return { icon: <Droplet className="h-5 w-5" />, color: 'text-blue-500', bg: 'bg-blue-500/10' }
      case 'internet': return { icon: <Wifi className="h-5 w-5" />, color: 'text-purple-500', bg: 'bg-purple-500/10' }
      case 'telefone': return { icon: <Phone className="h-5 w-5" />, color: 'text-green-500', bg: 'bg-green-500/10' }
      case 'aluguel': return { icon: <Building className="h-5 w-5" />, color: 'text-orange-500', bg: 'bg-orange-500/10' }
      default: return { icon: <Building className="h-5 w-5" />, color: 'text-muted-foreground', bg: 'bg-secondary' }
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Contas Fixas</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie suas contas mensais fixas
          </p>
        </div>
        <Button
          onClick={() => setShowAddDrawer(true)}
          className="h-12 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 w-full sm:w-auto"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nova Conta
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Card className="border-primary/20 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mensal</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalMensal)}</div>
            <p className="text-xs text-muted-foreground">Soma de todas as contas</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Energia</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.energia)}</div>
            <p className="text-xs text-muted-foreground">Luz</p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Água</CardTitle>
            <Droplet className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{formatCurrency(stats.agua)}</div>
            <p className="text-xs text-muted-foreground">Saneamento</p>
          </CardContent>
        </Card>

        <Card className="border-purple-500/20 bg-purple-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Internet</CardTitle>
            <Wifi className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">{formatCurrency(stats.internet)}</div>
            <p className="text-xs text-muted-foreground">Banda larga</p>
          </CardContent>
        </Card>

        <Card className="border-green-500/20 bg-green-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Telefone</CardTitle>
            <Phone className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{formatCurrency(stats.telefone)}</div>
            <p className="text-xs text-muted-foreground">Celular</p>
          </CardContent>
        </Card>
      </div>

      {/* List */}
      <h3 className="text-lg font-semibold">Suas Contas</h3>
      {contas.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">
              Nenhuma conta fixa cadastrada
            </h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              Adicione luz, água, internet, aluguel e outras contas fixas mensais
            </p>
            <Button
              onClick={() => setShowAddDrawer(true)}
              variant="outline"
              className="h-11 border-primary text-primary hover:bg-primary/10"
            >
              Adicionar primeira conta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {contas.map((item) => {
            const style = getCategoryStyle(item.categoria)
            return (
              <Card key={item.id} className="group hover:shadow-md transition-all">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${style.bg} ${style.color}`}>
                      {style.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{item.nome}</h4>
                      <p className="text-sm text-muted-foreground capitalize flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Vence dia {item.dia_vencimento}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t mt-2">
                    <div className="font-bold text-xl">
                      {formatCurrency(item.valor)}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        if (confirm('Tem certeza que deseja remover esta conta?')) deleteContaFixa(item.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remover
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <ContaFixaSheet
        open={showAddDrawer}
        onOpenChange={setShowAddDrawer}
      />
    </div>
  )
}
