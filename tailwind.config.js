/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Inter", "Roboto", "sans-serif"],
      },
      colors: {
        surface: {
          light: "#FFFFFF",
          dark: "#17171C",
        },
        canvas: {
          light: "#FAFAFA",
          dark: "#0E0E11",
        },
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        fadeUp: "fadeUp .35s cubic-bezier(.21,.9,.35,1) both",
        scaleIn: "scaleIn .22s cubic-bezier(.21,.9,.35,1) both",
      },
    },
  },
  plugins: [],
};
