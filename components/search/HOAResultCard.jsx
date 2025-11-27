'use client'

import Link from 'next/link'
import { Building2, MapPin, Briefcase, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function HOAResultCard({ hoa, className, compact = false }) {
  const { id, hoa_name, city, state, zip_code, management_company, address } = hoa

  if (compact) {
    return (
      <Link
        href={`/reports/${id}`}
        className={cn(
          'block p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group',
          className
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 truncate group-hover:text-blue-700">
              {hoa_name}
            </h4>
            <p className="text-sm text-gray-600 flex items-center mt-0.5">
              <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">
                {city}, {state} {zip_code}
              </span>
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 flex-shrink-0 ml-2 transition-colors" />
        </div>
      </Link>
    )
  }

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all group',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-700">
                {hoa_name}
              </h3>
              <p className="text-sm text-gray-600 flex items-center">
                <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                {city}, {state} {zip_code}
              </p>
            </div>
          </div>

          {address && (
            <p className="text-sm text-gray-500 mt-2 truncate">
              {address}
            </p>
          )}

          {management_company && (
            <p className="text-sm text-gray-500 mt-2 flex items-center">
              <Briefcase className="h-3 w-3 mr-1.5 flex-shrink-0" />
              <span className="truncate">{management_company}</span>
            </p>
          )}
        </div>

        <Link
          href={`/reports/${id}`}
          className="ml-4 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center flex-shrink-0"
        >
          View Report
          <ArrowRight className="h-4 w-4 ml-1.5" />
        </Link>
      </div>
    </div>
  )
}
