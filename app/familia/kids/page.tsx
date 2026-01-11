'use client'

import { useState } from 'react'
import { useKids } from '@/hooks/use-kids'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetDescription } from '@/components/ui/sheet'
import { Plus, PiggyBank, ArrowUpCircle, ArrowDownCircle, Trophy, User } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export default function KidsPage() {
    const { kids, addKid, addTransaction, isLoading } = useKids()
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [newKidName, setNewKidName] = useState('')
    const [selectedAvatar, setSelectedAvatar] = useState('bear')

    const handleCreateKid = () => {
        addKid({ nome: newKidName, avatar: selectedAvatar, saldo_inicial: 0 }, {
            onSuccess: () => {
                setIsSheetOpen(false)
                setNewKidName('')
            }
        })
    }

    const handleTransaction = (kidId: number, type: 'entrada' | 'saida') => {
        // Simples prompt por enquanto - Ideal seria outro Sheet/Dialog
        const valorStr = window.prompt(type === 'entrada' ? 'Valor da Mesada (R$):' : 'Valor do Gasto (R$):')
        if (!valorStr) return
        const valor = parseFloat(valorStr.replace(',', '.'))
        if (isNaN(valor)) return

        const descricao = window.prompt('Descrição:', type === 'entrada' ? 'Mesada Semanal' : 'Lanche') || 'Outros'

        addTransaction({ kid_id: kidId, tipo: type, valor, descricao })
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <PiggyBank className="h-8 w-8 text-orange-500" />
                        Cofrinho Kids
                    </h1>
                    <p className="text-muted-foreground">
                        Ensine educação financeira para seus filhos de forma divertida.
                    </p>
                </div>

                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
                            <Plus className="h-4 w-4" />
                            Adicionar Filho
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Criar Perfil Kids</SheetTitle>
                            <SheetDescription>
                                Crie uma conta para seu filho(a) começar a juntar dinheiro.
                            </SheetDescription>
                        </SheetHeader>
                        <div className="space-y-6 py-6">
                            <div className="space-y-2">
                                <Label>Nome do Filho(a)</Label>
                                <Input
                                    placeholder="Ex: Joãozinho"
                                    value={newKidName}
                                    onChange={e => setNewKidName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Escolha um Avatar</Label>
                                <div className="flex gap-4">
                                    {['bear', 'rabbit', 'cat', 'dog'].map(p => (
                                        <div
                                            key={p}
                                            onClick={() => setSelectedAvatar(p)}
                                            className={`cursor-pointer p-2 rounded-xl border-2 transition-all ${selectedAvatar === p ? 'border-orange-500 bg-orange-50' : 'border-transparent hover:bg-zinc-100'}`}
                                        >
                                            <Avatar className="h-12 w-12">
                                                <AvatarFallback className="bg-primary/10 text-xl">
                                                    {p === 'bear' ? '🐻' : p === 'rabbit' ? '🐰' : p === 'cat' ? '🐱' : '🐶'}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <Button onClick={handleCreateKid} className="w-full bg-orange-500 hover:bg-orange-600">
                                Criar Perfil
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {isLoading ? (
                <div className="text-center py-20">Carregando cofrinhos...</div>
            ) : kids?.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed rounded-3xl">
                    <div className="mx-auto h-20 w-20 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                        <PiggyBank className="h-10 w-10 text-orange-500" />
                    </div>
                    <h3 className="text-xl font-semibold">Nenhum cofrinho ainda</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                        Adicione seus filhos para começar a controlar mesadas e recompensas.
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {kids?.map((kid) => (
                        <Card key={kid.id} className="overflow-hidden border-orange-200 dark:border-orange-800">
                            <div className="h-24 bg-gradient-to-br from-orange-400 to-amber-500 relative">
                                <div className="absolute -bottom-8 left-6">
                                    <Avatar className="h-20 w-20 border-4 border-white dark:border-zinc-900 shadow-xl">
                                        <AvatarFallback className="bg-white text-4xl">
                                            {kid.avatar === 'bear' ? '🐻' : kid.avatar === 'rabbit' ? '🐰' : kid.avatar === 'cat' ? '🐱' : '🐶'}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                            </div>
                            <CardHeader className="pt-10 pb-2">
                                <CardTitle className="text-2xl">{kid.nome}</CardTitle>
                                <p className="text-sm text-muted-foreground">Saldo Disponível</p>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-6">
                                    {formatCurrency(kid.saldo)}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        variant="outline"
                                        className="border-green-200 hover:bg-green-50 text-green-700 dark:border-green-900 dark:hover:bg-green-900/20 dark:text-green-400"
                                        onClick={() => handleTransaction(kid.id, 'entrada')}
                                    >
                                        <ArrowUpCircle className="mr-2 h-4 w-4" />
                                        Mesada
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="border-red-200 hover:bg-red-50 text-red-700 dark:border-red-900 dark:hover:bg-red-900/20 dark:text-red-400"
                                        onClick={() => handleTransaction(kid.id, 'saida')}
                                    >
                                        <ArrowDownCircle className="mr-2 h-4 w-4" />
                                        Sacar
                                    </Button>
                                </div>

                                <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Trophy className="h-4 w-4 text-yellow-500" />
                                        0 Tarefas
                                    </span>
                                    <span>Ver Detalhes →</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
