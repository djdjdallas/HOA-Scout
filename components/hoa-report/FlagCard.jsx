/**
 * Flag Card Component - Dossier Theme
 * Displays red flags, yellow flags, or green flags
 * with a classified document alert aesthetic
 */

'use client'

import { XCircle, AlertTriangle, CheckCircle, AlertOctagon, ShieldCheck, ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function FlagCard({
  type,
  title,
  description,
  source,
  severity,
  compact = false,
  className = ''
}) {
  const styles = {
    danger: {
      border: 'border-l-2 border-red-500',
      background: 'bg-red-500/10',
      hoverBg: 'hover:bg-red-500/15',
      icon: AlertOctagon,
      iconColor: 'text-red-400',
      titleColor: 'text-slate-100',
      glowColor: 'shadow-red-500/20'
    },
    warning: {
      border: 'border-l-2 border-amber-500',
      background: 'bg-amber-500/10',
      hoverBg: 'hover:bg-amber-500/15',
      icon: ShieldAlert,
      iconColor: 'text-amber-400',
      titleColor: 'text-slate-100',
      glowColor: 'shadow-amber-500/20'
    },
    success: {
      border: 'border-l-2 border-cyan-500',
      background: 'bg-cyan-500/10',
      hoverBg: 'hover:bg-cyan-500/15',
      icon: ShieldCheck,
      iconColor: 'text-cyan-400',
      titleColor: 'text-slate-100',
      glowColor: 'shadow-cyan-500/20'
    }
  }

  const style = styles[type]
  const Icon = style.icon

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded transition-colors',
          style.border,
          style.background,
          style.hoverBg,
          className
        )}
      >
        <Icon className={cn('h-4 w-4 flex-shrink-0', style.iconColor)} />
        <span className="text-sm text-slate-200 truncate">{title}</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'p-4 rounded-r transition-all duration-200',
        style.border,
        style.background,
        style.hoverBg,
        'hover:shadow-lg',
        style.glowColor,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <Icon className={cn('h-5 w-5', style.iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn('font-medium text-sm', style.titleColor)}>
            {title}
          </p>
          {description && (
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {description}
            </p>
          )}
          {source && (
            <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mt-2">
              SOURCE: {source}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Flag Summary Badge - Shows count of flags
 */
export function FlagBadge({ type, count, label, onClick, expanded = false }) {
  const styles = {
    danger: {
      bg: 'bg-red-500/20',
      border: 'border-red-500/50',
      text: 'text-red-400',
      activeBg: 'bg-red-500/30',
      activeBorder: 'border-red-500'
    },
    warning: {
      bg: 'bg-amber-500/20',
      border: 'border-amber-500/50',
      text: 'text-amber-400',
      activeBg: 'bg-amber-500/30',
      activeBorder: 'border-amber-500'
    },
    success: {
      bg: 'bg-cyan-500/20',
      border: 'border-cyan-500/50',
      text: 'text-cyan-400',
      activeBg: 'bg-cyan-500/30',
      activeBorder: 'border-cyan-500'
    }
  }

  const style = styles[type]

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center p-4 rounded border transition-all duration-200',
        expanded ? style.activeBg : style.bg,
        expanded ? style.activeBorder : style.border,
        'hover:scale-[1.02]',
        onClick && 'cursor-pointer'
      )}
    >
      <span className={cn('text-3xl font-mono font-bold tabular-nums', style.text)}>
        {count}
      </span>
      <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mt-1">
        {label}
      </span>
    </button>
  )
}
