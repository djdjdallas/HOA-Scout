/**
 * Landing Page
 * Split-screen hero with dark left panel and light right panel
 */

import { CheckCircle, FileText, Building2 } from 'lucide-react'
import SearchForm from '@/components/search/SearchForm'
import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Dark Navy */}
      <div className="bg-dark-navy text-slate-50 lg:w-5/12 flex flex-col justify-between p-8 lg:p-12 min-h-[50vh] lg:min-h-screen">
        {/* Logo and Content */}
        <div>
          {/* Logo */}
          <div className="flex items-center mb-16">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-semibold">HOA Scout</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            Don't buy blind.<br />
            Know your HOA before you sign.
          </h1>

          {/* Subheading */}
          <p className="text-lg text-slate-300 mb-10 leading-relaxed max-w-lg">
            Get comprehensive HOA reports with financial health, rules analysis, community sentiment,
            and neighborhood context from Yelp. Make informed decisions on your biggest investment.
          </p>

          {/* Bullet Points */}
          <ul className="space-y-4">
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-slate-200">Uncover hidden special assessments</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-slate-200">Analyze reserve fund health</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-slate-200">Spot restrictive rental policies</span>
            </li>
          </ul>
        </div>

        {/* Testimonial */}
        <div className="mt-16">
          <div className="flex items-center mb-2">
            <div className="flex -space-x-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-dark-navy"></div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 border-2 border-dark-navy"></div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 border-2 border-dark-navy"></div>
            </div>
          </div>
          <p className="text-lg font-medium mb-1">"Saved me from a $15k assessment."</p>
          <p className="text-sm text-slate-400">Trusted by 1,000+ buyers</p>
        </div>

        {/* Copyright */}
        <div className="mt-8 text-xs text-slate-500">
          © 2024 HOA Scout Inc. Professional Research Tool.
        </div>
      </div>

      {/* Right Panel - Light */}
      <div className="bg-gray-50 grid-background lg:w-7/12 flex items-center justify-center p-8 lg:p-12 min-h-[50vh] lg:min-h-screen">
        <div className="w-full max-w-xl">
          {/* Top Link */}
          <Link
            href="#how-it-works"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 mb-8 font-medium"
          >
            <FileText className="h-4 w-4 mr-2" />
            Start your investigation
          </Link>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Evaluate a property
            </h2>
            <p className="text-gray-600 mb-8">
              Enter an address or HOA name to generate a full dossier.
            </p>

            {/* Search Form */}
            <SearchForm
              showExamples={false}
              buttonText="Generate Report"
              placeholder="e.g. 1234 Maple Drive, Springfield"
            />

            {/* Example Links */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                href="/search?q=Sunset Ridge Condos"
                className="text-xs text-gray-500 hover:text-gray-700 uppercase tracking-wide font-medium"
              >
                TRY EXAMPLE<br />
                <span className="text-sm text-gray-700 normal-case font-normal">Sunset Ridge Condos</span>
              </Link>
              <Link
                href="/search?q=The Highland Lofts"
                className="text-xs text-gray-500 hover:text-gray-700 uppercase tracking-wide font-medium sm:ml-6"
              >
                TRY EXAMPLE<br />
                <span className="text-sm text-gray-700 normal-case font-normal">The Highland Lofts</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
