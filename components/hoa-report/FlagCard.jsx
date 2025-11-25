/**
 * Flag Card Component
 * Displays red flags, yellow flags, or green flags
 */

'use client'

import { XCircle, AlertTriangle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function FlagCard({ type, title, description, source, severity, className = '' }) {
  const styles = {
    danger: {
      border: 'border-l-4 border-red-500',
      background: 'bg-red-50',
      icon: XCircle,
      iconColor: 'text-red-600',
      titleColor: 'text-gray-900'
    },
    warning: {
      border: 'border-l-4 border-yellow-500',
      background: 'bg-yellow-50',
      icon: AlertTriangle,
      iconColor: 'text-yellow-600',
      titleColor: 'text-gray-900'
    },
    success: {
      border: 'border-l-4 border-green-500',
      background: 'bg-green-50',
      icon: CheckCircle,
      iconColor: 'text-green-600',
      titleColor: 'text-gray-900'
    }
  }

  const style = styles[type]
  const Icon = style.icon

  return (
    <div
      className={cn(
        'p-4 rounded-r-lg',
        style.border,
        style.background,
        className
      )}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className={cn('h-5 w-5', style.iconColor)} />
        </div>
        <div className="ml-3 flex-1">
          <p className={cn('font-medium text-sm', style.titleColor)}>
            {title}
          </p>
          {description && (
            <p className="text-xs text-gray-600 mt-1">
              {description}
            </p>
          )}
          {source && (
            <p className="text-xs text-gray-400 mt-1.5">
              Source: {source}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}