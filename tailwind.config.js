/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'slide-in': {
          '0%': { 
            transform: 'translateY(-100%)',
            opacity: '0'
          },
          '10%': {
            transform: 'translateY(0)',
            opacity: '1'
          },
          '90%': {
            transform: 'translateY(0)',
            opacity: '1'
          },
          '100%': {
            transform: 'translateY(-100%)',
            opacity: '0'
          }
        },
        'bounce-in': {
          '0%': { 
            transform: 'scale(0.3)',
            opacity: '0'
          },
          '50%': {
            transform: 'scale(1.05)',
            opacity: '0.8'
          },
          '70%': { 
            transform: 'scale(0.9)',
            opacity: '0.9'
          },
          '100%': { 
            transform: 'scale(1)',
            opacity: '1'
          }
        }
      },
      animation: {
        'slide-in': 'slide-in 5s ease-in-out forwards',
        'bounce-in': 'bounce-in 0.5s ease-out forwards'
      },
      backdropBlur: {
        xs: '2px'
      }
    },
  },
  plugins: [],
}