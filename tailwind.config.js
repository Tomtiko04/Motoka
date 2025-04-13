module.exports = {
  mode: "jit", // Ensure JIT mode is enabled
  content: ["./src/**/*.{js,jsx,ts,tsx}"], // Make sure this points to your files
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-2px)" },
          "75%": { transform: "translateX(2px)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.6s ease-out",
        slideDown: "slideDown 0.6s ease-out",
        shake: "shake 0.3s ease-in-out",
      },
    },
  },
  plugins: [require("tailwind-scrollbar")],
};
