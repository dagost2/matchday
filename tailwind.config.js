/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        royals: {
          red: '#CC0000',
          dark: '#111111',
        }
      }
    }
  },
  plugins: []
}
