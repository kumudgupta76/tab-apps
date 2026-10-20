/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: 'rgb(var(--base) / <alpha-value>)',
        fg: 'rgb(var(--fg) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        accent2: 'rgb(var(--accent2) / <alpha-value>)',
        onaccent: 'rgb(var(--on-accent) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['"Segoe UI Variable Display"', '"SF Pro Display"', 'system-ui', '-apple-system', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
