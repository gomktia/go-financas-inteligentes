'use client'

import { useState, useEffect } from 'react'
import { useParcelas, InsertParcela } from '@/hooks/use-parcelas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetHeader, SheetContent, SheetFooter } from '@/components/ui/sheet'
import { Calendar } from 'lucide-react'

interface ParcelaSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ParcelaSheet({ open, onOpenChange }: ParcelaSheetProps) {
    const { createParcela, isCreating } = useParcelas()
    const [form, setForm] = useState<InsertParcela>({
        produto: '',
        valor_total: 0,
        total_parcelas: 1,
        valor_parcela: 0,
        parcelas_pagas: 0,
        data_compra: new Date().toISOString().split('T')[0],
        primeira_parcela: new Date().toISOString().split('T')[0],
        dia_vencimento: 10,
        usuario_id: 1, // TODO: Get from auth
        observacoes: ''
    })

    // Auto-calculate installment value
    useEffect(() => {
        if (form.valor_total > 0 && form.total_parcelas > 0) {
            const calculated = form.valor_total / form.total_parcelas
            setForm(f => ({ ...f, valor_parcela: parseFloat(calculated.toFixed(2)) }))
        }
    }, [form.valor_total, form.total_parcelas])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        createParcela(form)

        // Reset form
        setForm({
            produto: '',
            valor_total: 0,
            total_parcelas: 1,
            valor_parcela: 0,
            parcelas_pagas: 0,
            data_compra: new Date().toISOString().split('T')[0],
            primeira_parcela: new Date().toISOString().split('T')[0],
            dia_vencimento: 10,
            usuario_id: 1,
            observacoes: ''
        })

        onOpenChange(false)
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="overflow-y-auto">
                <SheetHeader className="mb-6">
                    <h2 className="text-xl font-bold">Nova Compra Parcelada</h2>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Produto */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Produto / Loja</label>
                        <Input
                            value={form.produto}
                            onChange={(e) => setForm({ ...form, produto: e.target.value })}
                            className="h-12 text-base"
                            placeholder="Ex: iPhone 15, Geladeira, Shopee..."
                            required
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Valor Total */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Valor Total (R$)</label>
                            <Input
                                type="number"
                                step="0.01"
                                value={form.valor_total || ''}
                                onChange={(e) => setForm({ ...form, valor_total: parseFloat(e.target.value) || 0 })}
                                className="h-12 font-semibold"
                                placeholder="0,00"
                                required
                            />
                        </div>

                        {/* Total Parcelas */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Qtd. Parcelas</label>
                            <Input
                                type="number"
                                min="1"
                                max="360"
                                value={form.total_parcelas || ''}
                                onChange={(e) => setForm({ ...form, total_parcelas: parseInt(e.target.value) || 1 })}
                                className="h-12"
                                required
                            />
                        </div>
                    </div>

                    {/* Valor da Parcela (Calculado) */}
                    <div className="p-4 bg-muted/30 rounded-xl border-dashed border-2 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Valor da Parcela:</span>
                        <span className="text-lg font-bold text-primary">
                            R$ {form.valor_parcela.toFixed(2)}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Data da Compra */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Data da Compra</label>
                            <Input
                                type="date"
                                value={form.data_compra}
                                onChange={(e) => setForm({ ...form, data_compra: e.target.value })}
                                className="h-12"
                                required
                            />
                        </div>

                        {/* Dia Vencimento */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Dia Vencimento</label>
                            <Input
                                type="number"
                                min="1"
                                max="31"
                                value={form.dia_vencimento || ''}
                                onChange={(e) => setForm({ ...form, dia_vencimento: parseInt(e.target.value) || 1 })}
                                className="h-12"
                                required
                            />
                        </div>
                    </div>

                    <SheetFooter className="pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="flex-1 h-12"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isCreating}
                            className="flex-1 h-12 bg-primary hover:bg-primary/90"
                        >
                            {isCreating ? 'Salvando...' : 'Adicionar'}
                        </Button>
                    </SheetFooter>

                </form>
            </SheetContent>
        </Sheet>
    )
}
