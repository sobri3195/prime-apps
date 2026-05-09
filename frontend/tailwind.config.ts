import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#B19731',
        'prime-gold': '#B19731',
        'prime-black': '#231F20',
        'prime-cream': '#FFE7AB',
      },
    },
  },
  plugins: [],
} satisfies Config;
