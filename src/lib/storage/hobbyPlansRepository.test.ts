import AsyncStorage from "@react-native-async-storage/async-storage";
import { hobbyPlansRepository, parseStoredState } from "./hobbyPlansRepository";
import type { HobbyPlan } from "../../shared/hobbyPlan.schema";

const samplePlan: HobbyPlan = {
  id: "plan-1",
  hobby: "chess",
  currentLevel: "beginner",
  goal: "have fun with friends",
  weeklyTimeBudgetHours: 3,
  hobbyCategory: "strategy-game",
  createdAt: "2026-01-01T00:00:00.000Z",
  streak: { count: 3, lastActiveDate: "2026-01-01" },
  techniques: [
    {
      id: "t1",
      title: "Opening principles",
      rationale: "Control the center early to avoid a cramped position.",
      resourceType: "article",
      searchQuery: "chess opening principles",
      estimatedHours: 1,
      order: 1,
      status: "not-started",
    },
  ],
};

beforeEach(async () => {
  await AsyncStorage.clear();
});

test("save then load round-trips valid plans, including each plan's own streak", async () => {
  await hobbyPlansRepository.save({ plans: [samplePlan] });
  const loaded = await hobbyPlansRepository.load();
  expect(loaded.plans).toEqual([samplePlan]);
});

test("a corrupted stored blob falls back to empty state instead of throwing", () => {
  const state = parseStoredState("not json{{{");
  expect(state.plans).toEqual([]);
});

test("an old/unexpected stored shape falls back to empty state instead of throwing", () => {
  const state = parseStoredState(JSON.stringify({ someOldField: true }));
  expect(state.plans).toEqual([]);
});

test("a pre-v2 blob (top-level streak, no per-plan streak) falls back to empty state", () => {
  // Exactly the v1 shape this schema replaced - proves the fallback covers
  // a real prior version, not just arbitrary garbage.
  const v1Shape = { version: 1, plans: [{ ...samplePlan, streak: undefined }], streak: { count: 3, lastActiveDate: "2026-01-01" } };
  const state = parseStoredState(JSON.stringify(v1Shape));
  expect(state.plans).toEqual([]);
});

test("clear() removes everything so a subsequent load returns empty state", async () => {
  await hobbyPlansRepository.save({ plans: [samplePlan] });
  await hobbyPlansRepository.clear();
  const state = await hobbyPlansRepository.load();
  expect(state.plans).toEqual([]);
});
