import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,js,jsx,mdx}",
    "./components/**/*.{ts,tsx,js,jsx,mdx}",
    "./lib/**/*.{ts,tsx,js,jsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4F46E5",
          foreground: "#FFFFFF",
          soft: "#818CF8",
        },
        secondary: {
          DEFAULT: "#06B6D4",
          foreground: "#0F172A",
        },
        accent: {
          DEFAULT: "#0EA5E9",
          muted: "#F0F9FF",
        },
        success: "#16A34A",
        warning: "#D97706",
        danger: "#DC2626",
        muted: {
          DEFAULT: "#F9FAFB",
          foreground: "#1E293B",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#0F172A",
        },
      },
      borderRadius: {
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
      },
      boxShadow: {
        subtle: "0 1px 2px rgba(15, 23, 42, 0.08)",
        elevated: "0 10px 25px rgba(15, 23, 42, 0.12)",
        hero: "0 30px 60px rgba(79, 70, 229, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
