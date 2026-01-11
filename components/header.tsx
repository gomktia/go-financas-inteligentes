'use client'

import { Moon, Sun, LogOut, User, Menu } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const { user, signOut } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3 md:gap-4">
          {/* Menu Hamburguer Mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden rounded-2xl w-10 h-10 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <Menu className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
          </Button>

          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <h1 className="text-lg md:text-xl font-semibold text-zinc-900 dark:text-white">Financeiro</h1>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          {/* User Info - Hidden on mobile */}
          {user && (
            <div className="hidden sm:flex items-center gap-2 px-3 md:px-4 py-2 rounded-2xl bg-zinc-100 dark:bg-zinc-800">
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                <User className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {user.name || user.email?.split('@')[0]}
              </span>
            </div>
          )}

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Alternar tema"
            className="rounded-2xl w-10 h-10 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            {!mounted ? (
              <div className="h-5 w-5" />
            ) : theme === 'dark' ? (
              <Sun className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
            ) : (
              <Moon className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
            )}
          </Button>

          {/* Logout */}
          {user && (
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              title="Sair"
              className="rounded-2xl w-10 h-10 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
