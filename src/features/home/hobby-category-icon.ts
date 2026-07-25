import type { HobbyCategory } from "@/shared/hobbyPlan.schema";

export const HOBBY_CATEGORY_EMOJI: Record<HobbyCategory, string> = {
  "physical-skill": "🏃",
  musical: "🎵",
  "strategy-game": "♟️",
  "creative-craft": "🎨",
  "knowledge-based": "📚",
};

// Category identity color, one distinct hue each, from the same validated
// colorblind-safe categorical palette used for the progress ring (blue/
// orange/yellow/magenta/violet slots) - deliberately excludes the green/red
// slots since those are reserved as status colors (mastered/critical) and
// reusing them here would blur "this is a category" with "this is a status".
// (aqua was considered for strategy-game but reads too close to the green
// status color at a glance - yellow is a cleaner break from it.)
const HOBBY_CATEGORY_COLOR_LIGHT: Record<HobbyCategory, string> = {
  "physical-skill": "#2a78d6",
  musical: "#4a3aa7",
  "strategy-game": "#eda100",
  "creative-craft": "#e87ba4",
  "knowledge-based": "#eb6834",
};

const HOBBY_CATEGORY_COLOR_DARK: Record<HobbyCategory, string> = {
  "physical-skill": "#3987e5",
  musical: "#9085e9",
  "strategy-game": "#c98500",
  "creative-craft": "#d55181",
  "knowledge-based": "#d95926",
};

export function hobbyCategoryColor(category: HobbyCategory, scheme: "light" | "dark"): string {
  return scheme === "dark" ? HOBBY_CATEGORY_COLOR_DARK[category] : HOBBY_CATEGORY_COLOR_LIGHT[category];
}
