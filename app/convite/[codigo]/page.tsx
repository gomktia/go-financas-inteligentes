'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Check, X, AlertCircle } from 'lucide-react'
import { useConvites } from '@/hooks/use-convites'
import { supabase } from '@/lib/supabase'
import { showToast } from '@/lib/toast'

export default function ConvitePage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = use(params)
  const router = useRouter()
  // @ts-expect-error - Hook updated but types pending
  const { useConvitePorCodigo, aceitarConvite, recusarConvite, isAccepting } = useConvites()
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)

  // Fetch convite details
  const { data: convite, isLoading, error } = useConvitePorCodigo(codigo)

  // Fetch current user
  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Fetch public user id
        const { data: publicUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', user.email)
          .single()

        if (publicUser) setCurrentUserId(publicUser.id)
      }
    }
    getUser()
  }, [])

  const handleAceitar = () => {
    if (!currentUserId) {
      showToast.error('Você precisa fazer login para aceitar o convite')
      router.push('/login?redirect=/convite/' + codigo)
      return
    }

    if (!convite) return

    aceitarConvite(
      { conviteId: convite.id, usuarioId: currentUserId },
      {
        onSuccess: () => router.push('/')
      }
    )
  }

  const handleRecusar = () => {
    if (confirm('Tem certeza que deseja recusar este convite?')) {
      // Only if we have an ID
      if (convite) {
        recusarConvite(convite.id)
        router.push('/')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !convite) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-destructive/50 bg-destructive/5">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-medium text-destructive mb-2">Convite Inválido</h3>
            <p className="text-muted-foreground mb-6">
              Este convite não existe ou já expirou.
            </p>
            <Button variant="outline" onClick={() => router.push('/')}>
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (convite.aceito) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-green-500/50 bg-green-500/5">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Check className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-medium text-green-700 mb-2">Convite já aceito!</h3>
            <p className="text-muted-foreground mb-6">
              Você já faz parte desta família.
            </p>
            <Button variant="outline" onClick={() => router.push('/')}>
              Ir para Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Você foi convidado!</CardTitle>
          <CardDescription>
            Para participar da <strong>{convite.familia?.nome}</strong>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Info do Convite */}
          <div className="space-y-3 p-4 rounded-lg bg-muted/50 border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Família:</span>
              <span className="font-medium">{convite.familia?.nome}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Convite para:</span>
              <span className="font-medium">{convite.email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Modo:</span>
              <span className="font-medium">
                {convite.familia?.modo_calculo === 'familiar'
                  ? '👨‍👩‍👧‍👦 Pote Comum'
                  : '🏢 Individual'}
              </span>
            </div>
          </div>

          {/* Descrição do Modo */}
          <div className="p-4 rounded-lg border-2 border-primary/20 bg-primary/5">
            <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
              {convite.familia?.modo_calculo === 'familiar' ? (
                <>
                  <strong className="text-foreground block mb-2">Modo Familiar (Pote Comum)</strong>
                  Neste modo, todas as receitas e despesas são somadas em um único dashboard compartilhado. Ideal para casais e famílias que gerenciam o orçamento juntos.
                </>
              ) : (
                <>
                  <strong className="text-foreground block mb-2">Modo Individual</strong>
                  Cada membro possui seu próprio saldo e extrato. É possível realizar transferências entre membros e visualizar relatórios individuais. Ideal para empresas ou repúblicas.
                </>
              )}
            </p>
          </div>

          {/* Ações */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleRecusar}
              className="flex-1 h-12"
            >
              <X className="h-4 w-4 mr-2" />
              Recusar
            </Button>
            <Button
              onClick={handleAceitar}
              className="flex-1 h-12 bg-primary hover:bg-primary/90"
              disabled={isAccepting || !currentUserId}
            >
              {isAccepting ? 'Entrando...' : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Aceitar Convite
                </>
              )}
            </Button>
          </div>

          {!currentUserId && (
            <p className="text-xs text-center text-destructive bg-destructive/10 p-2 rounded">
              Faça login para aceitar o convite
            </p>
          )}

        </CardContent>
      </Card>
    </div>
  )
}

