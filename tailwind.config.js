/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAF9F5',
        surface: '#F5F7FB',
        'surface-white': '#FFFFFF',
        navy: {
          deep: '#101A35',
          DEFAULT: '#1D2B50',
          darker: '#0B1430',
          hover: '#24396B',
        },
        primary: {
          DEFAULT: '#356AE6',
          hover: '#2753C4',
          light: '#E6ECFA',
        },
        cyan: {
          accent: '#39C6E8',
          bg: '#E7F9FD',
          dark: '#136A82',
        },
        orange: {
          accent: '#FF9F43',
          dark: '#8A4A0B',
          bg: '#FFF1E3',
        },
        yellow: {
          xp: '#FFD166',
        },
        green: {
          success: '#28A879',
          dark: '#1E7D5A',
          bg: '#E6F6EF',
        },
        border: {
          DEFAULT: '#E1E6F0',
          dark: '#D5DCE8',
        },
        text: {
          main: '#101A35',
          muted: '#4A5675',
          light: '#7A8499',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      borderRadius: {
        'button': '12px',
        'card': '20px',
        'hero': '24px',
      },
      boxShadow: {
        'card': '0 1px 2px rgba(16,26,53,.06), 0 8px 24px rgba(16,26,53,.08)',
        'chip': '0 1px 2px rgba(16,26,53,.06)',
      }
    },
  },
  plugins: [],
}
