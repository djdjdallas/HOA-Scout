/**
 * Root Layout
 * Wraps all pages with common layout elements
 */

import './globals.css'
import { Inter } from 'next/font/google'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata = {
  title: 'HOA Scout - Know Your HOA Before You Buy',
  description: 'Comprehensive HOA evaluation tool that helps homebuyers make informed decisions with AI-powered analysis, public records, and neighborhood context.',
  keywords: 'HOA, homeowners association, real estate, home buying, property search, neighborhood analysis',
  authors: [{ name: 'HOA Scout' }],
  openGraph: {
    title: 'HOA Scout - Know Your HOA Before You Buy',
    description: 'Get comprehensive HOA reports with financial health analysis, rules breakdown, and neighborhood context powered by Yelp.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HOA Scout - Know Your HOA Before You Buy',
    description: 'Comprehensive HOA evaluation for smart homebuyers',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#2563EB',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}