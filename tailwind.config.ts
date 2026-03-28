import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        alma: {
          50: "#e4f3f6",
          100: "#c2e5eb",
          200: "#99dfe3",
          300: "#66cfd5",
          400: "#33bfc7",
          500: "#008c95",
          600: "#00727a",
          700: "#00585f",
          800: "#003e44",
          900: "#002428",
        },
        sand: {
          50: "#fbfaf7",
          100: "#f5f2ea",
          200: "#e8e1d2",
          300: "#d9ccb4",
          400: "#c8b291",
          500: "#b1936a",
          600: "#957656",
          700: "#775b44",
          800: "#554131",
          900: "#33271e",
        },
      },
      borderRadius: {
        xl: "1.25rem",
        "2xl": "1.75rem",
        "3xl": "2.25rem",
      },
      boxShadow: {
        soft: "0 12px 40px rgba(0,0,0,0.10)",
      },
    },
  },
  plugins: [],
} satisfies Config;

