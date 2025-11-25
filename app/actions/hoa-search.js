/**
 * Server Action: Search for HOA and initiate analysis
 * This is the main entry point when a user searches for an HOA
 */

'use server'

import { createClient, createServiceClient, getCurrentUser } from '@/lib/supabase/server'
import { geocodeAddress, extractHOAName } from '@/lib/apis/geocoding'
import { revalidatePath } from 'next/cache'
import { analyzeHOA } from './analyze-hoa'

/**
 * Search for an HOA by address
 * Returns existing data if available, otherwise initiates new analysis
 */
export async function searchHOA(formData) {
  try {
    const address = formData.get('address')

    if (!address) {
      return {
        success: false,
        error: 'Please enter an address'
      }
    }

    console.log('Searching for HOA at:', address)

    // Get current user (optional - searches work for anonymous users too)
    const user = await getCurrentUser()

    // Step 1: Geocode the address to get location details
    const location = await geocodeAddress(address)

    if (!location || location.confidence < 0.3) {
      return {
        success: false,
        error: 'Could not find that address. Please try a more specific address.'
      }
    }

    // Extract HOA name from address if possible, or create a unique one
    const extractedHOAName = extractHOAName(address)
    // Make HOA name unique by including street address if it's "Unknown"
    const hoaName = extractedHOAName || `HOA at ${location.streetAddress || address.split(',')[0].trim()}`

    // Step 2: Check if we already have this HOA in database
    const supabase = createServiceClient()

    // Try to find by location proximity (same city/state and nearby coordinates)
    // Get all HOAs in the same city/state/zip
    const { data: potentialMatches } = await supabase
      .from('hoa_profiles')
      .select('*')
      .eq('city', location.city)
      .eq('state', location.stateCode)
      .eq('zip_code', location.zipCode)

    // Find the closest match by coordinates (within ~200 meters / 0.002 degrees)
    let existingHOA = null
    if (potentialMatches && potentialMatches.length > 0) {
      const PROXIMITY_THRESHOLD = 0.002 // ~200 meters in degrees

      existingHOA = potentialMatches.find(hoa => {
        if (!hoa.coordinates) return false
        const latDiff = Math.abs(hoa.coordinates.lat - location.lat)
        const lngDiff = Math.abs(hoa.coordinates.lng - location.lng)
        const isNearby = latDiff < PROXIMITY_THRESHOLD && lngDiff < PROXIMITY_THRESHOLD

        if (isNearby) {
          console.log(`🎯 Found nearby HOA: ${hoa.hoa_name} (${latDiff.toFixed(6)}°, ${lngDiff.toFixed(6)}° away)`)
        }

        return isNearby
      })

      if (!existingHOA) {
        console.log(`📍 No nearby HOAs found. ${potentialMatches.length} HOAs in same zip code but too far away.`)
      }
    }

    // Step 3: Log the search (for analytics)
    const searchLog = {
      user_id: user?.id || null,
      search_query: address,
      search_address: location.formattedAddress,
      search_result_status: 'processing',
      ip_address: null, // Would need to get from request headers
      user_agent: null  // Would need to get from request headers
    }

    if (existingHOA) {
      console.log('📦 Found existing HOA:', existingHOA.id)
      console.log('🔍 Checking analysis status - overall_score:', existingHOA.overall_score)

      // Check if analysis has been completed AND is good quality
      const isAnalyzed = existingHOA.overall_score !== null
      const isLowQuality = existingHOA.data_completeness <= 30 // Fallback analysis produces 25%
      const needsReanalysis = !isAnalyzed || isLowQuality

      if (needsReanalysis) {
        const reason = !isAnalyzed ? 'not analyzed yet' : 'low quality data (likely fallback)'
        console.log(`⚠️ HOA exists but ${reason} - triggering re-analysis`)
        // Trigger analysis for unanalyzed HOA
        analyzeHOA(existingHOA.id)
          .then(result => {
            console.log('✅ Analysis completed for existing HOA:', existingHOA.id, result)
          })
          .catch(error => {
            console.error('❌ Background analysis error for existing HOA:', existingHOA.id, error)
          })

        searchLog.hoa_id = existingHOA.id
        searchLog.search_result_status = 'processing'

        await supabase
          .from('user_searches')
          .insert(searchLog)

        return {
          success: true,
          hoaId: existingHOA.id,
          cached: true,
          processing: true,
          data: existingHOA
        }
      }

      // Check if data is recent (less than 30 days old) AND good quality
      const daysSinceUpdate = (Date.now() - new Date(existingHOA.last_updated).getTime()) / (1000 * 60 * 60 * 24)
      const hasGoodQuality = existingHOA.data_completeness > 30

      if (daysSinceUpdate < 30 && hasGoodQuality) {
        // Data is fresh, analyzed, and good quality - return it
        console.log('✅ Returning fresh analyzed HOA (quality:', existingHOA.data_completeness + '%)')
        searchLog.hoa_id = existingHOA.id
        searchLog.search_result_status = 'found'

        await supabase
          .from('user_searches')
          .insert(searchLog)

        return {
          success: true,
          hoaId: existingHOA.id,
          cached: true,
          data: existingHOA
        }
      }

      // Data is stale or low quality, trigger immediate re-analysis
      const staleReason = !hasGoodQuality ? 'low quality' : 'stale'
      console.log(`⚠️ HOA data is ${staleReason}, triggering re-analysis`)

      // Trigger immediate re-analysis instead of just queueing
      analyzeHOA(existingHOA.id)
        .then(result => {
          console.log('✅ Re-analysis completed for HOA:', existingHOA.id, result)
        })
        .catch(error => {
          console.error('❌ Re-analysis error for HOA:', existingHOA.id, error)
        })

      searchLog.hoa_id = existingHOA.id
      searchLog.search_result_status = 'processing'

      await supabase
        .from('user_searches')
        .insert(searchLog)

      return {
        success: true,
        hoaId: existingHOA.id,
        cached: true,
        processing: true, // Indicate re-analysis is happening
        stale: true,
        data: existingHOA
      }
    }

    // Step 4: No existing HOA found, create new profile and queue analysis
    console.log('🆕 No existing HOA found, creating new profile...')
    const { data: newHOA, error: createError } = await supabase
      .from('hoa_profiles')
      .insert({
        hoa_name: hoaName,
        address: location.streetAddress || address,
        city: location.city,
        state: location.stateCode,
        zip_code: location.zipCode,
        coordinates: { lat: location.lat, lng: location.lng },
        data_completeness: 10, // Just basic info so far
        overall_score: null, // Will be populated by analysis
        one_sentence_summary: 'Analysis in progress...'
      })
      .select()
      .single()

    if (createError) {
      console.error('❌ Error creating HOA profile:', createError)
      return {
        success: false,
        error: 'Failed to create HOA profile. Please try again.'
      }
    }
    console.log('✅ Created new HOA profile:', newHOA.id)

    // Step 5: Queue background analysis job
    const { error: queueError } = await supabase
      .from('processing_queue')
      .insert({
        job_type: 'analyze_hoa',
        status: 'pending',
        payload: {
          hoaId: newHOA.id,
          hoaName,
          address: location.formattedAddress,
          city: location.city,
          state: location.stateCode,
          zipCode: location.zipCode,
          lat: location.lat,
          lng: location.lng
        }
      })

    if (queueError) {
      console.error('Error queuing analysis:', queueError)
    }

    // Log the search
    searchLog.hoa_id = newHOA.id
    searchLog.search_result_status = 'processing'

    await supabase
      .from('user_searches')
      .insert(searchLog)

    // Trigger the analysis asynchronously (don't await - let it run in background)
    console.log('🚀 Triggering analysis for HOA:', newHOA.id)
    analyzeHOA(newHOA.id)
      .then(result => {
        console.log('✅ Analysis completed for HOA:', newHOA.id, result)
      })
      .catch(error => {
        console.error('❌ Background analysis error for HOA:', newHOA.id, error)
      })

    // Trigger revalidation of the search page
    revalidatePath('/search')

    return {
      success: true,
      hoaId: newHOA.id,
      cached: false,
      processing: true,
      data: newHOA
    }
  } catch (error) {
    console.error('HOA search error:', error)

    return {
      success: false,
      error: error.message || 'An unexpected error occurred during search'
    }
  }
}

