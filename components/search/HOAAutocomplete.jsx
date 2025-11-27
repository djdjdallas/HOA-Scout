'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, Loader2, Building2, MapPin, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function HOAAutocomplete({ onSelect, className }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [error, setError] = useState(null)

  const inputRef = useRef(null)
  const dropdownRef = useRef(null)
  const router = useRouter()

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/hoa/search?q=${encodeURIComponent(query)}&limit=10`)
        const data = await response.json()

        if (data.success) {
          setResults(data.results)
          setIsOpen(data.results.length > 0)
          setSelectedIndex(-1)
        } else {
          setError(data.error || 'Search failed')
          setResults([])
        }
      } catch (err) {
        setError('Failed to search. Please try again.')
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [query])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !inputRef.current?.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!isOpen || results.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelect(results[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        break
    }
  }, [isOpen, results, selectedIndex])

  const handleSelect = (hoa) => {
    setQuery(hoa.hoa_name)
    setIsOpen(false)
    setSelectedIndex(-1)

    if (onSelect) {
      onSelect(hoa)
    } else {
      router.push(`/reports/${hoa.id}`)
    }
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setIsOpen(false)
    setError(null)
    inputRef.current?.focus()
  }

  // Highlight matching text
  const highlightMatch = (text, query) => {
    if (!query.trim()) return text

    const parts = text.split(new RegExp(`(${query})`, 'gi'))
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 text-gray-900 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Search by HOA name..."
          className="w-full pl-12 pr-12 py-3 text-base border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
          aria-label="Search HOAs by name"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          role="combobox"
        />
        {isLoading ? (
          <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-600 animate-spin" />
        ) : query && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-[320px] overflow-y-auto"
          role="listbox"
        >
          {results.map((hoa, index) => (
            <button
              key={hoa.id}
              onClick={() => handleSelect(hoa)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={cn(
                'w-full px-4 py-3 text-left transition-colors flex items-start',
                selectedIndex === index ? 'bg-blue-50' : 'hover:bg-gray-50'
              )}
              role="option"
              aria-selected={selectedIndex === index}
            >
              <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                <Building2 className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {highlightMatch(hoa.hoa_name, query)}
                </p>
                <p className="text-sm text-gray-600 flex items-center mt-0.5">
                  <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                  {hoa.city}, {hoa.state} {hoa.zip_code}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {isOpen && query.length >= 2 && results.length === 0 && !isLoading && !error && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-center">
          <p className="text-gray-600">No HOAs found matching "{query}"</p>
          <p className="text-sm text-gray-500 mt-1">Try a different name or browse by location</p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  )
}
