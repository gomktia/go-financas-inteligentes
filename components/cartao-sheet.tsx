'use client'

import { useState } from 'react'
import { useCartoes, InsertCartao } from '@/hooks/use-cartoes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetHeader, SheetContent, SheetFooter } from '@/components/ui/sheet'

interface CartaoSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CartaoSheet({ open, onOpenChange }: CartaoSheetProps) {
    const { createCartao, isCreating } = useCartoes()
    const [form, setForm] = useState<InsertCartao>({
        nome: '',
        bandeira: 'mastercard',
        ultimos_digitos: '',
        limite: 0,
        dia_vencimento: 10,
        dia_fechamento: 5,
        usuario_id: 1, // TODO: Get from auth
        status: 'ativo',
        cor: '#000000',
        observacoes: ''
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        createCartao(form)

        // Reset form
        setForm({
            nome: '',
            bandeira: 'mastercard',
            ultimos_digitos: '',
            limite: 0,
            dia_vencimento: 10,
            dia_fechamento: 5,
            usuario_id: 1,
            status: 'ativo',
            cor: '#000000',
            observacoes: ''
        })

        onOpenChange(false)
    }

    const bandeiras = [
        { value: 'mastercard', label: 'Mastercard' },
        { value: 'visa', label: 'Visa' },
        { value: 'amex', label: 'American Express' },
        { value: 'elo', label: 'Elo' },
        { value: 'hipercard', label: 'Hipercard' },
        { value: 'nubank', label: 'Nubank' },
        { value: 'inter', label: 'Inter' },
        { value: 'itau', label: 'Itaú' },
        { value: 'santander', label: 'Santander' },
        { value: 'bradesco', label: 'Bradesco' },
        { value: 'bb', label: 'Banco do Brasil' },
        { value: 'caixa', label: 'Caixa' },
        { value: 'outro', label: 'Outro' }
    ]

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="overflow-y-auto">
                <SheetHeader className="mb-6">
                    <h2 className="text-xl font-bold">Novo Cartão</h2>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Nome */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Nome do Cartão / Apelido</label>
                        <Input
                            value={form.nome}
                            onChange={(e) => setForm({ ...form, nome: e.target.value })}
                            className="h-12 text-base"
                            placeholder="Ex: Nubank Principal, Itaú Black..."
                            required
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Bandeira */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Bandeira / Banco</label>
                            <Select
                                value={form.bandeira}
                                onValueChange={(value) => setForm({ ...form, bandeira: value })}
                            >
                                <SelectTrigger className="h-12">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {bandeiras.map((b) => (
                                        <SelectItem key={b.value} value={b.value}>
                                            {b.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Últimos Dígitos */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Últimos 4 Dígitos</label>
                            <Input
                                value={form.ultimos_digitos}
                                onChange={(e) => setForm({ ...form, ultimos_digitos: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                                maxLength={4}
                                className="h-12 text-center tracking-widest"
                                placeholder="1234"
                                required
                            />
                        </div>
                    </div>

                    {/* Limite */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Limite Total (R$)</label>
                        <Input
                            type="number"
                            step="0.01"
                            value={form.limite || ''}
                            onChange={(e) => setForm({ ...form, limite: parseFloat(e.target.value) || 0 })}
                            className="h-12 font-semibold"
                            placeholder="0,00"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Dia Fechamento */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Dia Fechamento</label>
                            <Input
                                type="number"
                                min="1"
                                max="31"
                                value={form.dia_fechamento || ''}
                                onChange={(e) => setForm({ ...form, dia_fechamento: parseInt(e.target.value) || 1 })}
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

                    {/* Cor */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Cor do Cartão</label>
                        <div className="flex gap-2 flex-wrap">
                            {['#000000', '#1a1a1a', '#820ad1', '#ec008c', '#FF0000', '#0038A8', '#f59e0b', '#10b981'].map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    className={`w-8 h-8 rounded-full border-2 ${form.cor === color ? 'border-primary scale-110' : 'border-transparent'}`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => setForm({ ...form, cor: color })}
                                />
                            ))}
                            <Input
                                type="color"
                                value={form.cor}
                                onChange={(e) => setForm({ ...form, cor: e.target.value })}
                                className="w-8 h-8 p-0 border-0 rounded-full cursor-pointer"
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
