/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      // s1: Custom font family for Noir Pro
      fontFamily: {
        'noir': ['Noir Pro', 'system-ui', '-apple-system', 'sans-serif'],
      },
      // s1: Custom color palette for dark admin theme
      colors: {
        admin: {
          bg: '#01021c',      // Main background
          text: '#ffffff',    // Main text color
          accent: '#e39607',  // Golden accent color
          card: '#1a1b2e',    // Card background (slightly lighter than bg)
          border: '#2d2e42',  // Border color
          hover: '#e3960710', // Accent color with 10% opacity for subtle hover
        }
      },
      // s1: Custom hover transitions
      transitionProperty: {
        'colors-shadow': 'color, background-color, border-color, box-shadow',
      }
    },
  },
  plugins: [],
}
