/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#FDFBF7',
        'bg-alt': '#F7F4ED',
        'bg-accent': '#EDE8DC',
        text: '#2C2416',
        'text-muted': '#6B5D4D',
        'text-light': '#8B7D6B',
        accent: '#8B4513',
        'accent-dark': '#5C3317',
        'accent-light': '#A0522D',
        rule: '#D4C4A8',
        'rule-dark': '#B8A88C',
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        heading: ['Cormorant Garamond', 'Georgia', 'serif'],
        body: ['Source Sans 3', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
