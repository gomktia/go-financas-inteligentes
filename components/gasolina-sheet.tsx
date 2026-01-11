'use client'

import { useState, useEffect } from 'react'
import { useGasolina, InsertGasolina } from '@/hooks/use-gasolina'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetHeader, SheetContent, SheetFooter } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Car, Bike } from 'lucide-react'

interface GasolinaSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function GasolinaSheet({ open, onOpenChange }: GasolinaSheetProps) {
    const { createGasolina, isCreating } = useGasolina()
    const [form, setForm] = useState<InsertGasolina>({
        veiculo: 'carro',
        valor: 0,
        litros: 0,
        preco_litro: 0,
        local: '',
        km_atual: 0,
        usuario_id: 1, // TODO: Get from auth context
        data: new Date().toISOString().split('T')[0],
        observacoes: ''
    })

    // Auto-calculate price per liter
    useEffect(() => {
        if (form.valor > 0 && form.litros > 0) {
            const calculated = form.valor / form.litros
            setForm(f => ({ ...f, preco_litro: parseFloat(calculated.toFixed(3)) }))
        }
    }, [form.valor, form.litros])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        createGasolina(form)

        // Reset form
        setForm({
            veiculo: 'carro',
            valor: 0,
            litros: 0,
            preco_litro: 0,
            local: '',
            km_atual: 0,
            usuario_id: 1,
            data: new Date().toISOString().split('T')[0],
            observacoes: ''
        })

        onOpenChange(false)
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="overflow-y-auto">
                <SheetHeader className="mb-6">
                    <h2 className="text-xl font-bold">Novo Abastecimento</h2>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Veículo */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Veículo</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setForm({ ...form, veiculo: 'carro' })}
                                className={`flex items-center justify-center gap-2 h-12 rounded-xl border-2 font-medium transition-all ${form.veiculo === 'carro'
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-input hover:border-primary/50'
                                    }`}
                            >
                                <Car className="h-5 w-5" />
                                Carro
                            </button>
                            <button
                                type="button"
                                onClick={() => setForm({ ...form, veiculo: 'moto' })}
                                className={`flex items-center justify-center gap-2 h-12 rounded-xl border-2 font-medium transition-all ${form.veiculo === 'moto'
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-input hover:border-primary/50'
                                    }`}
                            >
                                <Bike className="h-5 w-5" />
                                Moto
                            </button>
                        </div>
                    </div>

                    {/* Valor Total */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Valor Total (R$)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">R$</span>
                            <Input
                                type="number"
                                step="0.01"
                                value={form.valor || ''}
                                onChange={(e) => setForm({ ...form, valor: parseFloat(e.target.value) || 0 })}
                                className="pl-12 h-12 text-lg font-semibold"
                                placeholder="0,00"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Litros */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Litros</label>
                            <Input
                                type="number"
                                step="0.001"
                                value={form.litros || ''}
                                onChange={(e) => setForm({ ...form, litros: parseFloat(e.target.value) || 0 })}
                                className="h-12"
                                placeholder="0.000"
                                required
                            />
                        </div>

                        {/* Preço por Litro (Calculado) */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Preço/Litro</label>
                            <div className="h-12 px-3 flex items-center bg-muted/50 rounded-md border border-input text-muted-foreground">
                                R$ {form.preco_litro.toFixed(3)}
                            </div>
                        </div>
                    </div>

                    {/* Local / Posto */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Posto / Local</label>
                        <Input
                            value={form.local || ''}
                            onChange={(e) => setForm({ ...form, local: e.target.value })}
                            className="h-12"
                            placeholder="Ex: Posto Ipiranga Centro"
                        />
                    </div>

                    {/* KM Atual */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">KM Atual (Opcional)</label>
                        <Input
                            type="number"
                            value={form.km_atual || ''}
                            onChange={(e) => setForm({ ...form, km_atual: parseInt(e.target.value) || 0 })}
                            className="h-12"
                            placeholder="Ex: 54320"
                        />
                    </div>

                    {/* Data */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Data</label>
                        <Input
                            type="date"
                            value={form.data}
                            onChange={(e) => setForm({ ...form, data: e.target.value })}
                            className="h-12"
                            required
                        />
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
