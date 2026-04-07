export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  colors: {
    "--pb-jet-black": string;
    "--pb-rich-black": string;
    "--pb-charcoal": string;
    "--pb-gray": string;
    "--pb-silver": string;
    "--pb-light-gray": string;
    "--pb-off-white": string;
    "--pb-snow": string;
    "--pb-accent-terracotta": string;
  };
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "terracotta",
    name: "Terracotta",
    description: "베이지 배경 + 브라운 텍스트 + 테라코타 강조",
    colors: {
      "--pb-jet-black": "#3B2820",
      "--pb-rich-black": "#6B4A3A",
      "--pb-charcoal": "#6B4A3A",
      "--pb-gray": "#8B7355",
      "--pb-silver": "#B5A48C",
      "--pb-light-gray": "#D9C9AE",
      "--pb-off-white": "#F2ECE2",
      "--pb-snow": "#FAF7F2",
      "--pb-accent-terracotta": "#B5704F",
    },
  },
  {
    id: "monochrome",
    name: "Monochrome",
    description: "화이트 배경 + 블랙 텍스트 + 그레이 강조",
    colors: {
      "--pb-jet-black": "#0A0A0A",
      "--pb-rich-black": "#1A1A1A",
      "--pb-charcoal": "#333333",
      "--pb-gray": "#666666",
      "--pb-silver": "#999999",
      "--pb-light-gray": "#D4D4D4",
      "--pb-off-white": "#F0F0F0",
      "--pb-snow": "#FAFAFA",
      "--pb-accent-terracotta": "#666666",
    },
  },
  {
    id: "forest-light",
    name: "Forest Light",
    description: "베이지 배경 + 초록 텍스트 + 앰버 강조",
    colors: {
      "--pb-jet-black": "#2D4A2D",
      "--pb-rich-black": "#3D5C3D",
      "--pb-charcoal": "#4A6B4A",
      "--pb-gray": "#6B8B6B",
      "--pb-silver": "#9BAF8B",
      "--pb-light-gray": "#C8D5B9",
      "--pb-off-white": "#F2ECE2",
      "--pb-snow": "#FAF7F2",
      "--pb-accent-terracotta": "#C8873E",
    },
  },
  {
    id: "forest-deep",
    name: "Forest Deep",
    description: "초록 배경 + 베이지 텍스트 + 골드 강조",
    colors: {
      "--pb-jet-black": "#F2ECE2",
      "--pb-rich-black": "#D9C9AE",
      "--pb-charcoal": "#D9C9AE",
      "--pb-gray": "#B5A48C",
      "--pb-silver": "#8B9B7B",
      "--pb-light-gray": "#3D5C3D",
      "--pb-off-white": "#2D4A2D",
      "--pb-snow": "#1E3A1E",
      "--pb-accent-terracotta": "#C9A84C",
    },
  },
  {
    id: "lemon",
    name: "Lemon",
    description: "연노랑 배경 + 베이지 텍스트 + 코랄 강조",
    colors: {
      "--pb-jet-black": "#8B7355",
      "--pb-rich-black": "#6B4A3A",
      "--pb-charcoal": "#8B7355",
      "--pb-gray": "#A89070",
      "--pb-silver": "#C4B38A",
      "--pb-light-gray": "#E5D9A8",
      "--pb-off-white": "#FEF9C3",
      "--pb-snow": "#FEFCE8",
      "--pb-accent-terracotta": "#E07B5A",
    },
  },
];

export const DEFAULT_THEME_ID = "terracotta";

export function getThemePreset(themeId: string): ThemePreset {
  return THEME_PRESETS.find((t) => t.id === themeId) ?? THEME_PRESETS[0];
}

export function themeToStyleString(theme: ThemePreset): string {
  return Object.entries(theme.colors)
    .map(([key, value]) => `${key}:${value}`)
    .join(";");
}
