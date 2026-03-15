'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Detects Supabase auth errors in the URL hash (e.g., expired recovery links)
 * and redirects to the appropriate page instead of showing the dashboard.
 */
export function AuthHashHandler() {
  const router = useRouter()

  useEffect(() => {
    const hash = window.location.hash
    if (!hash) return

    // Parse hash fragment for Supabase auth errors
    const params = new URLSearchParams(hash.substring(1))
    const error = params.get('error')
    const errorCode = params.get('error_code')
    const errorDescription = params.get('error_description')

    if (error) {
      // Clear the hash
      window.history.replaceState(null, '', window.location.pathname)

      if (errorCode === 'otp_expired') {
        router.push('/forgot-password?error=Your+reset+link+has+expired.+Please+request+a+new+one.')
      } else {
        router.push(`/login?error=${encodeURIComponent(errorDescription || 'Authentication error')}`)
      }
    }
  }, [router])

  return null
}
