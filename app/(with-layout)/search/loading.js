/**
 * Loading state for search page
 */

import { Loader2 } from 'lucide-react'

export default function SearchLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Skeleton */}
        <div className="text-center mb-8">
          <div className="h-10 bg-gray-200 rounded-lg w-64 mx-auto mb-4 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded-lg w-96 mx-auto animate-pulse"></div>
        </div>

        {/* Search Card Skeleton */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 lg:p-8 mb-8">
          <div className="flex justify-center mb-6">
            <div className="h-10 bg-gray-200 rounded-lg w-full max-w-md animate-pulse"></div>
          </div>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-3 text-gray-500">Loading search...</span>
          </div>
        </div>

        {/* Popular Cities Skeleton */}
        <div className="bg-blue-50 rounded-xl p-6">
          <div className="h-6 bg-blue-200 rounded w-40 mb-4 animate-pulse"></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="p-3 bg-white rounded-lg border border-blue-200">
                <div className="h-5 bg-gray-200 rounded w-24 mb-1 animate-pulse"></div>
                <div className="h-4 bg-gray-100 rounded w-16 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
