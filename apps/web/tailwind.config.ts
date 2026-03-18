import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        eira: {
          50:  '#f0fdf9',
          100: '#ccfbef',
          200: '#99f6e0',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        crisis: {
          50:  '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
        wellness: {
          low:    '#f43f5e',
          medium: '#f59e0b',
          good:   '#84cc16',
          high:   '#14b8a6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'breathe-in':  'scale-up 4s ease-in-out',
        'breathe-out': 'scale-down 4s ease-in-out',
        'pulse-soft':  'pulse 3s ease-in-out infinite',
        'fade-in':     'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        'scale-up': {
          '0%':   { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.5)' },
        },
        'scale-down': {
          '0%':   { transform: 'scale(1.5)' },
          '100%': { transform: 'scale(1)' },
        },
        'fadeIn': {
          '0%':   { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
