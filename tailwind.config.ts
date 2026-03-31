import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Project B: Industrial Minimal Palette
      colors: {
        pb: {
          "jet-black": "#0A0A0A",
          "rich-black": "#1A1A1A",
          charcoal: "#333333",
          gray: "#666666",
          silver: "#999999",
          "light-gray": "#D4D4D4",
          "off-white": "#F0F0F0",
          snow: "#FAFAFA",
        },
        accent: {
          sale: "#C75050",
          success: "#2D8F4E",
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
      // No border-radius (industrial)
      borderRadius: {
        none: "0px",
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
