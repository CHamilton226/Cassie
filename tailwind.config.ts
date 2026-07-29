import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9f4',
          100: '#d9f2e3',
          200: '#b3e5c7',
          300: '#81d1a4',
          400: '#4db87d',
          500: '#2a9d5e',
          600: '#1c7e4a',
          700: '#17653d',
          800: '#145132',
          900: '#11422a',
          950: '#092416',
        },
        accent: {
          50: '#eff8ff',
          100: '#dbeffe',
          200: '#bfe3fe',
          300: '#93d2fd',
          400: '#60b8fa',
          500: '#3b98f5',
          600: '#257aea',
          700: '#1d64d7',
          800: '#1e51ae',
          900: '#1e4689',
          950: '#172b54',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
