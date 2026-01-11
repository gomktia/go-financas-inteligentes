'use client'

import { useState } from 'react'
import { useGastos } from '@/hooks/use-gastos'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetHeader, SheetContent, SheetFooter } from '@/components/ui/sheet'
import { CATEGORIAS, TIPOS_PAGAMENTO, InsertGasto } from '@/types'

interface GastoSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GastoSheet({ open, onOpenChange }: GastoSheetProps) {
  const { createGasto, isCreating } = useGastos()
  const [form, setForm] = useState<Partial<InsertGasto>>({
    descricao: '',
    valor: 0,
    usuario_id: 1,
    data: new Date().toISOString().split('T')[0],
    categoria: 'Alimentação',
    tipo_pagamento: 'PIX',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Form validation is handled by HTML5 required attributes
    createGasto(form as InsertGasto)
    setForm({
      descricao: '',
      valor: 0,
      usuario_id: 1,
      data: new Date().toISOString().split('T')[0],
      categoria: 'Alimentação',
      tipo_pagamento: 'PIX',
    })
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetHeader onClose={() => onOpenChange(false)}>
        Novo Gasto
      </SheetHeader>

      <form onSubmit={handleSubmit}>
        <SheetContent>
          {/* Descrição */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Descrição
            </label>
            <Input
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              placeholder="Ex: Mercado, Uber, Netflix..."
              className="h-12 text-base"
              required
              autoFocus
            />
          </div>

          {/* Valor */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Valor
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">
                R$
              </span>
              <Input
                type="number"
                step="0.01"
                value={form.valor || ''}
                onChange={(e) => setForm({ ...form, valor: parseFloat(e.target.value) || 0 })}
                placeholder="0,00"
                className="h-12 pl-12 text-lg font-semibold"
                required
              />
            </div>
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Categoria
            </label>
            <select
              className="flex h-12 w-full rounded-xl border-2 border-input bg-background px-4 text-base ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary hover:border-input/80"
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
            >
              {CATEGORIAS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo de Pagamento */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Forma de Pagamento
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TIPOS_PAGAMENTO.map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => setForm({ ...form, tipo_pagamento: tipo })}
                  className={`h-12 rounded-xl border-2 font-semibold transition-all duration-200 active:scale-95 ${
                    form.tipo_pagamento === tipo
                      ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/30 scale-[0.98]'
                      : 'border-input hover:border-primary/50 hover:bg-accent'
                  }`}
                >
                  {tipo}
                </button>
              ))}
            </div>
          </div>

          {/* Data */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Data
            </label>
            <Input
              type="date"
              value={form.data}
              onChange={(e) => setForm({ ...form, data: e.target.value })}
              className="h-12 text-base"
              required
            />
          </div>
        </SheetContent>

        <SheetFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-12 rounded-xl text-base font-semibold"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isCreating}
            className="flex-1 h-12 rounded-xl text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30"
          >
            {isCreating ? 'Salvando...' : 'Adicionar'}
          </Button>
        </SheetFooter>
      </form>
    </Sheet>
  )
}
