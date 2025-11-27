/**
 * Perplexity API Integration
 * Used to search for real HOA management company information
 * Optimized for Florida HOAs
 *
 * Pricing: ~$0.01 per search (sonar-pro)
 * Docs: https://docs.perplexity.ai/
 */

import { logApiUsage, checkRateLimit } from '@/lib/supabase/server'

const PERPLEXITY_API_BASE = 'https://api.perplexity.ai/chat/completions'

// Florida-specific management companies (largest in state)
const FLORIDA_MANAGEMENT_COMPANIES = [
  'FirstService Residential',
  'Associa',
  'Sentry Management',
  'Castle Group',
  'Leland Management',
  'Vesta Property Services',
  'KW Property Management',
  'Seacrest Services',
  'Campbell Property Management',
  'Greenacre Properties',
  'Sterling Property Services',
  'RealManage',
  'Beacon Community Management',
  'Alliant Property Management',
  'Trident Association Management'
]

/**
 * Extract potential subdivision/community name from HOA name or address
 */
function extractSearchTerms(hoaName, city) {
  const searchTerms = []

  // If it's a generic "HOA at [address]" name, extract street name
  if (hoaName.toLowerCase().startsWith('hoa at ')) {
    const address = hoaName.substring(7)

    // Extract street name (remove house number)
    const streetMatch = address.match(/^\d+\s+(.+)$/i)
    if (streetMatch) {
      const streetName = streetMatch[1]
        .replace(/\b(court|ct|street|st|drive|dr|lane|ln|avenue|ave|road|rd|way|place|pl|circle|cir|boulevard|blvd|terrace|ter|trail|trl)\b\.?$/i, '')
        .trim()

      if (streetName) {
        searchTerms.push(`${streetName} HOA`)
        searchTerms.push(`${streetName} Homeowners Association`)
        searchTerms.push(`${streetName} ${city}`)
      }
    }
  } else {
    searchTerms.push(hoaName)
    // Also try without common suffixes
    const cleanName = hoaName
      .replace(/\b(homeowners association|hoa|inc\.?|llc|property owners association|poa)\b/gi, '')
      .trim()
    if (cleanName !== hoaName) {
      searchTerms.push(cleanName)
    }
  }

  return searchTerms
}

/**
 * Get Florida county from zip code (approximate mapping for major counties)
 */
function getCountyFromZip(zip) {
  const zipPrefix = zip.substring(0, 3)
  const countyMap = {
    '330': 'Miami-Dade',
    '331': 'Miami-Dade',
    '332': 'Miami-Dade',
    '333': 'Broward',
    '334': 'Palm Beach',
    '335': 'Indian River',
    '336': 'Polk',
    '337': 'Hillsborough',
    '338': 'Manatee',
    '339': 'Charlotte',
    '340': 'Lee',
    '341': 'Collier',
    '342': 'Orange',
    '346': 'Brevard',
    '347': 'Volusia',
    '320': 'Duval',
    '321': 'St. Johns',
    '322': 'Alachua',
    '323': 'Leon',
    '324': 'Escambia'
  }
  return countyMap[zipPrefix] || null
}

/**
 * Search for HOA management company and contact information
 * Optimized for Florida HOAs with SunBiz and county-specific searches
 */
