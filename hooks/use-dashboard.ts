'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { DashboardData } from '@/types'

export function useDashboard() {
  const { data: dashboard, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vw_resumo_mensal')
        .select('*')
        .single()

      if (error) {
        console.warn('Materialized view not available, using fallback')
        return null
      }

      return data as DashboardData
    },
    staleTime: 30000, // 30 seconds
  })

  return {
    dashboard,
    isLoading,
    error,
  }
}
