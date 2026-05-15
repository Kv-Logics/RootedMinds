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
        sans: ["Outfit", "sans-serif"],
        serif: ["Newsreader", "serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        sarvam: {
          bg: "#131313",
          deep: "#0A0A0A",
          saffron: "#FF9933",
          saffronDark: "#FEBF2B",
        },
        brand: {
          50:  "#fff6ea",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
        dark: {
          900: "#0A0A0A",
          800: "#131313",
          700: "#1C1C1C",
          600: "#2A2A2A",
          500: "#3D3D3D",
          400: "#525252",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.8s ease-out forwards",
        "slide-up": "slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 3s ease-in-out infinite alternate",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(255, 153, 51, 0.1)" },
          "100%": { boxShadow: "0 0 30px rgba(255, 153, 51, 0.3)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        'sarvam-btn': 'inset 0 0 12px rgba(255, 255, 255, 1), 0 2px 10px rgba(0, 0, 0, 0.5)',
        'sarvam-btn-hover': 'inset 0 0 16px rgba(255, 255, 255, 1), 0 4px 15px rgba(255, 153, 51, 0.3)',
      }
    },
  },
  plugins: [],
};
