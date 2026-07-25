import { GoogleGenAI } from "@google/genai";
import type { AIProvider, GenerateJsonInput } from "./AIProvider";

export function createGeminiProvider(apiKey: string, model: string): AIProvider {
  const client = new GoogleGenAI({ apiKey });

  return {
    name: `gemini:${model}`,
    async generateJson({ systemInstruction, userPrompt, jsonSchema }: GenerateJsonInput): Promise<string> {
      const response = await client.models.generateContent({
        model,
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseJsonSchema: jsonSchema,
          temperature: 0.6,
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error(`Gemini provider (${model}) returned an empty response`);
      }
      return text;
    },
  };
}
