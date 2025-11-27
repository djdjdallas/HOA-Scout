/**
 * Footer Component
 * Intelligence-themed site footer matching dossier aesthetic
 */

import { Shield, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-dossier-bg border-t border-dossier-border">
      {/* Grid pattern overlay */}
      <div className="relative">
        <div className="absolute inset-0 bg-grid-pattern bg-[size:20px_20px] opacity-10 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-7 w-7 text-cyan-400" />
                <div>
                  <span className="text-lg font-mono font-bold text-dossier-text tracking-tight">
                    HOA SCOUT
                  </span>
                  <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-cyan-400/70">
                    Intelligence Bureau
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Comprehensive HOA intelligence for informed homebuying decisions.
                Know before you buy.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 mb-4">
                Navigation
              </h3>
              <div className="flex flex-col gap-2">
                <Link
                  href="/#how-it-works"
                  className="text-sm font-mono text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  How it works
                </Link>
                <Link
                  href="/#features"
                  className="text-sm font-mono text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  Features
                </Link>
                <Link
                  href="/search"
                  className="text-sm font-mono text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  Search HOAs
                </Link>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 mb-4">
                Legal
              </h3>
              <div className="flex flex-col gap-2">
                <Link
                  href="/privacy"
                  className="text-sm font-mono text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="text-sm font-mono text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  Terms of Service
                </Link>
                <Link
                  href="/about"
                  className="text-sm font-mono text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  About
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 pt-6 border-t border-dossier-border">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-xs font-mono text-slate-500">
                &copy; {new Date().getFullYear()} HOA Scout. Built for the Yelp AI Hackathon.
              </p>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                <span>Neighborhood data powered by</span>
                <a
                  href="https://www.yelp.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors"
                >
                  Yelp Fusion API
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
