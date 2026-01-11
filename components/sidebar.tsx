'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  Receipt,
  Trash2,
  CreditCard,
  Car,
  Calendar,
  Settings,
  Target,
  PieChart,
  Building,
  Wrench,
  TrendingUp,
  X,
  Building2,
  Users,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  PiggyBank,
  LogOut,
  User,
  Wallet,
  GraduationCap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface NavigationItem {
  name: string
  href: string
  icon: any
  subItems?: NavigationItem[]
}

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Pessoal',
    href: '#pessoal',
    icon: User,
    subItems: [
      { name: 'Gastos', href: '/gastos', icon: Receipt },
      { name: 'Receitas', href: '/receitas', icon: Wallet },
      { name: 'Cartões', href: '/cartoes', icon: CreditCard },
      { name: 'Parcelas', href: '/parcelas', icon: CreditCard },
      { name: 'Gasolina', href: '/gasolina', icon: Car },
      { name: 'Assinaturas', href: '/assinaturas', icon: Calendar },
      { name: 'Contas Fixas', href: '/contas-fixas', icon: Building },
    ]
  },
  {
    name: 'Família',
    href: '#familia',
    icon: Users,
    subItems: [
      { name: 'Visão Geral', href: '/familia', icon: Users },
      { name: 'Mesada / Kids', href: '/familia/kids', icon: PiggyBank },
    ]
  },
  {
    name: 'Empresa',
    href: '#empresa',
    icon: Building2,
    subItems: [
      { name: 'Visão Geral', href: '/empresa', icon: Building2 },
    ]
  },
  {
    name: 'Patrimônio',
    href: '#patrimonio',
    icon: TrendingUp,
    subItems: [
      { name: 'Investimentos', href: '/investimentos', icon: TrendingUp },
      { name: 'Metas', href: '/metas', icon: Target },
    ]
  },
  {
    name: 'Aprender',
    href: '/aprender',
    icon: GraduationCap,
  },
  {
    name: 'Relatórios',
    href: '/relatorios',
    icon: PieChart,
  },
  {
    name: 'Lixeira',
    href: '/lixeira',
    icon: Trash2,
  },
  {
    name: 'Configurações',
    href: '/configuracoes',
    icon: Settings,
  },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
  isCollapsed?: boolean
  onCollapse?: () => void
}

export function Sidebar({ isOpen = true, onClose, isCollapsed, onCollapse }: SidebarProps) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [openGroups, setOpenGroups] = useState<string[]>(['Pessoal', 'Família', 'Empresa', 'Patrimônio'])

  const toggleGroup = (name: string) => {
    if (isCollapsed && onCollapse) {
      onCollapse() // Expand sidebar if trying to open a group while collapsed
    }
    setOpenGroups(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    )
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={cn("flex items-center mb-8 transition-all duration-300", isCollapsed ? "justify-center" : "justify-between px-2")}>
        {!isCollapsed && (
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Financeiro</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">SaaS Edition</p>
          </div>
        )}
        {/* Toggle Collapse (Desktop only) */}
        {onCollapse && (
          <Button variant="ghost" size="icon" onClick={onCollapse} className="hidden lg:flex h-8 w-8 ml-auto">
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}

        {/* Close Mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden rounded-full p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="space-y-1 overflow-y-auto flex-1 no-scrollbar">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          const isGroupOpen = openGroups.includes(item.name)
          const hasSubItems = item.subItems && item.subItems.length > 0

          // Render Simple Link
          if (!hasSubItems) {
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 group relative',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white',
                  isCollapsed && 'justify-center p-2'
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className={cn("h-5 w-5 flex-shrink-0 transition-colors", isActive ? "text-primary" : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white")} />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </Link>
            )
          }

          // Render Group
          return (
            <Collapsible key={item.name} open={isGroupOpen && !isCollapsed} onOpenChange={() => toggleGroup(item.name)} className="space-y-1">
              <CollapsibleTrigger asChild>
                <button
                  className={cn(
                    'w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 group relative select-none',
                    'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white',
                    isCollapsed && 'justify-center p-2'
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
                  {!isCollapsed && (
                    <>
                      <span className="truncate flex-1 text-left">{item.name}</span>
                      <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isGroupOpen ? "rotate-180" : "")} />
                    </>
                  )}
                </button>
              </CollapsibleTrigger>

              <CollapsibleContent className="space-y-1">
                {item.subItems?.map((subItem) => {
                  const isSubActive = pathname === subItem.href
                  const SubIcon = subItem.icon
                  if (isCollapsed) return null // Don't show subitems when collapsed (or implement popover later)

                  return (
                    <Link
                      key={subItem.name}
                      href={subItem.href}
                      onClick={onClose}
                      className={cn(
                        'pl-11 flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200',
                        isSubActive
                          ? 'bg-primary/5 text-primary'
                          : 'text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                      )}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-40" />
                      <span className="truncate">{subItem.name}</span>
                    </Link>
                  )
                })}
              </CollapsibleContent>
            </Collapsible>
          )
        })}
      </nav>

      {/* User Footer */}
      <div className={cn("mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 transition-all", isCollapsed ? "items-center" : "")}>
        {user ? (
          <div className={cn("flex items-center gap-3 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50", isCollapsed ? "justify-center" : "")}>
            <Avatar className="h-9 w-9 border border-zinc-200 dark:border-zinc-700">
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-zinc-900 dark:text-white">
                  {user.name || 'Usuário'}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                  {user.email}
                </p>
              </div>
            )}

            {!isCollapsed && (
              <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-500" onClick={signOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          !isCollapsed && (
            <div className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 p-3 rounded-xl text-center text-xs">
              Modo Visitante
            </div>
          )
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl p-4 transition-all duration-300 ease-in-out",
          isCollapsed ? "w-20" : "w-72"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in"
            onClick={onClose}
          />

          {/* Drawer */}
          <aside className="lg:hidden fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl p-6 flex flex-col animate-in slide-in-from-left duration-300">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  )
}
