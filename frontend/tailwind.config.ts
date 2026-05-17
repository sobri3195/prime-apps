import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#B19731',
        'prime-gold': '#B19731',
        'prime-gold-dark': '#7A6216',
        'prime-gold-soft': '#F6EBCB',
        'prime-black': '#231F20',
        'prime-ink': '#1F2328',
        'prime-muted': '#5F6670',
        'prime-cream': '#FFE7AB',
        'prime-surface': '#FFF9EC',
        'prime-line': '#EADFC5',
        'prime-teal': '#128C8A',
        'prime-teal-soft': '#E6F6F4',
      },
      borderRadius: {
        'prime-lg': '24px',
        'prime-xl': '30px',
      },
      boxShadow: {
        'prime-card': '0 18px 45px rgba(95, 80, 31, 0.08)',
        'prime-soft': '0 12px 28px rgba(35, 31, 32, 0.08)',
        'prime-gold': '0 18px 34px rgba(177, 151, 49, 0.22)',
        'prime-lift': '0 22px 48px rgba(95, 80, 31, 0.14)',
      },
      spacing: {
        safe: 'env(safe-area-inset-bottom)',
      },
    },
  },
  plugins: [],
} satisfies Config;
