/**
 * Supabase client for browser/client-side usage
 * This client uses the public anon key and respects RLS policies
 */

import { createBrowserClient } from '@supabase/ssr'

let supabase

/**
 * Get or create Supabase client for browser
 * Singleton pattern to avoid multiple instances
 */
export function createClient() {
  if (!supabase) {
    supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  }

  return supabase
}

/**
 * Helper to get current user
 */
export async function getCurrentUser() {
  const supabase = createClient()

  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      console.error('Error fetching user:', error)
      return null
    }

    return user
  } catch (error) {
    console.error('Error in getCurrentUser:', error)
    return null
  }
}

/**
 * Helper to check if user is authenticated
 */
export async function isAuthenticated() {
  const user = await getCurrentUser()
  return !!user
}

/**
 * Sign in with email and password
 */
export async function signIn(email, password) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    throw error
  }

  return data
}

/**
 * Sign up with email and password
 */
export async function signUp(email, password, metadata = {}) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata // Additional user metadata
    }
  })

  if (error) {
    throw error
  }

  return data
}

/**
 * Sign out current user
 */
export async function signOut() {
  const supabase = createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }

  return true
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(callback) {
  const supabase = createClient()

  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })
}

/**
 * Helper to handle Supabase errors
 */
export function handleSupabaseError(error) {
  console.error('Supabase error:', error)

  // Return user-friendly error messages
  if (error.message?.includes('Invalid login credentials')) {
    return 'Invalid email or password'
  }

  if (error.message?.includes('Email not confirmed')) {
    return 'Please check your email to confirm your account'
  }

  if (error.message?.includes('User already registered')) {
    return 'An account with this email already exists'
  }

  if (error.message?.includes('Rate limit')) {
    return 'Too many attempts. Please try again later'
  }

  if (error.message?.includes('Network')) {
    return 'Network error. Please check your connection'
  }

  // Default fallback
  return error.message || 'An unexpected error occurred'
}