/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        app: 'var(--bg-app)',
        surface: {
          DEFAULT: 'var(--bg-surface)',
          muted: 'var(--bg-surface-muted)',
          card: 'var(--bg-card)',
        },
        border: {
          DEFAULT: 'var(--border-app)',
          card: 'var(--border-card)',
          muted: 'var(--border-muted)',
        },
        primary: {
          DEFAULT: 'var(--text-primary)',
          foreground: 'var(--text-inverse)',
        },
        secondary: 'var(--text-secondary)',
        muted: 'var(--text-muted)',
        brand: {
          DEFAULT: 'var(--brand-cyan)',
          50: '#f0fdf4',
          100: '#dcfce7',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
        },
        dark: {
          950: '#07090e',
          900: '#0d1117',
          850: '#131822',
          800: '#161b26',
          700: '#212836',
          600: '#30394c',
        },
        cyber: {
          cyan: 'var(--brand-cyan)',
          crimson: '#f43f5e',
          amber: '#f59e0b',
          emerald: '#10b981',
          indigo: '#6366f1',
          purple: '#a855f7',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scan 8s linear infinite',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' }
        }
      }
    },
  },
  plugins: [],
}
