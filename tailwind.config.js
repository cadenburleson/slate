/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#191919",
          muted: "#6B6B6B",
          faint: "#A8A8A8",
        },
        paper: {
          DEFAULT: "#FFFFFF",
          soft: "#FAFAFA",
        },
        rule: "#E6E6E6",
        leaf: "#1A8917",
      },
      fontFamily: {
        sans: ["System"],
        serif: ["Charter", "Georgia", "Cambria", "Times New Roman", "serif"],
      },
    },
  },
  plugins: [],
};
