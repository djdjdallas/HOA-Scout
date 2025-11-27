'use client'

import { useState, useEffect } from 'react'
import { Search, Loader2, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import HOAResultCard from './HOAResultCard'
import { cn } from '@/lib/utils'

export default function CityZipBrowser({ onSelect, className }) {
  const [cities, setCities] = useState([])
  const [selectedCity, setSelectedCity] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [results, setResults] = useState([])
  const [isLoadingCities, setIsLoadingCities] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
    hasMore: false
  })

  // Load cities on mount
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch('/api/cities')
        const data = await response.json()

        if (data.success) {
          setCities(data.cities)
        } else {
          setError('Failed to load cities')
        }
      } catch (err) {
        setError('Failed to load cities')
      } finally {
        setIsLoadingCities(false)
      }
    }

    fetchCities()
  }, [])

  const searchHOAs = async (page = 1) => {
    if (!selectedCity && !zipCode) {
      setError('Please select a city or enter a zip code')
      return
    }

    setIsSearching(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (selectedCity) params.append('city', selectedCity)
      if (zipCode) params.append('zip', zipCode)
      params.append('page', page.toString())
      params.append('limit', '20')

      const response = await fetch(`/api/hoa/browse?${params}`)
      const data = await response.json()

      if (data.success) {
        setResults(data.results)
        setPagination(data.pagination)
      } else {
        setError(data.error || 'Search failed')
        setResults([])
      }
    } catch (err) {
      setError('Failed to search. Please try again.')
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    searchHOAs(1)
  }

  const handlePageChange = (newPage) => {
    searchHOAs(newPage)
  }

  return (
    <div className={cn('space-y-4', className)}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* City Select */}
        <div>
          <label htmlFor="city-select" className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <div className="relative">
            <select
              id="city-select"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              disabled={isLoadingCities}
              className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-colors appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {isLoadingCities ? 'Loading cities...' : 'Select a city'}
              </option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Zip Code Input */}
        <div>
          <label htmlFor="zip-input" className="block text-sm font-medium text-gray-700 mb-1">
            Zip Code (optional)
          </label>
          <input
            id="zip-input"
            type="text"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
            placeholder="e.g. 33139"
            maxLength={5}
            className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Search Button */}
        <button
          type="submit"
          disabled={isSearching || (!selectedCity && !zipCode)}
          className="w-full px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {isSearching ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Searching...
            </>
          ) : (
            <>
              <Search className="h-5 w-5 mr-2" />
              Browse HOAs
            </>
          )}
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Found <span className="font-semibold">{pagination.total}</span> HOAs
            </p>
            {pagination.totalPages > 1 && (
              <p className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.totalPages}
              </p>
            )}
          </div>

          <div className="space-y-2">
            {results.map((hoa) => (
              <HOAResultCard key={hoa.id} hoa={hoa} compact onSelect={onSelect} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1 || isSearching}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i
                  } else {
                    pageNum = pagination.page - 2 + i
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      disabled={isSearching}
                      className={cn(
                        'w-10 h-10 rounded-lg text-sm font-medium transition-colors',
                        pagination.page === pageNum
                          ? 'bg-gray-900 text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      )}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasMore || isSearching}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* No results */}
      {!isSearching && results.length === 0 && pagination.total === 0 && selectedCity && (
        <div className="text-center py-8">
          <p className="text-gray-600">No HOAs found in {selectedCity}</p>
          <p className="text-sm text-gray-500 mt-1">Try selecting a different city</p>
        </div>
      )}
    </div>
  )
}