export async function searchHOAInfo(hoaName, city, state, zip, streetAddress = null) {
  const apiKey = process.env.PERPLEXITY_API_KEY

  if (!apiKey) {
    console.warn('⚠️ [PERPLEXITY] API key not found')
    return { success: false, foundInfo: false, error: 'API key not configured' }
  }

  const canProceed = await checkRateLimit('perplexity', 100)
  if (!canProceed) {
    console.warn('⚠️ [PERPLEXITY] Rate limit exceeded')
    return { success: false, foundInfo: false, error: 'Rate limit exceeded' }
  }

  const startTime = Date.now()
  const county = getCountyFromZip(zip)

  try {
    const searchTerms = extractSearchTerms(hoaName, city)
    const primarySearch = searchTerms[0] || hoaName

    console.log(`🔍 [PERPLEXITY] Florida HOA Search:`)
    console.log(`   Primary: "${primarySearch}"`)
    console.log(`   Location: ${city}, FL ${zip} (${county || 'Unknown'} County)`)

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
          content: `You are an expert at finding Florida HOA and homeowners association information from public sources.

CRITICAL: Respond with ONLY a valid JSON object, no markdown, no explanations, no code blocks.

Required JSON format:
{
  "subdivisionName": "Name of subdivision/community or null",
  "managementCompany": "Company name or null",
  "phone": "Phone number or null",
  "email": "Email or null",
  "website": "Website URL or null",
  "address": "Mailing address or null",
  "monthlyFee": "Monthly fee amount or null",
  "hoaExists": true or false or null,
  "yearEstablished": number or null,
  "totalUnits": number or null,
  "amenities": ["pool", "gym", "clubhouse"] or [],
  "masterAssociation": "Master HOA name if applicable or null",
  "sunbizStatus": "Active" or "Inactive" or "Dissolved" or null,
  "registeredAgent": "Registered agent name or null",
  "documentNumber": "Florida corporation document number or null",
  "is55Plus": true or false or null,
  "foundOnline": true or false
}`
        }, {
          role: 'user',
          content: `Find HOA information for a property in Florida:

LOCATION:
- City: ${city}, FL ${zip}
- County: ${county || 'Unknown'} County
${streetAddress ? `- Street Address: ${streetAddress}` : ''}
- HOA/Subdivision Name: ${primarySearch}

FLORIDA-SPECIFIC SEARCH STRATEGY:

1. FLORIDA SUNBIZ (sunbiz.org) - Search for:
   - "${primarySearch}" or variations with "Homeowners", "Property Owners", "Association"
   - Get corporation document number, status (Active/Inactive), registered agent
   - Check if annual reports are current

2. FLORIDA DBPR (myfloridalicense.com):
   - Search for Community Association Manager licenses in ${city}
   - Look for management companies licensed in ${county || 'this'} County

3. MAJOR FLORIDA HOA MANAGEMENT COMPANIES:
   ${FLORIDA_MANAGEMENT_COMPANIES.slice(0, 8).map(c => `- ${c}`).join('\n   ')}

4. COUNTY-SPECIFIC SEARCHES:
   - ${county || 'County'} Property Appraiser for subdivision info
   - ${county || 'County'} Clerk for recorded HOA documents/covenants

5. COMMUNITY RESOURCES:
   - HOA/subdivision websites
   - Management company portals (often have community search)
   - Real estate listings mentioning HOA details
   - Local news articles about this HOA

IMPORTANT:
- Return the subdivision/community name even if you can't find other details
- If this is part of a master-planned community, include the master association name
- Check if this is a 55+ community
- Set hoaExists to false if you confirm there is NO HOA for this area
- Set foundOnline to true only if you found verifiable information`
        }],
        return_citations: true,
        max_tokens: 2000,
        temperature: 0.1
      })
    })

    const responseTime = Date.now() - startTime

    await logApiUsage('perplexity', {
      endpoint: '/chat/completions',
      response_time_ms: responseTime,
      status_code: response.status,
      search_type: 'hoa_info'
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('❌ [PERPLEXITY] API Error:', response.status, errorData)
      throw new Error(`Perplexity API error: ${response.status}`)
    }

    const data = await response.json()
    let responseText = data.choices?.[0]?.message?.content || ''

    // Strip markdown code blocks
    let cleanedResponse = responseText.trim()
    if (cleanedResponse.startsWith('```json')) cleanedResponse = cleanedResponse.slice(7)
    else if (cleanedResponse.startsWith('```')) cleanedResponse = cleanedResponse.slice(3)
    if (cleanedResponse.endsWith('```')) cleanedResponse = cleanedResponse.slice(0, -3)
    cleanedResponse = cleanedResponse.trim()

    let hoaInfo
    try {
      hoaInfo = JSON.parse(cleanedResponse)
    } catch (parseError) {
      console.error('❌ [PERPLEXITY] JSON parse error:', parseError.message)
      return { success: false, foundInfo: false, error: 'Invalid JSON response' }
    }

    const citations = data.citations || []

    console.log('✅ [PERPLEXITY] Florida HOA info found:', {
      subdivision: hoaInfo.subdivisionName || 'Not found',
      management: hoaInfo.managementCompany || 'Not found',
      sunbiz: hoaInfo.sunbizStatus || 'Not checked',
      is55Plus: hoaInfo.is55Plus,
      citationCount: citations.length
    })

    const foundInfo = !!(
      hoaInfo.managementCompany ||
      hoaInfo.website ||
      hoaInfo.phone ||
      hoaInfo.subdivisionName ||
      hoaInfo.documentNumber
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
      yearEstablished: hoaInfo.yearEstablished || null,
      totalUnits: hoaInfo.totalUnits || null,
      amenities: hoaInfo.amenities || [],
      masterAssociation: hoaInfo.masterAssociation || null,
      sunbiz: {
        status: hoaInfo.sunbizStatus || null,
        registeredAgent: hoaInfo.registeredAgent || null,
        documentNumber: hoaInfo.documentNumber || null
      },
      is55Plus: hoaInfo.is55Plus || false,
      sources: citations,
      foundOnline: hoaInfo.foundOnline === true,
      responseTimeMs: responseTime,
      county,
      searchStrategy: { primaryTerm: primarySearch, allTerms: searchTerms }
    }
  } catch (error) {
    console.error('❌ [PERPLEXITY] Search error:', error.message)
    return { success: false, foundInfo: false, error: error.message }
  }
}

