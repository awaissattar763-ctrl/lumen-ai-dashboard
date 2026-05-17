'use server'

import { createClient } from './server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

/**
 * Server Action: Authenticate user with Email & Password.
 * Redirects to the /dashboard upon successful login.
 */
export async function login(formData: FormData) {
  const supabase = createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

/**
 * Server Action: Register a new user with Email & Password.
 * Sends a confirmation email and returns status.
 */
export async function signup(formData: FormData) {
  const supabase = createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  // Use site URL for authentication callback redirect
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const redirectTo = `${siteUrl}/auth/callback`

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectTo,
    },
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { 
    success: true, 
    message: 'Registration successful! Please check your email for the confirmation link.' 
  }
}

/**
 * Server Action: Log out the current user and clear sessions.
 * Redirects to the login page upon completion.
 */
export async function signOut() {
  const supabase = createClient()
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}

/**
 * Server Action: Save uploaded document metadata in the database.
 */
export async function saveDocumentMetadata(metadata: {
  file_name: string
  file_size: number
  storage_path: string
}) {
  const supabase = createClient()

  // Authenticate user on the server
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized. You must be signed in to perform this action.' }
  }

  // Check for duplicates by name and size
  const { data: existingDocs, error: checkError } = await supabase
    .from('documents')
    .select('id')
    .eq('user_id', user.id)
    .eq('file_name', metadata.file_name)
    .eq('file_size', metadata.file_size)
    .limit(1)

  if (checkError) {
    return { error: 'Failed to verify document uniqueness.' }
  }

  if (existingDocs && existingDocs.length > 0) {
    return { error: 'Duplicate Document: A file with this exact name and size has already been uploaded.' }
  }

  const { data, error } = await supabase
    .from('documents')
    .insert({
      user_id: user.id,
      file_name: metadata.file_name,
      file_size: metadata.file_size,
      storage_path: metadata.storage_path,
    })
    .select()

  if (error) {
    console.error('Error saving document metadata:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true, data: data[0] }
}

/**
 * Server Action: Deletes a document record from the database and its file in Storage.
 */
export async function deleteUserDocument(id: string, storagePath: string) {
  const supabase = createClient()

  // Authenticate user on the server
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized. You must be signed in to perform this action.' }
  }

  // 1. Delete from Supabase Storage
  const { error: storageError } = await supabase.storage
    .from('documents')
    .remove([storagePath])

  if (storageError) {
    console.warn('Storage deletion warning/error:', storageError)
    // Continue to DB deletion in case file was already manually removed from storage
  }

  // 2. Delete database record
  const { error: dbError } = await supabase
    .from('documents')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (dbError) {
    console.error('Database deletion error:', dbError)
    return { error: dbError.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

/**
 * Server Action: Parses document text on the server, chunks it, and saves in database.
 */
export async function processDocumentTextAction(documentId: string, storagePath: string) {
  try {
    const { processDocumentText } = await import('./processing')
    const result = await processDocumentText(documentId, storagePath)
    return result
  } catch (err: any) {
    console.error('Action error processing document text:', err)
    return { error: err.message || 'Failed to extract text from document.' }
  }
}

/**
 * Server Action: Retrieve all chat sessions for the logged-in user.
 */
export async function getUserChats() {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching chats:', error)
    return { error: error.message }
  }

  return { data }
}

/**
 * Server Action: Get all messages for a specific chat.
 */
export async function getChatMessages(chatId: string) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching messages:', error)
    return { error: error.message }
  }

  return { data }
}

/**
 * Server Action: Create a new chat session.
 */
export async function createChat(title: string) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('chats')
    .insert({
      user_id: user.id,
      title,
    })
    .select()

  if (error) {
    console.error('Error creating chat:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { data: data[0] }
}

/**
 * Server Action: Delete a chat session.
 */
export async function deleteChat(chatId: string) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('chats')
    .delete()
    .eq('id', chatId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting chat:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

/**
 * Server Action: Rename a chat session.
 */
export async function renameChat(chatId: string, title: string) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('chats')
    .update({ title, updated_at: new Date().toISOString() })
    .eq('id', chatId)
    .eq('user_id', user.id)
    .select()

  if (error) {
    console.error('Error renaming chat:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true, data: data?.[0] }
}


