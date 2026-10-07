import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#FAF5FF",
          100: "#F3E8FF",
          500: "#A855F7",
          600: "#8B5CF6",
          700: "#7C3AED",
        },
        success: {
          600: "#16A34A",
        },
        warning: {
          600: "#CA8A04",
        },
        error: {
          600: "#DC2626",
        },
        info: {
          600: "#2563EB",
        },
        neutral: {
          100: "#F5F5F5",
          400: "#A3A3A3",
          700: "#404040",
          950: "#0A0A0A",
        },
        canvas: "#FAFAFA",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        nebula: "linear-gradient(90deg, #3B82F6 0%, #8B5CF6 50%, #EC4899 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
