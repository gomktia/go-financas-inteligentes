'use client'

import { User, Users } from 'lucide-react'

interface DashboardToggleProps {
  modo: 'pessoal' | 'familiar'
  onModoChange: (modo: 'pessoal' | 'familiar') => void
}

export function DashboardToggle({ modo, onModoChange }: DashboardToggleProps) {
  return (
    <div className="inline-flex items-center rounded-xl bg-muted p-1">
      <button
        onClick={() => onModoChange('pessoal')}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
          ${modo === 'pessoal'
            ? 'bg-background shadow-sm text-foreground'
            : 'text-muted-foreground hover:text-foreground'
          }
        `}
      >
        <User className="h-4 w-4" />
        <span className="hidden sm:inline">Meus Gastos</span>
      </button>

      <button
        onClick={() => onModoChange('familiar')}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
          ${modo === 'familiar'
            ? 'bg-background shadow-sm text-foreground'
            : 'text-muted-foreground hover:text-foreground'
          }
        `}
      >
        <Users className="h-4 w-4" />
        <span className="hidden sm:inline">Família</span>
      </button>
    </div>
  )
}