/**
 * Search for HOA management companies serving a specific Florida zip code
 */
export async function searchManagementCompaniesByZip(zip, city, state) {
  const apiKey = process.env.PERPLEXITY_API_KEY

  if (!apiKey) {
    return { success: false, foundInfo: false, error: 'API key not configured' }
  }

  const canProceed = await checkRateLimit('perplexity', 100)
  if (!canProceed) {
    return { success: false, foundInfo: false, error: 'Rate limit exceeded' }
  }

  const startTime = Date.now()
  const county = getCountyFromZip(zip)

  try {
    console.log(`🔍 [PERPLEXITY] Searching Florida management companies in ${zip}`)

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
          content: `You are an expert at finding Florida HOA management companies.

CRITICAL: Respond with ONLY a valid JSON object, no markdown, no code blocks.

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
  "commonSubdivisions": ["subdivision names in this zip"],
  "masterCommunities": ["master-planned community names"]
}`
        }, {
          role: 'user',
          content: `Find HOA management companies serving ${city}, FL ${zip} (${county || 'Florida'} County).

List management companies with verified presence in this area.

FLORIDA MANAGEMENT COMPANIES TO CHECK:
${FLORIDA_MANAGEMENT_COMPANIES.map(c => `- ${c}`).join('\n')}

Also search:
- Florida DBPR licensed Community Association Managers in ${county || 'this'} County
- Local/regional Florida management companies

Include any known subdivisions or master-planned communities in zip ${zip}.`
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
      status_code: response.status,
      search_type: 'zip_companies'
    })

    if (!response.ok) throw new Error(`Perplexity API error: ${response.status}`)

    const data = await response.json()
    let responseText = data.choices?.[0]?.message?.content || ''

    let cleanedResponse = responseText.trim()
    if (cleanedResponse.startsWith('```json')) cleanedResponse = cleanedResponse.slice(7)
    else if (cleanedResponse.startsWith('```')) cleanedResponse = cleanedResponse.slice(3)
    if (cleanedResponse.endsWith('```')) cleanedResponse = cleanedResponse.slice(0, -3)

    const result = JSON.parse(cleanedResponse.trim())
    const citations = data.citations || []

    console.log('✅ [PERPLEXITY] Found FL management companies:', {
      count: result.companies?.length || 0,
      subdivisions: result.commonSubdivisions?.length || 0
    })

    return {
      success: true,
      foundInfo: (result.companies?.length || 0) > 0,
      companies: result.companies || [],
      commonSubdivisions: result.commonSubdivisions || [],
      masterCommunities: result.masterCommunities || [],
      sources: citations,
      responseTimeMs: responseTime,
      county
    }
  } catch (error) {
    console.error('❌ [PERPLEXITY] Zip search error:', error.message)
    return { success: false, foundInfo: false, error: error.message }
  }
}

/**
 * Search Florida SunBiz for HOA corporation details
 */
