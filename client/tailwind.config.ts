import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2868B2',
          dark: '#1D4F8C',
          deep: '#153A68',
        },
        secondary: {
          DEFAULT: '#55B8E8',
        },
        accent: {
          DEFAULT: '#FFB547',
          dark: '#F29F22',
        },
        surface: {
          DEFAULT: '#FFFFFF',
        },
        bg: {
          DEFAULT: '#F4F8FD',
        },
        line: {
          DEFAULT: '#E2EAF3',
        },
        muted: {
          DEFAULT: '#718198',
          soft: '#60738A',
        },
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      fontFamily: {
        sans: ['Be Vietnam Pro', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
      },
      boxShadow: {
        'sm': '0 2px 8px rgba(40, 104, 178, 0.05)',
        'md': '0 8px 24px rgba(40, 104, 178, 0.08)',
        'lg': '0 16px 40px rgba(20, 38, 61, 0.12)',
      },
    },
  },
  plugins: [],
};
export default config;
