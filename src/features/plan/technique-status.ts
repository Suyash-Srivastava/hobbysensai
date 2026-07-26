import type { TechniqueStatus } from "@/shared/hobbyPlan.schema";

// Universal status-color convention (independent of the hobby's own
// category color) - green/yellow/slate reads as completed/in-progress/
// skipped at a glance, the same way across every hobby's color theme.
export const STATUS_COLOR: Record<Exclude<TechniqueStatus, "not-started">, string> = {
  learning: "#eab308",
  mastered: "#22c55e",
  skipped: "#64748b",
};
