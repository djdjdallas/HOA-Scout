/**
 * Yelp Fusion API Integration
 * Provides neighborhood context and local business data
 *
 * Rate limits: 5000 requests/day on free tier
 * Cache aggressively to stay within limits
 */

import { logApiUsage, checkRateLimit } from '@/lib/supabase/server'

const YELP_API_BASE = 'https://api.yelp.com/v3'

/**
 * Make authenticated request to Yelp API
 */
async function yelpRequest(endpoint, params = {}) {
  // Check rate limit (100 requests per hour per user)
  const canProceed = await checkRateLimit('yelp', 100)
  if (!canProceed) {
    throw new Error('Yelp API rate limit exceeded. Please try again later.')
  }

  const url = new URL(`${YELP_API_BASE}${endpoint}`)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value)
    }
  })

  const startTime = Date.now()

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${process.env.YELP_API_KEY}`,
        'Accept': 'application/json'
      }
    })

    const responseTime = Date.now() - startTime

    // Log API usage for monitoring
    await logApiUsage('yelp', {
      endpoint,
      response_time_ms: responseTime,
      status_code: response.status
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Yelp API error: ${response.status} - ${error}`)
    }

    return response.json()
  } catch (error) {
    await logApiUsage('yelp', {
      endpoint,
      error_message: error.message,
      status_code: 500
    })
    throw error
  }
}

/**
 * Get neighborhood context around a specific location
 * Searches for various business categories to understand the area
 */
