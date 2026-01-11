'use client'

import { useLixeira } from '@/hooks/use-lixeira'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { Trash2, RotateCcw, Receipt } from 'lucide-react'

export default function LixeiraPage() {
  const { items: itens, isLoading, restoreItem, isRestoring } = useLixeira()

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Carregando lixeira...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Lixeira</h2>
          <p className="text-sm text-muted-foreground">
            Itens excluídos que podem ser restaurados
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <Trash2 className="h-4 w-4" />
          {itens.length} {itens.length === 1 ? 'item' : 'itens'} na lixeira
        </div>
      </div>

      {/* Stats Card */}
      <Card className="border-0 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-red-600 dark:text-red-400">Itens na Lixeira</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-700 dark:text-red-300">
            {itens.length}
          </div>
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            {itens.length === 0 ? 'Nenhum item excluído' : 'Itens aguardando restauração'}
          </p>
        </CardContent>
      </Card>

      {/* Items List */}
      {itens.length === 0 ? (
        <Card className="border-0 bg-zinc-50 dark:bg-zinc-900/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Trash2 className="h-12 w-12 text-zinc-400 mb-4" />
            <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">
              Lixeira vazia
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-center">
              Não há itens na lixeira. Itens excluídos aparecerão aqui para restauração.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {itens.map((item) => (
            <Card key={`${item.tabela}-${item.id}`} className="border-0 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <Receipt className="h-5 w-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-zinc-900 dark:text-white">
                          {item.descricao || item.nome || `Item ${item.id}`}
                        </h4>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          {item.tabela} • Excluído em {formatDateTime(item.deletado_em)}
                        </p>
                      </div>
                    </div>
                    <div className="ml-13">
                      {item.valor && (
                        <p className="text-sm text-zinc-600 dark:text-zinc-300">
                          Valor: {formatCurrency(parseFloat(item.valor.toString()))}
                        </p>
                      )}
                      {item.categoria && (
                        <p className="text-sm text-zinc-600 dark:text-zinc-300">
                          Categoria: {item.categoria}
                        </p>
                      )}
                      {item.observacoes && (
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                          {item.observacoes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => restoreItem({ tabela: item.tabela, id: item.id })}
                      disabled={isRestoring}
                      className="rounded-xl bg-green-600 hover:bg-green-700 text-white"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Restaurar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
