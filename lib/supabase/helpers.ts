import { createClient } from './server'
import { redirect } from 'next/navigation'
import { DbDocument } from './types'

/**
 * Gets the current authenticated user on the server side.
 * Safe to use in React Server Components, Server Actions, and Route Handlers.
 * Always verify the user via getUser() on the server rather than trusting cookies directly.
 */
export async function getServerUser() {
  const supabase = createClient()
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return null
    return user
  } catch (error) {
    console.error('Failed to get server user:', error)
    return null
  }
}

/**
 * Gets the current active session on the server side.
 * Recommended for reading tokens or checking local session states.
 * For strict authorization checks, use getServerUser() instead.
 */
export async function getServerSession() {
  const supabase = createClient()
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error || !session) return null
    return session
  } catch (error) {
    console.error('Failed to get server session:', error)
    return null
  }
}

/**
 * Enforces that a user is logged in before rendering a Server Component or running a Server Action.
 * Automatically redirects to the specified route (default: /login) if unauthenticated.
 */
export async function requireServerAuth(redirectTo = '/login') {
  const user = await getServerUser()
  if (!user) {
    redirect(redirectTo)
  }
  return user
}

/**
 * Fetches all documents uploaded by the currently logged-in user, ordered by creation date (newest first).
 * Safe to use in React Server Components.
 */
export async function getUserDocuments(): Promise<DbDocument[]> {
  const supabase = createClient()
  try {
    const user = await getServerUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user documents:', error)
      return []
    }

    return (data as DbDocument[]) || []
  } catch (error) {
    console.error('Exception fetching user documents:', error)
    return []
  }
}

