/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        brand: {
          50:  "#f0f4ff",
          100: "#dde5ff",
          200: "#c3cffe",
          300: "#9aaafb",
          400: "#697ef6",
          500: "#4a5af0",
          600: "#3540e4",
          700: "#2c33ca",
          800: "#272da3",
          900: "#252c81",
        },
        dark: {
          900: "#080b14",
          800: "#0d1120",
          700: "#111827",
          600: "#1a2235",
          500: "#232d42",
          400: "#2d3a52",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(74, 90, 240, 0.3)" },
          "100%": { boxShadow: "0 0 20px rgba(74, 90, 240, 0.7)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
