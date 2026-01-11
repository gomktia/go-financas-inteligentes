'use client'

import { useState } from 'react'
import { useMetas, InsertMeta } from '@/hooks/use-metas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetHeader, SheetContent, SheetFooter } from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'

interface MetaSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function MetaSheet({ open, onOpenChange }: MetaSheetProps) {
    const { createMeta, isCreating } = useMetas()
    const [form, setForm] = useState<InsertMeta>({
        nome: '',
        valor_objetivo: 0,
        valor_atual: 0,
        usuario_id: 1, // TODO: Get from auth
        status: 'em_andamento',
        categoria: 'viagem',
        prazo: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        observacoes: ''
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        createMeta(form)

        // Reset form
        setForm({
            nome: '',
            valor_objetivo: 0,
            valor_atual: 0,
            usuario_id: 1,
            status: 'em_andamento',
            categoria: 'viagem',
            prazo: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
            observacoes: ''
        })

        onOpenChange(false)
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="overflow-y-auto">
                <SheetHeader className="mb-6">
                    <h2 className="text-xl font-bold">Nova Meta</h2>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Nome */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Nome da Meta</label>
                        <Input
                            value={form.nome}
                            onChange={(e) => setForm({ ...form, nome: e.target.value })}
                            className="h-12 text-base"
                            placeholder="Ex: Viagem para Europa, Novo Carro..."
                            required
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Valor Objetivo */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Objetivo (R$)</label>
                            <Input
                                type="number"
                                step="0.01"
                                value={form.valor_objetivo || ''}
                                onChange={(e) => setForm({ ...form, valor_objetivo: parseFloat(e.target.value) || 0 })}
                                className="h-12 font-semibold"
                                placeholder="0,00"
                                required
                            />
                        </div>

                        {/* Valor Atual */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Já Tenho (R$)</label>
                            <Input
                                type="number"
                                step="0.01"
                                value={form.valor_atual || ''}
                                onChange={(e) => setForm({ ...form, valor_atual: parseFloat(e.target.value) || 0 })}
                                className="h-12"
                                placeholder="0,00"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Categoria */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Categoria</label>
                            <Select
                                value={form.categoria}
                                onValueChange={(value) => setForm({ ...form, categoria: value })}
                            >
                                <SelectTrigger className="h-12">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="viagem">✈️ Viagem</SelectItem>
                                    <SelectItem value="veiculo">🚗 Veículo</SelectItem>
                                    <SelectItem value="imovel">🏠 Imóvel</SelectItem>
                                    <SelectItem value="emergencia">🆘 Reserva de Emergência</SelectItem>
                                    <SelectItem value="eletronicos">💻 Eletrônicos</SelectItem>
                                    <SelectItem value="investimento">📈 Investimento</SelectItem>
                                    <SelectItem value="outro">📦 Outro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Prazo */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Prazo</label>
                            <Input
                                type="date"
                                value={form.prazo || ''}
                                onChange={(e) => setForm({ ...form, prazo: e.target.value })}
                                className="h-12"
                            />
                        </div>
                    </div>

                    {/* Observações */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Observações</label>
                        <Textarea
                            value={form.observacoes || ''}
                            onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                            className="min-h-[100px]"
                            placeholder="Detalhes adicionais sobre sua meta..."
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
                            {isCreating ? 'Salvando...' : 'Criar Meta'}
                        </Button>
                    </SheetFooter>

                </form>
            </SheetContent>
        </Sheet>
    )
}
