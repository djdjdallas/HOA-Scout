/**
 * Claude AI API Integration
 * Provides intelligent analysis of HOA data
 *
 * Using Claude Sonnet 3.5 for cost-effective, high-quality analysis
 */

import { logApiUsage, checkRateLimit } from '@/lib/supabase/server'

const CLAUDE_API_BASE = 'https://api.anthropic.com/v1/messages'

/**
 * Make request to Claude API
 */
async function claudeRequest(messages, options = {}) {
  // Validate API key is present
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ [CLAUDE] ANTHROPIC_API_KEY environment variable is not set')
    throw new Error('Claude API error: ANTHROPIC_API_KEY is not configured')
  }

  // Check rate limit (20 requests per hour to control costs)
  const canProceed = await checkRateLimit('claude', 20)
  if (!canProceed) {
    throw new Error('AI analysis rate limit exceeded. Please try again later.')
  }

  const {
    maxTokens = 4000,
    temperature = 0.7,
    system = null
  } = options

  const startTime = Date.now()
  const apiKey = process.env.ANTHROPIC_API_KEY
  console.log('🤖 [CLAUDE] Making API request...')
  console.log('🤖 [CLAUDE] API Key present:', !!apiKey, '| Key prefix:', apiKey?.substring(0, 10) + '...')

  try {
    const requestBody = {
      model: 'claude-sonnet-4-5-20250929', // Claude Sonnet 4.5 (Nov 2025)
      max_tokens: maxTokens,
      temperature,
      messages
    }

    // Add system prompt if provided
    if (system) {
      requestBody.system = system
    }

    const response = await fetch(CLAUDE_API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    })

    const responseTime = Date.now() - startTime
    console.log('🤖 [CLAUDE] Response received:', response.status, response.statusText, '| Time:', responseTime + 'ms')

    const data = await response.json()
    console.log('🤖 [CLAUDE] Response data keys:', Object.keys(data))

    // Extract token usage for cost tracking
    const tokensUsed = data.usage?.input_tokens + data.usage?.output_tokens || 0
    const costEstimate = (tokensUsed / 1000) * 0.003 // Approximate cost per 1K tokens

    // Log API usage
    await logApiUsage('claude', {
      endpoint: '/messages',
      response_time_ms: responseTime,
      status_code: response.status,
      tokens_used: tokensUsed,
      cost_estimate: costEstimate
    })

    if (!response.ok) {
      // Log full error details for debugging
      console.error('❌ [CLAUDE] API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        error: data.error,
        fullResponse: JSON.stringify(data, null, 2)
      })

      const errorMessage = data.error?.message
        || data.error?.type
        || (typeof data.error === 'string' ? data.error : null)
        || `HTTP ${response.status}: ${response.statusText}`

      throw new Error(`Claude API error: ${errorMessage}`)
    }

    console.log('✅ [CLAUDE] API request successful, tokens used:', tokensUsed)
    return data.content[0].text
  } catch (error) {
    await logApiUsage('claude', {
      endpoint: '/messages',
      error_message: error.message,
      status_code: 500
    })
    throw error
  }
}

/**
 * Analyze HOA data and generate comprehensive report
 */
