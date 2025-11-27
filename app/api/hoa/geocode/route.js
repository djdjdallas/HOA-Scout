/**
 * Address Geocoding API
 * POST /api/hoa/geocode { address: "123 Main St, Miami, FL" }
 * Uses Google Maps API (primary) with OpenStreetMap Nominatim fallback
 * Returns { city, zip, lat, lon }
 */

import { NextResponse } from 'next/server'

// Rate limit for Nominatim: max 1 request per second
let lastNominatimRequest = 0
const MIN_NOMINATIM_INTERVAL = 1100

async function waitForNominatimRateLimit() {
  const now = Date.now()
  const timeSinceLastRequest = now - lastNominatimRequest

  if (timeSinceLastRequest < MIN_NOMINATIM_INTERVAL) {
    await new Promise(resolve =>
      setTimeout(resolve, MIN_NOMINATIM_INTERVAL - timeSinceLastRequest)
    )
  }

  lastNominatimRequest = Date.now()
}

/**
 * Try Google Maps Geocoding API first (more reliable)
 */
async function geocodeWithGoogle(address) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    console.log('[GEOCODE] No Google Maps API key configured')
    return null
  }

  try {
    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json')
    url.searchParams.append('address', address)
    url.searchParams.append('key', apiKey)
    url.searchParams.append('components', 'country:US')

    console.log('[GEOCODE] Calling Google Maps API...')
    const response = await fetch(url.toString())

    if (!response.ok) {
      console.error('[GEOCODE] Google Maps HTTP error:', response.status)
      return null
    }

    const data = await response.json()
    console.log('[GEOCODE] Google Maps status:', data.status)

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      console.log('[GEOCODE] Google Maps returned no results')
      return null
    }

    const result = data.results[0]
    const components = result.address_components || []

    // Extract address parts
    let city = ''
    let state = ''
    let zip = ''

    components.forEach(component => {
      const types = component.types
      if (types.includes('locality')) {
        city = component.long_name
      }
      if (types.includes('sublocality_level_1') && !city) {
        city = component.long_name
      }
      if (types.includes('administrative_area_level_1')) {
        state = component.short_name
      }
      if (types.includes('postal_code')) {
        zip = component.long_name
      }
    })

    return {
      city: city || null,
      zip: zip || null,
      state: state || null,
      lat: result.geometry.location.lat,
      lon: result.geometry.location.lng,
      displayName: result.formatted_address,
      source: 'google'
    }
  } catch (error) {
    console.error('[GEOCODE] Google Maps error:', error.message)
    return null
  }
}

/**
 * Fallback to Nominatim (OpenStreetMap)
 */
async function geocodeWithNominatim(address) {
  try {
    await waitForNominatimRateLimit()

    const encodedAddress = encodeURIComponent(address.trim())
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&addressdetails=1&limit=1&countrycodes=us`

    console.log('[GEOCODE] Calling Nominatim fallback...')
    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'HOAScout/1.0 (https://hoascout.com)',
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      console.error('[GEOCODE] Nominatim HTTP error:', response.status)
      return null
    }

    const results = await response.json()
    console.log('[GEOCODE] Nominatim results count:', results?.length || 0)

    if (!results || results.length === 0) {
      return null
    }

    const result = results[0]
    const addressDetails = result.address || {}

    const city = addressDetails.city ||
                 addressDetails.town ||
                 addressDetails.village ||
                 addressDetails.municipality ||
                 addressDetails.county ||
                 null

    const state = addressDetails.state || null
    const zip = addressDetails.postcode || null

    // Convert state name to code
    let stateCode = state
    if (state?.toLowerCase() === 'florida') stateCode = 'FL'

    return {
      city,
      zip,
      state: stateCode,
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      displayName: result.display_name,
      source: 'nominatim'
    }
  } catch (error) {
    console.error('[GEOCODE] Nominatim error:', error.message)
    return null
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { address } = body

    console.log('[GEOCODE] Received request for address:', address)

    if (!address || address.trim().length < 5) {
      console.log('[GEOCODE] Invalid address - too short or empty')
      return NextResponse.json(
        { error: 'Please provide a valid address' },
        { status: 400 }
      )
    }

    // Try Google Maps first, then Nominatim as fallback
    let result = await geocodeWithGoogle(address.trim())

    if (!result) {
      console.log('[GEOCODE] Google failed, trying Nominatim fallback...')
      result = await geocodeWithNominatim(address.trim())
    }

    if (!result) {
      console.log('[GEOCODE] All geocoding services failed for:', address)
      return NextResponse.json(
        { error: 'Address not found. Please try a more specific address.' },
        { status: 404 }
      )
    }

    console.log('[GEOCODE] Success via', result.source, '- City:', result.city, 'State:', result.state)

    // Check if Florida address
    const isFloridaAddress = result.state &&
      (result.state.toLowerCase() === 'florida' || result.state.toLowerCase() === 'fl')

    if (!isFloridaAddress) {
      return NextResponse.json({
        success: true,
        warning: 'This address appears to be outside Florida. HOA Scout currently only has Florida HOA data.',
        data: {
          city: result.city,
          zip: result.zip,
          state: result.state,
          lat: result.lat,
          lon: result.lon,
          displayName: result.displayName,
          isFloridaAddress: false
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        city: result.city,
        zip: result.zip,
        state: 'FL',
        lat: result.lat,
        lon: result.lon,
        displayName: result.displayName,
        isFloridaAddress: true
      }
    })
  } catch (error) {
    console.error('[GEOCODE] Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred during geocoding' },
      { status: 500 }
    )
  }
}
