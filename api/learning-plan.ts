import type { VercelRequest, VercelResponse } from "@vercel/node";
import { learningPlanRequestSchema } from "../src/shared/hobbyPlan.schema";
import { generateLearningPlan, InputNotRecognizedError, LearningPlanGenerationError } from "./_lib/services/learningPlan.service";
import { AIProviderRateLimitedError } from "./_lib/providers/ai/AIProvider";
import { getAIProvider } from "./_lib/providers/ai/factory";
import { isRateLimited } from "./_lib/middleware/rateLimit";
import { applyCors } from "./_lib/middleware/cors";
import { config } from "./_lib/config";
import { logger } from "./_lib/logger";

function clientKeyFor(req: VercelRequest): string {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
    return forwardedFor.split(",")[0].trim();
  }
  return req.socket.remoteAddress ?? "unknown";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const clientKey = clientKeyFor(req);
  if (isRateLimited(clientKey, config.RATE_LIMIT_MAX_REQUESTS, config.RATE_LIMIT_WINDOW_MS)) {
    res.status(429).json({ error: "Too many requests, please slow down." });
    return;
  }

  const parsedRequest = learningPlanRequestSchema.safeParse(req.body);
  if (!parsedRequest.success) {
    res.status(400).json({ error: "Invalid request", details: parsedRequest.error.flatten() });
    return;
  }

  try {
    const { plan, cached } = await generateLearningPlan(getAIProvider(), parsedRequest.data);
    res.status(200).json({ plan, cached });
  } catch (error) {
    if (error instanceof InputNotRecognizedError) {
      res.status(422).json({ error: error.message, code: "input_not_recognized", field: error.field });
      return;
    }
    if (error instanceof AIProviderRateLimitedError) {
      // A different failure mode from our own isRateLimited() check above -
      // that one is us throttling the client; this is the upstream AI
      // provider (Gemini's free-tier RPM cap) throttling us. 503, not 429,
      // to keep the two distinguishable in logs/metrics - the client-facing
      // message and retry behavior end up the same either way.
      logger.warn({ error: error.message }, "AI provider rate-limited this request");
      res.status(503).json({
        error: "The AI service is busy right now. Please wait a few seconds and try again.",
        code: "ai_provider_busy",
      });
      return;
    }
    if (error instanceof LearningPlanGenerationError) {
      logger.error({ error: error.message }, "learning plan generation failed after repair retry");
      res.status(502).json({ error: "The AI provider could not produce a valid learning plan. Please try again." });
      return;
    }
    logger.error({ error }, "unexpected error generating learning plan");
    res.status(500).json({ error: "Unexpected server error." });
  }
}
