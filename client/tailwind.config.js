/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          800: '#0f172a',
          900: '#0b1120',
          950: '#060a14',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['IBM Plex Mono', 'JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  plugins: [],
};

