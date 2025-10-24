// constants/theme.ts
import { Platform, Dimensions } from "react-native";

export const pastelColors = [
    "#fecaca",
    "#fde68a",
    "#bbf7d0",
    "#bae6fd",
    "#ddd6fe",
];

export const Colors = {
    // Danger (Delete)
    DANGER: "#DC2626",

    WHITE: "#FFFFFF",
    TEXT: "#1F2937",
    TEXT_MUTED: "#4B5563",
    BORDER: "#059669",
    BACKGROUND: "#F8EEDB", // Cream
    HEADER: "#6D4C41", // Solid Chocolate Brown
    CARD_BORDER: "#A47551", // Light Brown Border
    CARD_SHADOW: "rgba(0,0,0,0.18)",

    PRIMARY: "#6D4C41",
    PRIMARY_LIGHT: "#A47551",
    PRIMARY_GRADIENT: ["#8D6E63", "#6D4C41"] as [string, string],

    TEXT_DARK: "#4E342E",
    HEADER_ACCENT: "#8B5E3C", // Medium brown (active tint, optional
    PRIMARY_LIGHT_GRADIENT: ["#6ee7b7", "#34d399"],
    GLOSS_GOLD_GRADIENT: ["#C69749", "#8D6E63"] as [string, string],
    GLOSS_BUTTON_GRADIENT: ["#D4AF37", "#B88A44"] as [string, string],
    GLOSS_GLOW: "rgba(255, 215, 0, 0.45)",
    GOLD: "#D4AF37",
    GOLD_LIGHT: "#F6E7B2",
    GLOSS_GRADIENT: ["#b37a33", "#6D4C41", "#3f2b21"] as [
        string,
        string,
        string
    ],
    GOLD_GRADIENT: ["#F6E27F", "#D4AF37"] as [string, string],
};

export const Fonts = Platform.select({
    ios: {
        sans: "system-ui",
        serif: "ui-serif",
        rounded: "ui-rounded",
        mono: "ui-monospace",
    },
    default: {
        sans: "normal",
        serif: "serif",
        rounded: "normal",
        mono: "monospace",
    },
});

export const { width: screenWidth, height: screenHeight } =
    Dimensions.get("window");
