/**
 * Score Display Component
 * Shows HOA overall score as a circular progress indicator
 */

'use client'

import { getScoreColor, getScoreLabel } from '@/lib/utils'

export default function ScoreDisplay({ score, size = 'md', showLabel = true, className = '' }) {
  const percentage = (score / 10) * 100

  const sizes = {
    sm: { container: 'w-16 h-16', text: 'text-xl', label: 'text-xs' },
    md: { container: 'w-24 h-24', text: 'text-2xl', label: 'text-sm' },
    lg: { container: 'w-32 h-32', text: 'text-3xl', label: 'text-base' },
    xl: { container: 'w-40 h-40', text: 'text-4xl', label: 'text-lg' }
  }

  const sizeConfig = sizes[size]
  const strokeDasharray = 2 * Math.PI * 45 // radius = 45
  const strokeDashoffset = strokeDasharray - (percentage / 100) * strokeDasharray

  return (
    <div className={`relative inline-block ${className}`}>
      <svg className={sizeConfig.container} viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="8"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          className={getScoreColor(score).replace('text-', 'stroke-')}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`${sizeConfig.text} font-bold ${getScoreColor(score)}`}>
          {score.toFixed(1)}
        </span>
        {showLabel && (
          <span className={`${sizeConfig.label} text-gray-600 mt-0.5`}>
            {getScoreLabel(score)}
          </span>
        )}
      </div>
    </div>
  )
}