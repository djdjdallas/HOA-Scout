/**
 * HOA Browse API
 * GET /api/hoa/browse?city=Miami&zip=33139&page=1&limit=20
 * Returns paginated HOAs filtered by city and/or zip
 */

import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const zip = searchParams.get('zip')
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)

    if (!city && !zip) {
      return NextResponse.json(
        { error: 'Please provide a city or zip code' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()
    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from('hoa_profiles')
      .select('id, hoa_name, city, state, zip_code, management_company, address', { count: 'exact' })

    if (city) {
      query = query.ilike('city', city.trim())
    }

    if (zip) {
      query = query.eq('zip_code', zip.trim())
    }

    // Execute query with pagination
    const { data, error, count } = await query
      .order('hoa_name', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('HOA browse error:', error)
      return NextResponse.json(
        { error: 'Failed to browse HOAs' },
        { status: 500 }
      )
    }

    const totalPages = Math.ceil((count || 0) / limit)

    return NextResponse.json({
      success: true,
      results: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasMore: page < totalPages
      }
    })
  } catch (error) {
    console.error('HOA browse error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
