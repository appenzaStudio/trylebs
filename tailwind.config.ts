import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors (iKnow-inspired)
        navy: {
          DEFAULT: '#001F4D',
          50: '#E6EBF3',
          100: '#CCD6E7',
          200: '#99ADCF',
          300: '#6685B7',
          400: '#335C9F',
          500: '#001F4D',
          600: '#00193D',
          700: '#00132E',
          800: '#000C1E',
          900: '#00060F',
        },
        gold: {
          DEFAULT: '#D4A574',
          50: '#FAF7F3',
          100: '#F5EFE7',
          200: '#EBDECF',
          300: '#E1CEB7',
          400: '#D7BD9F',
          500: '#D4A574',
          600: '#C88F4D',
          700: '#A67338',
          800: '#7D562A',
          900: '#54391C',
        },
        teal: {
          DEFAULT: '#20A39E',
          50: '#E7F7F6',
          100: '#CFEFED',
          200: '#9FDEDB',
          300: '#6FCEC9',
          400: '#3FBDB7',
          500: '#20A39E',
          600: '#1A837F',
          700: '#13625F',
          800: '#0D4240',
          900: '#062120',
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        // Arabic-optimized typography
        arabic: ['Cairo', 'Droid Arabic Kufi', 'sans-serif'],
        sans: ['Inter', 'Open Sans', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        base: '16px',
      },
      lineHeight: {
        base: '1.6',
      },
    },
  },
  plugins: [],
};
export default config;
