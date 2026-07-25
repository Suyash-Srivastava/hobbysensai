import { generateLearningPlan, LearningPlanGenerationError } from "./learningPlan.service";
import { clearCacheForTests } from "../cache/planCache";
import type { AIProvider } from "../providers/ai/AIProvider";
import type { LearningPlanRequest, LearningPlanResponse } from "../../../src/shared/hobbyPlan.schema";

function fakeProvider(responses: string[]): AIProvider {
  let call = 0;
  return {
    name: "fake-provider",
    generateJson: jest.fn(async () => {
      const response = responses[call] ?? responses[responses.length - 1];
      call += 1;
      return response;
    }),
  };
}

function baseRequest(overrides: Partial<LearningPlanRequest> = {}): LearningPlanRequest {
  return {
    hobby: "chess",
    currentLevel: "beginner",
    goal: "beat my friends casually",
    weeklyTimeBudgetHours: 3,
    ...overrides,
  };
}

function validPlanJson(overrides: Partial<LearningPlanResponse> = {}): string {
  const plan: LearningPlanResponse = {
    hobbyCategory: "strategy-game",
    techniques: [
      { title: "Opening principles", rationale: "Control the center early to avoid a cramped position.", resourceType: "article", searchQuery: "chess opening principles beginner", estimatedHours: 2, order: 1 },
      { title: "Fork tactics", rationale: "A single move that attacks two pieces wins material constantly.", resourceType: "diagram", searchQuery: "chess fork tactic examples", estimatedHours: 2, order: 2 },
      { title: "Pin tactics", rationale: "Pins immobilize a defender and set up follow-up attacks.", resourceType: "diagram", searchQuery: "chess pin tactic examples", estimatedHours: 2, order: 3 },
      { title: "Basic endgames", rationale: "King and pawn endgames come up in nearly every casual game.", resourceType: "interactive", searchQuery: "king pawn endgame practice", estimatedHours: 3, order: 4 },
      { title: "Board vision drills", rationale: "Spotting threats quickly prevents blunders under time pressure.", resourceType: "drill", searchQuery: "chess board vision exercises", estimatedHours: 2, order: 5 },
    ],
    ...overrides,
  };
  return JSON.stringify(plan);
}

beforeEach(() => {
  clearCacheForTests();
});

test("valid first attempt returns a schema-valid plan without a repair call", async () => {
  const provider = fakeProvider([validPlanJson()]);

  const { plan, cached } = await generateLearningPlan(provider, baseRequest());

  expect(cached).toBe(false);
  expect(plan.techniques).toHaveLength(5);
  expect(provider.generateJson).toHaveBeenCalledTimes(1);
});

test("malformed first attempt triggers one repair call that succeeds", async () => {
  const provider = fakeProvider(["not json at all", validPlanJson()]);

  const { plan } = await generateLearningPlan(provider, baseRequest({ hobby: "guitar" }));

  expect(plan.techniques).toHaveLength(5);
  expect(provider.generateJson).toHaveBeenCalledTimes(2);
});

test("malformed first attempt and malformed repair both fail with a typed error", async () => {
  const provider = fakeProvider(["not json", "still not json"]);

  await expect(generateLearningPlan(provider, baseRequest({ hobby: "poker" }))).rejects.toBeInstanceOf(
    LearningPlanGenerationError,
  );
  expect(provider.generateJson).toHaveBeenCalledTimes(2);
});

test("a resourceType mismatched to the hobby category is coerced to an allowed type", async () => {
  // "video" is not in the strategy-game allow-list (article/diagram/interactive/drill) -
  // this is exactly the "audio/video chess lesson" pitfall the guardrail exists to prevent.
  const mismatched: LearningPlanResponse = JSON.parse(validPlanJson());
  mismatched.techniques[0].resourceType = "video";
  const provider = fakeProvider([JSON.stringify(mismatched)]);

  const { plan } = await generateLearningPlan(provider, baseRequest({ hobby: "chess", goal: "test guardrail" }));

  expect(plan.techniques[0].resourceType).not.toBe("video");
  expect(["article", "diagram", "interactive", "drill"]).toContain(plan.techniques[0].resourceType);
});
