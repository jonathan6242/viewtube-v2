/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark1: '#222',
        dark2: '#333',
        dark3: '#444'
      },
      maxWidth: {
        'screen-3xl': '1700px'
      }
    },
    screens: {
      'xs': '585px',
      'sm': '640px',
      'md': '768px',
      '2md': '800px',
      '3md': '900px',
      '4md': '1000px',
      '5md': '1100px',
      'lg': '1200px',
      'xl': '1280px',
      '2xl': '1536px',
    }
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
    require('tailwind-scrollbar-hide')
  ]
}