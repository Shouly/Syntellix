module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Noto Sans SC', 'sans-serif'],
        body: ['Roboto', 'Noto Sans SC', 'sans-serif'],
        heading: ['Montserrat', 'Noto Sans SC', 'sans-serif'],
        tech: ['Montserrat', 'Noto Sans SC', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        'sans-sc': ['Noto Sans SC', 'sans-serif'],
      },
      colors: {
        primary: {
          light: '#4a90e2',
          DEFAULT: '#3a7bd5',
          dark: '#2c5ea3',
        },
        secondary: {
          light: '#f8fafc',
          DEFAULT: '#e2e8f0',
          dark: '#cbd5e1',
        },
        info: {
          light: '#b0cde0',
          DEFAULT: '#94b9d0',
          dark: '#78a5c0',
        },
        success: {
          light: '#90bf6a',
          DEFAULT: '#7aaf52',
          dark: '#649f3a',
        },
        warning: {
          light: '#f9b44c',
          DEFAULT: '#f79f1a',
          dark: '#e58a00',
        },
        danger: {
          light: '#f77066',
          DEFAULT: '#f44336',
          dark: '#d32f2f',
        },
        text: {
          primary: '#252422',
          secondary: '#66615b',
          muted: '#9a9a9a',
          body: '#253f62',
        },
        bg: {
          primary: '#ffffff',
          secondary: '#f1f5f9',
          tertiary: '#f0f2f5',
        },
        sidebar: {
          light: '#4a90e2',
          DEFAULT: '#3a7bd5',
          dark: '#2c5ea3',
        },
      },
      animation: {
        wave: 'wave 1.5s ease-in-out infinite',
      },
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'scaleY(0.5)' },
          '50%': { transform: 'scaleY(1.0)' },
        },
        ellipsis: {
          '0%': { opacity: 0 },
          '50%': { opacity: 1 },
          '100%': { opacity: 0 },
        }
      }
    }
  },
  plugins: [],
}