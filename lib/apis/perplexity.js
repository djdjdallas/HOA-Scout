/**
 * Perplexity API Integration
 * Used to search for real HOA management company information
 *
 * Pricing: $5 per 1,000 searches (very affordable)
 * Docs: https://docs.perplexity.ai/
 */

import { logApiUsage, checkRateLimit } from '@/lib/supabase/server'

const PERPLEXITY_API_BASE = 'https://api.perplexity.ai/chat/completions'

/**
 * Extract potential subdivision/community name from HOA name or address
 * @param {string} hoaName - The HOA name (often "HOA at [address]")
 * @param {string} city - City name
 * @returns {string[]} Array of potential search terms
 */
function extractSearchTerms(hoaName, city) {
  const searchTerms = []

  // If it's a generic "HOA at [address]" name, extract street name
  if (hoaName.toLowerCase().startsWith('hoa at ')) {
    const address = hoaName.substring(7) // Remove "HOA at "

    // Extract street name (remove house number)
    const streetMatch = address.match(/^\d+\s+(.+)$/i)
    if (streetMatch) {
      const streetName = streetMatch[1]
        .replace(/\b(court|ct|street|st|drive|dr|lane|ln|avenue|ave|road|rd|way|place|pl|circle|cir|boulevard|blvd)\b\.?$/i, '')
        .trim()

      if (streetName) {
        // Add variations: "Rio Sands HOA", "Rio Sands Homeowners"
        searchTerms.push(`${streetName} HOA`)
        searchTerms.push(`${streetName} Homeowners Association`)
      }
    }
  } else {
    // Use the HOA name as-is
    searchTerms.push(hoaName)
  }

  return searchTerms
}

/**
 * Search for HOA management company and contact information
 * Uses a multi-step search strategy:
 * 1. Try to find by subdivision/community name
 * 2. Search by zip code for major management companies
 *
 * @param {string} hoaName - Name of the HOA
 * @param {string} city - City
 * @param {string} state - State abbreviation
 * @param {string} zip - ZIP code
 * @param {string} streetAddress - Optional full street address for context
 * @returns {Promise<Object>} HOA information with confidence level
 */
