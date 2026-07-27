import { ApiError, GoogleGenAI } from "@google/genai";
import { AIProviderRateLimitedError, type AIProvider, type GenerateJsonInput } from "./AIProvider";

export function createGeminiProvider(apiKey: string, model: string): AIProvider {
  const client = new GoogleGenAI({ apiKey });

  return {
    name: `gemini:${model}`,
    async generateJson({ systemInstruction, userPrompt, jsonSchema }: GenerateJsonInput): Promise<string> {
      let response;
      try {
        response = await client.models.generateContent({
          model,
          contents: userPrompt,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseJsonSchema: jsonSchema,
            temperature: 0.6,
          },
        });
      } catch (error) {
        // Gemini's free tier is RPM-limited (see README) - surface this as
        // the provider-agnostic error type rather than letting @google/genai's
        // own ApiError leak past this adapter, so the service layer and route
        // handler can react to it without knowing which SDK threw it.
        if (error instanceof ApiError && error.status === 429) {
          throw new AIProviderRateLimitedError(`Gemini provider (${model}) rate-limited this request: ${error.message}`);
        }
        throw error;
      }

      const text = response.text;
      if (!text) {
        throw new Error(`Gemini provider (${model}) returned an empty response`);
      }
      return text;
    },
  };
}
