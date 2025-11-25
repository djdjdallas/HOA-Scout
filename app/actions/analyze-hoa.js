/**
 * Server Action: Analyze HOA data using AI and external APIs
 * This runs the complete analysis pipeline for a new HOA
 */

'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { getNeighborhoodContext, cacheYelpData, generateNeighborhoodVibe } from '@/lib/apis/yelp'
import { analyzeHOAData, generateNeighborhoodVibe as generateVibeWithAI } from '@/lib/apis/claude'

/**
 * Main function to analyze an HOA
 * This is called from the processing queue or can be triggered manually
 */
export async function analyzeHOA(hoaId) {
  console.log('🔍 Starting HOA analysis for:', hoaId)

  try {
    const supabase = createServiceClient()

    // Step 1: Get HOA basic info
    console.log('📋 Step 1: Fetching HOA profile from database...')
    const { data: hoa, error: hoaError } = await supabase
      .from('hoa_profiles')
      .select('*')
      .eq('id', hoaId)
      .single()

    if (hoaError || !hoa) {
      console.error('❌ HOA not found:', hoaError)
      throw new Error('HOA not found')
    }
    console.log('✅ HOA profile loaded:', hoa.hoa_name)

    const analysisData = {
      hoaName: hoa.hoa_name,
      city: hoa.city,
      state: hoa.state,
      zipCode: hoa.zip_code,
      monthlyFee: hoa.monthly_fee,
      totalUnits: hoa.total_units,
      managementCompany: hoa.management_company
    }

    // Step 2: Gather data from various sources
    console.log('📊 Step 2: Gathering HOA data from multiple sources...')

    // Collect public records (in production, this would scrape actual sources)
    console.log('  → Gathering public records...')
    const publicRecords = await gatherPublicRecords(hoa)
    analysisData.publicRecords = publicRecords
    console.log('  ✓ Public records gathered')

    // Collect community feedback (Reddit, reviews, etc.)
    console.log('  → Gathering community feedback...')
    const communityFeedback = await gatherCommunityFeedback(hoa)
    analysisData.communityFeedback = communityFeedback
    console.log('  ✓ Community feedback gathered')

    // Collect financial data
    console.log('  → Gathering financial data...')
    const financialData = await gatherFinancialData(hoa)
    analysisData.financialData = financialData
    console.log('  ✓ Financial data gathered')

    // Collect rules and restrictions
    console.log('  → Gathering rules data...')
    const rulesData = await gatherRulesData(hoa)
    analysisData.rulesData = rulesData
    console.log('  ✓ Rules data gathered')

    // Step 3: Get Yelp neighborhood context
    console.log('🌆 Step 3: Fetching Yelp neighborhood data...')
    let yelpData = null

    try {
      if (hoa.coordinates) {
        console.log('  → Calling Yelp API...')
        const coords = hoa.coordinates
        yelpData = await getNeighborhoodContext(
          coords.lat,
          coords.lng,
          hoa.city,
          hoa.state
        )
        console.log('  ✓ Yelp data received')

        // Generate neighborhood vibe with AI
        console.log('  → Generating neighborhood vibe with AI...')
        const vibe = await generateVibeWithAI(yelpData)
        yelpData.vibe = { description: vibe }
        console.log('  ✓ Vibe generated')

        // Cache Yelp data for 7 days
        console.log('  → Caching Yelp data...')
        await cacheYelpData(
          hoaId,
          hoa.coordinates,
          hoa.city,
          hoa.state,
          yelpData,
          supabase
        )
        console.log('  ✓ Yelp data cached')
      } else {
        console.log('  ⚠ No coordinates available, skipping Yelp data')
      }
    } catch (yelpError) {
      console.error('❌ Yelp API error:', yelpError)
      // Continue without Yelp data if it fails
    }

    // Step 4: Run AI analysis with Claude
    console.log('🤖 Step 4: Running AI analysis with Claude...')
    const aiAnalysis = await analyzeHOAData(analysisData, yelpData)
    console.log('✅ AI analysis completed')

    // Step 5: Update HOA profile with analysis results
    console.log('💾 Step 5: Saving analysis results to database...')
    const updateData = {
      // Scores
      overall_score: aiAnalysis.overallScore,
      financial_health_score: aiAnalysis.scores.financialHealth,
      restrictiveness_score: aiAnalysis.scores.restrictiveness,
      management_quality_score: aiAnalysis.scores.managementQuality,
      community_sentiment_score: aiAnalysis.scores.communitySentiment,

      // Summary
      one_sentence_summary: aiAnalysis.oneSentenceSummary,

      // Raw data
      public_records: publicRecords,
      community_feedback: communityFeedback,
      financial_data: financialData,
      rules_data: rulesData,
      ai_analysis: aiAnalysis,

      // Flags
      red_flags: aiAnalysis.redFlags || [],
      yellow_flags: aiAnalysis.yellowFlags || [],
      green_flags: aiAnalysis.greenFlags || [],

      // Questions and documents
      questions_to_ask: aiAnalysis.questionsToAsk || [],
      documents_to_request: aiAnalysis.documentsToRequest || [],

      // Metadata
      data_completeness: aiAnalysis.dataQuality?.completeness || 50,
      last_updated: new Date().toISOString()
    }

    const { error: updateError } = await supabase
      .from('hoa_profiles')
      .update(updateData)
      .eq('id', hoaId)

    if (updateError) {
      console.error('❌ Failed to update HOA profile:', updateError)
      throw new Error(`Failed to update HOA: ${updateError.message}`)
    }
    console.log('✅ HOA profile updated successfully')

    // Skip revalidation when called from background (during render)
    // Revalidation should only happen in server actions, not during analysis
    console.log('🎉 HOA analysis completed successfully for:', hoaId)

    return {
      success: true,
      hoaId,
      analysis: aiAnalysis
    }
  } catch (error) {
    console.error('💥 HOA analysis error:', error)
    console.error('Stack trace:', error.stack)

    // Mark job as failed in processing queue if applicable
    // (In a real system, you'd have a job processor that handles this)

    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Gather public records data
 * In production, this would scrape county websites, HOA databases, etc.
 */
async function gatherPublicRecords(hoa) {
  // For demo/hackathon, return structured mock data based on HOA location
  // In production, this would scrape actual sources

  console.log('Gathering public records for:', hoa.hoa_name)

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  return {
    recordingDate: new Date().toISOString(),
    source: 'County Assessor Records',
    data: {
      legalName: hoa.hoa_name,
      registrationStatus: 'Active',
      managementCompany: hoa.management_company || 'Self-managed',
      boardMembers: [
        { name: 'John Smith', position: 'President', term: '2023-2025' },
        { name: 'Sarah Johnson', position: 'Treasurer', term: '2023-2025' },
        { name: 'Michael Brown', position: 'Secretary', term: '2023-2025' }
      ],
      liens: [],
      violations: [],
      insuranceInfo: {
        provider: 'State Farm',
        coverage: '$2,000,000',
        lastUpdated: '2024-01-15'
      }
    }
  }
}

/**
 * Gather community feedback from Reddit, reviews, etc.
 * In production, this would use Reddit API, scrape review sites, etc.
 */
async function gatherCommunityFeedback(hoa) {
  console.log('Gathering community feedback for:', hoa.hoa_name)

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500))

  // For demo, return structured feedback
  // In production, scrape Reddit, Yelp (for management company), Google reviews, etc.

  const feedbackSources = []

  // Mock Reddit posts
  feedbackSources.push({
    source: 'Reddit',
    subreddit: 'RealEstate',
    posts: [
      {
        title: `Living in ${hoa.hoa_name} - My Experience`,
        body: 'Overall positive experience. Management is responsive and fees are reasonable.',
        sentiment: 'positive',
        upvotes: 15,
        date: '2024-01-10',
        url: 'https://reddit.com/r/RealEstate/example'
      }
    ]
  })

  // Mock management company reviews
  if (hoa.management_company) {
    feedbackSources.push({
      source: 'Management Company Reviews',
      company: hoa.management_company,
      rating: 3.8,
      reviewCount: 42,
      commonThemes: [
        'Responsive to emergencies',
        'Slow with routine requests',
        'Professional staff'
      ]
    })
  }

  return {
    collectedAt: new Date().toISOString(),
    sources: feedbackSources,
    overallSentiment: 'mixed',
    totalFeedbackItems: feedbackSources.length
  }
}

