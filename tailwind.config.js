/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      gray: {
        light: '#d3d3d3',
        dark: '#a9a9a9'
      }
    },
    extend: {},
  },
  plugins: [],
}

