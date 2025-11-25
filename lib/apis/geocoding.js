/**
 * Google Maps Geocoding API Integration
 * Converts addresses to coordinates and extracts location components
 *
 * Alternative: Can use Mapbox or other geocoding services if preferred
 */

import { logApiUsage } from '@/lib/supabase/server'

const GOOGLE_GEOCODING_API = 'https://maps.googleapis.com/maps/api/geocode/json'

/**
 * Geocode an address to get coordinates and components
 */
export async function geocodeAddress(address) {
  if (!address) {
    throw new Error('Address is required for geocoding')
  }

  console.log('🔍 [GEOCODING] Starting geocode for address:', address)

  // Check if Google Maps API key is configured
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    console.warn('⚠️ [GEOCODING] Google Maps API key not configured, using fallback geocoding')
    return fallbackGeocode(address)
  }

  console.log('✅ [GEOCODING] Google Maps API key found, using Google Geocoding API')
  const startTime = Date.now()

  try {
    const url = new URL(GOOGLE_GEOCODING_API)
    url.searchParams.append('address', address)
    url.searchParams.append('key', process.env.GOOGLE_MAPS_API_KEY)

    console.log('📡 [GEOCODING] Calling Google Maps API...')
    const response = await fetch(url.toString())
    const responseTime = Date.now() - startTime

    if (!response.ok) {
      console.error('❌ [GEOCODING] API HTTP error:', response.status)
      throw new Error(`Geocoding API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('📊 [GEOCODING] API Response Status:', data.status)
    console.log('📊 [GEOCODING] API Response Time:', responseTime + 'ms')

    // Log API usage
    await logApiUsage('google_maps', {
      endpoint: '/geocode',
      response_time_ms: responseTime,
      status_code: response.status
    })

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      console.error('❌ [GEOCODING] API returned non-OK status:', data.status, data.error_message)
      console.warn('⚠️ [GEOCODING] Falling back to manual geocoding')
      return fallbackGeocode(address)
    }

    // Parse the first result
    const result = data.results[0]
    const components = parseAddressComponents(result.address_components)
    const confidence = getConfidenceScore(result)

    const geocodedResult = {
      formattedAddress: result.formatted_address,
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      ...components,
      placeId: result.place_id,
      confidence
    }

    console.log('✅ [GEOCODING] Successfully geocoded via Google Maps API')
    console.log('📍 [GEOCODING] Location:', geocodedResult.city, geocodedResult.state, geocodedResult.zipCode)
    console.log('📍 [GEOCODING] Coordinates:', geocodedResult.lat, geocodedResult.lng)
    console.log('📍 [GEOCODING] Confidence:', confidence)

    return geocodedResult
  } catch (error) {
    console.error('❌ [GEOCODING] Exception caught:', error.message)

    // Log error
    await logApiUsage('google_maps', {
      endpoint: '/geocode',
      error_message: error.message,
      status_code: 500
    })

    // Use fallback geocoding
    console.warn('⚠️ [GEOCODING] Falling back to manual geocoding due to exception')
    return fallbackGeocode(address)
  }
}

/**
 * Reverse geocode coordinates to get address
 */
export async function reverseGeocode(lat, lng) {
  if (!lat || !lng) {
    throw new Error('Coordinates are required for reverse geocoding')
  }

  if (!process.env.GOOGLE_MAPS_API_KEY) {
    return {
      formattedAddress: `${lat}, ${lng}`,
      city: 'Unknown',
      state: 'Unknown',
      zipCode: 'Unknown'
    }
  }

  try {
    const url = new URL(GOOGLE_GEOCODING_API)
    url.searchParams.append('latlng', `${lat},${lng}`)
    url.searchParams.append('key', process.env.GOOGLE_MAPS_API_KEY)

    const response = await fetch(url.toString())

    if (!response.ok) {
      throw new Error(`Reverse geocoding API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      throw new Error(`Reverse geocoding failed: ${data.status}`)
    }

    const result = data.results[0]
    const components = parseAddressComponents(result.address_components)

    return {
      formattedAddress: result.formatted_address,
      ...components
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error)

    return {
      formattedAddress: `${lat}, ${lng}`,
      city: 'Unknown',
      state: 'Unknown',
      zipCode: 'Unknown'
    }
  }
}

