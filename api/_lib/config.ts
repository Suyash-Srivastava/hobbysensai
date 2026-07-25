import { z } from "zod";

const envSchema = z.object({
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  GEMINI_MODEL: z.string().default("gemini-3.6-flash"),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(20),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  LOG_LEVEL: z.string().default("info"),
});

// Parsed once at module load so a missing/invalid env fails fast at cold
// start instead of surfacing as a confusing error deep inside a request.
export const config = envSchema.parse(process.env);