export async function searchHOAInfo(hoaName, city, state, zip, streetAddress = null) {
  const apiKey = process.env.PERPLEXITY_API_KEY

  if (!apiKey) {
    console.warn('⚠️ [PERPLEXITY] API key not found, using mock data')
    return {
      success: false,
      foundInfo: false,
      error: 'API key not configured'
    }
  }

  // Check rate limit (50 requests per hour to control costs)
  const canProceed = await checkRateLimit('perplexity', 50)
  if (!canProceed) {
    console.warn('⚠️ [PERPLEXITY] Rate limit exceeded, using mock data')
    return {
      success: false,
      foundInfo: false,
      error: 'Rate limit exceeded'
    }
  }

  const startTime = Date.now()

  try {
    // Generate smart search terms
    const searchTerms = extractSearchTerms(hoaName, city)
    const primarySearch = searchTerms[0] || hoaName

    console.log(`🔍 [PERPLEXITY] Search strategy:`)
    console.log(`   Primary: "${primarySearch}"`)
    console.log(`   Location: ${city}, ${state} ${zip}`)
    if (streetAddress) console.log(`   Address: ${streetAddress}`)

    const response = await fetch(PERPLEXITY_API_BASE, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [{
          role: 'system',
          content: `You are an expert at finding HOA and homeowners association management information from public sources.

CRITICAL: Respond with ONLY a valid JSON object, no markdown, no explanations, no code blocks.

Required JSON format:
{
  "subdivisionName": "Name of the subdivision/community or null",
  "managementCompany": "Company Name or null",
  "phone": "Phone number or null",
  "email": "Email or null",
  "website": "Website URL or null",
  "address": "Mailing address or null",
  "monthlyFee": "Monthly fee amount as string or null",
  "hoaExists": true or false,
  "foundOnline": true or false
}`
        }, {
          role: 'user',
          content: `I need to find HOA information for a property at this location:
- City: ${city}, ${state} ${zip}
${streetAddress ? `- Street Address: ${streetAddress}` : ''}
- Possible HOA/Subdivision Name: ${primarySearch}

IMPORTANT SEARCH STRATEGY:
1. First, try to identify what subdivision, master-planned community, or neighborhood this address belongs to in ${city}, ${state}
2. Look for the HOA management company that serves this area
3. Search for common Las Vegas/Nevada HOA management companies that might serve zip code ${zip}:
   - CCMC (Community Association Management Company)
   - FirstService Residential
   - Associa
   - Terra West Management Services
   - Eugene Burger Management Corporation
   - Level Property Management
   - Real Properties Management Group

Search these sources:
- Nevada Secretary of State business entity search
- Clark County Assessor records (if Nevada)
- HOA management company websites and portals
- Community/subdivision websites
- Real estate listing sites that mention HOA info

Return the subdivision name if you can identify it, even if you can't find contact details.
If you cannot find specific verified information, set those fields to null.
Set hoaExists to true if there appears to be an HOA, false if the area has no HOA, or null if unknown.`
        }],
        return_citations: true,
        max_tokens: 1500,
        temperature: 0.1
      })
    })

    const responseTime = Date.now() - startTime

    // Log API usage
    await logApiUsage('perplexity', {
      endpoint: '/chat/completions',
      response_time_ms: responseTime,
      status_code: response.status
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('❌ [PERPLEXITY] API Error:', response.status, errorData)
      throw new Error(`Perplexity API error: ${response.status}`)
    }

    const data = await response.json()
    let responseText = data.choices?.[0]?.message?.content || ''

    console.log('🔍 [PERPLEXITY] Raw response length:', responseText.length)

    // Strip markdown code blocks if present (same pattern as claude.js)
    let cleanedResponse = responseText.trim()
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.slice(7)
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.slice(3)
    }
    if (cleanedResponse.endsWith('```')) {
      cleanedResponse = cleanedResponse.slice(0, -3)
    }
    cleanedResponse = cleanedResponse.trim()

    // Parse JSON response
    let hoaInfo
    try {
      hoaInfo = JSON.parse(cleanedResponse)
    } catch (parseError) {
      console.error('❌ [PERPLEXITY] JSON parse error:', parseError.message)
      console.error('❌ [PERPLEXITY] Response was:', cleanedResponse.substring(0, 500))
      return {
        success: false,
        foundInfo: false,
        error: 'Invalid JSON response'
      }
    }

    // Extract citations from Perplexity response
    const citations = data.citations || []

    console.log('✅ [PERPLEXITY] Found HOA info:', {
      subdivisionName: hoaInfo.subdivisionName || 'Not found',
      hasManagementCompany: !!hoaInfo.managementCompany,
      hasContact: !!(hoaInfo.phone || hoaInfo.email),
      hasWebsite: !!hoaInfo.website,
      hoaExists: hoaInfo.hoaExists,
      foundOnline: hoaInfo.foundOnline,
      citationCount: citations.length
    })

    // Determine if we found useful information
    const foundInfo = !!(
      hoaInfo.managementCompany ||
      hoaInfo.website ||
      hoaInfo.phone ||
      hoaInfo.email ||
      hoaInfo.subdivisionName
    )

    return {
      success: true,
      foundInfo,
      subdivisionName: hoaInfo.subdivisionName || null,
      managementCompany: hoaInfo.managementCompany || null,
      contactInfo: {
        phone: hoaInfo.phone || null,
        email: hoaInfo.email || null,
        website: hoaInfo.website || null,
        address: hoaInfo.address || null
      },
      monthlyFee: hoaInfo.monthlyFee || null,
      hoaExists: hoaInfo.hoaExists,
      sources: citations,
      foundOnline: hoaInfo.foundOnline === true,
      responseTimeMs: responseTime,
      searchStrategy: {
        primaryTerm: primarySearch,
        allTerms: searchTerms
      }
    }
  } catch (error) {
    const responseTime = Date.now() - startTime

    // Log error
    await logApiUsage('perplexity', {
      endpoint: '/chat/completions',
      error_message: error.message,
      response_time_ms: responseTime,
      status_code: 500
    })

    console.error('❌ [PERPLEXITY] Search error:', error.message)
    return {
      success: false,
      foundInfo: false,
      error: error.message
    }
  }
}

