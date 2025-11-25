/**
 * Verdict Bar Component
 * Interactive expandable flag summary with dossier aesthetic
 */

'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, AlertOctagon, ShieldAlert, ShieldCheck } from 'lucide-react'
import FlagCard from '@/components/hoa-report/FlagCard'

export default function VerdictBar({ redFlags, yellowFlags, greenFlags }) {
  const [expanded, setExpanded] = useState(null) // 'red' | 'yellow' | 'green' | null

  const toggleSection = (section) => {
    setExpanded(expanded === section ? null : section)
  }

  const hasFlags = redFlags.length > 0 || yellowFlags.length > 0 || greenFlags.length > 0

  if (!hasFlags) {
    return (
      <div className="bg-dossier-surface/50 rounded border border-dossier-border p-6">
        <p className="text-sm text-slate-400 text-center">
          No flags identified for this HOA.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-dossier-surface/50 rounded border border-dossier-border overflow-hidden">
      {/* Summary Row */}
      <div className="grid grid-cols-3 divide-x divide-dossier-border">
        {/* Red Flags */}
        <button
          onClick={() => toggleSection('red')}
          className={`p-5 transition-colors ${
            expanded === 'red' ? 'bg-red-500/10' : 'hover:bg-red-500/5'
          }`}
        >
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-2">
              <AlertOctagon className="h-5 w-5 text-red-400" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                Red Flags
              </span>
            </div>
            <span className="text-4xl font-mono font-bold tabular-nums text-red-400">
              {redFlags.length}
            </span>
            {redFlags.length > 0 && (
              <span className="text-[10px] font-mono text-slate-500 mt-1 flex items-center gap-1">
                {expanded === 'red' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {expanded === 'red' ? 'Hide' : 'View'}
              </span>
            )}
          </div>
        </button>

        {/* Yellow Flags */}
        <button
          onClick={() => toggleSection('yellow')}
          className={`p-5 transition-colors ${
            expanded === 'yellow' ? 'bg-amber-500/10' : 'hover:bg-amber-500/5'
          }`}
        >
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="h-5 w-5 text-amber-400" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                Cautions
              </span>
            </div>
            <span className="text-4xl font-mono font-bold tabular-nums text-amber-400">
              {yellowFlags.length}
            </span>
            {yellowFlags.length > 0 && (
              <span className="text-[10px] font-mono text-slate-500 mt-1 flex items-center gap-1">
                {expanded === 'yellow' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {expanded === 'yellow' ? 'Hide' : 'View'}
              </span>
            )}
          </div>
        </button>

        {/* Green Flags */}
        <button
          onClick={() => toggleSection('green')}
          className={`p-5 transition-colors ${
            expanded === 'green' ? 'bg-cyan-500/10' : 'hover:bg-cyan-500/5'
          }`}
        >
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-5 w-5 text-cyan-400" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                Positives
              </span>
            </div>
            <span className="text-4xl font-mono font-bold tabular-nums text-cyan-400">
              {greenFlags.length}
            </span>
            {greenFlags.length > 0 && (
              <span className="text-[10px] font-mono text-slate-500 mt-1 flex items-center gap-1">
                {expanded === 'green' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {expanded === 'green' ? 'Hide' : 'View'}
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-dossier-border p-5 animate-fade-in">
          <div className="space-y-3">
            {expanded === 'red' && redFlags.map((flag, idx) => (
              <FlagCard
                key={idx}
                type="danger"
                title={flag.title}
                description={flag.description}
                source={flag.source}
              />
            ))}

            {expanded === 'yellow' && yellowFlags.map((flag, idx) => (
              <FlagCard
                key={idx}
                type="warning"
                title={flag.title}
                description={flag.description}
                source={flag.source}
              />
            ))}

            {expanded === 'green' && greenFlags.map((flag, idx) => (
              <FlagCard
                key={idx}
                type="success"
                title={flag.title}
                description={flag.description}
                source={flag.source}
              />
            ))}

            {/* Empty state for each type */}
            {expanded === 'red' && redFlags.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">
                No critical issues identified.
              </p>
            )}
            {expanded === 'yellow' && yellowFlags.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">
                No cautions identified.
              </p>
            )}
            {expanded === 'green' && greenFlags.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">
                No positive aspects highlighted.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
