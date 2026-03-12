import { createBrowserClient } from '@supabase/ssr'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createClient(): any {
  // Provide fallback placeholder values during build when env vars aren't available
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
  return createBrowserClient(url, key)
}