/**
 * Parse address components from Google's response
 */
function parseAddressComponents(components) {
  const parsed = {
    streetNumber: '',
    street: '',
    city: '',
    county: '',
    state: '',
    stateCode: '',
    country: '',
    countryCode: '',
    zipCode: '',
    neighborhood: ''
  }

  if (!components) return parsed

  components.forEach(component => {
    const types = component.types

    if (types.includes('street_number')) {
      parsed.streetNumber = component.long_name
    }
    if (types.includes('route')) {
      parsed.street = component.long_name
    }
    if (types.includes('locality')) {
      parsed.city = component.long_name
    }
    if (types.includes('administrative_area_level_2')) {
      parsed.county = component.long_name
    }
    if (types.includes('administrative_area_level_1')) {
      parsed.state = component.long_name
      parsed.stateCode = component.short_name
    }
    if (types.includes('country')) {
      parsed.country = component.long_name
      parsed.countryCode = component.short_name
    }
    if (types.includes('postal_code')) {
      parsed.zipCode = component.long_name
    }
    if (types.includes('neighborhood')) {
      parsed.neighborhood = component.long_name
    }
    // Sometimes the city is stored as sublocality
    if (types.includes('sublocality_level_1') && !parsed.city) {
      parsed.city = component.long_name
    }
  })

  // Build full street address
  if (parsed.streetNumber && parsed.street) {
    parsed.streetAddress = `${parsed.streetNumber} ${parsed.street}`
  } else {
    parsed.streetAddress = parsed.street
  }

  return parsed
}

/**
 * Calculate confidence score for geocoding result
 */
function getConfidenceScore(result) {
  // Higher confidence for more precise location types
  const locationType = result.geometry.location_type

  const scores = {
    'ROOFTOP': 1.0,              // Precise location
    'RANGE_INTERPOLATED': 0.8,   // Approximate location
    'GEOMETRIC_CENTER': 0.6,     // Center of area
    'APPROXIMATE': 0.4            // Rough approximation
  }

  return scores[locationType] || 0.5
}

/**
 * Fallback geocoding without Google Maps API
 * Uses a simple parsing approach for demo purposes
 */
