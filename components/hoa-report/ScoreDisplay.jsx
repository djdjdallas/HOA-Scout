/**
 * Score Display Component - Dossier Theme
 * Shows HOA overall score as an animated circular progress indicator
 * with a classified document aesthetic
 */

'use client'

import { useEffect, useState } from 'react'

export default function ScoreDisplay({
  score,
  size = 'md',
  showLabel = true,
  variant = 'dark',
  className = ''
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const percentage = (score / 10) * 100
  const strokeDasharray = 2 * Math.PI * 45 // radius = 45
  const strokeDashoffset = strokeDasharray - (percentage / 100) * strokeDasharray

  const sizes = {
    sm: { container: 'w-16 h-16', text: 'text-lg', label: 'text-[10px]', stroke: 6 },
    md: { container: 'w-24 h-24', text: 'text-2xl', label: 'text-xs', stroke: 7 },
    lg: { container: 'w-36 h-36', text: 'text-4xl', label: 'text-sm', stroke: 8 },
    xl: { container: 'w-44 h-44', text: 'text-5xl', label: 'text-base', stroke: 8 }
  }

  const sizeConfig = sizes[size]

  // Get score color based on value - using dossier accent colors
  const getScoreColor = (s) => {
    if (s >= 8) return { stroke: '#06B6D4', glow: 'rgba(6, 182, 212, 0.5)' } // cyan
    if (s >= 6.5) return { stroke: '#10B981', glow: 'rgba(16, 185, 129, 0.5)' } // green
    if (s >= 5) return { stroke: '#F59E0B', glow: 'rgba(245, 158, 11, 0.5)' } // amber
    if (s >= 3.5) return { stroke: '#F97316', glow: 'rgba(249, 115, 22, 0.5)' } // orange
    return { stroke: '#EF4444', glow: 'rgba(239, 68, 68, 0.5)' } // red
  }

  const getScoreLabel = (s) => {
    if (s >= 8.5) return 'EXCELLENT'
    if (s >= 7) return 'GOOD'
    if (s >= 5.5) return 'FAIR'
    if (s >= 4) return 'POOR'
    return 'CRITICAL'
  }

  const colors = getScoreColor(score)
  const isDark = variant === 'dark'

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Glow effect behind the ring */}
      <div
        className="absolute inset-0 blur-xl opacity-30 rounded-full"
        style={{ backgroundColor: colors.glow }}
      />

      <svg className={sizeConfig.container} viewBox="0 0 100 100">
        {/* Background circle - subtle track */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={isDark ? '#334155' : '#E5E7EB'}
          strokeWidth={sizeConfig.stroke}
        />

        {/* Progress circle with animation */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={colors.stroke}
          strokeWidth={sizeConfig.stroke}
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={mounted ? strokeDashoffset : strokeDasharray}
          transform="rotate(-90 50 50)"
          style={{
            transition: 'stroke-dashoffset 1s ease-out',
            filter: `drop-shadow(0 0 6px ${colors.glow})`
          }}
        />

        {/* Tick marks around the circle for technical look */}
        {[...Array(12)].map((_, i) => (
          <line
            key={i}
            x1="50"
            y1="8"
            x2="50"
            y2="12"
            stroke={isDark ? '#475569' : '#D1D5DB'}
            strokeWidth="1"
            transform={`rotate(${i * 30} 50 50)`}
          />
        ))}
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`${sizeConfig.text} font-mono font-bold tabular-nums`}
          style={{ color: colors.stroke }}
        >
          {score.toFixed(1)}
        </span>
        {showLabel && (
          <span className={`${sizeConfig.label} font-mono uppercase tracking-widest mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            {getScoreLabel(score)}
          </span>
        )}
      </div>
    </div>
  )
}
