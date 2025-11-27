/**
 * Cities API
 * GET /api/cities
 * Returns distinct cities from hoa_profiles, sorted alphabetically
 */
import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Cache cities for 1 hour (static data that doesn't change often)
let cachedCities = null
let cacheTimestamp = null
const CACHE_TTL = 60 * 60 * 1000 // 1 hour in milliseconds

export async function GET() {
  try {
    // Check if we have valid cached data
    if (cachedCities && cacheTimestamp && (Date.now() - cacheTimestamp) < CACHE_TTL) {
      return NextResponse.json({
        success: true,
        cities: cachedCities,
        count: cachedCities.length,
        cached: true
      })
    }

    const supabase = createServiceClient()

    // Use raw SQL for efficient DISTINCT query
    const { data, error } = await supabase
      .rpc('get_distinct_cities')

    // Fallback if RPC doesn't exist - fetch with higher limit
    if (error?.code === '42883') {
      // Function doesn't exist, use fallback approach
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('hoa_profiles')
        .select('city')
        .not('city', 'is', null)
        .order('city', { ascending: true })
        .limit(50000) // Increase limit to get all rows

      if (fallbackError) {
        console.error('Cities fetch error:', fallbackError)
        return NextResponse.json(
          { error: 'Failed to fetch cities' },
          { status: 500 }
        )
      }

      const uniqueCities = [...new Set(fallbackData.map(row => row.city))]
        .filter(city => city && city.trim().length > 0)
        .sort((a, b) => a.localeCompare(b))

      cachedCities = uniqueCities
      cacheTimestamp = Date.now()

      return NextResponse.json({
        success: true,
        cities: uniqueCities,
        count: uniqueCities.length,
        cached: false
      })
    }

    if (error) {
      console.error('Cities fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch cities' },
        { status: 500 }
      )
    }

    // RPC returns array of {city: string}
    const uniqueCities = data
      .map(row => row.city)
      .filter(city => city && city.trim().length > 0)
      .sort((a, b) => a.localeCompare(b))

    // Cache the results
    cachedCities = uniqueCities
    cacheTimestamp = Date.now()

    return NextResponse.json({
      success: true,
      cities: uniqueCities,
      count: uniqueCities.length,
      cached: false
    })
  } catch (error) {
    console.error('Cities fetch error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
