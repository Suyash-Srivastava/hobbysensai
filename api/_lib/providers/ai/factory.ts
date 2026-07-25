import { config } from "../../config";
import { createGeminiProvider } from "./geminiProvider";
import type { AIProvider } from "./AIProvider";

let cachedProvider: AIProvider | undefined;

export function getAIProvider(): AIProvider {
  if (!cachedProvider) {
    cachedProvider = createGeminiProvider(config.GEMINI_API_KEY, config.GEMINI_MODEL);
  }
  return cachedProvider;
}
