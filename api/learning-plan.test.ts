import { createMocks } from "node-mocks-http";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { clearRateLimitForTests } from "./_lib/middleware/rateLimit";
import { clearCacheForTests } from "./_lib/cache/planCache";
import type { LearningPlanResponse } from "../src/shared/hobbyPlan.schema";

jest.mock("./_lib/providers/ai/factory", () => ({
  getAIProvider: jest.fn(),
}));

import { getAIProvider } from "./_lib/providers/ai/factory";
import handler from "./learning-plan";

const validPlan: LearningPlanResponse & { recognized: true } = {
  recognized: true,
  hobbyCategory: "musical",
  techniques: [
    { title: "Basic chords", rationale: "Open chords let you play hundreds of songs immediately.", resourceType: "video", searchQuery: "guitar open chords beginner", estimatedHours: 3, order: 1 },
    { title: "Strumming patterns", rationale: "Rhythm carries a song as much as the chords themselves.", resourceType: "video", searchQuery: "guitar strumming patterns beginner", estimatedHours: 2, order: 2 },
    { title: "Chord transitions", rationale: "Smooth changes between chords are what make playing feel fluid.", resourceType: "drill", searchQuery: "guitar chord transition drills", estimatedHours: 3, order: 3 },
    { title: "Basic music theory", rationale: "Knowing scale degrees explains why chord progressions work.", resourceType: "article", searchQuery: "beginner guitar music theory", estimatedHours: 2, order: 4 },
    { title: "Fingerpicking basics", rationale: "Fingerpicking unlocks a whole second style of playing songs.", resourceType: "video", searchQuery: "guitar fingerpicking basics", estimatedHours: 3, order: 5 },
  ],
};

function mockRequestResponse(body: Record<string, unknown>, ip = "10.0.0.1") {
  return createMocks<VercelRequest, VercelResponse>({
    method: "POST",
    headers: { "x-forwarded-for": ip },
    body,
  });
}

beforeEach(() => {
  clearRateLimitForTests();
  clearCacheForTests();
  jest.mocked(getAIProvider).mockClear();
  jest.mocked(getAIProvider).mockReturnValue({
    name: "mock-provider",
    generateJson: jest.fn(async () => JSON.stringify(validPlan)),
  });
});

test("a valid request returns 200 with a schema-valid plan", async () => {
  const { req, res } = mockRequestResponse({
    hobby: "guitar",
    currentLevel: "beginner",
    goal: "play campfire songs",
    weeklyTimeBudgetHours: 4,
  });

  await handler(req, res);

  expect(res._getStatusCode()).toBe(200);
  const data = res._getJSONData() as { plan: LearningPlanResponse };
  expect(data.plan.techniques).toHaveLength(5);
});

test("a nonsense hobby name is rejected with a 422 and a hobby_not_recognized code", async () => {
  jest.mocked(getAIProvider).mockReturnValue({
    name: "mock-provider",
    generateJson: jest.fn(async () =>
      JSON.stringify({ recognized: false, reason: "'das43' doesn't look like a real hobby - try chess, pottery, or guitar." }),
    ),
  });
  const { req, res } = mockRequestResponse({
    hobby: "das43",
    currentLevel: "beginner",
    goal: "learn it",
    weeklyTimeBudgetHours: 4,
  });

  await handler(req, res);

  expect(res._getStatusCode()).toBe(422);
  const data = res._getJSONData() as { error: string; code: string };
  expect(data.code).toBe("hobby_not_recognized");
  expect(data.error).toMatch(/das43/);
});

test("an invalid request body returns 400 and never calls the AI provider", async () => {
  const { req, res } = mockRequestResponse({ hobby: "a" }); // missing required fields, hobby too short

  await handler(req, res);

  expect(res._getStatusCode()).toBe(400);
  expect(getAIProvider).not.toHaveBeenCalled();
});

test("an OPTIONS preflight request gets a 204 with CORS headers, not a 405", async () => {
  const { req, res } = createMocks<VercelRequest, VercelResponse>({
    method: "OPTIONS",
    headers: { "x-forwarded-for": "10.0.0.3" },
  });

  await handler(req, res);

  expect(res._getStatusCode()).toBe(204);
  expect(res.getHeader("Access-Control-Allow-Origin")).toBe("*");
  expect(getAIProvider).not.toHaveBeenCalled();
});

test("requests beyond the configured rate limit receive 429", async () => {
  const validBody = {
    hobby: "guitar",
    currentLevel: "beginner",
    goal: "play campfire songs",
    weeklyTimeBudgetHours: 4,
  };

  // jest.setup.api.js sets RATE_LIMIT_MAX_REQUESTS=3 for this suite.
  for (let i = 0; i < 3; i += 1) {
    const { req, res } = mockRequestResponse({ ...validBody, goal: `attempt ${i}` }, "10.0.0.2");
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
  }

  const { req, res } = mockRequestResponse({ ...validBody, goal: "attempt 4" }, "10.0.0.2");
  await handler(req, res);
  expect(res._getStatusCode()).toBe(429);
});
