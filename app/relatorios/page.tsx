'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Download, Calendar, PieChart, BarChart3, TrendingUp } from 'lucide-react'

export default function RelatoriosPage() {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Relatórios</h2>
        <p className="text-sm text-muted-foreground">
          Visualize e exporte relatórios financeiros
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Relatórios Disponíveis</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">Tipos de relatórios</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Período Atual</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">Este Mês</div>
            <p className="text-xs text-muted-foreground">Dados atualizados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Formatos</CardTitle>
            <Download className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">PDF/CSV</div>
            <p className="text-xs text-muted-foreground">Exportar</p>
          </CardContent>
        </Card>
      </div>

      {/* Report Types */}
      <div>
        <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Tipos de Relatórios</h3>
        <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                  <PieChart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">Visão Geral Mensal</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Resumo completo de receitas e despesas
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full h-10 rounded-xl">
                <Download className="h-4 w-4 mr-2" />
                Gerar Relatório
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
                  <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">Gastos por Categoria</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Análise detalhada por tipo de gasto
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full h-10 rounded-xl">
                <Download className="h-4 w-4 mr-2" />
                Gerar Relatório
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                  <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">Evolução Temporal</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Tendências ao longo do tempo
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full h-10 rounded-xl">
                <Download className="h-4 w-4 mr-2" />
                Gerar Relatório
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900/30">
                  <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">Comparativo Anual</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Compare meses e anos anteriores
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full h-10 rounded-xl">
                <Download className="h-4 w-4 mr-2" />
                Gerar Relatório
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

