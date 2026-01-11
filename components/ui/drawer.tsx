'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface DrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export function Drawer({ open, onOpenChange, children }: DrawerProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Drawer */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-lg">
          {/* Handle */}
          <div className="flex justify-center py-2">
            <div className="h-1 w-12 rounded-full bg-zinc-300 dark:bg-zinc-600" />
          </div>
          
          {/* Content */}
          <div className="rounded-t-3xl bg-white dark:bg-zinc-900 shadow-2xl border-t border-zinc-200 dark:border-zinc-700 max-h-[85vh] overflow-hidden">
            <div className="overflow-y-auto max-h-[85vh]">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface DrawerContentProps {
  children: React.ReactNode
  className?: string
}

export function DrawerContent({ children, className }: DrawerContentProps) {
  return (
    <div className={cn("p-6", className)}>
      {children}
    </div>
  )
}

interface DrawerHeaderProps {
  children: React.ReactNode
  className?: string
}

export function DrawerHeader({ children, className }: DrawerHeaderProps) {
  return (
    <div className={cn("mb-6", className)}>
      {children}
    </div>
  )
}

interface DrawerTitleProps {
  children: React.ReactNode
  className?: string
}

export function DrawerTitle({ children, className }: DrawerTitleProps) {
  return (
    <h2 className={cn("text-2xl font-semibold text-zinc-900 dark:text-white", className)}>
      {children}
    </h2>
  )
}

interface DrawerDescriptionProps {
  children: React.ReactNode
  className?: string
}

export function DrawerDescription({ children, className }: DrawerDescriptionProps) {
  return (
    <p className={cn("text-sm text-zinc-500 dark:text-zinc-400 mt-1", className)}>
      {children}
    </p>
  )
}
