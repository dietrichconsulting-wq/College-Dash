import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const cookieConfig = async () => {
  const cookieStore = await cookies()
  return {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
          )
        } catch {}
      },
    },
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createClient(): Promise<any> {
  const config = await cookieConfig()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
    config
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createServiceClient(): Promise<any> {
  const config = await cookieConfig()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key',
    config
  )
}
