import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6c5ce7",
          dark: "#5a4bd1",
          light: "#a29bfe",
        },
        secondary: {
          DEFAULT: "#00b894",
          dark: "#00a381",
          light: "#55efc4",
        },
        accent: {
          DEFAULT: "#f39c12",
          dark: "#e67e22",
          light: "#ffeaa7",
        },
        danger: {
          DEFAULT: "#e74c3c",
          dark: "#c0392b",
        },
        page: {
          light: "#f3f2ef",
          dark: "#1a1a2e",
        },
        card: {
          light: "#ffffff",
          dark: "#16213e",
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
