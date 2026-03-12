export const dynamic = "force-dynamic"

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { JourneyClient } from '@/components/dashboard/JourneyClient'

export default async function JourneyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return <JourneyClient userId={user.id} />
}