export async function analyzeHOAData(hoaData, yelpData = null) {
  const system = `You are a real estate analyst specializing in HOA evaluation with 20+ years of experience helping homebuyers make informed decisions.

Your analysis must be:
- HONEST and DIRECT about problems
- SPECIFIC with examples from the data
- ACTIONABLE with clear next steps
- BALANCED showing both positives and negatives

Remember: This is potentially a $300,000+ decision. Be thorough and truthful.`

  const prompt = `Analyze this HOA data and provide a comprehensive evaluation for a potential homebuyer.

HOA INFORMATION:
Name: ${hoaData.hoaName || 'Unknown'}
Location: ${hoaData.city}, ${hoaData.state} ${hoaData.zipCode}
Monthly Fee: ${hoaData.monthlyFee ? `$${hoaData.monthlyFee}` : 'Unknown'}
Total Units: ${hoaData.totalUnits || 'Unknown'}
Management: ${hoaData.managementCompany || 'Self-managed'}

PUBLIC RECORDS DATA:
${JSON.stringify(hoaData.publicRecords || {}, null, 2)}

COMMUNITY FEEDBACK:
${JSON.stringify(hoaData.communityFeedback || [], null, 2)}

FINANCIAL DATA:
${JSON.stringify(hoaData.financialData || {}, null, 2)}

RULES & RESTRICTIONS:
${JSON.stringify(hoaData.rulesData || {}, null, 2)}

${yelpData ? `NEIGHBORHOOD CONTEXT (from Yelp):
Walkability: ${yelpData.walkability}/10
Restaurants: ${yelpData.summary?.restaurantCount || 0}
Parks: ${yelpData.summary?.parkCount || 0}
Overall vibe: ${yelpData.vibe?.description || 'Not available'}` : ''}

Provide your analysis in this EXACT JSON format:

{
  "overallScore": [0-10 score as number],
  "oneSentenceSummary": "[One clear sentence summarizing the HOA]",

  "scores": {
    "financialHealth": [0-10],
    "restrictiveness": [0-10 where 10 = very restrictive],
    "managementQuality": [0-10],
    "communitySentiment": [0-10],
    "legalHistory": [0-10 where 10 = clean history]
  },

  "redFlags": [
    {
      "title": "[Serious issue title]",
      "description": "[1-2 sentences explaining why this matters]",
      "severity": "high",
      "source": "[Where this info came from]"
    }
  ],

  "yellowFlags": [
    {
      "title": "[Concern title]",
      "description": "[1-2 sentences explaining the concern]",
      "severity": "moderate",
      "source": "[Data source]"
    }
  ],

  "greenFlags": [
    {
      "title": "[Positive aspect]",
      "description": "[Why this is good for buyers]",
      "severity": "positive",
      "source": "[Data source]"
    }
  ],

  "financialAnalysis": {
    "monthlyFee": [number or null],
    "feeAssessment": "[How fees compare to value provided]",
    "reserveFundStatus": "[healthy/concerning/unknown]",
    "specialAssessmentRisk": "[low/moderate/high/unknown]",
    "budgetTransparency": "[good/poor/unknown]",
    "financialTrend": "[stable/improving/declining/unknown]"
  },

  "rulesHighlight": {
    "mostRestrictive": [
      "[Top 3 most restrictive rules]"
    ],
    "leastRestrictive": [
      "[Areas where HOA is permissive]"
    ],
    "dealBreakers": [
      "[Rules that might be absolute deal breakers for some]"
    ]
  },

  "managementInsights": {
    "responsiveness": "[Based on feedback]",
    "transparency": "[Level of openness]",
    "competence": "[Professional vs amateur]",
    "boardDynamics": "[Stable/contentious/unknown]"
  },

  "communitySentiment": {
    "overallMood": "[positive/negative/mixed]",
    "commonComplaints": [
      "[Top complaints from residents]"
    ],
    "commonPraise": [
      "[What residents like]"
    ],
    "turnoverIndicator": "[low/moderate/high/unknown]"
  },

  "questionsToAsk": [
    "[5 specific questions buyer MUST ask]"
  ],

  "documentsToRequest": [
    "[Essential documents to review before buying]"
  ],

  "neighborhoodContext": {
    "walkability": "[Score and what it means]",
    "amenities": "[Key nearby amenities]",
    "lifestyle": "[Type of lifestyle this location supports]"
  },

  "buyerConsiderations": {
    "bestSuitedFor": "[Type of buyer who would thrive here]",
    "notIdealFor": "[Type of buyer who should look elsewhere]",
    "hiddenCosts": "[Potential costs beyond HOA fee]"
  },

  "dataQuality": {
    "completeness": [0-100 percentage],
    "confidence": "high/moderate/low",
    "missingData": [
      "[Critical data we couldn't find]"
    ]
  }
}

CRITICAL: Return ONLY the JSON object. No additional text before or after.`

  const messages = [
    {
      role: 'user',
      content: prompt
    }
  ]

  try {
    const response = await claudeRequest(messages, { system, temperature: 0.7 })

    // Clean response - strip markdown code blocks if present
    let cleanedResponse = response.trim()
    const hadMarkdown = cleanedResponse.startsWith('```')
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.slice(7)
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.slice(3)
    }
    if (cleanedResponse.endsWith('```')) {
      cleanedResponse = cleanedResponse.slice(0, -3)
    }
    cleanedResponse = cleanedResponse.trim()

    if (hadMarkdown) {
      console.log('🧹 [CLAUDE] Stripped markdown code blocks from response')
    }

    // Parse JSON response
    const analysis = JSON.parse(cleanedResponse)
    console.log('✅ [CLAUDE] Successfully parsed HOA analysis JSON')

    // Validate response structure
    if (!analysis.overallScore || !analysis.scores) {
      throw new Error('Invalid analysis format')
    }

    return analysis
  } catch (error) {
    console.error('HOA analysis error:', error)

    // Return fallback analysis if AI fails
    return generateFallbackAnalysis(hoaData, yelpData)
  }
}

