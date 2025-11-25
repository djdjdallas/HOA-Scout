/**
 * Search Page
 * Dedicated search interface with recent searches
 */

import SearchForm from '@/components/search/SearchForm'
import { getUserSearches } from '@/app/actions/hoa-search'
import Link from 'next/link'
import { Clock, MapPin } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export const metadata = {
  title: 'Search HOAs | HOA Scout',
  description: 'Search for comprehensive HOA reports by address or neighborhood',
}

export default async function SearchPage() {
  // Get user's recent searches if authenticated
  const { searches = [] } = await getUserSearches(5)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Search HOA Reports
          </h1>
          <p className="text-lg text-gray-600">
            Enter an address or HOA name to get started
          </p>
        </div>

        {/* Search Form */}
        <div className="mb-12">
          <SearchForm />
        </div>

        {/* Recent Searches */}
        {searches.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-gray-600" />
              Recent Searches
            </h2>
            <div className="space-y-3">
              {searches.map((search) => (
                <Link
                  key={search.id}
                  href={search.hoa_id ? `/reports/${search.hoa_id}` : '#'}
                  className="block p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {search.hoa?.hoa_name || search.search_query}
                      </h3>
                      {search.hoa && (
                        <div className="flex items-center mt-1 text-sm text-gray-600">
                          <MapPin className="h-3 w-3 mr-1" />
                          {search.hoa.city}, {search.hoa.state}
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(search.search_timestamp, 'relative')}
                      </p>
                    </div>
                    {search.hoa?.overall_score && (
                      <div className="ml-4">
                        <div className="text-2xl font-bold text-blue-600">
                          {search.hoa.overall_score.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-600 text-center">
                          Score
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Popular Searches/Examples */}
        <div className="mt-12 bg-blue-50 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-3">
            🔍 Try these popular areas:
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { location: 'Los Angeles, CA', desc: 'Urban HOAs with high-rise condos' },
              { location: 'Las Vegas, NV', desc: 'Master-planned communities' },
              { location: 'Marina del Rey, CA', desc: 'Waterfront HOAs' },
              { location: 'Henderson, NV', desc: 'Suburban family communities' },
            ].map((item) => (
              <div key={item.location} className="p-3 bg-white rounded-lg border border-blue-200">
                <p className="font-medium text-gray-900">{item.location}</p>
                <p className="text-xs text-gray-600 mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 text-center text-sm text-gray-600">
          <p>
            <strong>Note:</strong> Reports are generated from public records, community feedback,
            and AI analysis. For the most accurate information, always verify with the HOA directly.
          </p>
        </div>
      </div>
    </div>
  )
}