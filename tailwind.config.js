/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",    // Most important: scans everything in src
    "./pages/**/*.{js,ts,jsx,tsx}",  // Scans root pages if they exist
    "./components/**/*.{js,ts,jsx,tsx}",
    "./public/**/*.html",
  ],
  theme: {
    extend: {
      colors: {
        navy: '#001a33',
        primary: '#2563eb',
        accent: '#3b82f6',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'vector': '0 25px 50px -12px rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
}