export async function searchFloridaSunBiz(hoaName, city) {
  const apiKey = process.env.PERPLEXITY_API_KEY

  if (!apiKey) {
    return { success: false, foundInfo: false, error: 'API key not configured' }
  }

  const canProceed = await checkRateLimit('perplexity', 100)
  if (!canProceed) {
    return { success: false, foundInfo: false, error: 'Rate limit exceeded' }
  }

  const startTime = Date.now()

  try {
    console.log(`🔍 [PERPLEXITY] Searching Florida SunBiz for: ${hoaName}`)

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
          content: `You are an expert at searching Florida SunBiz corporation records.

CRITICAL: Respond with ONLY valid JSON, no markdown, no code blocks.

Required JSON format:
{
  "found": true or false,
  "corporationName": "Official registered name",
  "documentNumber": "Florida document number (e.g., N12345678)",
  "status": "Active" or "Inactive" or "Dissolved",
  "filingDate": "YYYY-MM-DD or null",
  "lastAnnualReport": "YYYY-MM-DD or null",
  "registeredAgent": {
    "name": "Agent name",
    "address": "Agent address"
  },
  "principalAddress": "Principal business address",
  "mailingAddress": "Mailing address or null",
  "officers": [{"name": "Name", "title": "Title"}],
  "feiNumber": "Federal EIN if listed or null"
}`
        }, {
          role: 'user',
          content: `Search Florida SunBiz (sunbiz.org) for this HOA:

HOA Name: "${hoaName}"
City: ${city}, Florida

Search variations:
- "${hoaName}"
- "${hoaName} Inc"
- "${hoaName} Homeowners Association"
- "${hoaName} Property Owners Association"

From SunBiz records, extract:
1. Official corporation name and document number
2. Status (Active/Inactive/Dissolved)
3. Filing date and last annual report date
4. Registered agent name and address
5. Principal address
6. Current officers (President, Secretary, Treasurer)

Only return data you find on SunBiz. Set found to false if no matching corporation exists.`
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
      status_code: response.status,
      search_type: 'sunbiz'
    })

    if (!response.ok) throw new Error(`Perplexity API error: ${response.status}`)

    const data = await response.json()
    let responseText = data.choices?.[0]?.message?.content || ''

    let cleanedResponse = responseText.trim()
    if (cleanedResponse.startsWith('```json')) cleanedResponse = cleanedResponse.slice(7)
    else if (cleanedResponse.startsWith('```')) cleanedResponse = cleanedResponse.slice(3)
    if (cleanedResponse.endsWith('```')) cleanedResponse = cleanedResponse.slice(0, -3)

    const result = JSON.parse(cleanedResponse.trim())
    const citations = data.citations || []

    console.log('✅ [PERPLEXITY] SunBiz result:', {
      found: result.found,
      status: result.status,
      documentNumber: result.documentNumber
    })

    return {
      success: true,
      foundInfo: result.found === true,
      ...result,
      sources: citations,
      responseTimeMs: responseTime
    }
  } catch (error) {
    console.error('❌ [PERPLEXITY] SunBiz search error:', error.message)
    return { success: false, foundInfo: false, error: error.message }
  }
}

/**
 * Search for HOA financial information
 */
export async function searchHOAFinancials(hoaName, managementCompany, city, state, zip) {
  const apiKey = process.env.PERPLEXITY_API_KEY

  if (!apiKey) {
    return { success: false, foundInfo: false, error: 'API key not configured' }
  }

  const canProceed = await checkRateLimit('perplexity', 100)
  if (!canProceed) {
    return { success: false, foundInfo: false, error: 'Rate limit exceeded' }
  }

  const startTime = Date.now()

  try {
    console.log(`🔍 [PERPLEXITY] Searching financials for: ${hoaName}`)

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
          content: `You are an expert at finding HOA financial information from public sources.

CRITICAL: Respond with ONLY valid JSON, no markdown, no code blocks.

Required JSON format:
{
  "foundFinancials": true or false,
  "monthlyFee": "Amount as string or null",
  "quarterlyFee": "Amount if quarterly billing or null",
  "annualFee": "Amount if annual billing or null",
  "specialAssessments": [
    {"year": 2024, "amount": "$500", "reason": "Roof replacement"}
  ],
  "reserveFundPercent": number or null,
  "lastReserveStudy": "YYYY or null",
  "feeHistory": [
    {"year": 2024, "amount": "$350"},
    {"year": 2023, "amount": "$325"}
  ],
  "financialHealth": "healthy" or "concerning" or "unknown",
  "lawsuits": [{"year": 2023, "description": "Brief description"}],
  "delinquencyRate": number or null
}`
        }, {
          role: 'user',
          content: `Search for financial information about:

HOA: "${hoaName}"
${managementCompany ? `Management Company: ${managementCompany}` : ''}
Location: ${city}, FL ${zip}

Look for:
1. Monthly/quarterly/annual assessment amounts
2. Recent special assessments and reasons
3. Reserve fund status (% funded, last study)
4. Fee increase history over past 5 years
5. Any lawsuits, liens, or financial disputes
6. Delinquency rates if mentioned

Search real estate listings, HOA disclosure documents, news articles, and management company info.
Only include information you can verify from sources.`
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
      status_code: response.status,
      search_type: 'financials'
    })

    if (!response.ok) throw new Error(`Perplexity API error: ${response.status}`)

    const data = await response.json()
    let responseText = data.choices?.[0]?.message?.content || ''

    let cleanedResponse = responseText.trim()
    if (cleanedResponse.startsWith('```json')) cleanedResponse = cleanedResponse.slice(7)
    else if (cleanedResponse.startsWith('```')) cleanedResponse = cleanedResponse.slice(3)
    if (cleanedResponse.endsWith('```')) cleanedResponse = cleanedResponse.slice(0, -3)

    const result = JSON.parse(cleanedResponse.trim())
    const citations = data.citations || []

    console.log('✅ [PERPLEXITY] Financial info:', {
      found: result.foundFinancials,
      monthlyFee: result.monthlyFee,
      specialAssessments: result.specialAssessments?.length || 0
    })

    return {
      success: true,
      foundInfo: result.foundFinancials === true,
      ...result,
      sources: citations,
      responseTimeMs: responseTime
    }
  } catch (error) {
    console.error('❌ [PERPLEXITY] Financial search error:', error.message)
    return { success: false, foundInfo: false, error: error.message }
  }
}

