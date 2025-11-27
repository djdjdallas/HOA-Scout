/**
 * Neighborhood Context Component - Dossier Theme
 * Displays Yelp-powered neighborhood insights
 * with an intelligence report aesthetic
 */

'use client'

import { MapPin, Star, Coffee, ShoppingBag, Utensils, TreePine, ExternalLink, Home } from 'lucide-react'

export default function NeighborhoodContext({ neighborhoodData, city, state, userAddress = null, source = null }) {
  if (!neighborhoodData) {
    return (
      <div className="bg-dossier-surface/50 rounded border border-dossier-border p-6">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="h-4 w-4 text-slate-500" />
          <h3 className="text-xs font-mono uppercase tracking-widest text-slate-500">
            Area Intelligence
          </h3>
        </div>
        <p className="text-sm text-slate-400">Neighborhood data not available</p>
      </div>
    )
  }

  // Check if this is data for user's specific address
  const isUserAddress = source === 'user_address' && userAddress

  const walkabilityColor =
    neighborhoodData.walkability_score >= 7 ? 'text-cyan-400' :
    neighborhoodData.walkability_score >= 5 ? 'text-amber-400' :
    'text-orange-400'

  const walkabilityBg =
    neighborhoodData.walkability_score >= 7 ? 'bg-cyan-500' :
    neighborhoodData.walkability_score >= 5 ? 'bg-amber-500' :
    'bg-orange-500'

  return (
    <div className="bg-dossier-surface/50 rounded border border-dossier-border">
      {/* Header with Yelp Attribution */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-dossier-border">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-cyan-400" />
          <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400">
            Area Intelligence
          </h3>
        </div>
        <div className="flex items-center text-[10px] font-mono uppercase tracking-wider text-slate-500">
          <span className="mr-1">Data:</span>
          <span className="text-red-400 font-semibold">Yelp</span>
        </div>
      </div>

      {/* User Address Indicator */}
      {isUserAddress && (
        <div className="px-5 py-3 bg-cyan-500/10 border-b border-cyan-500/20">
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-mono text-cyan-300">
              Data for your address: {userAddress}
            </span>
          </div>
        </div>
      )}

      <div className="p-5">
        {/* Walkability Score */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
              Walkability Index
            </span>
            <span className={`text-xl font-mono font-bold tabular-nums ${walkabilityColor}`}>
              {neighborhoodData.walkability_score}<span className="text-slate-500 text-sm">/10</span>
            </span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${walkabilityBg} transition-all duration-500`}
              style={{ width: `${neighborhoodData.walkability_score * 10}%` }}
            />
          </div>
        </div>

        {/* Neighborhood Vibe */}
        {neighborhoodData.overall_vibe && (
          <div className="mb-6 p-4 bg-slate-800/50 rounded border-l-2 border-cyan-500/50">
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2">
              Area Profile
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">
              {neighborhoodData.overall_vibe}
            </p>
          </div>
        )}

        {/* Business Categories Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <MetricBox
            icon={<Utensils className="h-4 w-4" />}
            value={neighborhoodData.restaurant_count || 0}
            label="Restaurants"
            color="orange"
          />
          <MetricBox
            icon={<Coffee className="h-4 w-4" />}
            value={neighborhoodData.coffee_count || 0}
            label="Coffee"
            color="amber"
          />
          <MetricBox
            icon={<TreePine className="h-4 w-4" />}
            value={neighborhoodData.parks_count || 0}
            label="Parks"
            color="green"
          />
          <MetricBox
            icon={<ShoppingBag className="h-4 w-4" />}
            value={neighborhoodData.grocery_count || 0}
            label="Grocery"
            color="purple"
          />
        </div>

        {/* Top Rated Businesses */}
        {neighborhoodData.businesses && neighborhoodData.businesses.length > 0 && (
          <div className="border-t border-dossier-border pt-5">
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-4">
              Notable Nearby
            </p>
            <div className="space-y-4">
              {neighborhoodData.businesses.slice(0, 3).map((category, idx) => {
                if (!category.topRated || category.topRated.length === 0) return null

                return (
                  <div key={idx}>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-cyan-400/80 mb-2">
                      {category.label}
                    </p>
                    <div className="space-y-2">
                      {category.topRated.slice(0, 2).map((business, bIdx) => (
                        <div
                          key={bIdx}
                          className="flex items-start justify-between p-2 rounded bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-200 truncate">
                              {business.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                                <span className="text-xs font-mono text-slate-400">
                                  {business.rating}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-600">•</span>
                              <span className="text-[10px] font-mono text-slate-500">
                                {business.reviewCount} reviews
                              </span>
                              {business.distance && (
                                <>
                                  <span className="text-[10px] text-slate-600">•</span>
                                  <span className="text-[10px] font-mono text-slate-500">
                                    {(business.distance / 1609).toFixed(1)}mi
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          {business.priceLevel && (
                            <span className="text-xs font-mono text-cyan-400/80 ml-2">
                              {business.priceLevel}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Yelp CTA */}
        <div className="mt-5 pt-4 border-t border-dossier-border">
          <a
            href={`https://www.yelp.com/search?find_loc=${encodeURIComponent(`${city}, ${state}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Full Area Report
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  )
}

function MetricBox({ icon, value, label, color }) {
  const colors = {
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    green: 'text-green-400 bg-green-500/10 border-green-500/30',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
  }

  const colorClass = colors[color] || colors.cyan

  return (
    <div className={`flex items-center gap-3 p-3 rounded border ${colorClass}`}>
      <div className="flex-shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-lg font-mono font-bold tabular-nums text-slate-200">
          {value}
        </div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
          {label}
        </div>
      </div>
    </div>
  )
}
