import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a Supabase client for use in Browser/Client Components.
 * Handles build-time environments gracefully by providing safe fallbacks.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // During next build, environment variables are typically not loaded.
  // We must return a fallback client so static prerendering succeeds.
  return createBrowserClient(
    url || 'https://placeholder-url.supabase.co',
    anonKey || 'placeholder-anon-key'
  )
}
