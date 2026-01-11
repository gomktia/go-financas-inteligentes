'use client'

import { useState } from 'react'
import { useAssinaturas, InsertAssinatura } from '@/hooks/use-assinaturas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetHeader, SheetContent, SheetFooter } from '@/components/ui/sheet'

interface AssinaturaSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AssinaturaSheet({ open, onOpenChange }: AssinaturaSheetProps) {
    const { createAssinatura, isCreating } = useAssinaturas()
    const [form, setForm] = useState<InsertAssinatura>({
        nome: '',
        valor: 0,
        periodicidade: 'mensal',
        dia_vencimento: 10,
        usuario_id: 1, // TODO: Get from auth
        status: 'ativa',
        data_inicio: new Date().toISOString().split('T')[0],
        url: '',
        observacoes: ''
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        createAssinatura(form)

        // Reset form
        setForm({
            nome: '',
            valor: 0,
            periodicidade: 'mensal',
            dia_vencimento: 10,
            usuario_id: 1,
            status: 'ativa',
            data_inicio: new Date().toISOString().split('T')[0],
            url: '',
            observacoes: ''
        })

        onOpenChange(false)
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="overflow-y-auto">
                <SheetHeader className="mb-6">
                    <h2 className="text-xl font-bold">Nova Assinatura</h2>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Nome */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Nome da Assinatura</label>
                        <Input
                            value={form.nome}
                            onChange={(e) => setForm({ ...form, nome: e.target.value })}
                            className="h-12 text-base"
                            placeholder="Ex: Netflix, Spotify, Academia..."
                            required
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Valor */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Valor (R$)</label>
                            <Input
                                type="number"
                                step="0.01"
                                value={form.valor || ''}
                                onChange={(e) => setForm({ ...form, valor: parseFloat(e.target.value) || 0 })}
                                className="h-12 font-semibold"
                                placeholder="0,00"
                                required
                            />
                        </div>

                        {/* Periodicidade */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Periodicidade</label>
                            <Select
                                value={form.periodicidade}
                                onValueChange={(value) => setForm({ ...form, periodicidade: value })}
                            >
                                <SelectTrigger className="h-12">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="mensal">Mensal</SelectItem>
                                    <SelectItem value="trimestral">Trimestral</SelectItem>
                                    <SelectItem value="semestral">Semestral</SelectItem>
                                    <SelectItem value="anual">Anual</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
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

                        {/* Data Início */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Data Início</label>
                            <Input
                                type="date"
                                value={form.data_inicio}
                                onChange={(e) => setForm({ ...form, data_inicio: e.target.value })}
                                className="h-12"
                                required
                            />
                        </div>
                    </div>

                    {/* URL / Site */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Site / App (Opcional)</label>
                        <Input
                            value={form.url || ''}
                            onChange={(e) => setForm({ ...form, url: e.target.value })}
                            className="h-12"
                            placeholder="https://..."
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
