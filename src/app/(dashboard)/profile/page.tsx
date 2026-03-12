export const dynamic = "force-dynamic"

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfilePageClient } from '@/components/dashboard/ProfilePageClient'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return <ProfilePageClient userId={user.id} />
}