/**
 * Generate neighborhood vibe summary from Yelp data
 */
export async function generateNeighborhoodVibe(yelpData) {
  const prompt = `Based on this Yelp business data for a neighborhood, describe the area's vibe in 1-2 sentences.

Business Data:
${JSON.stringify(yelpData.businesses, null, 2)}

Statistics:
- Total businesses: ${yelpData.summary?.totalBusinesses || 0}
- Restaurants: ${yelpData.summary?.restaurantCount || 0}
- Coffee shops: ${yelpData.summary?.coffeeCount || 0}
- Parks: ${yelpData.summary?.parkCount || 0}
- Walkability: ${yelpData.walkability}/10

Provide a vivid, specific description that helps someone understand what living here would be like.
Focus on lifestyle, not just listing numbers. Be conversational but informative.

Examples of good descriptions:
- "Vibrant urban neighborhood with a thriving food scene and walkable access to 47 restaurants. Young professional vibe with plenty of late-night options and trendy coffee shops."
- "Quiet suburban area with family-friendly amenities. Limited walkability but good access to parks and highly-rated schools nearby."
- "Up-and-coming area transitioning from industrial to residential. Growing coffee and restaurant scene but still maintaining affordable, laid-back atmosphere."

Just provide the 1-2 sentence description, nothing else.`

  const messages = [
    {
      role: 'user',
      content: prompt
    }
  ]

  try {
    const response = await claudeRequest(messages, {
      maxTokens: 200,
      temperature: 0.8
    })

    return response.trim()
  } catch (error) {
    console.error('Vibe generation error:', error)

    // Fallback description
    const walkLevel = yelpData.walkability > 7 ? 'highly walkable' :
                     yelpData.walkability > 5 ? 'moderately walkable' : 'car-dependent'

    return `${walkLevel.charAt(0).toUpperCase() + walkLevel.slice(1)} neighborhood with ${yelpData.summary?.totalBusinesses || 'limited'} businesses nearby. ${yelpData.summary?.restaurantCount > 10 ? 'Good dining options available.' : 'Limited dining scene.'}`
  }
}

/**
 * Summarize community feedback sentiment
 */
