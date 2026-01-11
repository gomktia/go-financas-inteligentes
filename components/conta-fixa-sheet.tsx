'use client'

import { useState } from 'react'
import { useContasFixas, InsertContaFixa } from '@/hooks/use-contas-fixas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetHeader, SheetContent, SheetFooter } from '@/components/ui/sheet'

interface ContaFixaSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ContaFixaSheet({ open, onOpenChange }: ContaFixaSheetProps) {
    const { createContaFixa, isCreating } = useContasFixas()
    const [form, setForm] = useState<InsertContaFixa>({
        nome: '',
        valor: 0,
        dia_vencimento: 10,
        usuario_id: 1, // TODO: Get from auth
        categoria: 'outros',
        status: 'ativa',
        observacoes: ''
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        createContaFixa(form)

        // Reset form
        setForm({
            nome: '',
            valor: 0,
            dia_vencimento: 10,
            usuario_id: 1,
            categoria: 'outros',
            status: 'ativa',
            observacoes: ''
        })

        onOpenChange(false)
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="overflow-y-auto">
                <SheetHeader className="mb-6">
                    <h2 className="text-xl font-bold">Nova Conta Fixa</h2>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Nome */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Nome da Conta</label>
                        <Input
                            value={form.nome}
                            onChange={(e) => setForm({ ...form, nome: e.target.value })}
                            className="h-12 text-base"
                            placeholder="Ex: Aluguel, Condomínio, Escola..."
                            required
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Valor */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Valor Estimado (R$)</label>
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
                                <SelectItem value="energia">⚡ Energia Elétrica</SelectItem>
                                <SelectItem value="agua">💧 Água e Esgoto</SelectItem>
                                <SelectItem value="internet">🌐 Internet</SelectItem>
                                <SelectItem value="telefone">📱 Telefone / Celular</SelectItem>
                                <SelectItem value="aluguel">🏠 Habitação (Aluguel/Cond.)</SelectItem>
                                <SelectItem value="educacao">🎓 Educação</SelectItem>
                                <SelectItem value="saude">🏥 Saúde</SelectItem>
                                <SelectItem value="outros">📦 Outros</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Observações */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Observações (Opcional)</label>
                        <Input
                            value={form.observacoes || ''}
                            onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                            className="h-12"
                            placeholder="Detalhes adicionais..."
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
