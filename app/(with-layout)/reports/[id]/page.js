/**
 * HOA Report Detail Page
 * Shows comprehensive analysis for a specific HOA
 */

import React from 'react'
import { getHOAById } from '@/app/actions/hoa-search'
import { notFound } from 'next/navigation'
import ScoreDisplay from '@/components/hoa-report/ScoreDisplay'
import FlagCard from '@/components/hoa-report/FlagCard'
import NeighborhoodContext from '@/components/hoa-report/NeighborhoodContext'
import { MapPin, DollarSign, Download, Share2, ChevronDown, Building, TrendingUp, CheckCircle, Users } from 'lucide-react'
import { formatCurrency, formatDate, getScoreColor, getScoreBgColor } from '@/lib/utils'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export async function generateMetadata({ params }) {
  const { id } = await params
  const { data } = await getHOAById(id)

  if (!data) {
    return {
      title: 'HOA Report Not Found | HOA Scout',
    }
  }

  return {
    title: `${data.hoa_name} - HOA Report | HOA Scout`,
    description: data.one_sentence_summary || `Comprehensive HOA analysis for ${data.hoa_name} in ${data.city}, ${data.state}`,
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

  // Check if analysis is complete
  const isAnalysisComplete = hoa.overall_score !== null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="flex-1">
              {/* Breadcrumb */}
              <div className="flex items-center text-blue-100 text-sm mb-4">
                <a href="/" className="hover:text-white transition-colors">Home</a>
                <ChevronDown className="h-4 w-4 mx-2 rotate-[-90deg]" />
                <span className="text-white">HOA Report</span>
              </div>

              <h1 className="text-4xl font-bold mb-3">{hoa.hoa_name}</h1>

              <div className="flex flex-wrap items-center gap-4 text-blue-50 mb-6">
                <span className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  {hoa.city}, {hoa.state} {hoa.zip_code}
                </span>
                {hoa.monthly_fee && (
                  <span className="flex items-center font-semibold bg-white/10 px-3 py-1 rounded-full">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {hoa.monthly_fee}/month
                  </span>
                )}
                {hoa.management_company && (
                  <span className="flex items-center">
                    <Building className="h-5 w-5 mr-2" />
                    {hoa.management_company}
                  </span>
                )}
              </div>

              {/* Summary */}
              {hoa.one_sentence_summary && (
                <p className="text-lg text-blue-50 leading-relaxed max-w-3xl">{hoa.one_sentence_summary}</p>
              )}
            </div>

            {/* Overall Score Card */}
            {isAnalysisComplete && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-center">
                  <div className="mb-3">
                    <ScoreDisplay score={hoa.overall_score} size="lg" className="mx-auto" />
                  </div>
                  <p className="text-sm text-blue-100">Overall Score</p>
                  <p className="text-xs text-blue-200 mt-1">
                    Updated {formatDate(hoa.last_updated, 'short')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isAnalysisComplete ? (
          // Analysis in progress
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Analysis in Progress</h2>
            <p className="text-gray-600">
              We're gathering data and analyzing this HOA. This usually takes about 30 seconds.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Refresh this page in a moment to see your report.
            </p>
          </div>
        ) : (
          <>
            {/* Quick Verdict - Red/Yellow/Green Flags */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Quick Verdict</h2>

              <div className="grid md:grid-cols-3 gap-8">
                {/* Red Flags */}
                <div>
                  <h3 className="font-semibold text-red-600 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-red-600 rounded-full mr-2"></div>
                    Red Flags ({hoa.red_flags?.length || 0})
                  </h3>
                  <div className="space-y-3">
                    {hoa.red_flags && hoa.red_flags.length > 0 ? (
                      hoa.red_flags.map((flag, idx) => (
                        <FlagCard
                          key={idx}
                          type="danger"
                          title={flag.title}
                          description={flag.description}
                          source={flag.source}
                        />
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No critical issues identified</p>
                    )}
                  </div>
                </div>

                {/* Yellow Flags */}
                <div>
                  <h3 className="font-semibold text-yellow-600 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-yellow-600 rounded-full mr-2"></div>
                    Cautions ({hoa.yellow_flags?.length || 0})
                  </h3>
                  <div className="space-y-3">
                    {hoa.yellow_flags && hoa.yellow_flags.length > 0 ? (
                      hoa.yellow_flags.map((flag, idx) => (
                        <FlagCard
                          key={idx}
                          type="warning"
                          title={flag.title}
                          description={flag.description}
                          source={flag.source}
                        />
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No concerns identified</p>
                    )}
                  </div>
                </div>

                {/* Green Flags */}
                <div>
                  <h3 className="font-semibold text-green-600 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                    Green Flags ({hoa.green_flags?.length || 0})
                  </h3>
                  <div className="space-y-3">
                    {hoa.green_flags && hoa.green_flags.length > 0 ? (
                      hoa.green_flags.map((flag, idx) => (
                        <FlagCard
                          key={idx}
                          type="success"
                          title={flag.title}
                          description={flag.description}
                          source={flag.source}
                        />
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No positive aspects highlighted</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <ScoreCard
                label="Financial Health"
                score={hoa.financial_health_score}
                icon={<DollarSign className="h-5 w-5" />}
              />
              <ScoreCard
                label="Restrictiveness"
                score={hoa.restrictiveness_score}
                icon={<Building className="h-5 w-5" />}
                inverted
              />
              <ScoreCard
                label="Management Quality"
                score={hoa.management_quality_score}
                icon={<TrendingUp className="h-5 w-5" />}
              />
              <ScoreCard
                label="Community Sentiment"
                score={hoa.community_sentiment_score}
                icon={<Users className="h-5 w-5" />}
              />
            </div>

            {/* Neighborhood Context (Yelp Integration) */}
            {neighborhood && (
              <div className="mb-6">
                <NeighborhoodContext
                  neighborhoodData={neighborhood}
                  city={hoa.city}
                  state={hoa.state}
                />
              </div>
            )}

            {/* Action Items */}
            {hoa.questions_to_ask && hoa.questions_to_ask.length > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Before You Buy: Action Items
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Questions to Ask</h3>
                    <ul className="space-y-2 text-sm">
                      {hoa.questions_to_ask.map((question, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-blue-600 font-semibold mr-2">{idx + 1}.</span>
                          <span>{question}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {hoa.documents_to_request && hoa.documents_to_request.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Documents to Request</h3>
                      <ul className="space-y-2 text-sm">
                        {hoa.documents_to_request.map((doc, idx) => (
                          <li key={idx} className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{doc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <button className="flex-1 px-6 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all hover:shadow-lg flex items-center justify-center">
                    <Download className="h-5 w-5 mr-2" />
                    Download Full Report
                  </button>
                  <button className="flex-1 px-6 py-4 bg-white text-blue-600 font-semibold rounded-xl border-2 border-blue-200 hover:border-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center">
                    <Share2 className="h-5 w-5 mr-2" />
                    Share with Realtor
                  </button>
                </div>
              </div>
            )}

            {/* Data Quality Notice */}
            <div className="bg-white border-l-4 border-gray-400 rounded-lg p-6 text-sm text-gray-600 shadow-sm">
              <p className="font-semibold text-gray-900 mb-2">Data Quality & Disclaimer</p>
              <p>
                This report is {hoa.data_completeness}% complete based on available public records.
                Last updated: {formatDate(hoa.last_updated, 'short')}
              </p>
              <p className="mt-3 text-gray-500">
                Always verify information directly with the HOA and review official documents before making purchasing decisions.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Score Card Component
function ScoreCard({ label, score, icon, inverted = false }) {
  if (score === null || score === undefined) return null

  // For inverted scores (like restrictiveness), lower is better
  const displayScore = inverted ? 10 - score : score
  const colorClass = getScoreColor(displayScore)
  const bgClass = getScoreBgColor(displayScore)

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 ${bgClass} rounded-lg`}>
          {React.cloneElement(icon, { className: `h-5 w-5 ${colorClass}` })}
        </div>
        <span className={`text-3xl font-bold ${colorClass}`}>
          {score.toFixed(1)}
        </span>
      </div>
      <h3 className="font-semibold text-gray-900 text-sm">{label}</h3>
      {inverted && (
        <p className="text-xs text-gray-500 mt-1">Lower is less restrictive</p>
      )}
    </div>
  )
}