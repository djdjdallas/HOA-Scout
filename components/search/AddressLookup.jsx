'use client'

import { useState } from 'react'
import { MapPin, Loader2, Search, AlertTriangle, CheckCircle } from 'lucide-react'
import HOAResultCard from './HOAResultCard'
import { cn } from '@/lib/utils'

export default function AddressLookup({ onSelect, className }) {
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [zip, setZip] = useState('')
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [geocodeResult, setGeocodeResult] = useState(null)
  const [hoaResults, setHoaResults] = useState([])
  const [error, setError] = useState(null)
  const [warning, setWarning] = useState(null)

  const handleGeocode = async () => {
    if (!address.trim()) {
      setError('Please enter a street address')
      return
    }

    setIsGeocoding(true)
    setError(null)
    setWarning(null)
    setGeocodeResult(null)
    setHoaResults([])

    try {
      const fullAddress = [address.trim(), city, 'FL', zip].filter(Boolean).join(', ')

      const response = await fetch('/api/hoa/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: fullAddress })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to find address')
        return
      }

      if (data.warning) {
        setWarning(data.warning)
      }

      if (data.success && data.data) {
        setGeocodeResult(data.data)
        // Auto-populate city and zip if found
        if (data.data.city) setCity(data.data.city)
        if (data.data.zip) setZip(data.data.zip)

        // If it's a Florida address, search for nearby HOAs
        if (data.data.isFloridaAddress) {
          await searchNearbyHOAs(data.data.city, data.data.zip)
        }
      }
    } catch (err) {
      setError('Failed to geocode address. Please try again.')
    } finally {
      setIsGeocoding(false)
    }
  }

  const searchNearbyHOAs = async (searchCity, searchZip) => {
    if (!searchCity && !searchZip) return

    setIsSearching(true)

    try {
      const params = new URLSearchParams()
      if (searchCity) params.append('city', searchCity)
      if (searchZip) params.append('zip', searchZip)
      params.append('limit', '10')

      const response = await fetch(`/api/hoa/browse?${params}`)
      const data = await response.json()

      if (data.success) {
        setHoaResults(data.results)
      }
    } catch (err) {
      console.error('Failed to search nearby HOAs:', err)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    handleGeocode()
  }

  const handleManualSearch = () => {
    if (city || zip) {
      searchNearbyHOAs(city, zip)
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Street Address */}
        <div>
          <label htmlFor="street-address" className="block text-sm font-medium text-gray-700 mb-1">
            Street Address
          </label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="street-address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 123 Main Street"
              className="w-full pl-12 pr-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* City and Zip Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="city-input" className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              id="city-input"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label htmlFor="zip-input-address" className="block text-sm font-medium text-gray-700 mb-1">
              Zip Code
            </label>
            <input
              id="zip-input-address"
              type="text"
              value={zip}
              onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
              placeholder="Zip"
              maxLength={5}
              className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* State (fixed to FL) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State
          </label>
          <input
            type="text"
            value="Florida"
            disabled
            className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600"
          />
          <p className="text-xs text-gray-500 mt-1">
            HOA Scout currently only covers Florida HOAs
          </p>
        </div>

        {/* Find My HOA Button */}
        <button
          type="submit"
          disabled={isGeocoding || !address.trim()}
          className="w-full px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {isGeocoding ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Finding Address...
            </>
          ) : (
            <>
              <Search className="h-5 w-5 mr-2" />
              Find My HOA
            </>
          )}
        </button>
      </form>

      {/* Geocode Success */}
      {geocodeResult && geocodeResult.isFloridaAddress && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-green-800 font-medium">Address found!</p>
            <p className="text-sm text-green-700">{geocodeResult.displayName}</p>
          </div>
        </div>
      )}

      {/* Warning (non-Florida address) */}
      {warning && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-yellow-800">{warning}</p>
            {geocodeResult && !geocodeResult.isFloridaAddress && (
              <button
                onClick={handleManualSearch}
                className="text-sm text-yellow-700 underline mt-1 hover:text-yellow-800"
              >
                Search anyway with entered city/zip
              </button>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading HOAs */}
      {isSearching && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400 mr-2" />
          <span className="text-gray-600">Searching for nearby HOAs...</span>
        </div>
      )}

      {/* HOA Results */}
      {hoaResults.length > 0 && !isSearching && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 font-medium">
            Found {hoaResults.length} HOA{hoaResults.length !== 1 ? 's' : ''} in this area:
          </p>
          <div className="space-y-2">
            {hoaResults.map((hoa) => (
              <HOAResultCard key={hoa.id} hoa={hoa} compact onSelect={onSelect} />
            ))}
          </div>
          <p className="text-xs text-gray-500 text-center">
            Don't see your HOA? It may not be in our database yet.
          </p>
        </div>
      )}

      {/* No Results */}
      {geocodeResult && geocodeResult.isFloridaAddress && !isSearching && hoaResults.length === 0 && (
        <div className="text-center py-6">
          <p className="text-gray-600">No HOAs found in this area</p>
          <p className="text-sm text-gray-500 mt-1">
            This property may not be part of an HOA, or the HOA isn't in our database yet.
          </p>
        </div>
      )}
    </div>
  )
}
