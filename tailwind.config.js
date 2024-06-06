/** @type {import('tailwindcss').Config} */
export default {
  from: "./frontend/index.css",
  to: "./public/styles.css",
  mode: "jit",
  content: ["./frontend/**/*.html", "./frontend/**/*.tsx"],
  darkMode: "class",
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
