/**
 * Server Action: Analyze HOA data using AI and external APIs
 * This runs the complete analysis pipeline for a new HOA
 * Optimized for Florida HOAs with comprehensive Perplexity searches
 */

'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { getNeighborhoodContext, cacheYelpData } from '@/lib/apis/yelp'
import { analyzeHOAData, generateNeighborhoodVibe as generateVibeWithAI } from '@/lib/apis/claude'
import { geocodeAddress } from '@/lib/apis/geocoding'
import {
  searchHOAInfo,
  searchManagementCompaniesByZip,
  searchFloridaSunBiz,
  searchHOAFinancials,
  searchHOARules,
  searchHOAReviews
} from '@/lib/apis/perplexity'

/**
 * Main function to analyze an HOA
 * This is called from the processing queue or can be triggered manually
 */
export async function analyzeHOA(hoaId) {
  console.log('🔍 Starting Florida HOA analysis for:', hoaId)

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
      state: hoa.state || 'FL',
      zipCode: hoa.zip_code,
      monthlyFee: hoa.monthly_fee,
      totalUnits: hoa.total_units,
      managementCompany: hoa.management_company
    }

    // Step 2: Gather data from multiple Perplexity searches (comprehensive)
    console.log('📊 Step 2: Gathering HOA data from multiple sources...')

    // 2a: Public records + SunBiz (primary data source)
    console.log('  → Gathering public records & SunBiz data...')
    let publicRecords = await gatherPublicRecords(hoa)

    // IMPORTANT: If no contact info found in primary search, do a secondary search
    // This helps ensure Claude has contact info when generating flags
    if (!publicRecords.data?.contactInfo?.phone &&
        !publicRecords.data?.contactInfo?.website &&
        !publicRecords.data?.contactInfo?.email) {
      console.log('  → Primary search found no contact info, attempting secondary search...')
      const secondaryResult = await searchHOAInfo(
        hoa.hoa_name,
        hoa.city,
        hoa.state || 'FL',
        hoa.zip_code,
        hoa.address
      )

      // Merge any found contact info
      if (secondaryResult.contactInfo?.phone || secondaryResult.contactInfo?.website || secondaryResult.contactInfo?.email) {
        console.log('  ✓ Secondary search found contact info')
        publicRecords.data.contactInfo = {
          ...publicRecords.data.contactInfo,
          phone: secondaryResult.contactInfo?.phone || publicRecords.data.contactInfo?.phone,
          email: secondaryResult.contactInfo?.email || publicRecords.data.contactInfo?.email,
          website: secondaryResult.contactInfo?.website || publicRecords.data.contactInfo?.website,
          address: secondaryResult.contactInfo?.address || publicRecords.data.contactInfo?.address,
          verified: secondaryResult.foundInfo
        }
        // Update confidence if we found more data
        if (publicRecords.confidence === 'low' && secondaryResult.foundInfo) {
          publicRecords.confidence = 'medium'
          publicRecords.source = 'Perplexity Search (secondary match)'
        }
      }
    }

    analysisData.publicRecords = publicRecords
    console.log('  ✓ Public records gathered')

    // Get management company from public records for subsequent searches
    const managementCompany = publicRecords.data?.managementCompany?.name || hoa.management_company

    // 2b: Community feedback with real reviews
    console.log('  → Gathering community feedback...')
    const communityFeedback = await gatherCommunityFeedback(hoa, managementCompany)
    analysisData.communityFeedback = communityFeedback
    console.log('  ✓ Community feedback gathered')

    // 2c: Financial data search
    console.log('  → Gathering financial data...')
    const financialData = await gatherFinancialData(hoa, managementCompany, publicRecords)
    analysisData.financialData = financialData
    console.log('  ✓ Financial data gathered')

    // 2d: Rules and restrictions search
    console.log('  → Gathering rules data...')
    const rulesData = await gatherRulesData(hoa, publicRecords.data?.subdivisionName)
    analysisData.rulesData = rulesData
    console.log('  ✓ Rules data gathered')

    // Step 3: Get Yelp neighborhood context
    console.log('🌆 Step 3: Fetching Yelp neighborhood data...')
    let yelpData = null
    let hoaCoordinates = hoa.coordinates

    try {
      // If no coordinates, try to geocode the HOA location
      if (!hoaCoordinates) {
        console.log('  → No coordinates stored, attempting to geocode...')
        const addressToGeocode = hoa.address
          ? `${hoa.address}, ${hoa.city}, ${hoa.state || 'FL'} ${hoa.zip_code}`
          : `${hoa.city}, ${hoa.state || 'FL'} ${hoa.zip_code}`

        try {
          const geocodeResult = await geocodeAddress(addressToGeocode)
          if (geocodeResult && geocodeResult.lat && geocodeResult.lng) {
            hoaCoordinates = { lat: geocodeResult.lat, lng: geocodeResult.lng }
            console.log(`  ✓ Geocoded to: ${hoaCoordinates.lat}, ${hoaCoordinates.lng}`)

            // Save coordinates to HOA profile for future use
            await supabase
              .from('hoa_profiles')
              .update({ coordinates: hoaCoordinates })
              .eq('id', hoaId)
            console.log('  ✓ Coordinates saved to database')
          }
        } catch (geocodeError) {
          console.log('  ⚠ Geocoding failed:', geocodeError.message)
        }
      }

      if (hoaCoordinates) {
        console.log('  → Calling Yelp API...')
        yelpData = await getNeighborhoodContext(
          hoaCoordinates.lat,
          hoaCoordinates.lng,
          hoa.city,
          hoa.state || 'FL'
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
          hoaCoordinates,
          hoa.city,
          hoa.state || 'FL',
          yelpData,
          supabase
        )
        console.log('  ✓ Yelp data cached')
      } else {
        console.log('  ⚠ No coordinates available after geocoding attempt, skipping Yelp data')
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

    // Calculate overall data completeness based on verified fields
    const dataCompleteness = calculateDataCompleteness(publicRecords, communityFeedback, financialData, rulesData)

    const updateData = {
      // Scores
      overall_score: aiAnalysis.overallScore,
      financial_health_score: aiAnalysis.scores.financialHealth,
      restrictiveness_score: aiAnalysis.scores.restrictiveness,
      management_quality_score: aiAnalysis.scores.managementQuality,
      community_sentiment_score: aiAnalysis.scores.communitySentiment,

      // Summary
      one_sentence_summary: aiAnalysis.oneSentenceSummary,

      // Raw data with enhanced Perplexity results
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
      data_completeness: dataCompleteness,
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

    console.log('🎉 HOA analysis completed successfully for:', hoaId)
    console.log(`   Data completeness: ${dataCompleteness}%`)

    return {
      success: true,
      hoaId,
      analysis: aiAnalysis,
      dataCompleteness
    }
  } catch (error) {
    console.error('💥 HOA analysis error:', error)
    console.error('Stack trace:', error.stack)

    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Calculate data completeness based on verified fields across all sources
 */
function calculateDataCompleteness(publicRecords, communityFeedback, financialData, rulesData) {
  let score = 0
  let totalPoints = 0

  // Public records fields (40 points max)
  totalPoints += 40
  if (publicRecords.data?.subdivisionName) score += 5
  if (publicRecords.data?.managementCompany?.verified) score += 10
  if (publicRecords.data?.contactInfo?.phone) score += 5
  if (publicRecords.data?.contactInfo?.website) score += 5
  if (publicRecords.data?.sunbiz?.status) score += 10
  if (publicRecords.data?.sunbiz?.documentNumber) score += 5

  // Community feedback fields (20 points max)
  totalPoints += 20
  if (communityFeedback.verified) score += 10
  if (communityFeedback.reviewCount > 0) score += 5
  if (communityFeedback.bbbRating) score += 5

  // Financial data fields (20 points max)
  totalPoints += 20
  if (financialData.verified) score += 10
  if (financialData.data?.monthlyFee && financialData.data?.monthlyFeeVerified) score += 5
  if (financialData.data?.specialAssessments?.verified) score += 5

  // Rules data fields (20 points max)
  totalPoints += 20
  if (rulesData.verified) score += 10
  if (rulesData.data?.ccrsAvailableOnline) score += 5
  if (rulesData.data?.rentalRestrictions?.shortTermAllowed !== null) score += 5

  return Math.round((score / totalPoints) * 100)
}

/**
 * Gather public records data using comprehensive Perplexity searches
 * Includes Florida SunBiz corporation data
 */
async function gatherPublicRecords(hoa) {
  console.log('📋 [PUBLIC RECORDS] Gathering Florida public records for:', hoa.hoa_name)

  // Extract street address from HOA name if it follows "HOA at [address]" pattern
  let streetAddress = null
  if (hoa.hoa_name.toLowerCase().startsWith('hoa at ')) {
    streetAddress = hoa.hoa_name.substring(7)
  }

  // Step 1: Primary search - comprehensive Florida HOA search
  console.log('📋 [PUBLIC RECORDS] Step 1: Primary Florida HOA search...')
  const perplexityResult = await searchHOAInfo(
    hoa.hoa_name,
    hoa.city,
    hoa.state || 'FL',
    hoa.zip_code,
    streetAddress
  )

  // Step 2: SunBiz search if primary didn't find corporation data
  let sunbizResult = null
  if (!perplexityResult.sunbiz?.documentNumber) {
    console.log('📋 [PUBLIC RECORDS] Step 2: Florida SunBiz corporation search...')
    sunbizResult = await searchFloridaSunBiz(hoa.hoa_name, hoa.city)
  }

  // Step 3: Fallback search by zip code if needed
  let zipSearchResult = null
  if (!perplexityResult.foundInfo && !perplexityResult.managementCompany) {
    console.log('📋 [PUBLIC RECORDS] Step 3: Fallback - searching by zip code...')
    zipSearchResult = await searchManagementCompaniesByZip(
      hoa.zip_code,
      hoa.city,
      hoa.state || 'FL'
    )
  }

  // Merge SunBiz data with primary search
  const sunbizData = sunbizResult?.foundInfo ? {
    status: sunbizResult.status,
    documentNumber: sunbizResult.documentNumber,
    registeredAgent: sunbizResult.registeredAgent,
    filingDate: sunbizResult.filingDate,
    lastAnnualReport: sunbizResult.lastAnnualReport,
    corporationName: sunbizResult.corporationName,
    officers: sunbizResult.officers || [],
    principalAddress: sunbizResult.principalAddress
  } : perplexityResult.sunbiz || {}

  // Use SunBiz officers as board members if available
  const boardMembers = sunbizData.officers?.length > 0
    ? sunbizData.officers.map(o => ({
        name: o.name,
        position: o.title,
        verified: true,
        source: 'Florida SunBiz'
      }))
    : [
        { name: 'Board President', position: 'President', verified: false },
        { name: 'Board Treasurer', position: 'Treasurer', verified: false },
        { name: 'Board Secretary', position: 'Secretary', verified: false }
      ]

  // Determine confidence level
  let confidence = 'low'
  let dataSource = 'Estimated Data (verification recommended)'

  if (sunbizData.documentNumber || perplexityResult.foundInfo) {
    if (sunbizData.documentNumber && perplexityResult.managementCompany) {
      confidence = 'high'
      dataSource = 'Florida SunBiz + Perplexity Search'
    } else if (sunbizData.documentNumber) {
      confidence = 'high'
      dataSource = 'Florida SunBiz Corporation Records'
    } else if (perplexityResult.managementCompany && perplexityResult.contactInfo?.phone) {
      confidence = 'high'
      dataSource = 'Perplexity Search + Public Records'
    } else if (perplexityResult.managementCompany || perplexityResult.subdivisionName) {
      confidence = 'medium'
      dataSource = 'Perplexity Search (partial match)'
    }
  } else if (zipSearchResult?.foundInfo) {
    confidence = 'low'
    dataSource = 'Area Management Companies (needs verification)'
  }

  console.log(`📋 [PUBLIC RECORDS] Data confidence: ${confidence}`)
  console.log(`📋 [PUBLIC RECORDS] SunBiz status: ${sunbizData.status || 'Not found'}`)

  return {
    recordingDate: new Date().toISOString(),
    source: dataSource,
    confidence,
    data: {
      legalName: sunbizData.corporationName || hoa.hoa_name,
      subdivisionName: perplexityResult.subdivisionName || null,
      registrationStatus: sunbizData.status || 'Unknown',
      hoaExists: perplexityResult.hoaExists,

      // Management company info
      managementCompany: {
        name: perplexityResult.managementCompany || hoa.management_company || 'Unknown',
        verified: !!perplexityResult.managementCompany
      },
      contactInfo: {
        phone: perplexityResult.contactInfo?.phone || null,
        email: perplexityResult.contactInfo?.email || null,
        website: perplexityResult.contactInfo?.website || null,
        address: perplexityResult.contactInfo?.address || sunbizData.principalAddress || null,
        verified: perplexityResult.foundInfo
      },

      // Florida SunBiz data
      sunbiz: sunbizData,

      // Additional HOA info
      yearEstablished: perplexityResult.yearEstablished || (sunbizData.filingDate ? new Date(sunbizData.filingDate).getFullYear() : null),
      totalUnits: perplexityResult.totalUnits || hoa.total_units || null,
      amenities: perplexityResult.amenities || [],
      masterAssociation: perplexityResult.masterAssociation || null,
      is55Plus: perplexityResult.is55Plus || false,
      monthlyFeeEstimate: perplexityResult.monthlyFee || (hoa.monthly_fee ? `$${hoa.monthly_fee}` : null),

      // Board members (from SunBiz or placeholder)
      boardMembers,

      // Area management companies (from fallback)
      areaManagementCompanies: zipSearchResult?.companies || [],
      knownSubdivisionsInArea: zipSearchResult?.commonSubdivisions || [],
      masterCommunities: zipSearchResult?.masterCommunities || [],

      // County info
      county: perplexityResult.county || zipSearchResult?.county || null,

      // Data quality metadata
      dataQuality: {
        verified: perplexityResult.foundInfo || sunbizResult?.foundInfo,
        confidence,
        sources: [
          ...(perplexityResult.sources || []),
          ...(sunbizResult?.sources || []),
          ...(zipSearchResult?.sources || [])
        ],
        lastChecked: new Date().toISOString(),
        searchTimings: {
          hoaInfo: perplexityResult.responseTimeMs,
          sunbiz: sunbizResult?.responseTimeMs,
          zipSearch: zipSearchResult?.responseTimeMs
        },
        fieldsVerified: {
          sunbizCorporation: !!sunbizData.documentNumber,
          subdivisionName: !!perplexityResult.subdivisionName,
          managementCompany: !!perplexityResult.managementCompany,
          phone: !!perplexityResult.contactInfo?.phone,
          email: !!perplexityResult.contactInfo?.email,
          website: !!perplexityResult.contactInfo?.website,
          boardMembers: sunbizData.officers?.length > 0,
          monthlyFee: !!perplexityResult.monthlyFee
        }
      }
    }
  }
}

/**
 * Gather community feedback using Perplexity review search
 */
async function gatherCommunityFeedback(hoa, managementCompany = null) {
  console.log('💬 [COMMUNITY] Gathering community feedback for:', hoa.hoa_name)

  // Call Perplexity review search
  const reviewResult = await searchHOAReviews(
    hoa.hoa_name,
    managementCompany,
    hoa.city,
    hoa.state || 'FL'
  )

  if (reviewResult.foundInfo) {
    console.log(`💬 [COMMUNITY] Found ${reviewResult.reviewCount} reviews, sentiment: ${reviewResult.sentiment}`)

    return {
      collectedAt: new Date().toISOString(),
      source: 'Perplexity Review Search',
      verified: true,
      sentiment: reviewResult.sentiment,
      reviewCount: reviewResult.reviewCount,
      averageRating: reviewResult.averageRating,
      commonComplaints: reviewResult.commonComplaints,
      commonPraise: reviewResult.commonPraise,
      redditMentions: reviewResult.redditMentions,
      googleRating: reviewResult.googleReviewRating,
      bbbRating: reviewResult.bbbRating,
      bbbComplaints: reviewResult.bbbComplaints,
      newsArticles: reviewResult.newsArticles,
      neighborhoodApps: reviewResult.neighborhoodApps,
      sources: reviewResult.sources,
      responseTimeMs: reviewResult.responseTimeMs
    }
  }

  // Fallback to estimated feedback if no real reviews found
  console.log('💬 [COMMUNITY] No reviews found, using estimated data')
  return {
    collectedAt: new Date().toISOString(),
    source: 'No online reviews found',
    verified: false,
    sentiment: 'unknown',
    reviewCount: 0,
    averageRating: null,
    commonComplaints: [],
    commonPraise: [],
    redditMentions: 0,
    googleRating: null,
    bbbRating: null,
    newsArticles: [],
    note: 'No community feedback found online. Consider asking current residents for their experience.'
  }
}

/**
 * Gather financial data using Perplexity search
 */
async function gatherFinancialData(hoa, managementCompany = null, publicRecords = null) {
  console.log('💰 [FINANCIAL] Gathering financial data for:', hoa.hoa_name)

  // Call Perplexity financial search
  const financialResult = await searchHOAFinancials(
    hoa.hoa_name,
    managementCompany,
    hoa.city,
    hoa.state || 'FL',
    hoa.zip_code
  )

  const currentFee = hoa.monthly_fee || 250
  const totalUnits = hoa.total_units || publicRecords?.data?.totalUnits || 100

  if (financialResult.foundInfo) {
    console.log(`💰 [FINANCIAL] Found financial data: ${financialResult.monthlyFee || 'no fee info'}`)

    // Parse verified monthly fee if available
    const verifiedFee = financialResult.monthlyFee
      ? parseFloat(financialResult.monthlyFee.replace(/[^0-9.]/g, ''))
      : null

    return {
      lastUpdated: new Date().toISOString(),
      source: 'Perplexity Financial Search',
      verified: true,
      responseTimeMs: financialResult.responseTimeMs,
      sources: financialResult.sources,
      data: {
        monthlyFee: verifiedFee || currentFee,
        monthlyFeeVerified: !!verifiedFee,
        quarterlyFee: financialResult.quarterlyFee || null,
        annualFee: financialResult.annualFee || null,
        annualBudget: (verifiedFee || currentFee) * totalUnits * 12,
        annualBudgetVerified: false,

        reserveFund: {
          percentFunded: financialResult.reserveFundPercent || null,
          lastStudy: financialResult.lastReserveStudy || null,
          verified: !!financialResult.reserveFundPercent
        },

        specialAssessments: {
          history: financialResult.specialAssessments || [],
          verified: (financialResult.specialAssessments?.length || 0) > 0
        },

        feeHistory: financialResult.feeHistory || [],
        feeHistoryVerified: (financialResult.feeHistory?.length || 0) > 0,

        financialHealth: financialResult.financialHealth || 'unknown',
        lawsuits: financialResult.lawsuits || [],
        delinquencyRate: financialResult.delinquencyRate || null,
        delinquencyRateVerified: financialResult.delinquencyRate !== null
      }
    }
  }

  // Fallback to estimated financial data
  console.log('💰 [FINANCIAL] No verified financials found, using estimates')

  const annualBudget = currentFee * totalUnits * 12
  const feeHistory = [
    { year: 2020, amount: `$${Math.round(currentFee * 0.85)}`, verified: false },
    { year: 2021, amount: `$${Math.round(currentFee * 0.89)}`, verified: false },
    { year: 2022, amount: `$${Math.round(currentFee * 0.93)}`, verified: false },
    { year: 2023, amount: `$${Math.round(currentFee * 0.97)}`, verified: false },
    { year: 2024, amount: `$${currentFee}`, verified: false }
  ]

  return {
    lastUpdated: new Date().toISOString(),
    source: 'Estimated Financial Data (verification recommended)',
    verified: false,
    data: {
      monthlyFee: currentFee,
      monthlyFeeVerified: !!hoa.monthly_fee,
      annualBudget,
      annualBudgetVerified: false,

      reserveFund: {
        percentFunded: null,
        lastStudy: null,
        verified: false,
        note: 'Reserve fund status should be verified with HOA'
      },

      specialAssessments: {
        history: [],
        verified: false,
        note: 'Special assessment history should be verified with HOA'
      },

      feeHistory,
      feeHistoryNote: 'Estimated based on typical 3-4% annual increases',

      financialHealth: 'unknown',
      lawsuits: [],
      delinquencyRate: null
    }
  }
}

/**
 * Gather rules and restrictions using Perplexity search
 */
async function gatherRulesData(hoa, subdivisionName = null) {
  console.log('📜 [RULES] Gathering rules data for:', hoa.hoa_name)

  // Call Perplexity rules search
  const rulesResult = await searchHOARules(
    hoa.hoa_name,
    subdivisionName,
    hoa.city,
    hoa.state || 'FL'
  )

  if (rulesResult.foundInfo) {
    console.log(`📜 [RULES] Found rules data, CC&Rs online: ${rulesResult.ccrsAvailableOnline}`)

    return {
      lastUpdated: new Date().toISOString(),
      source: 'Perplexity Rules Search',
      verified: true,
      responseTimeMs: rulesResult.responseTimeMs,
      sources: rulesResult.sources,
      data: {
        ccrsAvailableOnline: rulesResult.ccrsAvailableOnline || false,

        rentalRestrictions: rulesResult.rentalRestrictions || {
          shortTermAllowed: null,
          minLeaseTerm: null,
          rentalCapPercent: null
        },

        petRestrictions: rulesResult.petRestrictions || {
          allowed: null,
          maxNumber: null,
          weightLimit: null,
          breedRestrictions: null
        },

        parkingRules: rulesResult.parkingRules || {
          guestParking: null,
          rvBoatAllowed: null,
          garageRequired: null
        },

        exteriorModifications: rulesResult.exteriorModifications || {
          approvalRequired: null,
          commonRestrictions: []
        },

        notableRules: rulesResult.notableRules || [],
        recentRuleChanges: rulesResult.recentRuleChanges || []
      }
    }
  }

  // Fallback to typical Florida HOA rules
  console.log('📜 [RULES] No verified rules found, using typical Florida HOA rules')

  return {
    lastUpdated: new Date().toISOString(),
    source: 'Typical Florida HOA Rules (verification recommended)',
    verified: false,
    data: {
      ccrsAvailableOnline: false,

      rentalRestrictions: {
        shortTermAllowed: null,
        minLeaseTerm: null,
        rentalCapPercent: null,
        note: 'Florida law requires HOAs to disclose rental restrictions'
      },

      petRestrictions: {
        allowed: true,
        maxNumber: 2,
        weightLimit: null,
        breedRestrictions: null,
        note: 'Typical Florida HOA allows pets with some restrictions'
      },

      parkingRules: {
        guestParking: 'Varies by community',
        rvBoatAllowed: false,
        garageRequired: null,
        note: 'Most Florida HOAs restrict RV/boat parking'
      },

      exteriorModifications: {
        approvalRequired: true,
        commonRestrictions: ['Exterior paint colors', 'Landscaping changes', 'Fencing'],
        note: 'Florida HOAs typically require approval for exterior changes'
      },

      notableRules: [],
      recentRuleChanges: [],

      floridaLawNotes: [
        'Florida Statute 720 governs HOAs',
        'HOAs must provide governing documents within 10 days of request',
        'Rental restrictions may apply - verify with HOA'
      ]
    }
  }
}

/**
 * Check analysis status for an HOA
 */
export async function getAnalysisStatus(hoaId) {
  try {
    const supabase = createServiceClient()

    const { data: hoa } = await supabase
      .from('hoa_profiles')
      .select('overall_score, data_completeness, last_updated')
      .eq('id', hoaId)
      .single()

    if (!hoa) {
      return { status: 'not_found', progress: 0 }
    }

    if (hoa.overall_score !== null) {
      return {
        status: 'completed',
        progress: 100,
        completeness: hoa.data_completeness,
        lastUpdated: hoa.last_updated
      }
    }

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
      return { status: job.status, progress: progressMap[job.status] || 0 }
    }

    return { status: 'pending', progress: 0 }
  } catch (error) {
    console.error('Get analysis status error:', error)
    return { status: 'error', progress: 0, error: error.message }
  }
}

/**
 * Manually trigger HOA analysis (for admin or retry)
 */
export async function triggerAnalysis(hoaId) {
  try {
    const supabase = createServiceClient()

    const { data: hoa } = await supabase
      .from('hoa_profiles')
      .select('*')
      .eq('id', hoaId)
      .single()

    if (!hoa) {
      return { success: false, error: 'HOA not found' }
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
          state: hoa.state || 'FL'
        }
      })

    return { success: true, message: 'Analysis queued successfully' }
  } catch (error) {
    console.error('Trigger analysis error:', error)
    return { success: false, error: error.message }
  }
}
