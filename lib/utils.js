import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge Tailwind CSS classes with proper override behavior
 * Uses clsx for conditional classes and tailwind-merge for deduping
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency values with proper symbols
 */
export function formatCurrency(amount, showCents = false) {
  if (amount === null || amount === undefined) return 'N/A'

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  })

  return formatter.format(amount)
}

/**
 * Format dates in a readable format
 */
export function formatDate(date, format = 'short') {
  if (!date) return 'N/A'

  const dateObj = new Date(date)

  if (format === 'short') {
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (format === 'long') {
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (format === 'relative') {
    const now = new Date()
    const diffTime = Math.abs(now - dateObj)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }

  return dateObj.toISOString()
}

/**
 * Get score color based on value
 */
export function getScoreColor(score) {
  if (score >= 8.5) return 'text-green-600'
  if (score >= 7) return 'text-green-500'
  if (score >= 5.5) return 'text-yellow-600'
  if (score >= 4) return 'text-orange-600'
  return 'text-red-600'
}

/**
 * Get score background color based on value
 */
export function getScoreBgColor(score) {
  if (score >= 8.5) return 'bg-green-100'
  if (score >= 7) return 'bg-green-50'
  if (score >= 5.5) return 'bg-yellow-50'
  if (score >= 4) return 'bg-orange-50'
  return 'bg-red-50'
}

/**
 * Get score label based on value
 */
export function getScoreLabel(score) {
  if (score >= 8.5) return 'Excellent'
  if (score >= 7) return 'Good'
  if (score >= 5.5) return 'Fair'
  if (score >= 4) return 'Poor'
  return 'Critical'
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text, length = 100) {
  if (!text) return ''
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

/**
 * Debounce function calls
 */
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Sleep function for delays
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Parse address components from a full address string
 */
export function parseAddress(addressString) {
  // Basic address parser - in production, use a proper geocoding service
  const parts = addressString.split(',').map(part => part.trim())

  if (parts.length < 3) {
    return null
  }

  const stateZipPattern = /^([A-Z]{2})\s+(\d{5})(-\d{4})?$/
  const cityStateZip = parts[parts.length - 1]
  const match = stateZipPattern.exec(cityStateZip)

  if (match) {
    return {
      street: parts.slice(0, -2).join(', '),
      city: parts[parts.length - 2],
      state: match[1],
      zipCode: match[2]
    }
  }

  // Fallback parsing
  return {
    street: parts[0],
    city: parts[1] || '',
    state: parts[2] || '',
    zipCode: ''
  }
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value, total) {
  if (!total || total === 0) return 0
  return Math.round((value / total) * 100)
}

/**
 * Get initials from name
 */
export function getInitials(name) {
  if (!name) return ''

  const parts = name.split(' ')
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

/**
 * Generate a unique ID
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Format number with commas
 */
export function formatNumber(num) {
  if (num === null || num === undefined) return 'N/A'
  return new Intl.NumberFormat('en-US').format(num)
}

/**
 * Get error message from error object
 */
export function getErrorMessage(error) {
  if (typeof error === 'string') return error
  if (error?.message) return error.message
  if (error?.error) return error.error
  return 'An unexpected error occurred'
}