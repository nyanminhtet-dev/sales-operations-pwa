/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
     "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#6D28D9',
          dark: '#4C1D95',
          soft: '#F5F3FF',
        },
        page: '#F8FAFC',
        surface: '#FFFFFF',
        text: {
          primary: '#111827',
          muted: '#64748B',
        },
        border: '#E2E8F0',
        positive: '#16A34A',
      },
    },
  },
  plugins: [],
}

