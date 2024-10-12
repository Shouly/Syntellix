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
          light: '#4fd1d9',
          DEFAULT: '#22808d',
          dark: '#1a616b',
        },
        secondary: {
          light: '#ffd166',
          DEFAULT: '#f4a261',
          dark: '#e76f51',
        },
        info: {
          light: '#90e0ef',
          DEFAULT: '#00b4d8',
          dark: '#0077b6',
        },
        success: {
          light: '#95d5b2',
          DEFAULT: '#52b788',
          dark: '#2d6a4f',
        },
        warning: {
          light: '#fee440',
          DEFAULT: '#f9c74f',
          dark: '#f8961e',
        },
        danger: {
          light: '#f4a261',
          DEFAULT: '#e76f51',
          dark: '#d62828',
        },
        text: {
          primary: '#2b2d42',
          secondary: '#4a4e69',
          muted: '#8d99ae',
          body: '#3d405b',
        },
        bg: {
          primary: '#fcfcf9',
          secondary: '#f3f3ee',
          tertiary: '#E8E8E3',
        },
        sidebar: {
          light: '#4fd1d9',
          DEFAULT: '#22808d',
          dark: '#1a616b',
        },
      },
      animation: {
        wave: 'wave 1.5s ease-in-out infinite',
        'opacity-change': 'opacityChange 2s infinite',
        'expand': 'expand 2s infinite',
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
        },
        opacityChange: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        expand: {
          '0%, 100%': { width: '0' },
          '50%': { width: '100%' },
        },
      }
    }
  },
  plugins: [],
}
