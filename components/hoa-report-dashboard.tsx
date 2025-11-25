import React, { useState } from 'react';
import {
  Home, Download, Share2, ChevronDown, ChevronUp, AlertTriangle,
  CheckCircle, XCircle, Info, DollarSign, FileText, Users, MapPin,
  TrendingUp, TrendingDown, Calendar, Shield, Clock, AlertCircle,
  Building, Car, Pet, Volume2, Key, Mail, Phone, ExternalLink
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface HOAReport {
  name: string;
  address: string;
  monthlyFee: number;
  overallScore: number;
  financialScore: number;
  rulesScore: number;
  managementScore: number;
  communityScore: number;
}

const HOAReportDashboard = () => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['quick-verdict']);

  // Sample data
  const report: HOAReport = {
    name: "Willowbrook Estates HOA",
    address: "Phoenix, AZ 85001",
    monthlyFee: 285,
    overallScore: 7.2,
    financialScore: 8.5,
    rulesScore: 6.2,
    managementScore: 7.8,
    communityScore: 7.3
  };

  // Mock financial data
  const feeHistory = [
    { year: '2019', fee: 245 },
    { year: '2020', fee: 250 },
    { year: '2021', fee: 260 },
    { year: '2022', fee: 275 },
    { year: '2023', fee: 285 }
  ];

  const budgetBreakdown = [
    { name: 'Landscaping', value: 35, color: '#10B981' },
    { name: 'Security', value: 20, color: '#3B82F6' },
    { name: 'Maintenance', value: 25, color: '#F59E0B' },
    { name: 'Utilities', value: 10, color: '#8B5CF6' },
    { name: 'Admin', value: 10, color: '#6B7280' }
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 8.5) return 'text-green-600';
    if (score >= 7) return 'text-green-500';
    if (score >= 5.5) return 'text-yellow-600';
    if (score >= 4) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 8.5) return 'bg-green-100';
    if (score >= 7) return 'bg-green-50';
    if (score >= 5.5) return 'bg-yellow-50';
    if (score >= 4) return 'bg-orange-50';
    return 'bg-red-50';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8.5) return 'Excellent';
    if (score >= 7) return 'Good';
    if (score >= 5.5) return 'Fair';
    if (score >= 4) return 'Poor';
    return 'Critical';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Home className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">HOA Scout</span>
              <span className="hidden md:inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                Score: {report.overallScore}/10
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Share2 className="h-4 w-4" />
                <span className="hidden md:inline">Share</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors">
                <Download className="h-4 w-4" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{report.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {report.address}
                </span>
                <span className="flex items-center font-semibold text-gray-900">
                  <DollarSign className="h-4 w-4" />
                  {report.monthlyFee}/month
                </span>
              </div>
            </div>

            {/* Overall Score Display */}
            <div className="mt-6 lg:mt-0 flex items-center">
              <div className="relative">
                <svg className="w-32 h-32">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#E5E7EB"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke={report.overallScore >= 7 ? '#10B981' : report.overallScore >= 5.5 ? '#F59E0B' : '#EF4444'}
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${(report.overallScore / 10) * 351.86} 351.86`}
                    strokeLinecap="round"
                    transform="rotate(-90 64 64)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-bold ${getScoreColor(report.overallScore)}`}>
                    {report.overallScore}
                  </span>
                  <span className="text-xs text-gray-600">out of 10</span>
                </div>
              </div>
              <div className="ml-4">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(report.overallScore)} ${getScoreColor(report.overallScore)}`}>
                  {getScoreLabel(report.overallScore)}
                </span>
                <p className="text-sm text-gray-600 mt-2 max-w-xs">
                  Moderate restrictions, financially healthy, responsive management
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Verdict Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection('quick-verdict')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <h2 className="text-xl font-bold text-gray-900">Quick Verdict</h2>
            {expandedSections.includes('quick-verdict') ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>

          {expandedSections.includes('quick-verdict') && (
            <div className="px-6 pb-6">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Red Flags */}
                <div>
                  <h3 className="font-semibold text-red-600 mb-3 flex items-center">
                    <XCircle className="h-5 w-5 mr-2" />
                    Red Flags (2)
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r">
                      <p className="font-medium text-gray-900 text-sm">No guest parking after 6pm</p>
                      <p className="text-xs text-gray-600 mt-1">Visitors must leave or face towing</p>
                    </div>
                    <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r">
                      <p className="font-medium text-gray-900 text-sm">Strict rental restrictions</p>
                      <p className="text-xs text-gray-600 mt-1">No short-term rentals allowed</p>
                    </div>
                  </div>
                </div>

                {/* Cautions */}
                <div>
                  <h3 className="font-semibold text-yellow-600 mb-3 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Cautions (3)
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded-r">
                      <p className="font-medium text-gray-900 text-sm">Rising HOA fees</p>
                      <p className="text-xs text-gray-600 mt-1">16% increase over 3 years</p>
                    </div>
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded-r">
                      <p className="font-medium text-gray-900 text-sm">Pet weight limit</p>
                      <p className="text-xs text-gray-600 mt-1">Maximum 35 lbs per pet</p>
                    </div>
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded-r">
                      <p className="font-medium text-gray-900 text-sm">Architectural approval required</p>
                      <p className="text-xs text-gray-600 mt-1">All exterior changes need board approval</p>
                    </div>
                  </div>
                </div>

                {/* Green Flags */}
                <div>
                  <h3 className="font-semibold text-green-600 mb-3 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Green Flags (4)
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded-r">
                      <p className="font-medium text-gray-900 text-sm">Fully funded reserves</p>
                      <p className="text-xs text-gray-600 mt-1">120% of recommended level</p>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded-r">
                      <p className="font-medium text-gray-900 text-sm">No pending litigation</p>
                      <p className="text-xs text-gray-600 mt-1">Clean legal history</p>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded-r">
                      <p className="font-medium text-gray-900 text-sm">Active community</p>
                      <p className="text-xs text-gray-600 mt-1">Regular events and high participation</p>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded-r">
                      <p className="font-medium text-gray-900 text-sm">Transparent management</p>
                      <p className="text-xs text-gray-600 mt-1">Monthly reports published online</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Score Breakdown Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className={`text-2xl font-bold ${getScoreColor(report.financialScore)}`}>
                {report.financialScore}
              </span>
            </div>
            <h3 className="font-medium text-gray-900 text-sm">Financial Health</h3>
            <p className="text-xs text-gray-600 mt-1">Strong reserves, stable fees</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <FileText className="h-5 w-5 text-yellow-600" />
              <span className={`text-2xl font-bold ${getScoreColor(report.rulesScore)}`}>
                {report.rulesScore}
              </span>
            </div>
            <h3 className="font-medium text-gray-900 text-sm">Rules & Restrictions</h3>
            <p className="text-xs text-gray-600 mt-1">Moderate restrictions</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span className={`text-2xl font-bold ${getScoreColor(report.managementScore)}`}>
                {report.managementScore}
              </span>
            </div>
            <h3 className="font-medium text-gray-900 text-sm">Management Quality</h3>
            <p className="text-xs text-gray-600 mt-1">Responsive and organized</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-5 w-5 text-purple-600" />
              <span className={`text-2xl font-bold ${getScoreColor(report.communityScore)}`}>
                {report.communityScore}
              </span>
            </div>
            <h3 className="font-medium text-gray-900 text-sm">Community Vibe</h3>
            <p className="text-xs text-gray-600 mt-1">Active and friendly</p>
          </div>
        </div>

        {/* Financial Details Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection('financial')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <h2 className="text-xl font-bold text-gray-900">Financial Health</h2>
              <span className="ml-3 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                Score: {report.financialScore}/10
              </span>
            </div>
            {expandedSections.includes('financial') ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>

          {expandedSections.includes('financial') && (
            <div className="px-6 pb-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Fee History Chart */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">HOA Fee History</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={feeHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="fee" stroke="#2563EB" strokeWidth={2} dot={{ fill: '#2563EB' }} />
                    </LineChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-gray-600 mt-2">Average annual increase: 3.8%</p>
                </div>

                {/* Budget Breakdown */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Budget Allocation</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={budgetBreakdown}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {budgetBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Key Financial Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Reserve Fund</p>
                  <p className="text-lg font-semibold text-gray-900">$485,000</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    120% funded
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Last Assessment</p>
                  <p className="text-lg font-semibold text-gray-900">None</p>
                  <p className="text-xs text-gray-600 mt-1">5+ years ago</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Delinquency Rate</p>
                  <p className="text-lg font-semibold text-gray-900">2.1%</p>
                  <p className="text-xs text-green-600 mt-1">Below average</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Operating Budget</p>
                  <p className="text-lg font-semibold text-gray-900">$1.2M</p>
                  <p className="text-xs text-gray-600 mt-1">Annual</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rules & Restrictions Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection('rules')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <h2 className="text-xl font-bold text-gray-900">Rules & Restrictions</h2>
              <span className="ml-3 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                Score: {report.rulesScore}/10
              </span>
            </div>
            {expandedSections.includes('rules') ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>

          {expandedSections.includes('rules') && (
            <div className="px-6 pb-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Car className="h-4 w-4 mr-2 text-gray-600" />
                    Parking & Vehicles
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <XCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>No overnight street parking</span>
                    </li>
                    <li className="flex items-start">
                      <AlertCircle className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>2 vehicles per unit maximum</span>
                    </li>
                    <li className="flex items-start">
                      <XCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>No commercial vehicles or RVs</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Pet className="h-4 w-4 mr-2 text-gray-600" />
                    Pet Policy
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>2 pets per household allowed</span>
                    </li>
                    <li className="flex items-start">
                      <AlertCircle className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>35 lb weight limit per pet</span>
                    </li>
                    <li className="flex items-start">
                      <Info className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Must be leashed in common areas</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Building className="h-4 w-4 mr-2 text-gray-600" />
                    Modifications
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <AlertCircle className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>All exterior changes need approval</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Interior renovations allowed</span>
                    </li>
                    <li className="flex items-start">
                      <Info className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Approved color palette provided</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Key className="h-4 w-4 mr-2 text-gray-600" />
                    Rentals
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <XCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>No short-term rentals (< 30 days)</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Long-term rentals permitted</span>
                    </li>
                    <li className="flex items-start">
                      <Info className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Must register tenants with HOA</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Items Section */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <AlertCircle className="h-6 w-6 text-blue-600 mr-2" />
            Before You Buy: Action Items
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Questions to Ask</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-blue-600 font-semibold mr-2">1.</span>
                  <span>Are there any planned special assessments in the next 2 years?</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 font-semibold mr-2">2.</span>
                  <span>What percentage of units are owner-occupied vs rentals?</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 font-semibold mr-2">3.</span>
                  <span>How often are HOA fees typically increased?</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 font-semibold mr-2">4.</span>
                  <span>What's the process for architectural modifications?</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 font-semibold mr-2">5.</span>
                  <span>Are there any ongoing disputes or litigation?</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Documents to Request</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Last 3 years of financial statements</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Reserve study (should be < 3 years old)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Board meeting minutes (last 6 months)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Current CC&Rs and bylaws</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Insurance policy declarations</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
              <Download className="h-4 w-4 mr-2" />
              Download Full Report
            </button>
            <button className="flex-1 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center">
              <Mail className="h-4 w-4 mr-2" />
              Email to Realtor
            </button>
          </div>
        </div>
      </div>

      {/* Mobile FAB */}
      <div className="fixed bottom-4 right-4 md:hidden">
        <button className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors">
          <Download className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default HOAReportDashboard;