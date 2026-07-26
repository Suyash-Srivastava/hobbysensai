import { useHobbyPlansStore } from "./hobbyPlansStore";
import type { HobbyPlan } from "../shared/hobbyPlan.schema";

function makePlan(id: string): HobbyPlan {
  return {
    id,
    hobby: "chess",
    currentLevel: "beginner",
    goal: "have fun with friends",
    weeklyTimeBudgetHours: 3,
    hobbyCategory: "strategy-game",
    createdAt: "2026-01-01T00:00:00.000Z",
    streak: { count: 0, lastActiveDate: null },
    techniques: [
      { id: `${id}-t1`, title: "A", rationale: "Some rationale text here.", resourceType: "article", searchQuery: "q", estimatedHours: 1, order: 1, status: "not-started" },
      { id: `${id}-t2`, title: "B", rationale: "Some rationale text here.", resourceType: "article", searchQuery: "q", estimatedHours: 1, order: 2, status: "not-started" },
    ],
  };
}

beforeEach(() => {
  useHobbyPlansStore.setState({ plans: [], hydrated: false });
});

test("setTechniqueStatus updates only the targeted technique on the targeted plan", async () => {
  const planA = makePlan("a");
  const planB = makePlan("b");
  useHobbyPlansStore.setState({ plans: [planA, planB] });

  await useHobbyPlansStore.getState().setTechniqueStatus("a", "a-t1", "mastered");

  const [updatedA, updatedB] = useHobbyPlansStore.getState().plans;
  expect(updatedA.techniques.find((t) => t.id === "a-t1")?.status).toBe("mastered");
  expect(updatedA.techniques.find((t) => t.id === "a-t2")?.status).toBe("not-started");
  expect(updatedB.techniques).toEqual(planB.techniques);
});

test("addPlan appends without disturbing existing plans, removePlan removes only the targeted one", async () => {
  const planA = makePlan("a");
  await useHobbyPlansStore.getState().addPlan(planA);
  const planB = makePlan("b");
  await useHobbyPlansStore.getState().addPlan(planB);

  expect(useHobbyPlansStore.getState().plans.map((p) => p.id)).toEqual(["a", "b"]);

  await useHobbyPlansStore.getState().removePlan("a");
  expect(useHobbyPlansStore.getState().plans.map((p) => p.id)).toEqual(["b"]);
});

test("marking a technique mastered advances that hobby's own streak, skipping one does not, and other hobbies are untouched", async () => {
  const planA = makePlan("a");
  const planB = makePlan("b");
  useHobbyPlansStore.setState({ plans: [planA, planB] });

  await useHobbyPlansStore.getState().setTechniqueStatus("a", "a-t1", "mastered");
  const afterMaster = useHobbyPlansStore.getState().plans;
  expect(afterMaster.find((p) => p.id === "a")?.streak.count).toBe(1);
  // A different hobby's streak must not move just because this one did.
  expect(afterMaster.find((p) => p.id === "b")?.streak.count).toBe(0);

  await useHobbyPlansStore.getState().setTechniqueStatus("a", "a-t2", "skipped");
  expect(useHobbyPlansStore.getState().plans.find((p) => p.id === "a")?.streak.count).toBe(1);
});
