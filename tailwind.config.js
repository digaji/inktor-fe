/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: { 'inktor-cyan': '#53a8b6' },
      boxShadow: {
        toolbar: '0px 0px 5px 5px rgba(0, 0, 0, 0.2)',
      },
      height: {
        toolbar: '60%',
      },
    },
  },
  // eslint-disable-next-line no-undef
  plugins: [require('@headlessui/tailwindcss')],
}
