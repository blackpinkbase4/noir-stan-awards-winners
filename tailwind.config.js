/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        vma: {
          mint: '#7bf1a8',
          mintHover: '#5eead4',
          cardDark: '#0e1017',
          cardHover: '#141824',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        noir: {
          950: '#040406',
          900: '#0b0c10',
          850: '#11131a',
        },
        chrome: {
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
        },
      },
      fontFamily: {
        heading: ['Oswald', 'sans-serif'],
        accent: ['Syne', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'vma-mint': '0 0 25px rgba(123, 241, 168, 0.25)',
        'vma-gold': '0 0 30px rgba(234, 179, 8, 0.3)',
      },
    },
  },
  plugins: [],
};