export async function getNeighborhoodContext(lat, lng, city, state) {
  console.log('🏘️ [YELP] Starting neighborhood context search')
  console.log('🏘️ [YELP] Location:', { lat, lng, city, state })

  // Define categories to search for neighborhood analysis
  // Using correct Yelp Fusion API category aliases
  // See: https://docs.developer.yelp.com/docs/resources-categories
  // Updated for Florida with beaches, golf, pharmacy
  const categories = [
    { key: 'restaurants', alias: 'restaurants', label: 'Restaurants' },
    { key: 'parks', alias: 'parks', label: 'Parks & Recreation' },
    { key: 'grocery', alias: 'grocery', label: 'Grocery Stores' },
    { key: 'coffee', alias: 'coffee', label: 'Coffee Shops' },
    { key: 'bars', alias: 'bars', label: 'Bars & Nightlife' },
    { key: 'shopping', alias: 'shoppingcenters', label: 'Shopping Centers' },
    { key: 'gyms', alias: 'gyms', label: 'Gyms & Fitness' },
    { key: 'medical', alias: 'physicians,hospitals,urgent_care', label: 'Medical Services' },
    { key: 'pharmacy', alias: 'pharmacy', label: 'Pharmacies' },
    { key: 'beaches', alias: 'beaches', label: 'Beaches' },          // Florida-specific
    { key: 'golf', alias: 'golf', label: 'Golf Courses' }            // Florida-specific (many HOAs near golf)
  ]

  const radius = 1609 // 1 mile in meters
  console.log('🏘️ [YELP] Search radius: 1 mile (1609 meters)')

  const neighborhoodData = {
    businesses: [],
    statistics: {},
    walkability: 0,
    topRated: [],
    summary: {}
  }

  // Fetch data for each category with rate limiting (sequential)
  const categoryResults = []

  for (const { key, alias, label } of categories) {
    try {
      console.log(`🔍 [YELP] Searching for ${label} (category alias: "${alias}")...`)

      const searchParams = {
        latitude: lat,
        longitude: lng,
        radius,
        categories: alias,  // Use alias for Yelp API
        sort_by: 'distance',
        limit: 20
      }

      const data = await yelpRequest('/businesses/search', searchParams)

      // Post-filter to strictly enforce radius limit (Yelp radius is a preference, not hard limit)
      const filteredBusinesses = data.businesses.filter(b => b.distance <= radius)
      // Sort filtered results by rating for better display
      filteredBusinesses.sort((a, b) => b.rating - a.rating)
      data.businesses = filteredBusinesses

      console.log(`✅ [YELP] Found ${filteredBusinesses.length} ${label} within 1 mile (${data.total} total in area)`)
      if (data.businesses.length > 0) {
        console.log(`📍 [YELP] Sample ${label}:`, data.businesses.slice(0, 3).map(b => ({
          name: b.name,
          distance: Math.round(b.distance) + 'm',
          rating: b.rating,
          categories: b.categories?.map(c => c.alias).join(', ') || 'none'  // Show actual categories for debugging
        })))
      } else {
        console.log(`⚠️ [YELP] No ${label} found within radius`)
      }

      categoryResults.push({
        category: key,  // Use key for statistics tracking
        label,
        count: filteredBusinesses.length,
        businesses: data.businesses.slice(0, 5).map(b => ({
          name: b.name,
          rating: b.rating,
          reviewCount: b.review_count,
          priceLevel: b.price,
          distance: Math.round(b.distance),
          categories: b.categories.map(c => c.title),
          url: b.url,
          image: b.image_url
        }))
      })

      // Add 300ms delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 300))

    } catch (error) {
      console.error(`❌ [YELP] Error fetching ${label} (alias: ${alias}):`, error.message)
      categoryResults.push({
        category: key,
        label,
        count: 0,
        businesses: []
      })
    }
  }

  console.log('📊 [YELP] All category searches complete')

  // Process results
  categoryResults.forEach(result => {
    neighborhoodData.businesses.push(result)
    neighborhoodData.statistics[result.category] = result.count
  })

  // Calculate walkability score (0-10 scale)
  const totalBusinesses = categoryResults.reduce((sum, cat) => sum + cat.count, 0)
  const categoryDiversity = categoryResults.filter(cat => cat.count > 0).length

  console.log('📊 [YELP] Statistics:', {
    totalBusinesses,
    categoryDiversity: `${categoryDiversity}/9`,
    restaurants: neighborhoodData.statistics.restaurants || 0,
    parks: neighborhoodData.statistics.parks || 0,
    grocery: neighborhoodData.statistics.grocery || 0,
    coffee: neighborhoodData.statistics.coffee || 0
  })

  // Walkability factors:
  // - Number of businesses within 1 mile
  // - Diversity of business types
  // - Presence of essential services (grocery, restaurants, coffee)
  const essentialServices = ['restaurants', 'grocery', 'coffee']
  const hasEssentials = essentialServices.every(service =>
    neighborhoodData.statistics[service] > 0
  )

  neighborhoodData.walkability = Math.min(10,
    (Math.min(totalBusinesses, 100) / 10) * 0.5 + // Business density (0-5 points)
    (categoryDiversity / 9) * 3 + // Category diversity (0-3 points)
    (hasEssentials ? 2 : 0) // Essential services (0-2 points)
  ).toFixed(1)

  // Get top rated businesses across all categories
  const allBusinesses = categoryResults.flatMap(cat => cat.businesses)
  neighborhoodData.topRated = allBusinesses
    .sort((a, b) => {
      // Sort by rating * review count for better relevance
      const scoreA = a.rating * Math.log(a.reviewCount + 1)
      const scoreB = b.rating * Math.log(b.reviewCount + 1)
      return scoreB - scoreA
    })
    .slice(0, 10)

  // Create summary statistics
  neighborhoodData.summary = {
    totalBusinesses,
    restaurantCount: neighborhoodData.statistics.restaurants || 0,
    parkCount: neighborhoodData.statistics.parks || 0,
    groceryCount: neighborhoodData.statistics.grocery || 0,
    coffeeCount: neighborhoodData.statistics.coffee || 0,
    hasNightlife: (neighborhoodData.statistics.bars || 0) > 3,
    hasFitness: (neighborhoodData.statistics.gyms || 0) > 0,
    hasSchools: (neighborhoodData.statistics.education || 0) > 0,
    avgRating: (allBusinesses.reduce((sum, b) => sum + b.rating, 0) / allBusinesses.length).toFixed(1)
  }

  console.log('✅ [YELP] Neighborhood context complete')
  console.log('📊 [YELP] Walkability score:', neighborhoodData.walkability + '/10')
  console.log('📊 [YELP] Summary:', neighborhoodData.summary)

  return neighborhoodData
}

/**
 * Search for a specific business (like HOA management company)
 */
export async function searchBusiness(name, city, state) {
  try {
    const data = await yelpRequest('/businesses/search', {
      term: name,
      location: `${city}, ${state}`,
      limit: 5,
      sort_by: 'best_match'
    })

    if (data.businesses.length === 0) {
      return null
    }

    // Return the best match
    const business = data.businesses[0]
    return {
      name: business.name,
      rating: business.rating,
      reviewCount: business.review_count,
      categories: business.categories.map(c => c.title),
      location: {
        address: business.location.address1,
        city: business.location.city,
        state: business.location.state,
        zipCode: business.location.zip_code
      },
      phone: business.phone,
      url: business.url,
      coordinates: business.coordinates
    }
  } catch (error) {
    console.error('Business search error:', error)
    return null
  }
}

/**
 * Get reviews for a specific business
 */
