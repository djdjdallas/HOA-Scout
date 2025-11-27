/**
 * Address Geocoding API
 * POST /api/hoa/geocode { address: "123 Main St, Miami, FL" }
 * Uses OpenStreetMap Nominatim API (free, no key needed)
 * Returns { city, zip, lat, lon }
 */

import { NextResponse } from 'next/server'

// Rate limit: Nominatim requires max 1 request per second
// Add a simple delay mechanism
let lastRequestTime = 0
const MIN_REQUEST_INTERVAL = 1100 // 1.1 seconds to be safe

async function waitForRateLimit() {
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve =>
      setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
    )
  }

  lastRequestTime = Date.now()
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { address } = body

    if (!address || address.trim().length < 5) {
      return NextResponse.json(
        { error: 'Please provide a valid address' },
        { status: 400 }
      )
    }

    // Ensure we respect Nominatim's rate limit
    await waitForRateLimit()

    // Call OpenStreetMap Nominatim API
    const encodedAddress = encodeURIComponent(address.trim())
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&addressdetails=1&limit=1&countrycodes=us`

    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'HOAScout/1.0 (https://hoascout.com)',
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      console.error('Nominatim API error:', response.status)
      return NextResponse.json(
        { error: 'Geocoding service unavailable' },
        { status: 503 }
      )
    }

    const results = await response.json()

    if (!results || results.length === 0) {
      return NextResponse.json(
        { error: 'Address not found. Please try a more specific address.' },
        { status: 404 }
      )
    }

    const result = results[0]
    const addressDetails = result.address || {}

    // Extract city (try multiple fields as Nominatim uses different ones)
    const city = addressDetails.city ||
                 addressDetails.town ||
                 addressDetails.village ||
                 addressDetails.municipality ||
                 addressDetails.county ||
                 null

    // Extract zip code
    const zip = addressDetails.postcode || null

    // Verify this is in Florida (since we're focused on FL HOAs)
    const state = addressDetails.state || null
    const isFloridaAddress = state &&
      (state.toLowerCase() === 'florida' || state.toLowerCase() === 'fl')

    if (!isFloridaAddress) {
      return NextResponse.json({
        success: true,
        warning: 'This address appears to be outside Florida. HOA Scout currently only has Florida HOA data.',
        data: {
          city,
          zip,
          state,
          lat: parseFloat(result.lat),
          lon: parseFloat(result.lon),
          displayName: result.display_name,
          isFloridaAddress: false
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        city,
        zip,
        state: 'FL',
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon),
        displayName: result.display_name,
        isFloridaAddress: true
      }
    })
  } catch (error) {
    console.error('Geocoding error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred during geocoding' },
      { status: 500 }
    )
  }
}
