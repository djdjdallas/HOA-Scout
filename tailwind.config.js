/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './app/(with-layout)/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          light: '#DBEAFE',
        },
        success: {
          DEFAULT: '#10B981',
          light: '#D1FAE5',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FED7AA',
        },
        danger: {
          DEFAULT: '#EF4444',
          light: '#FEE2E2',
        },
        'dark-navy': '#0F172A',
        // Dossier theme colors
        dossier: {
          bg: '#0F172A',
          surface: '#1E293B',
          border: '#334155',
          text: '#F1F5F9',
          muted: '#94A3B8',
          accent: '#06B6D4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'IBM Plex Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      animation: {
        'spin-slow': 'spin 1.5s linear infinite',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'score-fill': 'scoreFill 1s ease-out forwards',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scoreFill: {
          '0%': { strokeDashoffset: '283' },
          '100%': { strokeDashoffset: 'var(--score-offset)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
      },
      backgroundImage: {
        'scan-lines': 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.03) 2px, rgba(0, 0, 0, 0.03) 4px)',
        'grid-pattern': 'linear-gradient(rgba(51, 65, 85, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(51, 65, 85, 0.3) 1px, transparent 1px)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}