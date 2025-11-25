/**
 * Neighborhood Context Component
 * Displays Yelp-powered neighborhood insights
 * Key feature for Yelp AI Hackathon
 */

'use client'

import { MapPin, Star, Coffee, ShoppingBag, Utensils, TreePine } from 'lucide-react'
import Image from 'next/image'

export default function NeighborhoodContext({ neighborhoodData, city, state }) {
  if (!neighborhoodData) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-blue-600" />
          Neighborhood Context
        </h3>
        <p className="text-gray-600">Neighborhood data not available</p>
      </div>
    )
  }

  const walkabilityColor =
    neighborhoodData.walkability_score >= 7 ? 'text-green-600' :
    neighborhoodData.walkability_score >= 5 ? 'text-yellow-600' :
    'text-orange-600'

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Header with Yelp Attribution */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-blue-600" />
          Neighborhood Context
        </h3>
        <div className="flex items-center text-xs text-gray-500">
          <span className="mr-1">Powered by</span>
          <span className="font-semibold text-red-600">Yelp</span>
        </div>
      </div>

      {/* Walkability Score */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Walkability Score</span>
          <span className={`text-2xl font-bold ${walkabilityColor}`}>
            {neighborhoodData.walkability_score}/10
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${walkabilityColor.replace('text-', 'bg-')}`}
            style={{ width: `${neighborhoodData.walkability_score * 10}%` }}
          />
        </div>
      </div>

      {/* Neighborhood Vibe */}
      {neighborhoodData.overall_vibe && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">The Vibe</h4>
          <p className="text-gray-700 leading-relaxed">
            {neighborhoodData.overall_vibe}
          </p>
        </div>
      )}

      {/* Business Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <Utensils className="h-6 w-6 mx-auto mb-1 text-orange-600" />
          <div className="text-2xl font-bold text-gray-900">
            {neighborhoodData.restaurant_count || 0}
          </div>
          <div className="text-xs text-gray-600">Restaurants</div>
        </div>

        <div className="text-center p-3 bg-amber-50 rounded-lg">
          <Coffee className="h-6 w-6 mx-auto mb-1 text-amber-600" />
          <div className="text-2xl font-bold text-gray-900">
            {neighborhoodData.coffee_count || 0}
          </div>
          <div className="text-xs text-gray-600">Coffee Shops</div>
        </div>

        <div className="text-center p-3 bg-green-50 rounded-lg">
          <TreePine className="h-6 w-6 mx-auto mb-1 text-green-600" />
          <div className="text-2xl font-bold text-gray-900">
            {neighborhoodData.parks_count || 0}
          </div>
          <div className="text-xs text-gray-600">Parks</div>
        </div>

        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <ShoppingBag className="h-6 w-6 mx-auto mb-1 text-purple-600" />
          <div className="text-2xl font-bold text-gray-900">
            {neighborhoodData.grocery_count || 0}
          </div>
          <div className="text-xs text-gray-600">Grocery Stores</div>
        </div>
      </div>

      {/* Top Rated Businesses */}
      {neighborhoodData.businesses && neighborhoodData.businesses.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Nearby Highlights
          </h4>
          <div className="space-y-3">
            {neighborhoodData.businesses.slice(0, 5).map((category, idx) => {
              if (!category.topRated || category.topRated.length === 0) return null

              return (
                <div key={idx}>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-2">
                    {category.label}
                  </p>
                  {category.topRated.slice(0, 2).map((business, bIdx) => (
                    <div
                      key={bIdx}
                      className="flex items-start space-x-3 mb-2 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {business.name}
                        </p>
                        <div className="flex items-center mt-1">
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-600 ml-1">
                              {business.rating}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400 mx-1">•</span>
                          <span className="text-xs text-gray-600">
                            {business.reviewCount} reviews
                          </span>
                          {business.distance && (
                            <>
                              <span className="text-xs text-gray-400 mx-1">•</span>
                              <span className="text-xs text-gray-600">
                                {(business.distance / 1609).toFixed(1)} mi
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      {business.priceLevel && (
                        <div className="text-xs font-medium text-green-600">
                          {business.priceLevel}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Yelp CTA */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <a
          href={`https://www.yelp.com/search?find_loc=${encodeURIComponent(`${city}, ${state}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Explore more on Yelp
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  )
}