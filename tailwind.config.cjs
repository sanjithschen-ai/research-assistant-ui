/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body:    ['"Inter"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        // Dark mode
        dark: {
          bg:      '#080C14',
          surface: '#0D1117',
          card:    '#111827',
          border:  '#1F2937',
          muted:   '#1E293B',
          hover:   '#1a2235',
        },
        // Light mode
        light: {
          bg:      '#F8FAFC',
          surface: '#FFFFFF',
          card:    '#FFFFFF',
          border:  '#E2E8F0',
          muted:   '#F1F5F9',
          hover:   '#F8FAFC',
        },
        brand: {
          50:  '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger:  '#EF4444',
        info:    '#3B82F6',
      },
      boxShadow: {
        'card-dark':  '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        'card-light': '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        'glow':       '0 0 0 3px rgba(99,102,241,0.15)',
        'glow-md':    '0 0 20px rgba(99,102,241,0.12)',
        'dropdown':   '0 10px 40px rgba(0,0,0,0.3)',
      },
      animation: {
        'fade-in':  'fadeIn 0.3s ease forwards',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16,1,0.3,1) forwards',
        'scale-in': 'scaleIn 0.2s ease forwards',
        'shimmer':  'shimmer 2s linear infinite',
        'pulse-sm': 'pulseSm 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:   { from: { opacity:0 }, to: { opacity:1 } },
        slideUp:  { from: { opacity:0, transform:'translateY(12px)' }, to: { opacity:1, transform:'translateY(0)' } },
        scaleIn:  { from: { opacity:0, transform:'scale(0.95)' }, to: { opacity:1, transform:'scale(1)' } },
        shimmer:  { from: { backgroundPosition:'-200% 0' }, to: { backgroundPosition:'200% 0' } },
        pulseSm:  { '0%,100%':{ opacity:1 }, '50%':{ opacity:0.4 } },
      },
    },
  },
  plugins: [],
}
