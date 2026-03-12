export const dynamic = "force-dynamic"

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ScholarshipsPageClient } from '@/components/dashboard/ScholarshipsPageClient'

export default async function ScholarshipsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return <ScholarshipsPageClient userId={user.id} />
}
