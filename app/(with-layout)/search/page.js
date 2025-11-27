/**
 * Search Page
 * Dedicated search interface with recent searches and hybrid search
 */

import HybridSearch from '@/components/search/HybridSearch'
import { getUserSearches } from '@/app/actions/hoa-search'
import Link from 'next/link'
import { Clock, MapPin, Database, ArrowLeft } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export const metadata = {
  title: 'Search HOAs | HOA Scout',
  description: 'Search for Florida HOAs by name, location, or address. Access 16,000+ HOA profiles.',
}

export default async function SearchPage() {
  // Get user's recent searches if authenticated
  const { searches = [] } = await getUserSearches(5)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Find Your HOA
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Search by name, browse by location, or look up by address
          </p>
          <p className="text-sm text-gray-500 flex items-center justify-center">
            <Database className="h-4 w-4 mr-1" />
            16,000+ Florida HOAs in our database
          </p>
        </div>

        {/* Main Search Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 lg:p-8 mb-8">
          <HybridSearch defaultTab="name" />
        </div>

        {/* Recent Searches */}
        {searches.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-gray-600" />
              Your Recent Searches
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

        {/* Popular Florida Cities */}
        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-3">
            Popular Florida Cities
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { city: 'Miami', count: '2,500+' },
              { city: 'Orlando', count: '1,800+' },
              { city: 'Tampa', count: '1,400+' },
              { city: 'Jacksonville', count: '1,200+' },
              { city: 'Fort Lauderdale', count: '900+' },
              { city: 'West Palm Beach', count: '800+' },
              { city: 'Naples', count: '600+' },
              { city: 'Sarasota', count: '500+' },
            ].map((item) => (
              <div key={item.city} className="p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-400 transition-colors cursor-pointer">
                <p className="font-medium text-gray-900">{item.city}</p>
                <p className="text-xs text-gray-500">{item.count} HOAs</p>
              </div>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            <strong>Note:</strong> HOA data is sourced from Florida SunBiz corporate records.
            Reports are generated using AI analysis. For the most accurate information,
            always verify with the HOA directly.
          </p>
        </div>
      </div>
    </div>
  )
}