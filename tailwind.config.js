/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    colors: {
      teal: '#00d1b2',
      grey: {
        light: '#d3d3d3',
        dark: '#a9a9a9'
      },
      yellow: '#ffd644',
      intellij: {
        orange: '#cf8e6d',
        white: '#bcbec4',
        purple: '#b189f5',
        brackets: '#54a857',
        comments: '#5f826b'
      }
    },
    extend: {},
  },
  plugins: [],
}

