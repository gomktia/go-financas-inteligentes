'use client'

import { useState } from 'react'
import { useInvestimentos, InsertInvestimento } from '@/hooks/use-investimentos'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetHeader, SheetContent, SheetFooter } from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'

interface InvestimentoSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function InvestimentoSheet({ open, onOpenChange }: InvestimentoSheetProps) {
    const { createInvestimento, isCreating } = useInvestimentos()
    const [form, setForm] = useState<InsertInvestimento>({
        nome: '',
        tipo: 'poupanca',
        valor_investido: 0,
        valor_atual: 0,
        usuario_id: 1, // TODO: Get from auth
        data_aplicacao: new Date().toISOString().split('T')[0],
        observacoes: ''
    })

    // Auto-sync initial values
    const handleInvestidoChange = (val: number) => {
        setForm(prev => {
            // If current value was same as invested, keep them synced initially
            const shouldSync = prev.valor_atual === prev.valor_investido
            return {
                ...prev,
                valor_investido: val,
                valor_atual: shouldSync ? val : prev.valor_atual
            }
        })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        createInvestimento(form)

        // Reset form
        setForm({
            nome: '',
            tipo: 'poupanca',
            valor_investido: 0,
            valor_atual: 0,
            usuario_id: 1,
            data_aplicacao: new Date().toISOString().split('T')[0],
            observacoes: ''
        })

        onOpenChange(false)
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="overflow-y-auto">
                <SheetHeader className="mb-6">
                    <h2 className="text-xl font-bold">Novo Investimento</h2>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Nome */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Nome do Ativo</label>
                        <Input
                            value={form.nome}
                            onChange={(e) => setForm({ ...form, nome: e.target.value })}
                            className="h-12 text-base"
                            placeholder="Ex: Reserva NuBank, Ações Apple, Tesouro Direto..."
                            required
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Tipo */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                            <Select
                                value={form.tipo}
                                onValueChange={(value) => setForm({ ...form, tipo: value })}
                            >
                                <SelectTrigger className="h-12">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="poupanca">Poupança</SelectItem>
                                    <SelectItem value="cdb">CDB / Renda Fixa</SelectItem>
                                    <SelectItem value="acoes">Ações / Stocks</SelectItem>
                                    <SelectItem value="fiis">FIIs</SelectItem>
                                    <SelectItem value="crypto">Criptomoedas</SelectItem>
                                    <SelectItem value="tesouro">Tesouro Direto</SelectItem>
                                    <SelectItem value="outro">Outro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Data Aplicação */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Data</label>
                            <Input
                                type="date"
                                value={form.data_aplicacao}
                                onChange={(e) => setForm({ ...form, data_aplicacao: e.target.value })}
                                className="h-12"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Valor Investido */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Valor Aplicado (R$)</label>
                            <Input
                                type="number"
                                step="0.01"
                                value={form.valor_investido || ''}
                                onChange={(e) => handleInvestidoChange(parseFloat(e.target.value) || 0)}
                                className="h-12 font-semibold"
                                placeholder="0,00"
                                required
                            />
                        </div>

                        {/* Valor Atual */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Valor Atual (R$)</label>
                            <Input
                                type="number"
                                step="0.01"
                                value={form.valor_atual || ''}
                                onChange={(e) => setForm({ ...form, valor_atual: parseFloat(e.target.value) || 0 })}
                                className="h-12"
                                placeholder="0,00"
                                required
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
                            placeholder="Detalhes adicionais, corretora, vencimento..."
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
