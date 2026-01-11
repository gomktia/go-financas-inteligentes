'use client'

import { useState } from 'react'
import { useGastos } from '@/hooks/use-gastos'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { Plus, Receipt, Trash2, Edit3 } from 'lucide-react'

export default function GastosPage() {
  const { gastos, isLoading, deleteGasto, isDeleting } = useGastos()
  const [showAddDrawer, setShowAddDrawer] = useState(false)
  const [editingGasto, setEditingGasto] = useState<any>(null)

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este gasto?')) {
      await deleteGasto(id)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Carregando gastos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Gastos</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie seus gastos do dia a dia
          </p>
        </div>
        <Button 
          onClick={() => setShowAddDrawer(true)}
          className="w-full sm:w-auto shadow-lg shadow-primary/30"
        >
          <Plus className="h-5 w-5 mr-2" />
          Novo Gasto
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-0 bg-gradient-to-br from-primary/10 to-primary/20 dark:from-primary/10 dark:to-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-primary">Total do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(gastos.reduce((sum, gasto) => sum + parseFloat(gasto.valor.toString()), 0))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-green-600 dark:text-green-400">Gastos Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {formatCurrency(gastos.filter(g => new Date(g.data).toDateString() === new Date().toDateString()).reduce((sum, gasto) => sum + parseFloat(gasto.valor.toString()), 0))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-orange-600 dark:text-orange-400">Total de Gastos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
              {gastos.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gastos List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Gastos Recentes</h3>
        
        {gastos.length === 0 ? (
          <Card className="border-0 bg-zinc-50 dark:bg-zinc-900/50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Receipt className="h-12 w-12 text-zinc-400 mb-4" />
              <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">
                Nenhum gasto encontrado
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-center mb-6">
                Comece adicionando seu primeiro gasto para acompanhar seus gastos
              </p>
              <Button 
                onClick={() => setShowAddDrawer(true)}
              >
                <Plus className="h-5 w-5 mr-2" />
                Adicionar Gasto
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {gastos.map((gasto) => (
              <Card key={gasto.id} className="border-0 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 flex-shrink-0 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                          <Receipt className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-zinc-900 dark:text-white truncate">
                            {gasto.descricao}
                          </h4>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            {formatDateTime(gasto.data)}
                          </p>
                        </div>
                      </div>
                      <div className="sm:ml-13">
                        <p className="text-sm text-zinc-600 dark:text-zinc-300">
                          Categoria: {gasto.categoria || 'Não especificada'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <div className="text-left sm:text-right">
                        <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                          -{formatCurrency(parseFloat(gasto.valor.toString()))}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingGasto(gasto)}
                          className="h-8 w-8 p-0 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(gasto.id)}
                          disabled={isDeleting}
                          className="h-8 w-8 p-0 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Gasto Drawer */}
      <Drawer open={showAddDrawer || !!editingGasto} onOpenChange={(open) => {
        setShowAddDrawer(open)
        if (!open) setEditingGasto(null)
      }}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {editingGasto ? 'Editar Gasto' : 'Novo Gasto'}
            </DrawerTitle>
            <DrawerDescription>
              {editingGasto ? 'Atualize as informações do gasto' : 'Adicione um novo gasto ao seu controle financeiro'}
            </DrawerDescription>
          </DrawerHeader>
          
          <GastoForm 
            gasto={editingGasto}
            onClose={() => {
              setShowAddDrawer(false)
              setEditingGasto(null)
            }}
          />
        </DrawerContent>
      </Drawer>
    </div>
  )
}

function GastoForm({ gasto, onClose }: { gasto?: any; onClose: () => void }) {
  const { createGasto, updateGasto, isCreating, isUpdating } = useGastos()
  const [formData, setFormData] = useState({
    descricao: gasto?.descricao || '',
    valor: gasto?.valor || '',
    categoria: gasto?.categoria || '',
    data: gasto?.data ? new Date(gasto.data).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    tipo_pagamento: gasto?.tipo_pagamento || 'dinheiro'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const gastoData = {
      ...formData,
      valor: parseFloat(formData.valor.toString()),
      usuario_id: 1, // TODO: Get from auth context
    }

    try {
      if (gasto) {
        await updateGasto({ id: gasto.id, ...gastoData })
      } else {
        await createGasto(gastoData)
      }
      onClose()
    } catch (error) {
      console.error('Erro ao salvar gasto:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Descrição *
        </label>
        <Input
          type="text"
          placeholder="Ex: Mercado, Farmácia, Gasolina..."
          value={formData.descricao}
          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
          className="rounded-xl border-zinc-200 dark:border-zinc-700"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Valor *
          </label>
          <Input
            type="number"
            step="0.01"
            placeholder="0,00"
            value={formData.valor}
            onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
            className="rounded-xl border-zinc-200 dark:border-zinc-700"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Data *
          </label>
          <Input
            type="date"
            value={formData.data}
            onChange={(e) => setFormData({ ...formData, data: e.target.value })}
            className="rounded-xl border-zinc-200 dark:border-zinc-700"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Categoria
        </label>
        <Input
          type="text"
          placeholder="Ex: Alimentação, Transporte, Saúde..."
          value={formData.categoria}
          onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
          className="rounded-xl border-zinc-200 dark:border-zinc-700"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Tipo de Pagamento
        </label>
        <select
          value={formData.tipo_pagamento}
          onChange={(e) => setFormData({ ...formData, tipo_pagamento: e.target.value })}
          className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm"
        >
          <option value="dinheiro">💵 Dinheiro</option>
          <option value="cartao_debito">💳 Cartão Débito</option>
          <option value="cartao_credito">💳 Cartão Crédito</option>
          <option value="pix">📱 PIX</option>
          <option value="transferencia">🏦 Transferência</option>
        </select>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1 rounded-xl border-zinc-200 dark:border-zinc-700"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isCreating || isUpdating}
          className="flex-1"
        >
          {isCreating || isUpdating ? 'Salvando...' : (gasto ? 'Atualizar' : 'Adicionar')}
        </Button>
      </div>
    </form>
  )
}
