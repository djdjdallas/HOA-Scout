/**
 * Neighborhood Prompt Component - Dossier Theme
 * Prompts users to enter their property address to get neighborhood data
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Loader2, Search, Home } from 'lucide-react'

export default function NeighborhoodPrompt({ hoaId }) {
  const router = useRouter()
  const [address, setAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!address.trim()) {
      setError('Please enter your property address')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Geocode the address
      const response = await fetch('/api/hoa/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: address.trim() + ', FL' })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.error || 'Could not find that address. Please try again.')
        return
      }

      // API returns 'lon' not 'lng'
      const lat = data.data?.lat
      const lng = data.data?.lon || data.data?.lng

      if (!lat || !lng) {
        setError('Could not determine location for this address.')
        return
      }

      // Redirect to the same report page with the address params
      const params = new URLSearchParams()
      params.set('lat', lat.toString())
      params.set('lng', lng.toString())
      params.set('address', data.data.displayName || address)

      router.push(`/reports/${hoaId}?${params.toString()}`)
    } catch (err) {
      console.error('Geocode error:', err)
      setError('Failed to look up address. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-dossier-surface/50 rounded border border-dossier-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-dossier-border">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-cyan-400" />
          <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400">
            Area Intelligence
          </h3>
        </div>
      </div>

      <div className="p-5">
        {/* Prompt Message */}
        <div className="mb-5 p-4 bg-slate-800/50 rounded border-l-2 border-amber-500/50">
          <div className="flex items-start gap-3">
            <Home className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Enter your property address to see walkability scores, nearby restaurants,
                coffee shops, parks, and more for your specific location.
              </p>
              <p className="text-[10px] font-mono text-slate-500 mt-2">
                Note: HOA addresses are often corporate/management offices, not where homes are located.
              </p>
            </div>
          </div>
        </div>

        {/* Address Input Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label
              htmlFor="property-address"
              className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2"
            >
              Your Property Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                id="property-address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 123 Palm Beach Blvd, Boca Raton"
                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-dossier-border rounded text-sm text-slate-200 placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none transition-colors font-mono"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !address.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 disabled:cursor-not-allowed text-dossier-bg font-mono text-sm font-semibold rounded transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Looking up address...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Get Neighborhood Data
              </>
            )}
          </button>
        </form>

        {/* Data Source Note */}
        <div className="mt-5 pt-4 border-t border-dossier-border">
          <p className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
            <span>Data powered by</span>
            <span className="text-red-400 font-semibold">Yelp</span>
          </p>
        </div>
      </div>
    </div>
  )
}
