import { render, fireEvent } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { router } from "expo-router";
import { HomeScreen } from "./home-screen";
import { useHobbyPlansStore } from "@/store/hobbyPlansStore";
import type { HobbyPlan } from "@/shared/hobbyPlan.schema";

jest.mock("expo-router", () => ({
  router: { push: jest.fn() },
}));

// HomeScreen reads safe-area insets, which need a provider with a known
// frame - there's no real window to measure in the test environment.
const SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

async function renderHome() {
  return render(
    <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
      <HomeScreen />
    </SafeAreaProvider>,
  );
}

function makePlan(id: string, hobby: string): HobbyPlan {
  return {
    id,
    hobby,
    currentLevel: "beginner",
    goal: "have fun with friends",
    weeklyTimeBudgetHours: 3,
    hobbyCategory: "strategy-game",
    createdAt: "2026-01-01T00:00:00.000Z",
    streak: { count: 0, lastActiveDate: null },
    techniques: [
      {
        id: `${id}-t1`,
        title: "Opening principles",
        rationale: "Some rationale text here.",
        resourceType: "article",
        searchQuery: "chess openings",
        estimatedHours: 1,
        order: 1,
        status: "mastered",
      },
      {
        id: `${id}-t2`,
        title: "Basic tactics",
        rationale: "Some rationale text here.",
        resourceType: "article",
        searchQuery: "chess tactics",
        estimatedHours: 1,
        order: 2,
        status: "not-started",
      },
    ],
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  useHobbyPlansStore.setState({
    plans: [],
    lastActiveHobbyId: null,
    hydrated: true,
  });
});

test("shows the empty state when there are no hobbies yet", async () => {
  const view = await renderHome();

  expect(view.getByText(/first step is the hardest/i)).toBeTruthy();
  expect(view.queryByTestId("hobby-card-a")).toBeNull();
});

test("renders a card per stored hobby with its progress", async () => {
  useHobbyPlansStore.setState({ plans: [makePlan("a", "chess"), makePlan("b", "guitar")] });

  const view = await renderHome();

  expect(view.getByTestId("hobby-card-a")).toBeTruthy();
  expect(view.getByTestId("hobby-card-b")).toBeTruthy();
  // One of the two seeded techniques is mastered on each plan.
  expect(view.getAllByText("1/2 mastered")).toHaveLength(2);
});

test("tapping a hobby card navigates to that hobby's plan", async () => {
  useHobbyPlansStore.setState({ plans: [makePlan("a", "chess"), makePlan("b", "guitar")] });

  const view = await renderHome();
  fireEvent.press(view.getByTestId("hobby-card-b"));

  expect(router.push).toHaveBeenCalledWith("/plan/b");
});
