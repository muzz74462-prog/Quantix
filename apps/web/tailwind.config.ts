import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0e121c",
          900: "#141a28",
          850: "#182033",
          800: "#1c2335",
          700: "#252d42",
          600: "#313a54",
          500: "#4a5573",
        },
        brand: { DEFAULT: "#12b45f", hover: "#0ea052", soft: "#12b45f1a" },
        accent: { DEFAULT: "#3b8bff", soft: "#3b8bff1a" },
        up: "#2fbf71",
        down: "#ef5b53",
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      keyframes: {
        "hero-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "tag-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.75" },
        },
        "terminal-float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
      animation: {
        "hero-in": "hero-in 0.7s ease-out both",
        "tag-pulse": "tag-pulse 2.4s ease-in-out infinite",
        "terminal-float": "terminal-float 9s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
