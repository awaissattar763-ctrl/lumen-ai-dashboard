import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Creates a Supabase client for use in Server Components, Server Actions, and Route Handlers.
 * Gracefully fallback to placeholders during static site builds (npm run build) to avoid crashes.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // During next build, environment variables are typically not loaded.
  // We must return a fallback client to prevent static prerendering compilation failures.
  if (!url || !anonKey) {
    return createServerClient(
      'https://placeholder-url.supabase.co',
      'placeholder-anon-key',
      {
        cookies: {
          getAll() {
            return []
          },
          setAll() {},
        },
      }
    )
  }

  const cookieStore = cookies()

  return createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be safely ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  )
}
