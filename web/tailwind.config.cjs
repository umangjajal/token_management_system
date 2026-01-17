/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef2ff",
          100: "#e0e7ff",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca"
        },
        accent: {
          400: "#fb923c",
          500: "#f97316"
        },
        bg: {
          dark: "#020617",
          card: "#0b1220"
        }
      },
      boxShadow: {
        glow: "0 0 25px rgba(79,70,229,0.4)"
      }
    }
  },
  plugins: []
};
