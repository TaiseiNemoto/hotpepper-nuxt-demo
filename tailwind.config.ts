import type { Config } from 'tailwindcss'
export default {
  content: [
    './app/app.vue',
    './app/components/**/*.{vue,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/composables/**/*.{ts,js}',
    './app/plugins/**/*.{ts,js}',
    './app/utils/**/*.{ts,js}',
    './server/**/*.{ts,js}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        error: 'var(--color-error)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
      },
      fontFamily: {
        sans: ['"Noto Sans JP"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
