/**
 * Search Form Component
 * Main search interface for finding HOAs by address
 */

'use client'

import { useState } from 'react'
import { Search, Loader2, MapPin, ArrowRight } from 'lucide-react'
import { searchHOA } from '@/app/actions/hoa-search'
import { useRouter } from 'next/navigation'

export default function SearchForm({ className = '', showExamples = true, buttonText = 'Get Report', placeholder = 'Enter property address or HOA name...' }) {
  const [address, setAddress] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setIsSearching(true)

    try {
      const formData = new FormData()
      formData.append('address', address)

      const result = await searchHOA(formData)

      if (!result.success) {
        setError(result.error)
        setIsSearching(false)
        return
      }

      // Redirect to report page
      router.push(`/reports/${result.hoaId}`)
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      setIsSearching(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-12 pr-32 py-4 text-base border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
            required
            disabled={isSearching}
          />
          <button
            type="submit"
            disabled={isSearching || !address.trim()}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2.5 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isSearching ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <span>{buttonText}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2 animate-slide-up">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Example Searches */}
        {showExamples && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Try these examples:</p>
            <div className="flex flex-wrap gap-2">
              {[
                '1234 Sunset Blvd, Los Angeles, CA',
                'Marina del Rey, CA 90292',
                'Las Vegas, NV 89134'
              ].map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setAddress(example)}
                  className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                  disabled={isSearching}
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </form>
  )
}