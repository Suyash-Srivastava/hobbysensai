import { z } from "zod";
import {
  learningPlanModelOutputSchema,
  RESOURCE_TYPES_BY_CATEGORY,
  type LearningPlanRequest,
  type LearningPlanResponse,
} from "../../../src/shared/hobbyPlan.schema";
import type { AIProvider } from "../providers/ai/AIProvider";
import { buildSystemInstruction, buildUserPrompt, buildRepairPrompt } from "./promptBuilder";
import { cacheKeyFor, getCached, setCached } from "../cache/planCache";
import { logger } from "../logger";

export class LearningPlanGenerationError extends Error {}

/** The model looked at the hobby or the goal and decided it isn't sensible input. */
export class InputNotRecognizedError extends Error {
  field: "hobby" | "goal";

  constructor(message: string, field: "hobby" | "goal") {
    super(message);
    this.name = "InputNotRecognizedError";
    this.field = field;
  }
}

// Gemini's structured-output subset doesn't include every JSON Schema
// keyword (e.g. no $schema) - strip what it doesn't recognize rather than
// risk the request being rejected outright.
const { $schema: _omit, ...responseJsonSchema } = z.toJSONSchema(learningPlanModelOutputSchema) as Record<
  string,
  unknown
>;

type ParseResult =
  | { success: true; data: z.infer<typeof learningPlanModelOutputSchema> }
  | { success: false; error: string };

function parseModelOutput(raw: string): ParseResult {
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(raw);
  } catch {
    return { success: false, error: "Response was not valid JSON" };
  }
  const result = learningPlanModelOutputSchema.safeParse(parsedJson);
  if (!result.success) {
    return { success: false, error: result.error.message };
  }
  return { success: true, data: result.data };
}

/**
 * Deterministic backstop behind the LLM's own resourceType choice: even if
 * a generation ignores the prompt's formatting guidance, no technique can
 * end up with a resourceType that's wrong for its hobby category (e.g. an
 * "interactive" quiz for a physical skill).
 */
function enforceResourceTypeGuardrail(plan: LearningPlanResponse): LearningPlanResponse {
  const allowed = RESOURCE_TYPES_BY_CATEGORY[plan.hobbyCategory];
  return {
    ...plan,
    techniques: plan.techniques.map((technique) => {
      if (allowed.includes(technique.resourceType)) return technique;
      logger.warn(
        { hobbyCategory: plan.hobbyCategory, technique: technique.title, rejected: technique.resourceType },
        "resourceType not allowed for hobbyCategory, coercing to nearest allowed type",
      );
      return { ...technique, resourceType: allowed[0] };
    }),
  };
}

export async function generateLearningPlan(
  provider: AIProvider,
  request: LearningPlanRequest,
): Promise<{ plan: LearningPlanResponse; cached: boolean }> {
  const key = cacheKeyFor(request);
  const cachedPlan = getCached(key);
  if (cachedPlan) {
    logger.info({ provider: provider.name, hobby: request.hobby }, "learning plan cache hit");
    return { plan: cachedPlan, cached: true };
  }

  const systemInstruction = buildSystemInstruction();
  const userPrompt = buildUserPrompt(request);

  const firstAttempt = await provider.generateJson({ systemInstruction, userPrompt, jsonSchema: responseJsonSchema });
  let parsed = parseModelOutput(firstAttempt);

  if (!parsed.success) {
    logger.warn(
      { provider: provider.name, error: parsed.error },
      "learning plan generation failed validation, retrying with a repair prompt",
    );
    const repairPrompt = buildRepairPrompt(userPrompt, firstAttempt, parsed.error);
    const secondAttempt = await provider.generateJson({
      systemInstruction,
      userPrompt: repairPrompt,
      jsonSchema: responseJsonSchema,
    });
    parsed = parseModelOutput(secondAttempt);
  }

  if (!parsed.success) {
    throw new LearningPlanGenerationError(
      `AI provider ${provider.name} failed to produce a valid learning plan: ${parsed.error}`,
    );
  }

  if (!parsed.data.recognized) {
    logger.info(
      { provider: provider.name, hobby: request.hobby, field: parsed.data.field, reason: parsed.data.reason },
      "input not recognized",
    );
    throw new InputNotRecognizedError(parsed.data.reason, parsed.data.field);
  }

  const { hobbyCategory, techniques } = parsed.data;
  const guarded = enforceResourceTypeGuardrail({ hobbyCategory, techniques });
  setCached(key, guarded);
  logger.info({ provider: provider.name, hobby: request.hobby, techniques: guarded.techniques.length }, "learning plan generated");
  return { plan: guarded, cached: false };
}
