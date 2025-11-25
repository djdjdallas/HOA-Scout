/**
 * Footer Component
 * Site footer with links and branding
 */

import { Home } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  return (
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
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/about" className="hover:text-white transition-colors">
              About
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              Contact
            </Link>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-gray-800 text-center text-sm">
          <p className="mb-2">
            © 2024 HOA Scout. Built for the Yelp AI Hackathon.
          </p>
          <p className="text-gray-400 text-xs">
            Neighborhood data powered by{' '}
            <a
              href="https://www.yelp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:text-red-300"
            >
              Yelp Fusion API
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}