/**
 * Search for HOA rules and CC&R information
 */
export async function searchHOARules(hoaName, subdivisionName, city, state) {
  const apiKey = process.env.PERPLEXITY_API_KEY

  if (!apiKey) {
    return { success: false, foundInfo: false, error: 'API key not configured' }
  }

  const canProceed = await checkRateLimit('perplexity', 100)
  if (!canProceed) {
    return { success: false, foundInfo: false, error: 'Rate limit exceeded' }
  }

  const startTime = Date.now()
  const searchName = subdivisionName || hoaName

  try {
    console.log(`🔍 [PERPLEXITY] Searching rules for: ${searchName}`)

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
          content: `You are an expert at finding HOA rules and restrictions from public sources.

CRITICAL: Respond with ONLY valid JSON, no markdown, no code blocks.

Required JSON format:
{
  "foundRules": true or false,
  "rentalRestrictions": {
    "shortTermAllowed": true or false or null,
    "minLeaseTerm": "6 months" or null,
    "rentalCapPercent": number or null,
    "ownerOccupiedRequired": number or null
  },
  "petRestrictions": {
    "allowed": true or false or null,
    "maxNumber": number or null,
    "weightLimit": "50 lbs" or null,
    "breedRestrictions": ["breed1"] or null
  },
  "parkingRules": {
    "guestParking": "description or null",
    "rvBoatAllowed": true or false or null,
    "garageRequired": true or false or null
  },
  "exteriorModifications": {
    "approvalRequired": true or false or null,
    "commonRestrictions": ["fence colors", "landscaping"]
  },
  "notableRules": ["Any unusual or strict rules"],
  "recentRuleChanges": ["Recent amendments if any"],
  "ccrsAvailableOnline": true or false
}`
        }, {
          role: 'user',
          content: `Search for rules and restrictions for:

HOA/Subdivision: "${searchName}"
Location: ${city}, FL

Find information about:
1. Rental restrictions (short-term/Airbnb, minimum lease terms, rental caps)
2. Pet policies (size limits, breed restrictions, number allowed)
3. Parking rules (guest parking, RV/boat storage, garage requirements)
4. Exterior modification rules (fencing, landscaping, paint colors)
5. Any unusual or notably strict rules
6. Recent rule changes or amendments

Also check:
- If CC&Rs are publicly available online
- Florida-specific HOA regulations that apply
- Any news about rule disputes or enforcement issues

Only include rules you can verify from actual sources.`
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
      status_code: response.status,
      search_type: 'rules'
    })

    if (!response.ok) throw new Error(`Perplexity API error: ${response.status}`)

    const data = await response.json()
    let responseText = data.choices?.[0]?.message?.content || ''

    let cleanedResponse = responseText.trim()
    if (cleanedResponse.startsWith('```json')) cleanedResponse = cleanedResponse.slice(7)
    else if (cleanedResponse.startsWith('```')) cleanedResponse = cleanedResponse.slice(3)
    if (cleanedResponse.endsWith('```')) cleanedResponse = cleanedResponse.slice(0, -3)

    const result = JSON.parse(cleanedResponse.trim())
    const citations = data.citations || []

    console.log('✅ [PERPLEXITY] Rules info:', {
      found: result.foundRules,
      ccrsOnline: result.ccrsAvailableOnline,
      notableRules: result.notableRules?.length || 0
    })

    return {
      success: true,
      foundInfo: result.foundRules === true,
      ...result,
      sources: citations,
      responseTimeMs: responseTime
    }
  } catch (error) {
    console.error('❌ [PERPLEXITY] Rules search error:', error.message)
    return { success: false, foundInfo: false, error: error.message }
  }
}

