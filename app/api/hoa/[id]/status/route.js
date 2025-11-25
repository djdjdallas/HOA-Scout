/**
 * API Route: Check HOA Analysis Status
 * Used by the AnalysisPending component to poll for completion
 */

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(request, { params }) {
  try {
    const { id } = await params

    const { data, error } = await supabase
      .from('hoa_profiles')
      .select('overall_score')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error checking HOA status:', error)
      return NextResponse.json({ isComplete: false, error: error.message }, { status: 500 })
    }

    const isComplete = data?.overall_score !== null

    return NextResponse.json({
      isComplete,
      score: data?.overall_score
    })
  } catch (error) {
    console.error('Error in status check:', error)
    return NextResponse.json({ isComplete: false, error: 'Internal error' }, { status: 500 })
  }
}
