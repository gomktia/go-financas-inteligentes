'use client'

import { useState } from 'react'
import { InsertTransacaoEmpresa, useEmpresa } from '@/hooks/use-empresa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetFooter, SheetTitle } from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'

interface EmpresaTransacaoSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EmpresaTransacaoSheet({ open, onOpenChange }: EmpresaTransacaoSheetProps) {
    const { createTransacao, contas, isCreating } = useEmpresa()
    const [tipo, setTipo] = useState<'receita' | 'despesa'>('receita')

    const [form, setForm] = useState<Partial<InsertTransacaoEmpresa>>({
        descricao: '',
        valor: 0,
        data_transacao: new Date().toISOString().split('T')[0],
        categoria: '',
        observacoes: '',
        status: 'pago'
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!form.descricao || !form.valor) return

        createTransacao({
            empresa_id: 1, // Fixed for single organization
            tipo: tipo,
            conta_id: contas[0]?.id, // Default to first account
            descricao: form.descricao,
            valor: Number(form.valor),
            data_transacao: form.data_transacao!,
            categoria: form.categoria || (tipo === 'receita' ? 'Vendas' : 'Operacional'),
            status: form.status,
            observacoes: form.observacoes
        })

        // Reset
        setForm({
            descricao: '',
            valor: 0,
            data_transacao: new Date().toISOString().split('T')[0],
            categoria: '',
            observacoes: '',
            status: 'pago'
        })

        onOpenChange(false)
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle>Nova Movimentação</SheetTitle>
                    <div className="flex gap-2 mt-4 bg-muted p-1 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setTipo('receita')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${tipo === 'receita'
                                    ? 'bg-green-500 text-white shadow-sm'
                                    : 'text-muted-foreground hover:bg-background/50'
                                }`}
                        >
                            Receita
                        </button>
                        <button
                            type="button"
                            onClick={() => setTipo('despesa')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${tipo === 'despesa'
                                    ? 'bg-red-500 text-white shadow-sm'
                                    : 'text-muted-foreground hover:bg-background/50'
                                }`}
                        >
                            Despesa
                        </button>
                    </div>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Descrição</label>
                        <Input
                            value={form.descricao}
                            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                            className="h-12"
                            placeholder={tipo === 'receita' ? "Ex: Venda de Serviço" : "Ex: Conta de Luz"}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Valor (R$)</label>
                            <Input
                                type="number"
                                step="0.01"
                                value={form.valor || ''}
                                onChange={(e) => setForm({ ...form, valor: parseFloat(e.target.value) })}
                                className="h-12 font-bold"
                                placeholder="0,00"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Data</label>
                            <Input
                                type="date"
                                value={form.data_transacao}
                                onChange={(e) => setForm({ ...form, data_transacao: e.target.value })}
                                className="h-12"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Categoria</label>
                        <Select
                            value={form.categoria}
                            onValueChange={(value) => setForm({ ...form, categoria: value })}
                        >
                            <SelectTrigger className="h-12">
                                <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                                {tipo === 'receita' ? (
                                    <>
                                        <SelectItem value="Vendas">Vendas</SelectItem>
                                        <SelectItem value="Serviços">Serviços</SelectItem>
                                        <SelectItem value="Rendimentos">Rendimentos</SelectItem>
                                    </>
                                ) : (
                                    <>
                                        <SelectItem value="Operacional">Operacional</SelectItem>
                                        <SelectItem value="Marketing">Marketing</SelectItem>
                                        <SelectItem value="Impostos">Impostos</SelectItem>
                                        <SelectItem value="Pessoal">Pessoal / Salários</SelectItem>
                                        <SelectItem value="Software">Software</SelectItem>
                                    </>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <SheetFooter className="pt-4">
                        <Button
                            type="submit"
                            disabled={isCreating}
                            className={`flex-1 h-12 ${tipo === 'receita' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                        >
                            {isCreating ? 'Salvando...' : `Adicionar ${tipo === 'receita' ? 'Receita' : 'Despesa'}`}
                        </Button>
                    </SheetFooter>

                </form>
            </SheetContent>
        </Sheet>
    )
}
