import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Project B: Terracotta + Beige Palette
      colors: {
        pb: {
          "jet-black": "#3B2820",
          "rich-black": "#6B4A3A",
          charcoal: "#6B4A3A",
          gray: "#8B7355",
          silver: "#B5A48C",
          "light-gray": "#D9C9AE",
          "off-white": "#F2ECE2",
          snow: "#FAF7F2",
        },
        accent: {
          sale: "#C75050",
          success: "#4A7C59",
          terracotta: "#B5704F",
        },
      },
      // Typography
      fontFamily: {
        heading: ['"Archivo"', "sans-serif"],
        body: ['"Pretendard"', "sans-serif"],
      },
      letterSpacing: {
        industrial: "0.15em",
        wide: "0.25em",
      },
      // Soft corners
      borderRadius: {
        DEFAULT: "4px",
        sm: "2px",
        md: "6px",
      },
      // Spacing system
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "30": "7.5rem",
      },
      // Aspect ratio for product images (1:1)
      aspectRatio: {
        product: "1 / 1",
      },
      // Max width for content
      maxWidth: {
        content: "1280px",
        narrow: "960px",
      },
      // Container
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          sm: "1.5rem",
          lg: "2rem",
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/container-queries"),
  ],
};

export default config;
