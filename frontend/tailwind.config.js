/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1f2933",
        smoke: "#f5f7fa",
        coal: "#2f3437",
        ember: "#c2410c",
        mint: "#047857"
      },
      boxShadow: {
        panel: "0 10px 30px rgba(31, 41, 51, 0.08)"
      }
    }
  },
  plugins: []
};
