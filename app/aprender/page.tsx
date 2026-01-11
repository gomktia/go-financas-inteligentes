'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookOpen, TrendingUp, ShieldCheck, Calculator, GraduationCap } from 'lucide-react'

export default function AprenderPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <GraduationCap className="h-8 w-8 text-blue-500" />
                    Finanças Academy
                </h1>
                <p className="text-muted-foreground">
                    Domine o seu dinheiro com nossos guias e ferramentas interativas.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5" />
                            Segurança
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-blue-100 text-sm mb-4">Aprenda a criar sua reserva de emergência.</p>
                        <div className="h-2 bg-blue-400/30 rounded-full overflow-hidden">
                            <div className="h-full w-3/4 bg-white rounded-full" />
                        </div>
                        <p className="text-xs mt-2 text-blue-100">75% Concluído</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Investimentos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-emerald-100 text-sm mb-4">Do zero ao primeiro milhão.</p>
                        <div className="h-2 bg-emerald-400/30 rounded-full overflow-hidden">
                            <div className="h-full w-1/4 bg-white rounded-full" />
                        </div>
                        <p className="text-xs mt-2 text-emerald-100">25% Concluído</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="artigos" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="artigos">Artigos & Guias</TabsTrigger>
                    <TabsTrigger value="ferramentas">Ferramentas</TabsTrigger>
                </TabsList>

                <TabsContent value="artigos" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[
                            { title: 'Regra 50/30/20', category: 'Orçamento', readTime: '5 min' },
                            { title: 'Tesouro Direto vs Poupança', category: 'Investimentos', readTime: '8 min' },
                            { title: 'Como sair das dívidas', category: 'Planejamento', readTime: '10 min' },
                            { title: 'Educação Financeira para Crianças', category: 'Família', readTime: '6 min' },
                            { title: 'Separe as contas PF e PJ', category: 'Empresa', readTime: '7 min' },
                            { title: 'O que são FIIs?', category: 'Investimentos', readTime: '12 min' },
                        ].map((article, i) => (
                            <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <Badge variant="outline">{article.category}</Badge>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <BookOpen className="h-3 w-3" /> {article.readTime}
                                        </span>
                                    </div>
                                    <CardTitle className="text-lg mt-2">{article.title}</CardTitle>
                                    <CardDescription>Um guia prático para começar hoje mesmo.</CardDescription>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="ferramentas">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calculator className="h-5 w-5 text-primary" />
                                    Calculadora de Juros Compostos
                                </CardTitle>
                                <CardDescription>Simule o crescimento do seu patrimônio.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="p-8 text-center border-2 border-dashed rounded-xl text-muted-foreground">
                                    Em breve: Simulação interativa
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
