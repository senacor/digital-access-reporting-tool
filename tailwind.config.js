/** @type {import('tailwindcss').Config} */
export default {
  from: "./src/index.css",
  to: "./public/styles.css",
  mode: "jit",
  content: ["./src/**/*.html", "./src/**/*.tsx"],
  darkMode: "class",
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
