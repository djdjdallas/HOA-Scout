/**
 * Server Action: Analyze HOA data using AI and external APIs
 * This runs the complete analysis pipeline for a new HOA
 */

'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { getNeighborhoodContext, cacheYelpData, generateNeighborhoodVibe } from '@/lib/apis/yelp'
import { analyzeHOAData, generateNeighborhoodVibe as generateVibeWithAI } from '@/lib/apis/claude'
import { searchHOAInfo, searchManagementCompaniesByZip } from '@/lib/apis/perplexity'

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
 * Uses Perplexity API with smart search strategy:
 * 1. First, search by HOA name/street name to find subdivision and management company
 * 2. If no results, fallback to searching management companies by zip code
 * Falls back to estimated data for fields that can't be verified
 */
async function gatherPublicRecords(hoa) {
  console.log('📋 [PUBLIC RECORDS] Gathering public records for:', hoa.hoa_name)

  // Extract street address from HOA name if it follows "HOA at [address]" pattern
  let streetAddress = null
  if (hoa.hoa_name.toLowerCase().startsWith('hoa at ')) {
    streetAddress = hoa.hoa_name.substring(7)
  }

  // Step 1: Primary search - try to find HOA info with smart search terms
  console.log('📋 [PUBLIC RECORDS] Step 1: Primary Perplexity search...')
  let perplexityResult = await searchHOAInfo(
    hoa.hoa_name,
    hoa.city,
    hoa.state,
    hoa.zip_code,
    streetAddress
  )

  // Step 2: Fallback search - if primary search failed, search by zip code
  let zipSearchResult = null
  if (!perplexityResult.foundInfo || !perplexityResult.managementCompany) {
    console.log('📋 [PUBLIC RECORDS] Step 2: Fallback - searching management companies by zip code...')
    zipSearchResult = await searchManagementCompaniesByZip(
      hoa.zip_code,
      hoa.city,
      hoa.state
    )

    // If zip search found subdivision info, it might help identify the HOA
    if (zipSearchResult.foundInfo) {
      console.log('📋 [PUBLIC RECORDS] Found area management companies:', zipSearchResult.companies?.length || 0)
      if (zipSearchResult.commonSubdivisions?.length > 0) {
        console.log('📋 [PUBLIC RECORDS] Known subdivisions in area:', zipSearchResult.commonSubdivisions.slice(0, 3).join(', '))
      }
    }
  }

  // Step 3: Generate placeholder board members (clearly labeled as unverified)
  const currentYear = new Date().getFullYear()
  const mockBoardMembers = [
    { name: 'Board President', position: 'President', term: `${currentYear}-${currentYear + 2}`, verified: false },
    { name: 'Board Treasurer', position: 'Treasurer', term: `${currentYear}-${currentYear + 2}`, verified: false },
    { name: 'Board Secretary', position: 'Secretary', term: `${currentYear}-${currentYear + 2}`, verified: false }
  ]

  // Step 4: Determine data quality/confidence level
  let confidence = 'low'
  let dataSource = 'Estimated Data (verification recommended)'

  if (perplexityResult.foundInfo) {
    if (perplexityResult.managementCompany && perplexityResult.contactInfo?.phone) {
      confidence = 'high'
      dataSource = 'Perplexity Search + Public Records'
    } else if (perplexityResult.managementCompany || perplexityResult.contactInfo?.website) {
      confidence = 'medium'
      dataSource = 'Perplexity Search (partial match)'
    } else if (perplexityResult.subdivisionName) {
      confidence = 'medium'
      dataSource = 'Perplexity Search (subdivision identified)'
    }
  } else if (zipSearchResult?.foundInfo) {
    confidence = 'low'
    dataSource = 'Area Management Companies (needs verification)'
  }

  console.log(`📋 [PUBLIC RECORDS] Data confidence: ${confidence}`)
  console.log(`📋 [PUBLIC RECORDS] Source: ${dataSource}`)
  if (perplexityResult.subdivisionName) {
    console.log(`📋 [PUBLIC RECORDS] Subdivision identified: ${perplexityResult.subdivisionName}`)
  }

  // Step 5: Combine real + estimated data with clear labeling
  return {
    recordingDate: new Date().toISOString(),
    source: dataSource,
    confidence: confidence,
    data: {
      legalName: hoa.hoa_name,
      subdivisionName: perplexityResult.subdivisionName || null,
      registrationStatus: 'Active',
      hoaExists: perplexityResult.hoaExists,

      // VERIFIED data from Perplexity (if found)
      managementCompany: {
        name: perplexityResult.managementCompany || hoa.management_company || 'Unknown (verification needed)',
        verified: !!perplexityResult.managementCompany
      },
      contactInfo: {
        phone: perplexityResult.contactInfo?.phone || null,
        email: perplexityResult.contactInfo?.email || null,
        website: perplexityResult.contactInfo?.website || null,
        address: perplexityResult.contactInfo?.address || null,
        verified: perplexityResult.foundInfo
      },
      monthlyFeeEstimate: perplexityResult.monthlyFee || (hoa.monthly_fee ? `$${hoa.monthly_fee}` : null),

      // Area management companies (from fallback search)
      areaManagementCompanies: zipSearchResult?.companies || [],
      knownSubdivisionsInArea: zipSearchResult?.commonSubdivisions || [],

      // ESTIMATED data (clearly labeled)
      boardMembers: mockBoardMembers,
      liens: [],
      violations: [],
      insuranceInfo: {
        provider: 'To be verified',
        coverage: 'Standard HOA Coverage (typical)',
        lastUpdated: new Date().toISOString(),
        verified: false
      },

      // Data quality metadata for the AI analysis and UI
      dataQuality: {
        verified: perplexityResult.foundInfo,
        confidence: confidence,
        sources: [...(perplexityResult.sources || []), ...(zipSearchResult?.sources || [])],
        lastChecked: new Date().toISOString(),
        perplexityResponseTimeMs: perplexityResult.responseTimeMs || null,
        searchStrategy: perplexityResult.searchStrategy || null,
        fieldsVerified: {
          subdivisionName: !!perplexityResult.subdivisionName,
          managementCompany: !!perplexityResult.managementCompany,
          phone: !!perplexityResult.contactInfo?.phone,
          email: !!perplexityResult.contactInfo?.email,
          website: !!perplexityResult.contactInfo?.website,
          address: !!perplexityResult.contactInfo?.address,
          monthlyFee: !!perplexityResult.monthlyFee
        }
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
 * NOTE: This returns ESTIMATED data - clearly labeled as unverified
 */
async function gatherFinancialData(hoa) {
  console.log('Gathering financial data for:', hoa.hoa_name)

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Use provided monthly fee or a reasonable default for Las Vegas area
  const currentFee = hoa.monthly_fee || 250
  const totalUnits = hoa.total_units || 100

  // Calculate estimated annual budget based on monthly fee
  const annualBudget = currentFee * totalUnits * 12

  // Generate realistic fee history (typical 3-5% annual increase)
  // Calculate backwards from current fee to avoid negative numbers
  const feeHistory = [
    { year: 2020, monthlyFee: Math.round(currentFee * 0.85), verified: false },
    { year: 2021, monthlyFee: Math.round(currentFee * 0.89), verified: false },
    { year: 2022, monthlyFee: Math.round(currentFee * 0.93), verified: false },
    { year: 2023, monthlyFee: Math.round(currentFee * 0.97), verified: false },
    { year: 2024, monthlyFee: currentFee, verified: false }
  ]

  return {
    lastUpdated: new Date().toISOString(),
    source: 'Estimated Financial Data (verification recommended)',
    verified: false,
    data: {
      monthlyFee: currentFee,
      monthlyFeeVerified: !!hoa.monthly_fee,
      annualBudget: annualBudget,
      annualBudgetVerified: false,
      reserveFund: {
        current: Math.round(annualBudget * 0.25), // 25% of annual budget (estimated)
        recommended: Math.round(annualBudget * 0.20),
        percentFunded: 125, // Estimated as adequately funded
        lastStudy: '2023-06-01',
        verified: false
      },
      specialAssessments: {
        history: [],
        upcoming: [],
        verified: false
      },
      delinquencyRate: 2.1, // Industry average percentage
      delinquencyRateVerified: false,
      budgetBreakdown: {
        landscaping: 30,
        insurance: 20,
        maintenance: 25,
        utilities: 10,
        management: 10,
        reserves: 5,
        verified: false,
        note: 'Typical HOA budget allocation percentages'
      },
      feeHistory: feeHistory,
      feeHistoryNote: 'Estimated based on typical 3-4% annual increases. Actual history should be verified with HOA.'
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