function fallbackGeocode(address) {
  console.log('🔄 [FALLBACK GEOCODING] Starting fallback geocoding')
  console.log('🔄 [FALLBACK GEOCODING] Input address:', address)

  // Parse address string manually
  const parts = address.split(',').map(s => s.trim())
  console.log('🔄 [FALLBACK GEOCODING] Address parts:', parts)

  // Try to extract city, state, zip from address
  let city = ''
  let state = ''
  let zipCode = ''

  // Common address patterns
  // "123 Main St, Los Angeles, CA 90001"
  // "Los Angeles, CA"
  // "90001"

  if (parts.length >= 2) {
    // Assume last part might be "STATE ZIP" or just "STATE"
    const lastPart = parts[parts.length - 1]
    const stateZipMatch = lastPart.match(/^([A-Z]{2})\s*(\d{5})?/)

    if (stateZipMatch) {
      state = stateZipMatch[1]
      zipCode = stateZipMatch[2] || ''

      // City is probably the second to last part
      if (parts.length >= 2) {
        city = parts[parts.length - 2]
      }
    } else {
      // Maybe it's just city, state format
      if (parts.length === 2) {
        city = parts[0]
        state = parts[1]
      }
    }
  }

  // Generate approximate coordinates for major cities (for demo)
  const cityCoordinates = {
    'Los Angeles': { lat: 34.0522, lng: -118.2437 },
    'Las Vegas': { lat: 36.1699, lng: -115.1398 },
    'San Francisco': { lat: 37.7749, lng: -122.4194 },
    'San Diego': { lat: 32.7157, lng: -117.1611 },
    'Phoenix': { lat: 33.4484, lng: -112.0740 },
    'Seattle': { lat: 47.6062, lng: -122.3321 },
    'Portland': { lat: 45.5152, lng: -122.6784 },
    'Denver': { lat: 39.7392, lng: -104.9903 },
    'Austin': { lat: 30.2672, lng: -97.7431 },
    'Miami': { lat: 25.7617, lng: -80.1918 }
  }

  // Try to find coordinates for the city
  let lat = 34.0522  // Default to LA
  let lng = -118.2437
  let matchedCity = 'Los Angeles'

  Object.entries(cityCoordinates).forEach(([name, coords]) => {
    if (city.toLowerCase().includes(name.toLowerCase())) {
      lat = coords.lat
      lng = coords.lng
      matchedCity = name
    }
  })

  // If no city was matched, use the parsed city name
  if (matchedCity === 'Los Angeles' && city && city.toLowerCase() !== 'los angeles') {
    // Keep the original city name instead of defaulting to LA
    matchedCity = city
  }

  const fallbackResult = {
    formattedAddress: address,
    lat,
    lng,
    streetAddress: parts[0] || '',
    city: city || matchedCity,
    state: state || 'CA',
    stateCode: state || 'CA',
    country: 'United States',
    countryCode: 'US',
    zipCode: zipCode || '',
    confidence: 0.3 // Low confidence for fallback
  }

  console.log('🔄 [FALLBACK GEOCODING] Parsed city:', city)
  console.log('🔄 [FALLBACK GEOCODING] Matched city:', matchedCity)
  console.log('🔄 [FALLBACK GEOCODING] Final result:', {
    city: fallbackResult.city,
    state: fallbackResult.state,
    zipCode: fallbackResult.zipCode,
    lat: fallbackResult.lat,
    lng: fallbackResult.lng,
    confidence: fallbackResult.confidence
  })

  return fallbackResult
}

/**
 * Validate if coordinates are within the United States
 */
export function isInUnitedStates(lat, lng) {
  // Rough bounds for continental US, Alaska, and Hawaii
  const continentalUS = lat >= 24 && lat <= 49 && lng >= -125 && lng <= -66
  const alaska = lat >= 51 && lat <= 72 && lng >= -180 && lng <= -129
  const hawaii = lat >= 18 && lat <= 23 && lng >= -161 && lng <= -154

  return continentalUS || alaska || hawaii
}

/**
 * Calculate distance between two coordinates (in miles)
 */
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 3959 // Earth's radius in miles

  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180)
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(lat, lng, precision = 4) {
  return `${lat.toFixed(precision)}°, ${lng.toFixed(precision)}°`
}

/**
 * Validate address format
 */
export function isValidAddress(address) {
  if (!address || typeof address !== 'string') {
    return false
  }

  // Basic validation - at least 5 characters and contains some alphanumeric
  return address.length >= 5 && /[a-zA-Z0-9]/.test(address)
}

/**
 * Extract HOA name from address if possible
 */
export function extractHOAName(address) {
  // Common HOA patterns
  const patterns = [
    /(.+?)\s+HOA/i,
    /(.+?)\s+Homeowners/i,
    /(.+?)\s+Association/i,
    /(.+?)\s+Estates/i,
    /(.+?)\s+Village/i,
    /(.+?)\s+Community/i,
    /(.+?)\s+Condominiums/i,
    /(.+?)\s+Condos/i
  ]

  for (const pattern of patterns) {
    const match = address.match(pattern)
    if (match) {
      return match[1].trim()
    }
  }

  // If no pattern matches, return null
  return null
}