/**
 * Get HOA data by ID
 */
export async function getHOAById(hoaId) {
  try {
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('hoa_profiles')
      .select(`
        *,
        neighborhood_context (*)
      `)
      .eq('id', hoaId)
      .single()

    if (error) {
      console.error('Error fetching HOA:', error)
      return { success: false, error: error.message }
    }

    return {
      success: true,
      data
    }
  } catch (error) {
    console.error('Get HOA error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Get recent HOA searches for the current user
 */
export async function getUserSearches(limit = 10) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { success: true, searches: [] }
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('user_searches')
      .select(`
        *,
        hoa:hoa_profiles (
          id,
          hoa_name,
          city,
          state,
          overall_score,
          one_sentence_summary
        )
      `)
      .eq('user_id', user.id)
      .order('search_timestamp', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching searches:', error)
      return { success: false, error: error.message }
    }

    return {
      success: true,
      searches: data || []
    }
  } catch (error) {
    console.error('Get searches error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Save an HOA report to user's saved reports
 */
export async function saveReport(hoaId, notes = '') {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return {
        success: false,
        error: 'Please sign in to save reports'
      }
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('saved_reports')
      .upsert({
        user_id: user.id,
        hoa_id: hoaId,
        notes,
        saved_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,hoa_id'
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving report:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard')

    return {
      success: true,
      data
    }
  } catch (error) {
    console.error('Save report error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Remove a saved report
 */
export async function unsaveReport(hoaId) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return {
        success: false,
        error: 'Please sign in to manage saved reports'
      }
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('saved_reports')
      .delete()
      .eq('user_id', user.id)
      .eq('hoa_id', hoaId)

    if (error) {
      console.error('Error removing saved report:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard')

    return { success: true }
  } catch (error) {
    console.error('Unsave report error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Get user's saved reports
 */
export async function getSavedReports() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { success: true, reports: [] }
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('saved_reports')
      .select(`
        *,
        hoa:hoa_profiles (
          id,
          hoa_name,
          city,
          state,
          zip_code,
          overall_score,
          one_sentence_summary,
          monthly_fee,
          last_updated
        )
      `)
      .eq('user_id', user.id)
      .order('saved_at', { ascending: false })

    if (error) {
      console.error('Error fetching saved reports:', error)
      return { success: false, error: error.message }
    }

    return {
      success: true,
      reports: data || []
    }
  } catch (error) {
    console.error('Get saved reports error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Provide user feedback on search results
 */
export async function submitSearchFeedback(searchId, feedback, rating = null) {
  try {
    const user = await getCurrentUser()

    const supabase = user ? await createClient() : createServiceClient()

    const updateData = {
      user_feedback: feedback,
      feedback_timestamp: new Date().toISOString()
    }

    if (rating !== null) {
      updateData.feedback_rating = rating
    }

    const { error } = await supabase
      .from('user_searches')
      .update(updateData)
      .eq('id', searchId)
      .eq('user_id', user?.id) // Ensure user can only update their own searches

    if (error) {
      console.error('Error submitting feedback:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Submit feedback error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Queue an HOA for data refresh
 */
async function queueHOARefresh(hoaId) {
  try {
    const supabase = createServiceClient()

    await supabase
      .from('processing_queue')
      .insert({
        job_type: 'refresh_data',
        status: 'pending',
        payload: { hoaId }
      })
  } catch (error) {
    console.error('Error queuing refresh:', error)
  }
}