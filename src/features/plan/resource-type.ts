import type { ResourceType } from "@/shared/hobbyPlan.schema";

export const RESOURCE_TYPE_ICON: Record<ResourceType, string> = {
  video: "📺",
  article: "📄",
  interactive: "🧩",
  drill: "🏋️",
  diagram: "📊",
};

export const RESOURCE_TYPE_LABEL: Record<ResourceType, string> = {
  video: "Video",
  article: "Article",
  interactive: "Interactive",
  drill: "Drill",
  diagram: "Diagram",
};

// Fixed display order (not the order types happen to appear in a plan) so
// the filter tabs render consistently across every hobby.
export const RESOURCE_TYPE_ORDER: ResourceType[] = ["video", "article", "diagram", "drill", "interactive"];

// Names the actual search destination (see search-url.ts) so the button
// itself signals it's not just another generic "find a lesson" link.
export const RESOURCE_TYPE_ACTION_LABEL: Record<ResourceType, string> = {
  video: "Find a video",
  article: "Find an article",
  interactive: "Find an interactive tool",
  drill: "Find a drill on video",
  diagram: "Find a diagram",
};
