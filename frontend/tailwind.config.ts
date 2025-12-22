import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7C3AED',
        'primary-light': '#A78BFA',
        'primary-dark': '#5B21B6',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
        background: '#0F172A',
        surface: '#1E293B',
        'surface-light': '#334155',
        border: '#475569',
        'text-primary': '#F8FAFC',
        'text-secondary': '#CBD5E1',
        'text-muted': '#64748B',
        'severity-critical': '#DC2626',
        'severity-high': '#EA580C',
        'severity-medium': '#D97706',
        'severity-low': '#CA8A04',
        'severity-healthy': '#16A34A',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        display: ['36px', { fontWeight: '700', lineHeight: '1.2' }],
        h1: ['28px', { fontWeight: '700', lineHeight: '1.2' }],
        h2: ['24px', { fontWeight: '600', lineHeight: '1.3' }],
        h3: ['20px', { fontWeight: '600', lineHeight: '1.4' }],
        h4: ['16px', { fontWeight: '600', lineHeight: '1.5' }],
        'body-lg': ['16px', { fontWeight: '400', lineHeight: '1.6' }],
        body: ['14px', { fontWeight: '400', lineHeight: '1.6' }],
        'body-sm': ['13px', { fontWeight: '400', lineHeight: '1.6' }],
        caption: ['12px', { fontWeight: '500', lineHeight: '1.5' }],
        code: ['14px', { fontWeight: '400', lineHeight: '1.5' }],
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
      },
      borderRadius: {
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(180deg)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;