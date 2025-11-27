/**
 * Server Action: Enrich HOA data using Perplexity API
 * On-demand enrichment that searches for real HOA contact info, management company details, etc.
 */

'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { searchHOAInfo } from '@/lib/apis/perplexity'
import { revalidatePath } from 'next/cache'

/**
 * Enrich HOA data with Perplexity web search
 * @param {string} hoaId - The HOA profile ID
 * @param {boolean} force - Force re-enrichment even if already enriched
 * @returns {Promise<Object>} Enrichment result
 */
export async function enrichHOAData(hoaId, force = false) {
  const supabase = createServiceClient()

  try {
    // 1. Get HOA basic info
    const { data: hoa, error: fetchError } = await supabase
      .from('hoa_profiles')
      .select('*')
      .eq('id', hoaId)
      .single()

    if (fetchError || !hoa) {
      console.error('❌ [ENRICH] HOA not found:', hoaId)
      return {
        success: false,
        error: 'HOA not found'
      }
    }

    console.log(`🔍 [ENRICH] Starting enrichment for: ${hoa.hoa_name}`)

    // 2. Check if already enriched (within last 30 days)
    if (!force && hoa.public_records?.enriched) {
      const enrichedAt = new Date(hoa.public_records.enrichedAt)
      const daysSinceEnriched = (Date.now() - enrichedAt) / (1000 * 60 * 60 * 24)

      if (daysSinceEnriched < 30) {
        console.log(`✅ [ENRICH] Using cached enrichment (${Math.floor(daysSinceEnriched)} days old)`)
        return {
          success: true,
          cached: true,
          data: hoa.public_records,
          found: hoa.public_records.perplexityResponse?.foundInfo || false
        }
      }

      console.log(`⚠️ [ENRICH] Enrichment is ${Math.floor(daysSinceEnriched)} days old, refreshing...`)
    }

    // 3. Call Perplexity API
    console.log(`🌐 [ENRICH] Calling Perplexity API for: ${hoa.hoa_name}, ${hoa.city}, ${hoa.state} ${hoa.zip_code}`)

    const perplexityResult = await searchHOAInfo(
      hoa.hoa_name,
      hoa.city,
      hoa.state,
      hoa.zip_code,
      hoa.address
    )

    if (!perplexityResult.success) {
      console.error('❌ [ENRICH] Perplexity search failed:', perplexityResult.error)

      // Store the failed attempt so we don't retry immediately
      const failedEnrichment = {
        ...hoa.public_records,
        enriched: true,
        enrichedAt: new Date().toISOString(),
        source: 'Perplexity Search (Failed)',
        confidence: 'low',
        error: perplexityResult.error,
        perplexityResponse: {
          foundInfo: false,
          error: perplexityResult.error
        }
      }

      await supabase
        .from('hoa_profiles')
        .update({
          public_records: failedEnrichment,
          last_updated: new Date().toISOString()
        })
        .eq('id', hoaId)

      return {
        success: true, // API call succeeded, just no data found
        cached: false,
        data: failedEnrichment,
        found: false
      }
    }

    // 4. Build enriched public_records
    const enrichedData = {
      ...hoa.public_records,
      enriched: true,
      enrichedAt: new Date().toISOString(),
      source: perplexityResult.foundInfo ? 'Perplexity Web Search' : 'Limited Data Available',
      confidence: perplexityResult.foundInfo ? 'medium' : 'low',

      // Real data from Perplexity
      managementCompany: {
        name: perplexityResult.managementCompany || hoa.management_company || null,
        verified: !!perplexityResult.managementCompany,
        source: perplexityResult.managementCompany ? 'web_search' : 'sunbiz'
      },
      contactInfo: {
        phone: perplexityResult.contactInfo?.phone || null,
        email: perplexityResult.contactInfo?.email || null,
        website: perplexityResult.contactInfo?.website || null,
        address: perplexityResult.contactInfo?.address || null,
        verified: perplexityResult.foundInfo
      },
      subdivisionName: perplexityResult.subdivisionName || null,
      monthlyFeeEstimate: perplexityResult.monthlyFee || null,
      hoaExists: perplexityResult.hoaExists,

      // Store raw response for debugging
      perplexityResponse: {
        foundInfo: perplexityResult.foundInfo,
        foundOnline: perplexityResult.foundOnline,
        sources: perplexityResult.sources || [],
        searchStrategy: perplexityResult.searchStrategy,
        responseTimeMs: perplexityResult.responseTimeMs
      }
    }

    console.log(`✅ [ENRICH] Enrichment complete:`, {
      foundInfo: perplexityResult.foundInfo,
      managementCompany: enrichedData.managementCompany?.name,
      hasContact: !!(enrichedData.contactInfo?.phone || enrichedData.contactInfo?.email),
      subdivisionName: enrichedData.subdivisionName
    })

    // 5. Update database
    const updateData = {
      public_records: enrichedData,
      last_updated: new Date().toISOString()
    }

    // Update management_company if we found one and it's better than what we have
    if (perplexityResult.managementCompany && !hoa.management_company) {
      updateData.management_company = perplexityResult.managementCompany
    }

    // Update monthly_fee if we found one and don't have one
    if (perplexityResult.monthlyFee && !hoa.monthly_fee) {
      // Try to parse the fee (e.g., "$150/month" -> 150)
      const feeMatch = perplexityResult.monthlyFee.match(/\$?(\d+(?:,\d+)?(?:\.\d+)?)/);
      if (feeMatch) {
        updateData.monthly_fee = parseFloat(feeMatch[1].replace(',', ''))
      }
    }

    const { error: updateError } = await supabase
      .from('hoa_profiles')
      .update(updateData)
      .eq('id', hoaId)

    if (updateError) {
      console.error('❌ [ENRICH] Database update failed:', updateError)
      return {
        success: false,
        error: 'Failed to save enrichment data'
      }
    }

    // 6. Revalidate the report page
    revalidatePath(`/reports/${hoaId}`)

    return {
      success: true,
      cached: false,
      data: enrichedData,
      found: perplexityResult.foundInfo
    }
  } catch (error) {
    console.error('❌ [ENRICH] Unexpected error:', error)
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    }
  }
}

/**
 * Check enrichment status for an HOA
 * @param {string} hoaId - The HOA profile ID
 * @returns {Promise<Object>} Enrichment status
 */
export async function checkEnrichmentStatus(hoaId) {
  const supabase = createServiceClient()

  try {
    const { data: hoa, error } = await supabase
      .from('hoa_profiles')
      .select('public_records')
      .eq('id', hoaId)
      .single()

    if (error || !hoa) {
      return {
        enriched: false,
        enrichedAt: null,
        found: false
      }
    }

    const publicRecords = hoa.public_records || {}

    return {
      enriched: publicRecords.enriched || false,
      enrichedAt: publicRecords.enrichedAt || null,
      found: publicRecords.perplexityResponse?.foundInfo || false,
      confidence: publicRecords.confidence || 'low',
      managementCompany: publicRecords.managementCompany || null,
      contactInfo: publicRecords.contactInfo || null,
      subdivisionName: publicRecords.subdivisionName || null,
      source: publicRecords.source || null
    }
  } catch (error) {
    console.error('❌ [ENRICH] Status check error:', error)
    return {
      enriched: false,
      enrichedAt: null,
      found: false
    }
  }
}
