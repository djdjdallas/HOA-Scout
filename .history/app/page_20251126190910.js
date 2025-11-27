/**
 * Landing Page
 * Split-screen hero with dark left panel and light right panel
 */

import { CheckCircle, FileText, Building2, Database } from "lucide-react";
import HybridSearch from "@/components/search/HybridSearch";
import Link from "next/link";

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
            Don't buy blind.
            <br />
            Know your HOA before you sign.
          </h1>

          {/* Subheading */}
          <p className="text-lg text-slate-300 mb-10 leading-relaxed max-w-lg">
            Get comprehensive HOA reports with financial health, rules analysis,
            community sentiment, and neighborhood context from Yelp. Make
            informed decisions on your biggest investment.
          </p>

          {/* Bullet Points */}
          <ul className="space-y-4">
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-slate-200">
                Uncover hidden special assessments
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-slate-200">
                Analyze reserve fund health
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-slate-200">
                Spot restrictive rental policies
              </span>
            </li>
          </ul>

          {/* Database Stats */}
          <div className="mt-10 flex items-center text-slate-400">
            <Database className="h-4 w-4 mr-2" />
            <span className="text-sm">
              16,000+ Florida HOAs in our database
            </span>
          </div>
        </div>
        {/* Copyright */}
        <div className="mt-8 text-xs text-slate-500">
          © 2025 HOA Scout Inc. Professional Research Tool.
        </div>
      </div>

      {/* Right Panel - Light */}
      <div className="bg-gray-50 grid-background lg:w-7/12 flex items-center justify-center p-8 lg:p-12 min-h-[50vh] lg:min-h-screen">
        <div className="w-full max-w-xl">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Find your HOA
            </h2>
            <p className="text-gray-600 mb-6">
              Search by HOA name, browse by location, or enter a property
              address.
            </p>

            {/* Hybrid Search */}
            <HybridSearch defaultTab="name" />
          </div>
        </div>
      </div>
    </div>
  );
}