/**
 * Search for HOA reviews and community sentiment
 * Enhanced for Florida with local sources
 */
export async function searchHOAReviews(hoaName, managementCompany, city, state) {
  const apiKey = process.env.PERPLEXITY_API_KEY

  if (!apiKey) {
    return { success: false, foundInfo: false, error: 'API key not configured' }
  }

  const canProceed = await checkRateLimit('perplexity', 100)
  if (!canProceed) {
    return { success: false, foundInfo: false, error: 'Rate limit exceeded' }
  }

  const startTime = Date.now()

  try {
    console.log(`🔍 [PERPLEXITY] Searching reviews for: ${hoaName} in ${city}, FL`)

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

CRITICAL: Respond with ONLY valid JSON, no markdown, no code blocks.

Required JSON format:
{
  "overallSentiment": "positive" or "negative" or "mixed" or "unknown",
  "reviewCount": number,
  "averageRating": number (1-5) or null,
  "commonComplaints": ["complaint 1", "complaint 2"],
  "commonPraise": ["positive 1", "positive 2"],
  "redditMentions": number,
  "googleReviewRating": number or null,
  "bbbRating": "A+" or "A" or "B" etc or null,
  "bbbComplaints": number or null,
  "newsArticles": [{"title": "Title", "summary": "Brief summary", "year": 2024}],
  "neighborhoodApps": {"nextdoor": true/false, "sentiment": "positive/negative/mixed"},
  "foundOnline": true or false
}`
        }, {
          role: 'user',
          content: `Search for reviews and community feedback about ${searchTarget} in ${city}, Florida.

SEARCH THESE SOURCES:
1. Google reviews of the management company
2. BBB (Better Business Bureau) - complaints count and rating
3. Reddit - r/florida, r/HOA, r/${city.toLowerCase().replace(/\s/g, '')} if exists
4. Yelp reviews of management company
5. HOA forums - HOAForum.com, BiggerPockets
6. NextDoor and neighborhood apps (note if community is active)
7. Local Florida news articles about HOA disputes
8. Florida CAM complaints (DBPR)

For management company "${managementCompany || 'unknown'}", also check:
- Google Business reviews
- Facebook page reviews
- Any lawsuits or regulatory actions

Summarize:
- Overall sentiment (positive/negative/mixed)
- Most common complaints (top 3-5)
- Most common praise (top 3-5)
- Any notable news or incidents

Set foundOnline to true only if you found actual reviews or mentions.`
        }],
        return_citations: true,
        max_tokens: 2000,
        temperature: 0.1
      })
    })

    const responseTime = Date.now() - startTime

    await logApiUsage('perplexity', {
      endpoint: '/chat/completions',
      response_time_ms: responseTime,
      status_code: response.status,
      search_type: 'reviews'
    })

    if (!response.ok) throw new Error(`Perplexity API error: ${response.status}`)

    const data = await response.json()
    let responseText = data.choices?.[0]?.message?.content || ''

    let cleanedResponse = responseText.trim()
    if (cleanedResponse.startsWith('```json')) cleanedResponse = cleanedResponse.slice(7)
    else if (cleanedResponse.startsWith('```')) cleanedResponse = cleanedResponse.slice(3)
    if (cleanedResponse.endsWith('```')) cleanedResponse = cleanedResponse.slice(0, -3)

    const reviewInfo = JSON.parse(cleanedResponse.trim())
    const citations = data.citations || []

    console.log('✅ [PERPLEXITY] Review info:', {
      sentiment: reviewInfo.overallSentiment,
      reviewCount: reviewInfo.reviewCount,
      bbbRating: reviewInfo.bbbRating,
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
      bbbComplaints: reviewInfo.bbbComplaints,
      newsArticles: reviewInfo.newsArticles || [],
      neighborhoodApps: reviewInfo.neighborhoodApps || null,
      sources: citations,
      responseTimeMs: responseTime
    }
  } catch (error) {
    console.error('❌ [PERPLEXITY] Review search error:', error.message)
    return { success: false, foundInfo: false, error: error.message }
  }
}
