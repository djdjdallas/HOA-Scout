/**
 * Analysis Pending Component
 * Shows loading state and auto-refreshes when analysis completes
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AnalysisPending({ hoaId }) {
  const router = useRouter()
  const [dots, setDots] = useState('')
  const [checkCount, setCheckCount] = useState(0)
  const [timedOut, setTimedOut] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    // Animate the dots
    const dotInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.')
    }, 500)

    return () => clearInterval(dotInterval)
  }, [])

  useEffect(() => {
    if (timedOut) return // Don't poll if timed out

    // Poll for completion every 3 seconds
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/hoa/${hoaId}/status`)
        const data = await response.json()

        setCheckCount(prev => prev + 1)

        if (data.isComplete) {
          // Analysis complete - refresh the page
          clearInterval(pollInterval)
          router.refresh()
        }
      } catch (error) {
        console.error('Error checking analysis status:', error)
      }
    }, 3000)

    // Stop polling after 2 minutes (40 checks) and show timeout message
    const timeout = setTimeout(() => {
      clearInterval(pollInterval)
      setTimedOut(true)
    }, 120000)

    return () => {
      clearInterval(pollInterval)
      clearTimeout(timeout)
    }
  }, [hoaId, router, timedOut])

  const handleRetry = async () => {
    setIsRetrying(true)
    setTimedOut(false)
    setCheckCount(0)

    try {
      // Trigger analysis via API
      await fetch(`/api/hoa/${hoaId}/analyze`, { method: 'POST' })
      // Polling will restart automatically due to timedOut state change
    } catch (error) {
      console.error('Error triggering analysis:', error)
    } finally {
      setIsRetrying(false)
    }
  }

  const handleRefresh = () => {
    router.refresh()
  }

  // Timeout state - show retry options
  if (timedOut) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500/50 flex items-center justify-center mb-6">
          <span className="text-2xl">⚠️</span>
        </div>

        <h2 className="text-2xl font-mono text-dossier-text mb-3">
          Analysis Taking Longer Than Expected
        </h2>

        <p className="text-sm text-slate-400 text-center max-w-md mb-6">
          The analysis is still processing. This can happen with complex HOAs or during high demand.
          You can wait and check again, or retry the analysis.
        </p>

        <div className="flex gap-4">
          <button
            onClick={handleRefresh}
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-dossier-bg font-mono text-sm font-semibold rounded transition-colors"
          >
            Check Status
          </button>
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="px-6 py-3 bg-dossier-surface hover:bg-slate-700 text-slate-300 font-mono text-sm rounded border border-dossier-border transition-colors disabled:opacity-50"
          >
            {isRetrying ? 'Retrying...' : 'Retry Analysis'}
          </button>
        </div>

        <p className="text-[10px] font-mono text-slate-600 mt-8">
          Checked {checkCount} times over 2 minutes
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-20">
      {/* Animated spinner */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full border-2 border-dossier-border" />
        <div className="absolute inset-0 w-24 h-24 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
        <div className="absolute inset-2 w-20 h-20 rounded-full border border-dossier-border" />
        <div className="absolute inset-2 w-20 h-20 rounded-full border border-cyan-400/30 border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
      </div>

      <h2 className="text-2xl font-mono text-dossier-text mb-3">
        Compiling Intelligence{dots}
      </h2>

      <p className="text-sm text-slate-400 text-center max-w-md mb-6">
        Gathering data from multiple sources and running AI analysis.
        This typically takes 30-60 seconds.
      </p>

      {/* Progress indicators */}
      <div className="flex flex-col gap-2 text-xs font-mono text-slate-500">
        <StatusLine
          label="Geocoding address"
          status={checkCount >= 0 ? 'complete' : 'pending'}
        />
        <StatusLine
          label="Fetching public records"
          status={checkCount >= 1 ? 'complete' : checkCount >= 0 ? 'active' : 'pending'}
        />
        <StatusLine
          label="Gathering neighborhood data"
          status={checkCount >= 3 ? 'complete' : checkCount >= 1 ? 'active' : 'pending'}
        />
        <StatusLine
          label="Running AI analysis"
          status={checkCount >= 5 ? 'complete' : checkCount >= 3 ? 'active' : 'pending'}
        />
        <StatusLine
          label="Generating report"
          status={checkCount >= 7 ? 'active' : 'pending'}
        />
      </div>

      <p className="text-[10px] font-mono text-slate-600 mt-8">
        Auto-refreshing • Check #{checkCount + 1}
      </p>
    </div>
  )
}

function StatusLine({ label, status }) {
  return (
    <div className="flex items-center gap-3">
      {status === 'complete' && (
        <span className="text-cyan-400">✓</span>
      )}
      {status === 'active' && (
        <span className="text-amber-400 animate-pulse">●</span>
      )}
      {status === 'pending' && (
        <span className="text-slate-600">○</span>
      )}
      <span className={status === 'complete' ? 'text-slate-400' : status === 'active' ? 'text-slate-300' : 'text-slate-600'}>
        {label}
      </span>
    </div>
  )
}
