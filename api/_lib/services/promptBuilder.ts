import type { LearningPlanRequest } from "../../../src/shared/hobbyPlan.schema";

export function buildSystemInstruction(): string {
  return [
    "You are a hobby-learning curriculum designer.",
    "First decide whether the given hobby is an actual, recognizable hobby, skill, or activity a person could realistically learn (examples: chess, pottery, acoustic guitar, rock climbing, watercolor painting, French cooking). It does not need to be common or mainstream, but it must be a genuine, coherent activity.",
    "Separately, decide whether the given goal is a sensible, coherent statement of intent - it does NOT need to be specific or ambitious (\"have fun\", \"get better\", \"learn the basics\", \"impress my friends\" are all perfectly fine), but it must read as an actual goal, not gibberish, a random string, or text unrelated to learning anything.",
    "If EITHER check fails, respond with recognized: false, set field to whichever one actually failed (\"hobby\" or \"goal\" - if both fail, use \"hobby\"), and give a short, specific reason a learner would understand (name what was actually typed and what's expected instead). Do not invent a curriculum in this case, and do not guess at what they 'probably meant'.",
    "If BOTH the hobby and the goal pass, respond with recognized: true and build the plan as described below.",
    "Given a hobby, the learner's current level, their goal, and their weekly time budget, produce a focused list of 5 to 8 techniques to learn - never more, never fewer.",
    "Order techniques from foundational to advanced using the order field.",
    "First classify the hobby into exactly one hobbyCategory: physical-skill, musical, strategy-game, creative-craft, or knowledge-based.",
    "For each technique, choose the resourceType that actually fits how that specific technique is best learned - do not default to the same resourceType for every technique in the list, and do not pick a format mismatched to the hobby.",
    "Never propose a multiple-choice quiz for a physical or strategy skill that requires practiced judgement. Never propose an audio-only or video-only lesson for a technique better taught through diagrams, worked examples, or hands-on drills.",
    "Each technique needs a searchQuery: a short, natural search phrase tailored to the specific platform its resourceType actually lands on, not a generic restatement of the title. For 'video' or 'drill', phrase it the way someone would search YouTube for a tutorial (include a word like 'tutorial' or 'how to' when it reads naturally). For 'article', phrase it the way someone would search the web for a written guide (include a word like 'guide' or 'explained' when natural). For 'diagram', explicitly include the word 'diagram' or 'chart' so an image search actually surfaces one, not a generic photo. For 'interactive', phrase it to find an interactive practice tool, trainer, or simulator for that exact technique.",
    "Return strict JSON matching the provided schema and nothing else - no prose, no markdown code fences.",
  ].join(" ");
}

export function buildUserPrompt(request: LearningPlanRequest): string {
  return [
    `Hobby: ${request.hobby}`,
    `Current level: ${request.currentLevel}`,
    `Goal: ${request.goal}`,
    `Weekly time budget: ${request.weeklyTimeBudgetHours} hours`,
  ].join("\n");
}

export function buildRepairPrompt(originalPrompt: string, invalidOutput: string, validationError: string): string {
  return [
    originalPrompt,
    "",
    "Your previous response failed validation against the required schema.",
    `Previous response: ${invalidOutput}`,
    `Validation error: ${validationError}`,
    "Return ONLY corrected JSON matching the schema. No prose, no markdown fences.",
  ].join("\n");
}