/**
 * Gather financial data
 * In production, would request from HOA or scrape public filings
 */
async function gatherFinancialData(hoa) {
  console.log('Gathering financial data for:', hoa.hoa_name)

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Calculate estimated annual budget based on monthly fee
  const annualBudget = (hoa.monthly_fee || 300) * (hoa.total_units || 100) * 12

  return {
    lastUpdated: new Date().toISOString(),
    source: 'HOA Financial Statements',
    data: {
      monthlyFee: hoa.monthly_fee || 300,
      annualBudget: annualBudget,
      reserveFund: {
        current: annualBudget * 0.25, // 25% of annual budget
        recommended: annualBudget * 0.20,
        percentFunded: 125,
        lastStudy: '2023-06-01'
      },
      specialAssessments: {
        history: [],
        upcoming: []
      },
      delinquencyRate: 2.1, // percentage
      budgetBreakdown: {
        landscaping: 30,
        insurance: 20,
        maintenance: 25,
        utilities: 10,
        management: 10,
        reserves: 5
      },
      feeHistory: [
        { year: 2020, monthlyFee: hoa.monthly_fee - 50 },
        { year: 2021, monthlyFee: hoa.monthly_fee - 35 },
        { year: 2022, monthlyFee: hoa.monthly_fee - 20 },
        { year: 2023, monthlyFee: hoa.monthly_fee - 10 },
        { year: 2024, monthlyFee: hoa.monthly_fee }
      ]
    }
  }
}

