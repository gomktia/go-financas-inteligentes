'use client'

import { useState } from 'react'
import { useCartoes } from '@/hooks/use-cartoes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, CreditCard, TrendingUp, Calendar, DollarSign, Trash2, Lock, Landmark } from 'lucide-react'
import { CartaoSheet } from '@/components/cartao-sheet'
import { formatCurrency } from '@/lib/utils'

export default function CartoesPage() {
  const { cartoes, stats, isLoading, deleteCartao } = useCartoes()
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
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Cartões</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie seus cartões de crédito e débito
          </p>
        </div>
        <Button
          onClick={() => setShowAddDrawer(true)}
          className="h-12 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 w-full sm:w-auto"
        >
          <Plus className="h-5 w-5 mr-2" />
          Novo Cartão
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-orange-500/20 bg-orange-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fatura Atual</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            {/* TODO: Integrate with real invoice values from Parcelas/Gastos */}
            <div className="text-2xl font-bold text-orange-500">R$ 0,00</div>
            <p className="text-xs text-muted-foreground">A pagar</p>
          </CardContent>
        </Card>

        <Card className="border-green-500/20 bg-green-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Limite Disponível</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{formatCurrency(stats.limiteDisponivel)}</div>
            <p className="text-xs text-muted-foreground">Total disponível</p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cartões Ativos</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats.cartoesAtivos}</div>
            <p className="text-xs text-muted-foreground">Cadastrados</p>
          </CardContent>
        </Card>

        <Card className="border-purple-500/20 bg-purple-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próx. Vencimento</CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">
              {stats.proximoVencimento ? `Dia ${stats.proximoVencimento}` : '--'}
            </div>
            <p className="text-xs text-muted-foreground">Data</p>
          </CardContent>
        </Card>
      </div>

      {/* List */}
      <h3 className="text-lg font-semibold">Seus Cartões</h3>
      {cartoes.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">
              Nenhum cartão cadastrado
            </h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              Adicione seus cartões de crédito e débito para controlar faturas e limites
            </p>
            <Button
              onClick={() => setShowAddDrawer(true)}
              variant="outline"
              className="h-11 border-primary text-primary hover:bg-primary/10"
            >
              Adicionar primeiro cartão
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cartoes.map((cartao) => (
            <div
              key={cartao.id}
              className="relative overflow-hidden rounded-xl aspect-[1.586/1] text-white shadow-xl transition-transform hover:scale-[1.02]"
              style={{
                background: cartao.cor || `linear-gradient(135deg, #1e293b 0%, #0f172a 100%)`
              }}
            >
              <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors p-6 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg tracking-wide">{cartao.nome}</h3>
                    <p className="text-white/70 text-sm font-medium capitalize">{cartao.bandeira}</p>
                  </div>
                  <Landmark className="h-6 w-6 opacity-70" />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-white/50"></span>
                      <span className="w-2 h-2 rounded-full bg-white/50"></span>
                      <span className="w-2 h-2 rounded-full bg-white/50"></span>
                      <span className="w-2 h-2 rounded-full bg-white/50"></span>
                    </div>
                    <span className="font-mono text-lg tracking-widest">{cartao.ultimos_digitos}</span>
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-white/60 mb-1">LIMITE</p>
                      <p className="font-semibold">{formatCurrency(cartao.limite)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white/60 mb-1">VENCTO</p>
                      <p className="font-semibold">DIA {cartao.dia_vencimento}</p>
                    </div>
                  </div>
                </div>

                {/* Actions Overlay */}
                <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:bg-white/20 hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm('Tem certeza que deseja excluir?')) deleteCartao(cartao.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Decorative Circles */}
              <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-white/5 blur-3xl" />
              <div className="absolute -top-12 -left-12 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
            </div>
          ))}
        </div>
      )}

      <CartaoSheet
        open={showAddDrawer}
        onOpenChange={setShowAddDrawer}
      />
    </div>
  )
}
