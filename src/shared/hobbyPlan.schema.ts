import { z } from "zod";

/**
 * Single source of truth for the HobbyPlan domain shape.
 * Used by the frontend (persisted store) AND the backend (request +
 * LLM-output validation) so the two sides can never silently drift apart.
 */

export const hobbyLevelSchema = z.enum(["beginner", "intermediate", "advanced"]);
export type HobbyLevel = z.infer<typeof hobbyLevelSchema>;

export const techniqueStatusSchema = z.enum([
  "not-started",
  "learning",
  "mastered",
  "skipped",
]);
export type TechniqueStatus = z.infer<typeof techniqueStatusSchema>;

export const resourceTypeSchema = z.enum([
  "video",
  "article",
  "interactive",
  "drill",
  "diagram",
]);
export type ResourceType = z.infer<typeof resourceTypeSchema>;

/**
 * Broad category the AI classifies the hobby into. This backs a
 * deterministic allow-list (below) so the model can't hand back a
 * one-size-fits-all resource type (e.g. an MCQ-quiz "interactive" for a
 * physical skill, or "video"-only for a strategy game) even on a bad
 * generation.
 */
export const hobbyCategorySchema = z.enum([
  "physical-skill", // sports, dance, martial arts
  "musical", // instruments, singing
  "strategy-game", // chess, poker, go
  "creative-craft", // drawing, writing, woodworking
  "knowledge-based", // languages, cooking theory, wine tasting
]);
export type HobbyCategory = z.infer<typeof hobbyCategorySchema>;

export const RESOURCE_TYPES_BY_CATEGORY: Record<HobbyCategory, ResourceType[]> = {
  "physical-skill": ["video", "drill"],
  musical: ["video", "drill", "article"],
  "strategy-game": ["article", "diagram", "interactive", "drill"],
  "creative-craft": ["video", "article", "drill"],
  "knowledge-based": ["article", "video", "interactive"],
};

export const learningPlanRequestSchema = z.object({
  hobby: z.string().trim().min(2).max(60),
  currentLevel: hobbyLevelSchema,
  goal: z.string().trim().min(2).max(200),
  weeklyTimeBudgetHours: z.number().min(1).max(40),
});
export type LearningPlanRequest = z.infer<typeof learningPlanRequestSchema>;

/** Shape of one technique exactly as the LLM should return it. */
export const techniqueCoreSchema = z.object({
  title: z.string().trim().min(2).max(80),
  rationale: z.string().trim().min(10).max(300),
  resourceType: resourceTypeSchema,
  searchQuery: z.string().trim().min(3).max(120),
  estimatedHours: z.number().min(0.5).max(40),
  order: z.number().int().min(1).max(8),
});
export type TechniqueCore = z.infer<typeof techniqueCoreSchema>;

/** Full shape the LLM must return for one generation call. */
export const learningPlanResponseSchema = z.object({
  hobbyCategory: hobbyCategorySchema,
  techniques: z.array(techniqueCoreSchema).min(5).max(8),
});
export type LearningPlanResponse = z.infer<typeof learningPlanResponseSchema>;

/** One technique as persisted on-device, with local-only fields added. */
export const techniqueSchema = techniqueCoreSchema.extend({
  id: z.string(),
  status: techniqueStatusSchema,
});
export type Technique = z.infer<typeof techniqueSchema>;

/** A full hobby track as persisted on-device. */
export const hobbyPlanSchema = learningPlanRequestSchema.extend({
  id: z.string(),
  createdAt: z.string(),
  hobbyCategory: hobbyCategorySchema,
  techniques: z.array(techniqueSchema),
});
export type HobbyPlan = z.infer<typeof hobbyPlanSchema>;

export const streakSchema = z.object({
  count: z.number().int().min(0),
  lastActiveDate: z.string().nullable(), // YYYY-MM-DD, local calendar day
});
export type Streak = z.infer<typeof streakSchema>;

/** Top-level shape of the persisted AsyncStorage blob. */
export const hobbyPlansStateSchema = z.object({
  version: z.literal(1),
  plans: z.array(hobbyPlanSchema),
  streak: streakSchema,
});
export type HobbyPlansState = z.infer<typeof hobbyPlansStateSchema>;

const DAY_MS = 24 * 60 * 60 * 1000;

function toCalendarDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Advances the app-wide streak given a "the learner engaged today" event.
 * Same day: unchanged. Exactly one calendar day after the last activity:
 * +1. Any bigger gap (or first-ever activity): resets to 1.
 */
export function advanceStreak(streak: Streak, now: Date = new Date()): Streak {
  const today = toCalendarDay(now);
  if (streak.lastActiveDate === today) return streak;

  if (streak.lastActiveDate) {
    const gapDays = Math.round((now.getTime() - new Date(streak.lastActiveDate).getTime()) / DAY_MS);
    if (gapDays === 1) {
      return { count: streak.count + 1, lastActiveDate: today };
    }
  }
  return { count: 1, lastActiveDate: today };
}

export function hobbyProgress(plan: HobbyPlan): { mastered: number; total: number; percent: number } {
  const counted = plan.techniques.filter((t) => t.status !== "skipped");
  const mastered = counted.filter((t) => t.status === "mastered").length;
  const total = counted.length;
  return { mastered, total, percent: total === 0 ? 0 : Math.round((mastered / total) * 100) };
}
