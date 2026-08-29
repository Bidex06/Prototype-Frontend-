/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark': '#0a0a0f',
        'card': '#14141e',
        'border': '#2a2a3a',
        'accent': '#00d4ff',
        'green': '#00d4aa',
        'red': '#ff4757',
      }
    },
  },
  plugins: [],
}