import React, { useState } from 'react';
import { Search, Shield, TrendingUp, FileText, AlertCircle, CheckCircle, Home, Users, DollarSign, MapPin } from 'lucide-react';

const LandingPage = () => {
  const [address, setAddress] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    // Handle search logic
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Home className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">HOA Scout</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">How it works</a>
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
              <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-white pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Don't buy blind.<br />
              <span className="text-blue-600">Know your HOA before you sign.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10">
              Get comprehensive HOA reports with financial health, rules analysis, and community sentiment.
              Make informed decisions on your biggest investment.
            </p>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter property address or HOA name..."
                  className="w-full pl-12 pr-32 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                  required
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSearching ? 'Searching...' : 'Get Report'}
                </button>
              </div>
            </form>

            {/* Trust Indicators */}
            <div className="mt-8 flex flex-wrap justify-center items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>1,000+ reports generated</span>
              </div>
              <div className="flex items-center">
                <Shield className="h-4 w-4 text-blue-500 mr-2" />
                <span>Public records verified</span>
              </div>
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                <span>Real-time data</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            What's in your HOA Report?
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Our comprehensive analysis covers every aspect of HOA governance and community life
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Financial Health Card */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-start mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Financial Health</h3>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-2xl font-bold text-green-600">8.5/10</span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">Excellent</span>
                  </div>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>6-month reserve fund analysis</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Assessment history & trends</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Budget breakdown & spending</span>
                </li>
              </ul>
            </div>

            {/* Rules & Restrictions Card */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-start mb-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <FileText className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Rules Analysis</h3>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-2xl font-bold text-yellow-600">6.2/10</span>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">Moderate</span>
                  </div>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <AlertCircle className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Pet restrictions summary</span>
                </li>
                <li className="flex items-start">
                  <AlertCircle className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Rental & Airbnb policies</span>
                </li>
                <li className="flex items-start">
                  <AlertCircle className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Parking & modification rules</span>
                </li>
              </ul>
            </div>

            {/* Community Sentiment Card */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-start mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Community Vibe</h3>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-2xl font-bold text-blue-600">7.8/10</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">Good</span>
                  </div>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <MapPin className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Yelp neighborhood insights</span>
                </li>
                <li className="flex items-start">
                  <Users className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Resident reviews & feedback</span>
                </li>
                <li className="flex items-start">
                  <TrendingUp className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Board responsiveness rating</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Red Yellow Green Flags Preview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Know What to Look For
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Our reports highlight critical issues and positive features at a glance
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Red Flags */}
            <div>
              <h3 className="font-semibold text-red-600 mb-4 flex items-center">
                <div className="w-2 h-2 bg-red-600 rounded-full mr-2"></div>
                Red Flags
              </h3>
              <div className="space-y-3">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                  <p className="font-medium text-gray-900">No reserve fund</p>
                  <p className="text-sm text-gray-600 mt-1">Special assessments likely</p>
                </div>
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                  <p className="font-medium text-gray-900">Pending litigation</p>
                  <p className="text-sm text-gray-600 mt-1">$2M lawsuit in progress</p>
                </div>
              </div>
            </div>

            {/* Cautions */}
            <div>
              <h3 className="font-semibold text-yellow-600 mb-4 flex items-center">
                <div className="w-2 h-2 bg-yellow-600 rounded-full mr-2"></div>
                Cautions
              </h3>
              <div className="space-y-3">
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                  <p className="font-medium text-gray-900">Strict pet policy</p>
                  <p className="text-sm text-gray-600 mt-1">1 pet max, 25lb limit</p>
                </div>
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                  <p className="font-medium text-gray-900">Rising fees</p>
                  <p className="text-sm text-gray-600 mt-1">15% increase over 2 years</p>
                </div>
              </div>
            </div>

            {/* Green Flags */}
            <div>
              <h3 className="font-semibold text-green-600 mb-4 flex items-center">
                <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                Green Flags
              </h3>
              <div className="space-y-3">
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                  <p className="font-medium text-gray-900">Fully funded reserves</p>
                  <p className="text-sm text-gray-600 mt-1">120% of recommended</p>
                </div>
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                  <p className="font-medium text-gray-900">Active community</p>
                  <p className="text-sm text-gray-600 mt-1">90% meeting attendance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Make your smartest home buying decision
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of homebuyers who researched their HOA first
          </p>
          <button className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-lg">
            Get Your Free HOA Report
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center mb-2">
                <Home className="h-6 w-6 text-blue-400 mr-2" />
                <span className="text-lg font-semibold text-white">HOA Scout</span>
              </div>
              <p className="text-sm">Smart HOA research for smart homebuyers</p>
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Data Sources</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-800 text-center text-sm">
            <p>© 2024 HOA Scout. Built for the Yelp AI Hackathon.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;