import type { HobbyCategory } from "@/shared/hobbyPlan.schema";

export const HOBBY_CATEGORY_EMOJI: Record<HobbyCategory, string> = {
  "physical-skill": "🏃",
  musical: "🎵",
  "strategy-game": "♟️",
  "creative-craft": "🎨",
  "knowledge-based": "📚",
};

export const HOBBY_CATEGORY_LABEL: Record<HobbyCategory, string> = {
  "physical-skill": "Physical Skill",
  musical: "Musical",
  "strategy-game": "Strategy Game",
  "creative-craft": "Creative Craft",
  "knowledge-based": "Knowledge Based",
};

// Category identity color, one distinct hue each - grounded in the design
// mockups where they showed one (physical-skill=green, strategy-game=blue,
// creative-craft=violet), filled in for the remaining two: musical takes a
// warm rose (distinct from every other slot), knowledge-based reuses the
// app's own Tertiary/eyebrow amber since "warm study" fits that brand hue
// rather than inventing an unrelated sixth color.
const HOBBY_CATEGORY_COLOR_LIGHT: Record<HobbyCategory, string> = {
  "physical-skill": "#0F7A38",
  "strategy-game": "#2563EB",
  "creative-craft": "#9333EA",
  musical: "#DB2777",
  "knowledge-based": "#B4550E",
};

const HOBBY_CATEGORY_COLOR_DARK: Record<HobbyCategory, string> = {
  "physical-skill": "#4ADE80",
  "strategy-game": "#7FA8E8",
  "creative-craft": "#C4A3F5",
  musical: "#F472B6",
  "knowledge-based": "#E0A458",
};

export function hobbyCategoryColor(category: HobbyCategory, scheme: "light" | "dark"): string {
  return scheme === "dark" ? HOBBY_CATEGORY_COLOR_DARK[category] : HOBBY_CATEGORY_COLOR_LIGHT[category];
}
