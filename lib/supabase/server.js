/**
 * Supabase client for server-side usage (Server Actions, Route Handlers)
 * This includes both authenticated client (respects RLS) and service role client (bypasses RLS)
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Create authenticated Supabase client that respects RLS
 * Use this for user-specific operations
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

/**
 * Create service role client that bypasses RLS
 * Use this only for admin operations and background jobs
 * NEVER expose service role key to client
 */
export function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {
          // Service role doesn't need cookies
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

/**
 * Get current user from server
 */
export async function getCurrentUser() {
  const supabase = await createClient()

  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      return null
    }

    return user
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

/**
 * Require authentication or throw error
 * Use in server actions that require auth
 */
export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('Authentication required')
  }

  return user
}

/**
 * Check if current request is authenticated
 */
export async function isAuthenticated() {
  const user = await getCurrentUser()
  return !!user
}

/**
 * Get user session
 */
export async function getSession() {
  const supabase = await createClient()

  try {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      return null
    }

    return session
  } catch (error) {
    console.error('Error fetching session:', error)
    return null
  }
}

/**
 * Database query wrapper with error handling
 * Provides consistent error handling for all database operations
 */
export async function dbQuery(queryFn, options = {}) {
  const { useServiceRole = false, throwOnError = true } = options

  try {
    const client = useServiceRole ? createServiceClient() : await createClient()
    const result = await queryFn(client)

    if (result.error && throwOnError) {
      throw result.error
    }

    return result
  } catch (error) {
    console.error('Database query error:', error)

    if (throwOnError) {
      throw error
    }

    return { data: null, error }
  }
}

/**
 * Insert data with automatic user association
 */
export async function insertWithUser(table, data) {
  const user = await requireAuth()

  return dbQuery(async (client) => {
    return client
      .from(table)
      .insert({
        ...data,
        user_id: user.id
      })
      .select()
      .single()
  })
}

/**
 * Batch insert for performance
 */
export async function batchInsert(table, records, options = {}) {
  const { chunkSize = 100, useServiceRole = false } = options

  const chunks = []
  for (let i = 0; i < records.length; i += chunkSize) {
    chunks.push(records.slice(i, i + chunkSize))
  }

  const results = []
  for (const chunk of chunks) {
    const result = await dbQuery(
      async (client) => client.from(table).insert(chunk).select(),
      { useServiceRole }
    )
    results.push(result)
  }

  return results
}

/**
 * Cache helper for expensive operations
 */
export async function getCachedData(key, fetchFn, ttlSeconds = 3600) {
  const supabase = createServiceClient()

  // Try to get from cache
  const { data: cached } = await supabase
    .from('cache')
    .select('data, expires_at')
    .eq('key', key)
    .single()

  // Return cached data if still valid
  if (cached && new Date(cached.expires_at) > new Date()) {
    return cached.data
  }

  // Fetch fresh data
  const freshData = await fetchFn()

  // Store in cache
  await supabase
    .from('cache')
    .upsert({
      key,
      data: freshData,
      expires_at: new Date(Date.now() + ttlSeconds * 1000).toISOString()
    })

  return freshData
}

/**
 * Log API usage for monitoring and rate limiting
 */
export async function logApiUsage(apiName, details = {}) {
  const user = await getCurrentUser()
  const supabase = createServiceClient()

  try {
    await supabase.from('api_usage').insert({
      user_id: user?.id,
      api_name: apiName,
      ...details,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    // Don't throw on logging errors
    console.error('Failed to log API usage:', error)
  }
}

/**
 * Check rate limits for API usage
 */
export async function checkRateLimit(apiName, limitPerHour = 100) {
  const user = await getCurrentUser()
  if (!user) return true // No limits for anonymous users (or implement IP-based limiting)

  const supabase = createServiceClient()
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

  const { count, error } = await supabase
    .from('api_usage')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('api_name', apiName)
    .gte('timestamp', oneHourAgo)

  if (error) {
    console.error('Rate limit check failed:', error)
    return true // Allow on error to not block users
  }

  return count < limitPerHour
}