export async function getBusinessReviews(businessId) {
  try {
    const data = await yelpRequest(`/businesses/${businessId}/reviews`, {
      limit: 20,
      sort_by: 'relevance'
    })

    return data.reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      text: review.text,
      user: review.user.name,
      timeCreated: review.time_created,
      url: review.url
    }))
  } catch (error) {
    console.error('Reviews fetch error:', error)
    return []
  }
}

/**
 * Generate neighborhood vibe description based on Yelp data
 * This provides a human-readable summary of the area
 */
export function generateNeighborhoodVibe(neighborhoodData) {
  const { summary, walkability } = neighborhoodData

  // Determine neighborhood type
  let vibeType = ''
  let vibeDescription = ''

  // Urban vs Suburban classification
  if (summary.totalBusinesses > 100 && walkability > 7) {
    vibeType = 'Urban'
  } else if (summary.totalBusinesses > 50 && walkability > 5) {
    vibeType = 'Urban-Suburban Mix'
  } else {
    vibeType = 'Suburban'
  }

  // Activity level
  const activityLevel = summary.totalBusinesses > 75 ? 'vibrant' :
                       summary.totalBusinesses > 30 ? 'moderate' : 'quiet'

  // Lifestyle indicators
  const lifestyle = []

  if (summary.restaurantCount > 20) {
    lifestyle.push('foodie-friendly')
  }

  if (summary.hasNightlife) {
    lifestyle.push('active nightlife')
  }

  if (summary.parkCount > 2) {
    lifestyle.push('outdoor-oriented')
  }

  if (summary.coffeeCount > 5) {
    lifestyle.push('coffee culture')
  }

  if (summary.hasFitness) {
    lifestyle.push('fitness-focused')
  }

  if (summary.hasSchools) {
    lifestyle.push('family-friendly')
  }

  // Build description
  if (vibeType === 'Urban') {
    vibeDescription = `${vibeType} neighborhood with ${activityLevel} atmosphere. `
    vibeDescription += `Highly walkable (${walkability}/10) with ${summary.restaurantCount} restaurants and ${summary.coffeeCount} coffee shops within walking distance. `
  } else if (vibeType === 'Urban-Suburban Mix') {
    vibeDescription = `${vibeType} area offering balanced lifestyle. `
    vibeDescription += `Good walkability (${walkability}/10) with ${summary.totalBusinesses} businesses nearby. `
  } else {
    vibeDescription = `${vibeType} neighborhood with ${activityLevel} setting. `
    vibeDescription += `Limited walkability (${walkability}/10) but ${summary.totalBusinesses} local businesses available. `
  }

  // Add lifestyle characteristics
  if (lifestyle.length > 0) {
    vibeDescription += `Character: ${lifestyle.slice(0, 3).join(', ')}.`
  }

  // Add specific highlights
  if (summary.avgRating >= 4) {
    vibeDescription += ` Well-rated local businesses (avg ${summary.avgRating}/5).`
  }

  return {
    type: vibeType,
    activityLevel,
    lifestyle,
    description: vibeDescription,
    walkabilityScore: walkability
  }
}

/**
 * Check if Yelp data is cached and still valid
 */
export async function getCachedYelpData(location, supabaseClient) {
  const { data } = await supabaseClient
    .from('neighborhood_context')
    .select('*')
    .eq('location', location)
    .gte('expires_at', new Date().toISOString())
    .single()

  return data
}

/**
 * Cache Yelp data for future use
 */
export async function cacheYelpData(hoaId, location, city, state, yelpData, supabaseClient) {
  const vibe = generateNeighborhoodVibe(yelpData)

  const cacheData = {
    hoa_id: hoaId,
    location,
    city,
    state,
    businesses: yelpData.businesses,
    walkability_score: parseFloat(yelpData.walkability),
    restaurant_count: yelpData.summary.restaurantCount,
    parks_count: yelpData.summary.parkCount,
    grocery_count: yelpData.summary.groceryCount,
    coffee_count: yelpData.summary.coffeeCount,
    // Florida-specific categories
    beaches_count: yelpData.statistics?.beaches || 0,
    golf_count: yelpData.statistics?.golf || 0,
    medical_count: yelpData.statistics?.medical || 0,
    pharmacy_count: yelpData.statistics?.pharmacy || 0,
    // Store full statistics for flexibility
    statistics: yelpData.statistics || {},
    overall_vibe: vibe.description,
    cached_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
  }

  const { data, error } = await supabaseClient
    .from('neighborhood_context')
    .upsert(cacheData, {
      onConflict: 'city,state,location'
    })
    .select()
    .single()

  if (error) {
    console.error('Error caching Yelp data:', error)
  }

  return data
}