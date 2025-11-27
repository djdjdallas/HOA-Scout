/**
 * Enrichment Status Component - Dossier Theme
 * Shows Perplexity enrichment status and triggers on-demand enrichment
 */

'use client'

import { useState, useEffect } from 'react'
import { enrichHOAData } from '@/app/actions/enrich-hoa'
import {
  Loader2, Search, CheckCircle2, AlertCircle, RefreshCw,
  Phone, Mail, Globe, MapPin, Building, ExternalLink, Clock
} from 'lucide-react'

export default function EnrichmentStatus({ hoaId, initialPublicRecords, hoaName }) {
  const [isEnriching, setIsEnriching] = useState(false)
  const [enrichmentData, setEnrichmentData] = useState(initialPublicRecords || null)
  const [error, setError] = useState(null)

  // Check if we need to enrich on mount
  const needsEnrichment = !enrichmentData?.enriched

  // Calculate days since enrichment
  const daysSinceEnriched = enrichmentData?.enrichedAt
    ? Math.floor((Date.now() - new Date(enrichmentData.enrichedAt)) / (1000 * 60 * 60 * 24))
    : null

  // Show refresh button if data is older than 7 days
  const showRefreshButton = daysSinceEnriched !== null && daysSinceEnriched >= 7

  useEffect(() => {
    // Auto-trigger enrichment if not already enriched
    if (needsEnrichment && !isEnriching) {
      handleEnrich()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleEnrich = async (force = false) => {
    setIsEnriching(true)
    setError(null)

    try {
      const result = await enrichHOAData(hoaId, force)

      if (result.success) {
        setEnrichmentData(result.data)
      } else {
        setError(result.error || 'Failed to enrich data')
      }
    } catch (err) {
      console.error('Enrichment error:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsEnriching(false)
    }
  }

  // Loading state
  if (isEnriching) {
    return (
      <div className="bg-dossier-surface/50 rounded border border-dossier-border overflow-hidden">
        <div className="px-5 py-4 border-b border-dossier-border flex items-center gap-2">
          <Search className="h-4 w-4 text-cyan-400 animate-pulse" />
          <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400">
            Public Records Search
          </h3>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded border-l-2 border-cyan-500/50">
            <Loader2 className="h-5 w-5 text-cyan-400 animate-spin flex-shrink-0" />
            <div>
              <p className="text-sm text-slate-300">
                Searching public records for additional data...
              </p>
              <p className="text-[10px] font-mono text-slate-500 mt-1">
                Checking management company websites, state records, and more
              </p>
            </div>
          </div>

          {/* Animated search lines */}
          <div className="mt-4 space-y-2">
            {['Nevada Secretary of State', 'Management Company Portals', 'Community Websites'].map((source, i) => (
              <div
                key={source}
                className="flex items-center gap-2 text-[10px] font-mono text-slate-500"
                style={{ animationDelay: `${i * 0.3}s` }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>Searching {source}...</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !enrichmentData?.enriched) {
    return (
      <div className="bg-dossier-surface/50 rounded border border-dossier-border overflow-hidden">
        <div className="px-5 py-4 border-b border-dossier-border flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-400" />
          <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400">
            Public Records Search
          </h3>
        </div>

        <div className="p-5">
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded">
            <p className="text-sm text-amber-300">{error}</p>
            <p className="text-[10px] font-mono text-slate-500 mt-2">
              Report data is still available. Try again later.
            </p>
          </div>

          <button
            onClick={() => handleEnrich(true)}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-mono rounded transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Retry Search
          </button>
        </div>
      </div>
    )
  }

  // Enriched state - show results
  if (enrichmentData?.enriched) {
    const hasContactInfo = enrichmentData.contactInfo && (
      enrichmentData.contactInfo.phone ||
      enrichmentData.contactInfo.email ||
      enrichmentData.contactInfo.website
    )

    const foundInfo = enrichmentData.perplexityResponse?.foundInfo || false

    return (
      <div className="bg-dossier-surface/50 rounded border border-dossier-border overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-dossier-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            {foundInfo ? (
              <CheckCircle2 className="h-4 w-4 text-green-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-slate-500" />
            )}
            <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400">
              Public Records
            </h3>
          </div>

          {/* Verification badge */}
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
            foundInfo
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-slate-700 text-slate-500 border border-slate-600'
          }`}>
            {foundInfo ? 'Verified Data Found' : 'Limited Data'}
          </span>
        </div>

        <div className="p-5 space-y-4">
          {/* Subdivision Name */}
          {enrichmentData.subdivisionName && (
            <div className="p-3 bg-slate-800/50 rounded">
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1">
                Subdivision / Community
              </p>
              <p className="text-sm font-mono text-slate-200">
                {enrichmentData.subdivisionName}
              </p>
            </div>
          )}

          {/* Management Company */}
          {enrichmentData.managementCompany?.name && (
            <div className="p-3 bg-slate-800/50 rounded">
              <div className="flex items-center gap-2 mb-1">
                <Building className="h-3 w-3 text-slate-500" />
                <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                  Management Company
                </p>
                {enrichmentData.managementCompany.verified && (
                  <span className="text-[8px] font-mono px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 rounded">
                    VERIFIED
                  </span>
                )}
              </div>
              <p className="text-sm font-mono text-slate-200">
                {enrichmentData.managementCompany.name}
              </p>
            </div>
          )}

          {/* Contact Info */}
          {hasContactInfo && (
            <div className="space-y-2">
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                Contact Information
              </p>

              {enrichmentData.contactInfo.phone && (
                <a
                  href={`tel:${enrichmentData.contactInfo.phone.replace(/[^0-9+]/g, '')}`}
                  className="flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded transition-colors group"
                >
                  <Phone className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm font-mono text-slate-200 group-hover:text-cyan-300">
                    {enrichmentData.contactInfo.phone}
                  </span>
                  <span className="ml-auto text-[10px] text-slate-500">Click to call</span>
                </a>
              )}

              {enrichmentData.contactInfo.email && (
                <a
                  href={`mailto:${enrichmentData.contactInfo.email}`}
                  className="flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded transition-colors group"
                >
                  <Mail className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm font-mono text-slate-200 group-hover:text-cyan-300 break-all">
                    {enrichmentData.contactInfo.email}
                  </span>
                  <span className="ml-auto text-[10px] text-slate-500 flex-shrink-0">Click to email</span>
                </a>
              )}

              {enrichmentData.contactInfo.website && (
                <a
                  href={enrichmentData.contactInfo.website.startsWith('http') ? enrichmentData.contactInfo.website : `https://${enrichmentData.contactInfo.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded transition-colors group"
                >
                  <Globe className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm font-mono text-slate-200 group-hover:text-cyan-300 truncate">
                    {enrichmentData.contactInfo.website.replace(/^https?:\/\//, '')}
                  </span>
                  <ExternalLink className="ml-auto h-3 w-3 text-slate-500 flex-shrink-0" />
                </a>
              )}

              {enrichmentData.contactInfo.address && (
                <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded">
                  <MapPin className="h-4 w-4 text-slate-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-mono text-slate-400">
                    {enrichmentData.contactInfo.address}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Monthly Fee Estimate */}
          {enrichmentData.monthlyFeeEstimate && (
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded">
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1">
                Monthly Fee (Web Estimate)
              </p>
              <p className="text-lg font-mono font-bold text-cyan-300">
                {enrichmentData.monthlyFeeEstimate}
              </p>
              <p className="text-[10px] font-mono text-slate-500 mt-1">
                Verify with HOA directly
              </p>
            </div>
          )}

          {/* No data found message */}
          {!foundInfo && !hasContactInfo && !enrichmentData.subdivisionName && (
            <div className="p-4 bg-slate-800/30 rounded border-l-2 border-slate-600">
              <p className="text-sm text-slate-400">
                Limited public information found for this HOA.
                Contact details may be available in HOA documents.
              </p>
            </div>
          )}

          {/* Source Attribution & Refresh */}
          <div className="pt-4 border-t border-dossier-border">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>
                  {enrichmentData.source} • Updated {daysSinceEnriched === 0 ? 'today' : `${daysSinceEnriched} days ago`}
                </span>
              </div>

              {showRefreshButton && (
                <button
                  onClick={() => handleEnrich(true)}
                  disabled={isEnriching}
                  className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <RefreshCw className="h-3 w-3" />
                  Refresh
                </button>
              )}
            </div>

            {/* Sources from Perplexity */}
            {enrichmentData.perplexityResponse?.sources?.length > 0 && (
              <div className="mt-3">
                <p className="text-[10px] font-mono text-slate-600 mb-1">Sources:</p>
                <div className="flex flex-wrap gap-1">
                  {enrichmentData.perplexityResponse.sources.slice(0, 3).map((source, i) => (
                    <a
                      key={i}
                      href={source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] font-mono text-slate-500 hover:text-cyan-400 truncate max-w-[150px]"
                    >
                      [{i + 1}] {new URL(source).hostname}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Default - no enrichment yet (shouldn't normally reach here due to auto-trigger)
  return null
}
