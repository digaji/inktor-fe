/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: { 'inktor-cyan': '#53a8b6' },
    },
  },
  // eslint-disable-next-line no-undef
  plugins: [require('@headlessui/tailwindcss')],
}
