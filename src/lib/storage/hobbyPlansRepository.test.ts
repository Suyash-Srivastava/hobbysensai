import AsyncStorage from "@react-native-async-storage/async-storage";
import { hobbyPlansRepository, parseStoredState } from "./hobbyPlansRepository";
import type { HobbyPlan, Streak } from "../../shared/hobbyPlan.schema";

const samplePlan: HobbyPlan = {
  id: "plan-1",
  hobby: "chess",
  currentLevel: "beginner",
  goal: "have fun with friends",
  weeklyTimeBudgetHours: 3,
  hobbyCategory: "strategy-game",
  createdAt: "2026-01-01T00:00:00.000Z",
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

const sampleStreak: Streak = { count: 3, lastActiveDate: "2026-01-01" };

beforeEach(async () => {
  await AsyncStorage.clear();
});

test("save then load round-trips valid plans and streak state", async () => {
  await hobbyPlansRepository.save({ plans: [samplePlan], streak: sampleStreak });
  const loaded = await hobbyPlansRepository.load();
  expect(loaded.plans).toEqual([samplePlan]);
  expect(loaded.streak).toEqual(sampleStreak);
});

test("a corrupted stored blob falls back to empty state instead of throwing", () => {
  const state = parseStoredState("not json{{{");
  expect(state.plans).toEqual([]);
  expect(state.streak).toEqual({ count: 0, lastActiveDate: null });
});

test("an old/unexpected stored shape falls back to empty state instead of throwing", () => {
  const state = parseStoredState(JSON.stringify({ someOldField: true }));
  expect(state.plans).toEqual([]);
});

test("clear() removes everything so a subsequent load returns empty state", async () => {
  await hobbyPlansRepository.save({ plans: [samplePlan], streak: sampleStreak });
  await hobbyPlansRepository.clear();
  const state = await hobbyPlansRepository.load();
  expect(state.plans).toEqual([]);
  expect(state.streak).toEqual({ count: 0, lastActiveDate: null });
});
