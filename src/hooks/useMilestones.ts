import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useMilestones(userId: string) {
  const supabase = createClient()
  return useQuery({
    queryKey: ['milestones', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('progress')
        .select('milestone_key')
        .eq('user_id', userId)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data ?? []).map((r: any) => r.milestone_key as string)
    },
    enabled: !!userId,
  })
}

export function useMarkMilestone(userId: string) {
  const supabase = createClient()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (key: string) => {
      const current = queryClient.getQueryData<string[]>(['milestones', userId]) ?? []
      if (current.includes(key)) {
        // Unmark
        await supabase.from('progress').delete().eq('user_id', userId).eq('milestone_key', key)
      } else {
        // Mark
        await supabase.from('progress').insert({ user_id: userId, milestone_key: key, reached_at: new Date().toISOString() })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones', userId] })
    },
  })
}
