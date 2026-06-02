/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        // Core Surfaces
        'app-bg':      '#FAF6F0',   // warm alabaster — entire app background
        'surface':     '#FFFFFF',   // pure white — cards, sidebar, modals
        'ink':         '#1E1E1E',   // matte black — all headings & primary text
        'muted':       '#8A857F',   // warm gray — secondary text, muted labels
        'active':      '#111111',   // solid black — active menu, primary buttons

        // Accent Pastel Palette
        'pastel-pink':    '#F9C3BA',
        'pastel-yellow':  '#FCD6A5',
        'pastel-lavender':'#C6C1F7',
        'pastel-mint':    '#B5EAD7',

        // Pastel Light Backgrounds (for icon wrappers, badges, tints)
        'pastel-pink-bg':     '#FEF0EE',
        'pastel-yellow-bg':   '#FEF7EC',
        'pastel-lavender-bg': '#EEEDFB',
        'pastel-mint-bg':     '#E8FAF3',

        // Border
        'border-soft': 'rgba(30,30,30,0.07)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'soft':    '0 2px 8px rgba(30,30,30,0.06)',
        'softer':  '0 1px 3px rgba(30,30,30,0.04)',
        'none':    'none',
      },
    },
  },
  plugins: [],
}
