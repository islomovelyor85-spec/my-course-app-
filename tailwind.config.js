/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#231F14',   // deep ink-brown-black, evokes calligraphy ink
          soft: '#3A3424'
        },
        gold: {
          DEFAULT: '#C9A24B',
          light: '#DEC17E',
          dark: '#9C7A32'
        },
        beige: {
          DEFAULT: '#F5EFE6',
          soft: '#FAF6F0'
        },
        paper: '#FFFFFF'
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        body: ['"Inter"', 'sans-serif']
      },
      borderRadius: {
        xl2: '1.25rem'
      },
      boxShadow: {
        soft: '0 2px 20px rgba(35, 31, 20, 0.06)'
      }
    }
  },
  plugins: []
}
