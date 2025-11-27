/**
 * API Route: Trigger HOA Analysis
 * Used to manually trigger or retry analysis
 */

import { NextResponse } from 'next/server'
import { analyzeHOA } from '@/app/actions/analyze-hoa'

export async function POST(request, { params }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ success: false, error: 'HOA ID required' }, { status: 400 })
    }

    // Trigger analysis in background (don't await)
    analyzeHOA(id).catch(err => {
      console.error('Analysis error:', err)
    })

    return NextResponse.json({
      success: true,
      message: 'Analysis triggered'
    })
  } catch (error) {
    console.error('Error triggering analysis:', error)
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 })
  }
}
