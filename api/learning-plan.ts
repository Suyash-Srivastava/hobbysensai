import type { VercelRequest, VercelResponse } from "@vercel/node";
import { learningPlanRequestSchema } from "../src/shared/hobbyPlan.schema";
import { generateLearningPlan, HobbyNotRecognizedError, LearningPlanGenerationError } from "./_lib/services/learningPlan.service";
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
    if (error instanceof HobbyNotRecognizedError) {
      res.status(422).json({ error: error.message, code: "hobby_not_recognized" });
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
