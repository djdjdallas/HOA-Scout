/**
 * Header Component
 * Intelligence-themed navigation header matching dossier aesthetic
 */

'use client'

import { Shield, Menu, X, Search, FileText } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-dossier-bg/95 backdrop-blur-sm border-b border-dossier-border">
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern bg-[size:20px_20px] opacity-20 pointer-events-none" />

      <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <Shield className="h-8 w-8 text-cyan-400 transition-all group-hover:text-cyan-300" />
              <div className="absolute inset-0 bg-cyan-400/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-mono font-bold text-dossier-text tracking-tight">
                HOA SCOUT
              </span>
              <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-cyan-400/70 -mt-1">
                Intelligence Bureau
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/#how-it-works"
              className="px-4 py-2 text-sm font-mono text-slate-400 hover:text-cyan-400 transition-colors"
            >
              How it works
            </Link>
            <Link
              href="/#features"
              className="px-4 py-2 text-sm font-mono text-slate-400 hover:text-cyan-400 transition-colors"
            >
              Features
            </Link>
            <div className="w-px h-6 bg-dossier-border mx-2" />
            <Link
              href="/search"
              className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-dossier-bg font-mono text-sm font-semibold rounded transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              <Search className="h-4 w-4" />
              Search HOAs
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-cyan-400 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-dossier-border animate-slide-up">
            <div className="flex flex-col gap-2">
              <Link
                href="/#how-it-works"
                className="px-4 py-3 text-sm font-mono text-slate-400 hover:text-cyan-400 hover:bg-dossier-surface/50 rounded transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                How it works
              </Link>
              <Link
                href="/#features"
                className="px-4 py-3 text-sm font-mono text-slate-400 hover:text-cyan-400 hover:bg-dossier-surface/50 rounded transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <div className="h-px bg-dossier-border my-2" />
              <Link
                href="/search"
                className="flex items-center justify-center gap-2 mx-4 px-5 py-3 bg-cyan-500 hover:bg-cyan-400 text-dossier-bg font-mono text-sm font-semibold rounded transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Search className="h-4 w-4" />
                Search HOAs
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
