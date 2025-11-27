/**
 * HOA Name Search API
 * GET /api/hoa/search?q=sunset&limit=10
 * Returns HOAs matching the name query
 */

import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Search for HOAs by name using ilike for case-insensitive partial matching
    const { data, error } = await supabase
      .from('hoa_profiles')
      .select('id, hoa_name, city, state, zip_code, management_company')
      .ilike('hoa_name', `%${query.trim()}%`)
      .order('hoa_name', { ascending: true })
      .limit(limit)

    if (error) {
      console.error('HOA search error:', error)
      return NextResponse.json(
        { error: 'Failed to search HOAs' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      results: data || [],
      count: data?.length || 0
    })
  } catch (error) {
    console.error('HOA search error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