export async function analyzeCommunityFeedback(feedback) {
  if (!feedback || feedback.length === 0) {
    return {
      sentiment: 'unknown',
      summary: 'No community feedback available',
      themes: []
    }
  }

  const prompt = `Analyze this community feedback about an HOA and identify key themes and overall sentiment.

Feedback:
${JSON.stringify(feedback.slice(0, 20), null, 2)}

Provide a brief JSON summary:
{
  "sentiment": "positive/negative/mixed",
  "summary": "1-2 sentence overview",
  "positiveThemes": ["theme1", "theme2"],
  "negativeThemes": ["theme1", "theme2"],
  "concernLevel": "low/moderate/high"
}

Return ONLY the JSON.`

  const messages = [
    {
      role: 'user',
      content: prompt
    }
  ]

  try {
    const response = await claudeRequest(messages, {
      maxTokens: 500,
      temperature: 0.5
    })

    return JSON.parse(response)
  } catch (error) {
    console.error('Feedback analysis error:', error)

    return {
      sentiment: 'unknown',
      summary: 'Unable to analyze feedback',
      themes: []
    }
  }
}

/**
 * Generate fallback analysis when AI is unavailable
 * Uses rule-based scoring as backup
 */
function generateFallbackAnalysis(hoaData, yelpData) {
  // Basic scoring logic
  let financialScore = 5
  let restrictiveScore = 5
  let managementScore = 5
  let communityScore = 5
  let legalScore = 8

  // Adjust scores based on available data
  if (hoaData.monthlyFee) {
    financialScore = hoaData.monthlyFee > 500 ? 4 :
                    hoaData.monthlyFee > 300 ? 6 : 7
  }

  if (hoaData.publicRecords?.lawsuits?.length > 0) {
    legalScore = 3
  }

  const overallScore = (
    financialScore * 0.3 +
    (10 - restrictiveScore) * 0.15 +
    managementScore * 0.25 +
    communityScore * 0.2 +
    legalScore * 0.1
  ).toFixed(1)

  return {
    overallScore: parseFloat(overallScore),
    oneSentenceSummary: 'Limited data available for comprehensive HOA analysis.',

    scores: {
      financialHealth: financialScore,
      restrictiveness: restrictiveScore,
      managementQuality: managementScore,
      communitySentiment: communityScore,
      legalHistory: legalScore
    },

    redFlags: [],
    yellowFlags: [
      {
        title: 'Incomplete Data',
        description: 'Unable to perform full AI analysis. Manual research recommended.',
        severity: 'moderate',
        source: 'System'
      }
    ],
    greenFlags: [],

    financialAnalysis: {
      monthlyFee: hoaData.monthlyFee || null,
      feeAssessment: 'Unable to assess without complete data',
      reserveFundStatus: 'unknown',
      specialAssessmentRisk: 'unknown',
      budgetTransparency: 'unknown',
      financialTrend: 'unknown'
    },

    rulesHighlight: {
      mostRestrictive: [],
      leastRestrictive: [],
      dealBreakers: []
    },

    managementInsights: {
      responsiveness: 'unknown',
      transparency: 'unknown',
      competence: 'unknown',
      boardDynamics: 'unknown'
    },

    communitySentiment: {
      overallMood: 'unknown',
      commonComplaints: [],
      commonPraise: [],
      turnoverIndicator: 'unknown'
    },

    questionsToAsk: [
      'Can you provide complete financial statements?',
      'What is the current reserve fund status?',
      'Are there any pending or planned special assessments?',
      'Can I review the CC&Rs and bylaws?',
      'What is the process for architectural modifications?'
    ],

    documentsToRequest: [
      'CC&Rs (Covenants, Conditions & Restrictions)',
      'Current bylaws',
      'Last 2 years of financial statements',
      'Reserve study',
      'Board meeting minutes (last 6 months)'
    ],

    neighborhoodContext: yelpData ? {
      walkability: `${yelpData.walkability}/10`,
      amenities: 'See Yelp data for details',
      lifestyle: yelpData.vibe?.description || 'Not available'
    } : null,

    buyerConsiderations: {
      bestSuitedFor: 'Unable to determine without complete data',
      notIdealFor: 'Unable to determine without complete data',
      hiddenCosts: ['Potential special assessments', 'Maintenance not covered by HOA']
    },

    dataQuality: {
      completeness: 25,
      confidence: 'low',
      missingData: [
        'Complete financial records',
        'Community feedback',
        'Management company information',
        'Rules and restrictions details'
      ]
    }
  }
}