/**
 * Search for HOA management companies serving a specific zip code
 * This is a fallback when we can't find the specific HOA
 *
 * @param {string} zip - ZIP code
 * @param {string} city - City
 * @param {string} state - State abbreviation
 * @returns {Promise<Object>} List of management companies in the area
 */
export async function searchManagementCompaniesByZip(zip, city, state) {
  const apiKey = process.env.PERPLEXITY_API_KEY

  if (!apiKey) {
    return {
      success: false,
      foundInfo: false,
      error: 'API key not configured'
    }
  }

  // Check rate limit
  const canProceed = await checkRateLimit('perplexity', 50)
  if (!canProceed) {
    return {
      success: false,
      foundInfo: false,
      error: 'Rate limit exceeded'
    }
  }

  const startTime = Date.now()

  try {
    console.log(`🔍 [PERPLEXITY] Searching for management companies in ${zip}`)

    const response = await fetch(PERPLEXITY_API_BASE, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [{
          role: 'system',
          content: `You are an expert at finding HOA management companies.

CRITICAL: Respond with ONLY a valid JSON object, no markdown, no explanations, no code blocks.

Required JSON format:
{
  "companies": [
    {
      "name": "Company Name",
      "phone": "Phone or null",
      "website": "Website or null",
      "servesArea": true
    }
  ],
  "totalFound": number,
  "commonSubdivisions": ["subdivision names in this zip code"]
}`
        }, {
          role: 'user',
          content: `Find HOA management companies that serve ${city}, ${state} ${zip}.

List the top management companies in this area with their contact information.
Also list any known subdivisions or master-planned communities in zip code ${zip}.

Focus on well-known regional companies like:
- CCMC, FirstService Residential, Associa, Terra West, Eugene Burger Management
- Any local/regional management companies

Search Nevada Secretary of State records and management company websites.`
        }],
        return_citations: true,
        max_tokens: 1500,
        temperature: 0.1
      })
    })

    const responseTime = Date.now() - startTime

    await logApiUsage('perplexity', {
      endpoint: '/chat/completions',
      response_time_ms: responseTime,
      status_code: response.status
    })

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`)
    }

    const data = await response.json()
    let responseText = data.choices?.[0]?.message?.content || ''

    // Clean response
    let cleanedResponse = responseText.trim()
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.slice(7)
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.slice(3)
    }
    if (cleanedResponse.endsWith('```')) {
      cleanedResponse = cleanedResponse.slice(0, -3)
    }

    const result = JSON.parse(cleanedResponse.trim())
    const citations = data.citations || []

    console.log('✅ [PERPLEXITY] Found management companies:', {
      count: result.companies?.length || 0,
      subdivisions: result.commonSubdivisions?.length || 0
    })

    return {
      success: true,
      foundInfo: (result.companies?.length || 0) > 0,
      companies: result.companies || [],
      commonSubdivisions: result.commonSubdivisions || [],
      sources: citations,
      responseTimeMs: responseTime
    }
  } catch (error) {
    console.error('❌ [PERPLEXITY] Zip search error:', error.message)
    return {
      success: false,
      foundInfo: false,
      error: error.message
    }
  }
}

