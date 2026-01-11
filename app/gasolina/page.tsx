'use client'

import { useState } from 'react'
import { useGasolina } from '@/hooks/use-gasolina'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Car, TrendingUp, Fuel, MapPin, Bike, Trash2 } from 'lucide-react'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { GasolinaSheet } from '@/components/gasolina-sheet'

export default function GasolinaPage() {
  const { abastecimentos, stats, isLoading, deleteGasolina } = useGasolina()
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
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Gasolina</h2>
          <p className="text-sm text-muted-foreground">
            Controle seus abastecimentos e consumo
          </p>
        </div>
        <Button
          onClick={() => setShowAddDrawer(true)}
          className="h-12 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 w-full sm:w-auto"
        >
          <Plus className="h-5 w-5 mr-2" />
          Novo Abastecimento
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gasto Total</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.gastoTotal)}</div>
            <p className="text-xs text-muted-foreground">Total acumulado</p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Litros</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats.litrosTotais.toFixed(1)} L</div>
            <p className="text-xs text-muted-foreground">Abastecidos</p>
          </CardContent>
        </Card>

        <Card className="border-orange-500/20 bg-orange-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Preço Médio</CardTitle>
            <MapPin className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{formatCurrency(stats.precoMedio)}</div>
            <p className="text-xs text-muted-foreground">Por litro</p>
          </CardContent>
        </Card>

        <Card className="border-green-500/20 bg-green-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abastecimentos</CardTitle>
            <Car className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.totalAbastecimentos}</div>
            <p className="text-xs text-muted-foreground">Registros</p>
          </CardContent>
        </Card>
      </div>

      {/* List */}
      <h3 className="text-lg font-semibold">Histórico</h3>
      {abastecimentos.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Car className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">
              Nenhum abastecimento registrado
            </h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              Registre seus abastecimentos para acompanhar consumo e gastos com combustível
            </p>
            <Button
              onClick={() => setShowAddDrawer(true)}
              variant="outline"
              className="h-11 border-primary text-primary hover:bg-primary/10"
            >
              Começar agora
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {abastecimentos.map((item) => (
            <Card key={item.id} className="group overflow-hidden transition-all hover:shadow-md hover:border-primary/30">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${item.veiculo === 'moto'
                    ? 'bg-orange-500/10 text-orange-500'
                    : 'bg-blue-500/10 text-blue-500'
                  }`}>
                  {item.veiculo === 'moto' ? <Bike className="h-6 w-6" /> : <Car className="h-6 w-6" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-base truncate">
                      {item.local || 'Posto Desconhecido'}
                    </h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium">
                      {formatDateTime(item.data).split(' ')[0]}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Fuel className="h-3 w-3" />
                      {Number(item.litros).toFixed(2)}L
                    </span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                    <span>
                      {formatCurrency(Number(item.preco_litro))}/L
                    </span>
                    {item.km_atual && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                        <span>KM {item.km_atual}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="font-bold text-lg">
                    {formatCurrency(item.valor)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10"
                    onClick={() => {
                      if (confirm('Tem certeza que deseja excluir?')) deleteGasolina(item.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <GasolinaSheet
        open={showAddDrawer}
        onOpenChange={setShowAddDrawer}
      />
    </div>
  )
}

