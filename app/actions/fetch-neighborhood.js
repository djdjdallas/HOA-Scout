/**
 * Server Action: Fetch Neighborhood Data from Yelp
 * Fetches neighborhood context based on user's actual property address (not HOA corporate address)
 */

'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { getNeighborhoodContext, generateNeighborhoodVibe } from '@/lib/apis/yelp'

/**
 * Round coordinates to 3 decimal places for neighborhood-level caching
 * This means multiple users in the same ~100m area share cached data
 */
function roundCoordinates(lat, lng) {
  return {
    lat: Math.round(lat * 1000) / 1000,
    lng: Math.round(lng * 1000) / 1000
  }
}

/**
 * Fetch neighborhood data for a specific address
 * Uses caching to avoid hitting Yelp API repeatedly
 *
 * @param {number} lat - Latitude of user's property
 * @param {number} lng - Longitude of user's property
 * @param {string} city - City name
 * @param {string} state - State code (e.g., 'FL')
 * @param {string|null} hoaId - Optional HOA ID to associate with the cache
 */
export async function fetchNeighborhoodForAddress(lat, lng, city, state, hoaId = null) {
  try {
    console.log('🏘️ [NEIGHBORHOOD] Fetching neighborhood data for:', { lat, lng, city, state, hoaId })

    const supabase = createServiceClient()
    const rounded = roundCoordinates(lat, lng)

    // Step 1: Check if we have cached data for this location (by coordinate range)
    // Use a small range to find cached data in the same ~100m area
    const tolerance = 0.001 // ~100m
    const { data: cachedData, error: cacheError } = await supabase
      .from('neighborhood_context')
      .select('*')
      .gte('location->lat', rounded.lat - tolerance)
      .lte('location->lat', rounded.lat + tolerance)
      .gte('location->lng', rounded.lng - tolerance)
      .lte('location->lng', rounded.lng + tolerance)
      .gte('expires_at', new Date().toISOString())
      .limit(1)
      .maybeSingle()

    if (cacheError) {
      // Log but don't fail - cache lookup errors shouldn't block the request
      console.warn('⚠️ [NEIGHBORHOOD] Cache lookup issue (non-fatal):', cacheError.message)
    }

    if (cachedData) {
      console.log('✅ [NEIGHBORHOOD] Cache hit! Using cached data for location:', rounded)
      return {
        success: true,
        data: cachedData,
        cached: true
      }
    }

    console.log('📡 [NEIGHBORHOOD] Cache miss. Fetching from Yelp API...')

    // Step 2: Fetch fresh data from Yelp
    let yelpData
    try {
      yelpData = await getNeighborhoodContext(lat, lng, city, state)
    } catch (yelpError) {
      console.error('❌ [NEIGHBORHOOD] Yelp API error:', yelpError.message)
      return {
        success: false,
        error: 'Unable to fetch neighborhood data. Please try again later.',
        cached: false
      }
    }

    if (!yelpData) {
      return {
        success: false,
        error: 'No neighborhood data available for this location.',
        cached: false
      }
    }

    // Step 3: Generate vibe description
    const vibe = generateNeighborhoodVibe(yelpData)

    // Step 4: Cache the results
    const cacheData = {
      hoa_id: hoaId,
      location: { lat: rounded.lat, lng: rounded.lng }, // Store as JSON object
      city,
      state,
      businesses: yelpData.businesses,
      walkability_score: parseFloat(yelpData.walkability),
      restaurant_count: yelpData.summary.restaurantCount,
      parks_count: yelpData.summary.parkCount,
      grocery_count: yelpData.summary.groceryCount,
      coffee_count: yelpData.summary.coffeeCount,
      // Florida-specific categories
      beaches_count: yelpData.statistics?.beaches || 0,
      golf_count: yelpData.statistics?.golf || 0,
      medical_count: yelpData.statistics?.medical || 0,
      pharmacy_count: yelpData.statistics?.pharmacy || 0,
      // Store full statistics for flexibility
      statistics: yelpData.statistics || {},
      overall_vibe: vibe.description,
      cached_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    }

    // Use insert instead of upsert (no unique constraint on location)
    const { data: savedData, error: saveError } = await supabase
      .from('neighborhood_context')
      .insert(cacheData)
      .select()
      .single()

    if (saveError) {
      // Log but don't fail - caching errors shouldn't block the request
      console.warn('⚠️ [NEIGHBORHOOD] Failed to cache data (non-fatal):', saveError.message)
      // Still return the data even if caching failed
      return {
        success: true,
        data: cacheData,
        cached: false
      }
    }

    console.log('✅ [NEIGHBORHOOD] Data fetched and cached successfully')

    return {
      success: true,
      data: savedData || cacheData,
      cached: false
    }
  } catch (error) {
    console.error('❌ [NEIGHBORHOOD] Unexpected error:', error)
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
      cached: false
    }
  }
}

/**
 * Get cached neighborhood data for an HOA (if any exists)
 * Used to check if we already have neighborhood data linked to an HOA
 *
 * @param {string} hoaId - HOA ID to look up
 */
export async function getNeighborhoodForHOA(hoaId) {
  try {
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('neighborhood_context')
      .select('*')
      .eq('hoa_id', hoaId)
      .gte('expires_at', new Date().toISOString())
      .maybeSingle()

    if (error) {
      console.error('❌ [NEIGHBORHOOD] Error fetching HOA neighborhood:', error)
      return { success: false, error: error.message }
    }

    return {
      success: true,
      data
    }
  } catch (error) {
    console.error('❌ [NEIGHBORHOOD] Unexpected error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
