import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Subscription } from '@/lib/types/database'

export function useSubscription(userId: string) {
  const supabase = createClient()
  return useQuery({
    queryKey: ['subscription', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single()
      if (error) throw error
      return data as Subscription
    },
    enabled: !!userId,
  })
}

export function useIsPro(userId: string): boolean {
  const { data } = useSubscription(userId)
  return data?.tier === 'pro' && (data?.status === 'active' || data?.status === 'trialing')
}
