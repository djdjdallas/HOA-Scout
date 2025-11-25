/**
 * HOA Report Detail Page - Intelligence Dossier Theme
 * Premium classified document aesthetic for comprehensive HOA analysis
 */

import React from 'react'
import { getHOAById } from '@/app/actions/hoa-search'
import { notFound } from 'next/navigation'
import ScoreDisplay from '@/components/hoa-report/ScoreDisplay'
import FlagCard, { FlagBadge } from '@/components/hoa-report/FlagCard'
import NeighborhoodContext from '@/components/hoa-report/NeighborhoodContext'
import {
  MapPin, DollarSign, Download, Share2, Building, TrendingUp,
  Users, FileText, ChevronRight, Shield, Clock, Database,
  AlertTriangle, CheckCircle2, BookmarkPlus, Printer
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import VerdictBar from './VerdictBar'
import AnalysisPending from './AnalysisPending'

export async function generateMetadata({ params }) {
  const { id } = await params
  const { data } = await getHOAById(id)

  if (!data) {
    return {
      title: 'HOA Report Not Found | HOA Scout',
    }
  }

  return {
    title: `${data.hoa_name} - HOA Dossier | HOA Scout`,
    description: data.one_sentence_summary || `Intelligence report for ${data.hoa_name} in ${data.city}, ${data.state}`,
  }
}

export default async function HOAReportPage({ params }) {
  const { id } = await params
  const result = await getHOAById(id)

  if (!result.success || !result.data) {
    notFound()
  }

  const hoa = result.data
  const neighborhood = hoa.neighborhood_context?.[0] || null
  const isAnalysisComplete = hoa.overall_score !== null

  return (
    <div className="min-h-screen bg-dossier-bg">
      {/* Scan lines overlay */}
      <div className="fixed inset-0 pointer-events-none bg-scan-lines opacity-50 z-50" />

      {/* ═══════════════════════════════════════════════════════════════════════
          HERO SECTION - Full-width dark header
      ═══════════════════════════════════════════════════════════════════════ */}
      <header className="relative border-b border-dossier-border">
        {/* Grid background pattern */}
        <div className="absolute inset-0 bg-grid-pattern bg-[size:20px_20px] opacity-30" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            {/* Left: HOA Info */}
            <div className="flex-1">
              {/* Classification label */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-400 border border-cyan-400/30 px-2 py-0.5 rounded">
                  Dossier #{id.slice(0, 8).toUpperCase()}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                  {isAnalysisComplete ? 'Analysis Complete' : 'Processing'}
                </span>
              </div>

              {/* HOA Name */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-mono font-bold text-dossier-text mb-4 tracking-tight">
                {hoa.hoa_name}
              </h1>

              {/* Location & Meta */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-6">
                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin className="h-4 w-4 text-cyan-400" />
                  <span className="font-mono text-sm">
                    {hoa.city}, {hoa.state} {hoa.zip_code}
                  </span>
                </div>

                {hoa.monthly_fee && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded bg-cyan-500/10 border border-cyan-500/30">
                    <DollarSign className="h-4 w-4 text-cyan-400" />
                    <span className="font-mono text-sm text-cyan-300 font-semibold">
                      {hoa.monthly_fee}/mo
                    </span>
                  </div>
                )}

                {hoa.management_company && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Building className="h-4 w-4" />
                    <span className="text-sm">{hoa.management_company}</span>
                  </div>
                )}
              </div>

              {/* Summary */}
              {hoa.one_sentence_summary && (
                <p className="text-base text-slate-300 leading-relaxed max-w-2xl border-l-2 border-cyan-500/30 pl-4">
                  {hoa.one_sentence_summary}
                </p>
              )}
            </div>

            {/* Right: Overall Score */}
            {isAnalysisComplete && (
              <div className="flex flex-col items-center p-6 bg-dossier-surface/50 rounded border border-dossier-border backdrop-blur-sm">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 mb-3">
                  Overall Assessment
                </span>
                <ScoreDisplay score={hoa.overall_score} size="xl" variant="dark" />
                <div className="mt-4 text-[10px] font-mono text-slate-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Updated {formatDate(hoa.last_updated, 'short')}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isAnalysisComplete ? (
          /* ═══════════════════════════════════════════════════════════════════
             LOADING STATE - Auto-refreshes when analysis completes
          ═══════════════════════════════════════════════════════════════════ */
          <AnalysisPending hoaId={id} />
        ) : (
          <>
            {/* ═══════════════════════════════════════════════════════════════
                VERDICT BAR - Flag summaries with expandable details
            ═══════════════════════════════════════════════════════════════ */}
            <VerdictBar
              redFlags={hoa.red_flags || []}
              yellowFlags={hoa.yellow_flags || []}
              greenFlags={hoa.green_flags || []}
            />

            {/* ═══════════════════════════════════════════════════════════════
                MAIN CONTENT GRID - Two-column asymmetric layout
            ═══════════════════════════════════════════════════════════════ */}
            <div className="grid lg:grid-cols-[1fr_400px] gap-6 mt-6">
              {/* ─────────────────────────────────────────────────────────────
                  LEFT COLUMN (Primary Intel - ~60%)
              ───────────────────────────────────────────────────────────── */}
              <div className="space-y-6">
                {/* Financial Health Panel */}
                <section className="bg-dossier-surface/50 rounded border border-dossier-border overflow-hidden">
                  <div className="px-5 py-4 border-b border-dossier-border flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-cyan-400" />
                    <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400">
                      Financial Assessment
                    </h2>
                  </div>

                  <div className="p-5">
                    {/* Key Financial Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                      <MetricCard
                        label="Monthly Fee"
                        value={hoa.monthly_fee ? `$${hoa.monthly_fee}` : 'N/A'}
                        sublabel="per unit"
                      />
                      <MetricCard
                        label="Reserve Fund"
                        value={hoa.reserve_fund_balance ? formatCurrency(hoa.reserve_fund_balance) : 'N/A'}
                        sublabel={hoa.reserve_fund_percent_funded ? `${hoa.reserve_fund_percent_funded}% funded` : ''}
                      />
                      <MetricCard
                        label="Special Assess."
                        value={hoa.recent_special_assessments || 'None'}
                        sublabel="recent"
                      />
                      <MetricCard
                        label="Fee History"
                        value={hoa.fee_increase_history || 'Stable'}
                        sublabel="trend"
                      />
                    </div>

                    {/* Reserve Fund Visualization */}
                    {hoa.reserve_fund_percent_funded && (
                      <div className="p-4 bg-slate-800/30 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                            Reserve Fund Health
                          </span>
                          <span className={`text-sm font-mono font-bold ${getReserveFundColor(hoa.reserve_fund_percent_funded)}`}>
                            {hoa.reserve_fund_percent_funded}%
                          </span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${getReserveFundBg(hoa.reserve_fund_percent_funded)}`}
                            style={{ width: `${Math.min(hoa.reserve_fund_percent_funded, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-2 text-[10px] font-mono text-slate-500">
                          <span>Underfunded</span>
                          <span>70% (Industry Standard)</span>
                          <span>Fully Funded</span>
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* Score Breakdown Panel */}
                <section className="bg-dossier-surface/50 rounded border border-dossier-border overflow-hidden">
                  <div className="px-5 py-4 border-b border-dossier-border flex items-center gap-2">
                    <Shield className="h-4 w-4 text-cyan-400" />
                    <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400">
                      Dimension Analysis
                    </h2>
                  </div>

                  <div className="p-5 space-y-4">
                    <ScoreBar
                      label="Financial Health"
                      score={hoa.financial_health_score}
                      icon={<DollarSign className="h-4 w-4" />}
                    />
                    <ScoreBar
                      label="Management Quality"
                      score={hoa.management_quality_score}
                      icon={<TrendingUp className="h-4 w-4" />}
                    />
                    <ScoreBar
                      label="Community Sentiment"
                      score={hoa.community_sentiment_score}
                      icon={<Users className="h-4 w-4" />}
                    />
                    <ScoreBar
                      label="Rule Restrictiveness"
                      score={hoa.restrictiveness_score}
                      icon={<FileText className="h-4 w-4" />}
                      inverted
                      invertedLabel="Lower = Less Restrictive"
                    />
                  </div>
                </section>

                {/* Action Items Section */}
                {(hoa.questions_to_ask?.length > 0 || hoa.documents_to_request?.length > 0) && (
                  <section className="bg-dossier-surface/50 rounded border border-dossier-border overflow-hidden">
                    <div className="px-5 py-4 border-b border-dossier-border flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                      <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400">
                        Recommended Actions
                      </h2>
                    </div>

                    <div className="p-5">
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Questions to Ask */}
                        {hoa.questions_to_ask && hoa.questions_to_ask.length > 0 && (
                          <div>
                            <h3 className="text-[10px] font-mono uppercase tracking-widest text-cyan-400/80 mb-4">
                              Questions to Ask
                            </h3>
                            <ul className="space-y-3">
                              {hoa.questions_to_ask.map((question, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                  <span className="flex-shrink-0 w-5 h-5 rounded bg-slate-700 flex items-center justify-center text-[10px] font-mono text-slate-400">
                                    {idx + 1}
                                  </span>
                                  <span className="text-sm text-slate-300 leading-relaxed">
                                    {question}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Documents to Request */}
                        {hoa.documents_to_request && hoa.documents_to_request.length > 0 && (
                          <div>
                            <h3 className="text-[10px] font-mono uppercase tracking-widest text-cyan-400/80 mb-4">
                              Documents to Request
                            </h3>
                            <ul className="space-y-3">
                              {hoa.documents_to_request.map((doc, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                  <div className="flex-shrink-0 w-5 h-5 rounded border border-slate-600 flex items-center justify-center">
                                    <CheckCircle2 className="h-3 w-3 text-slate-500" />
                                  </div>
                                  <span className="text-sm text-slate-300 leading-relaxed">
                                    {doc}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </section>
                )}
              </div>

              {/* ─────────────────────────────────────────────────────────────
                  RIGHT COLUMN (Supporting Intel - ~40%)
              ───────────────────────────────────────────────────────────── */}
              <div className="space-y-6">
                {/* Quick Stats Grid */}
                <section className="bg-dossier-surface/50 rounded border border-dossier-border overflow-hidden">
                  <div className="px-5 py-4 border-b border-dossier-border flex items-center gap-2">
                    <Database className="h-4 w-4 text-cyan-400" />
                    <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400">
                      Quick Stats
                    </h2>
                  </div>

                  <div className="p-5 grid grid-cols-2 gap-3">
                    {hoa.total_units && (
                      <StatBox label="Total Units" value={hoa.total_units} />
                    )}
                    {hoa.year_established && (
                      <StatBox label="Established" value={hoa.year_established} />
                    )}
                    {hoa.property_type && (
                      <StatBox label="Type" value={hoa.property_type} />
                    )}
                    {hoa.data_completeness && (
                      <StatBox label="Data Quality" value={`${hoa.data_completeness}%`} />
                    )}
                  </div>
                </section>

                {/* Neighborhood Context (Yelp) */}
                {neighborhood && (
                  <NeighborhoodContext
                    neighborhoodData={neighborhood}
                    city={hoa.city}
                    state={hoa.state}
                  />
                )}
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                FOOTER BAR - Actions & Attribution
            ═══════════════════════════════════════════════════════════════ */}
            <footer className="mt-8 pt-6 border-t border-dossier-border">
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mb-6">
                <button className="flex items-center gap-2 px-5 py-3 bg-cyan-500 hover:bg-cyan-400 text-dossier-bg font-mono text-sm font-semibold rounded transition-colors">
                  <Download className="h-4 w-4" />
                  Download PDF
                </button>
                <button className="flex items-center gap-2 px-5 py-3 bg-dossier-surface hover:bg-slate-700 text-slate-300 font-mono text-sm rounded border border-dossier-border transition-colors">
                  <Share2 className="h-4 w-4" />
                  Share Report
                </button>
                <button className="flex items-center gap-2 px-5 py-3 bg-dossier-surface hover:bg-slate-700 text-slate-300 font-mono text-sm rounded border border-dossier-border transition-colors">
                  <BookmarkPlus className="h-4 w-4" />
                  Save to Account
                </button>
                <button className="flex items-center gap-2 px-5 py-3 bg-dossier-surface hover:bg-slate-700 text-slate-300 font-mono text-sm rounded border border-dossier-border transition-colors">
                  <Printer className="h-4 w-4" />
                  Print
                </button>
              </div>

              {/* Data Quality & Disclaimer */}
              <div className="p-4 bg-slate-800/30 rounded border-l-2 border-slate-600">
                <div className="flex items-start gap-3">
                  <Database className="h-4 w-4 text-slate-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1">
                      Data Quality & Sources
                    </p>
                    <p className="text-sm text-slate-400">
                      This report is {hoa.data_completeness}% complete based on available public records.
                      Always verify information directly with the HOA and review official documents before making purchasing decisions.
                    </p>
                    <p className="text-[10px] font-mono text-slate-500 mt-2">
                      Report generated {formatDate(hoa.last_updated, 'full')} • Sources: Public Records, HOA Documents, Yelp
                    </p>
                  </div>
                </div>
              </div>
            </footer>
          </>
        )}
      </main>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   HELPER COMPONENTS
═══════════════════════════════════════════════════════════════════════════ */

function MetricCard({ label, value, sublabel }) {
  return (
    <div className="p-4 bg-slate-800/30 rounded border border-slate-700/50">
      <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1">
        {label}
      </p>
      <p className="text-lg font-mono font-bold tabular-nums text-slate-200">
        {value}
      </p>
      {sublabel && (
        <p className="text-[10px] font-mono text-slate-500 mt-0.5">
          {sublabel}
        </p>
      )}
    </div>
  )
}

function StatBox({ label, value }) {
  return (
    <div className="p-3 bg-slate-800/30 rounded">
      <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1">
        {label}
      </p>
      <p className="text-base font-mono font-semibold tabular-nums text-slate-200">
        {value}
      </p>
    </div>
  )
}

function ScoreBar({ label, score, icon, inverted = false, invertedLabel = '' }) {
  if (score === null || score === undefined) return null

  const getColor = (s) => {
    if (inverted) s = 10 - s
    if (s >= 8) return { text: 'text-cyan-400', bg: 'bg-cyan-500' }
    if (s >= 6.5) return { text: 'text-green-400', bg: 'bg-green-500' }
    if (s >= 5) return { text: 'text-amber-400', bg: 'bg-amber-500' }
    if (s >= 3.5) return { text: 'text-orange-400', bg: 'bg-orange-500' }
    return { text: 'text-red-400', bg: 'bg-red-500' }
  }

  const colors = getColor(score)

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">{icon}</span>
          <span className="text-sm text-slate-300">{label}</span>
          {inverted && (
            <span className="text-[10px] font-mono text-slate-500">
              ({invertedLabel})
            </span>
          )}
        </div>
        <span className={`text-sm font-mono font-bold tabular-nums ${colors.text}`}>
          {score.toFixed(1)}
        </span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${colors.bg} transition-all duration-500`}
          style={{ width: `${score * 10}%` }}
        />
      </div>
    </div>
  )
}

function getReserveFundColor(percent) {
  if (percent >= 70) return 'text-cyan-400'
  if (percent >= 50) return 'text-amber-400'
  return 'text-red-400'
}

function getReserveFundBg(percent) {
  if (percent >= 70) return 'bg-cyan-500'
  if (percent >= 50) return 'bg-amber-500'
  return 'bg-red-500'
}
