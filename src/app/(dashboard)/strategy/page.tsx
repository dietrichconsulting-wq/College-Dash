export const dynamic = "force-dynamic"

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StrategyPageClient } from '@/components/dashboard/StrategyPageClient'

export default async function StrategyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('gpa, sat, proposed_major, school1_name, school2_name, school3_name, school4_name, strategy_result, strategy_generated_at')
    .eq('id', user.id)
    .single()

  return <StrategyPageClient profile={profile} userId={user.id} />
}