/**
 * Gather rules and restrictions
 * In production, would parse CC&Rs, bylaws, and rule documents
 */
async function gatherRulesData(hoa) {
  console.log('Gathering rules data for:', hoa.hoa_name)

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800))

  return {
    lastUpdated: new Date().toISOString(),
    source: 'HOA CC&Rs and Bylaws',
    data: {
      parking: {
        guestParking: 'Limited - 2 spots per 100 units',
        residentParking: '2 spaces per unit',
        overnight: 'No street parking after 10pm',
        rvStorage: 'Not permitted'
      },
      pets: {
        allowed: true,
        limit: 2,
        sizeRestriction: '35 lbs per pet',
        breeds: 'No breed restrictions',
        deposit: '$300 per pet'
      },
      rentals: {
        shortTerm: 'Prohibited (< 30 days)',
        longTerm: 'Allowed with registration',
        ownerOccupied: '70%',
        approvalRequired: true
      },
      modifications: {
        exterior: 'Board approval required',
        interior: 'Allowed without approval',
        landscaping: 'Must match approved palette',
        solar: 'Allowed with architectural review',
        satellite: 'Allowed in approved locations'
      },
      amenities: {
        pool: {
          hours: '6am - 10pm',
          guestPolicy: 'Allowed with resident',
          ageRestriction: 'Under 16 requires supervision'
        },
        gym: {
          hours: '24/7 with key card',
          guestPolicy: 'Allowed with resident'
        }
      },
      violations: {
        firstWarning: 'Written notice',
        fineStructure: '$50-$500 depending on violation',
        appealProcess: 'Board hearing within 30 days'
      }
    }
  }
}

/**
 * Check analysis status for an HOA
 */
export async function getAnalysisStatus(hoaId) {
  try {
    const supabase = createServiceClient()

    // Check if HOA has been analyzed
    const { data: hoa } = await supabase
      .from('hoa_profiles')
      .select('overall_score, data_completeness, last_updated')
      .eq('id', hoaId)
      .single()

    if (!hoa) {
      return {
        status: 'not_found',
        progress: 0
      }
    }

    if (hoa.overall_score !== null) {
      return {
        status: 'completed',
        progress: 100,
        completeness: hoa.data_completeness,
        lastUpdated: hoa.last_updated
      }
    }

    // Check processing queue
    const { data: job } = await supabase
      .from('processing_queue')
      .select('status')
      .eq('payload->>hoaId', hoaId)
      .eq('job_type', 'analyze_hoa')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (job) {
      const progressMap = {
        'pending': 10,
        'processing': 50,
        'completed': 100,
        'failed': 0
      }

      return {
        status: job.status,
        progress: progressMap[job.status] || 0
      }
    }

    return {
      status: 'pending',
      progress: 0
    }
  } catch (error) {
    console.error('Get analysis status error:', error)
    return {
      status: 'error',
      progress: 0,
      error: error.message
    }
  }
}

/**
 * Manually trigger HOA analysis (for admin or retry)
 */
export async function triggerAnalysis(hoaId) {
  try {
    // Queue the analysis job
    const supabase = createServiceClient()

    const { data: hoa } = await supabase
      .from('hoa_profiles')
      .select('*')
      .eq('id', hoaId)
      .single()

    if (!hoa) {
      return {
        success: false,
        error: 'HOA not found'
      }
    }

    await supabase
      .from('processing_queue')
      .insert({
        job_type: 'analyze_hoa',
        status: 'pending',
        payload: {
          hoaId: hoa.id,
          hoaName: hoa.hoa_name,
          city: hoa.city,
          state: hoa.state
        }
      })

    // In production, this would trigger a background worker
    // For demo, we can run it inline (but it will take time)
    // Comment this out for faster response times
    // await analyzeHOA(hoaId)

    return {
      success: true,
      message: 'Analysis queued successfully'
    }
  } catch (error) {
    console.error('Trigger analysis error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}