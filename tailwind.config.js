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
      },
      yellow: '#ffd644',
      teal: '#00d1b2',
      intellij: {
        white: '#bcbec4',
        orange: '#cf8e6d',
        purple: '#b189f5',
        brace: '#bcbec4',
        comment: '#5f826b'
      }
    },
    extend: {},
  },
  plugins: [],
}

