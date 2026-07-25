export interface GenerateJsonInput {
  systemInstruction: string;
  userPrompt: string;
  /** JSON Schema (e.g. from zod's toJSONSchema) constraining the model's output. */
  jsonSchema: object;
}

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