/**
 * Search for HOA reviews and community sentiment
 * @param {string} hoaName - Name of the HOA
 * @param {string} managementCompany - Name of the management company (if known)
 * @param {string} city - City
 * @param {string} state - State abbreviation
 * @returns {Promise<Object>} Community feedback with sources
 */
export async function searchHOAReviews(hoaName, managementCompany, city, state) {
  const apiKey = process.env.PERPLEXITY_API_KEY

  if (!apiKey) {
    return {
      success: false,
      foundInfo: false,
      error: 'API key not configured'
    }
  }

  // Check rate limit
  const canProceed = await checkRateLimit('perplexity', 50)
  if (!canProceed) {
    return {
      success: false,
      foundInfo: false,
      error: 'Rate limit exceeded'
    }
  }

  const startTime = Date.now()

  try {
    console.log(`🔍 [PERPLEXITY] Searching for reviews: ${hoaName} in ${city}, ${state}`)

    const searchTarget = managementCompany
      ? `"${hoaName}" HOA or "${managementCompany}" management company`
      : `"${hoaName}" HOA`

    const response = await fetch(PERPLEXITY_API_BASE, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [{
          role: 'system',
          content: `You are an expert at finding HOA reviews and community feedback from public sources.

CRITICAL: Respond with ONLY a valid JSON object, no markdown, no explanations, no code blocks.

Required JSON format:
{
  "overallSentiment": "positive" or "negative" or "mixed" or "unknown",
  "reviewCount": number or 0,
  "averageRating": number (1-5) or null,
  "commonComplaints": ["complaint 1", "complaint 2"],
  "commonPraise": ["positive 1", "positive 2"],
  "redditMentions": number or 0,
  "googleReviewRating": number or null,
  "bbbRating": "A+" or "A" or "B" etc or null,
  "foundOnline": true or false
}`
        }, {
          role: 'user',
          content: `Search for reviews and community feedback about ${searchTarget} in ${city}, ${state}.

Look for:
1. Google reviews of the management company
2. BBB (Better Business Bureau) complaints and rating
3. Reddit posts mentioning this HOA or management company
4. Yelp reviews of the management company
5. HOA review sites like HOAForum, BiggerPockets, etc.

Summarize the overall sentiment and common themes. If no reviews found, set foundOnline to false.`
        }],
        return_citations: true,
        max_tokens: 1500,
        temperature: 0.1
      })
    })

    const responseTime = Date.now() - startTime

    await logApiUsage('perplexity', {
      endpoint: '/chat/completions',
      response_time_ms: responseTime,
      status_code: response.status
    })

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`)
    }

    const data = await response.json()
    let responseText = data.choices?.[0]?.message?.content || ''

    // Clean response
    let cleanedResponse = responseText.trim()
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.slice(7)
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.slice(3)
    }
    if (cleanedResponse.endsWith('```')) {
      cleanedResponse = cleanedResponse.slice(0, -3)
    }

    const reviewInfo = JSON.parse(cleanedResponse.trim())
    const citations = data.citations || []

    console.log('✅ [PERPLEXITY] Found review info:', {
      sentiment: reviewInfo.overallSentiment,
      reviewCount: reviewInfo.reviewCount,
      foundOnline: reviewInfo.foundOnline
    })

    return {
      success: true,
      foundInfo: reviewInfo.foundOnline === true,
      sentiment: reviewInfo.overallSentiment || 'unknown',
      reviewCount: reviewInfo.reviewCount || 0,
      averageRating: reviewInfo.averageRating,
      commonComplaints: reviewInfo.commonComplaints || [],
      commonPraise: reviewInfo.commonPraise || [],
      redditMentions: reviewInfo.redditMentions || 0,
      googleReviewRating: reviewInfo.googleReviewRating,
      bbbRating: reviewInfo.bbbRating,
      sources: citations
    }
  } catch (error) {
    console.error('❌ [PERPLEXITY] Review search error:', error.message)
    return {
      success: false,
      foundInfo: false,
      error: error.message
    }
  }
}
