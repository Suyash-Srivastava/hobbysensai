export interface GenerateJsonInput {
  systemInstruction: string;
  userPrompt: string;
  /** JSON Schema (e.g. from zod's toJSONSchema) constraining the model's output. */
  jsonSchema: object;
}

/**
 * Thrown by a provider implementation when the underlying AI service itself
 * rate-limited the request (e.g. Gemini's free-tier RPM cap) - provider-
 * agnostic on purpose, so the service layer and route handler don't need to
 * know which SDK-specific error type (e.g. @google/genai's ApiError) a given
 * provider happens to throw. Deliberately not retried with a repair prompt
 * (see learningPlan.service.ts) - a rate limit isn't a malformed-JSON
 * problem a repair prompt could ever fix.
 */
export class AIProviderRateLimitedError extends Error {}

/**
 * Adapter seam between the learning-plan service and whichever LLM actually
 * produces the plan. The service only ever talks to this interface, so
 * swapping/adding a provider (e.g. a fallback if Gemini's free-tier RPM is
 * exhausted) is a one-file change.
 */
export interface AIProvider {
  readonly name: string;
  generateJson(input: GenerateJsonInput): Promise<string>;
}
