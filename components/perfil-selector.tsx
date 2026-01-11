'use client'

import { useState } from 'react'
import { Building, Home, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Perfil {
  id: number
  tipo: 'pessoal' | 'empresa'
  nome: string
  familia_id: number | null
}

interface PerfilSelectorProps {
  perfis: Perfil[]
  perfilAtivo: Perfil | null
  onPerfilChange: (perfil: Perfil) => void
}

export function PerfilSelector({ perfis, perfilAtivo, onPerfilChange }: PerfilSelectorProps) {
  const [open, setOpen] = useState(false)

  if (perfis.length <= 1) return null

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setOpen(!open)}
        className="h-10 gap-2 px-3"
      >
        {perfilAtivo?.tipo === 'pessoal' ? (
          <Home className="h-4 w-4" />
        ) : (
          <Building className="h-4 w-4" />
        )}
        <span className="hidden sm:inline text-sm font-medium">
          {perfilAtivo?.nome || 'Selecione'}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </Button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-12 left-0 z-50 min-w-[200px] rounded-xl border bg-background shadow-lg p-1">
            {perfis.map((perfil) => (
              <button
                key={perfil.id}
                onClick={() => {
                  onPerfilChange(perfil)
                  setOpen(false)
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${perfilAtivo?.id === perfil.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted'
                  }
                `}
              >
                {perfil.tipo === 'pessoal' ? (
                  <Home className="h-4 w-4 flex-shrink-0" />
                ) : (
                  <Building className="h-4 w-4 flex-shrink-0" />
                )}
                <div className="flex-1 text-left">
                  <div className="font-medium">{perfil.nome}</div>
                  <div className="text-xs opacity-70">
                    {perfil.tipo === 'pessoal' ? '🏠 Pessoal' : '🏢 Empresa'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

