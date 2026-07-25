import { render } from "@testing-library/react-native";
import { ProgressRing } from "./progress-ring";

test("renders 0%, a partial value, and 100% with the correct accessibility value and label", async () => {
  const view = await render(<ProgressRing testID="ring" percent={0} />);
  expect(view.getByTestId("ring").props["aria-valuenow"]).toBe(0);
  expect(view.getByText("0%")).toBeTruthy();

  await view.rerender(<ProgressRing testID="ring" percent={42} />);
  expect(view.getByTestId("ring").props["aria-valuenow"]).toBe(42);
  expect(view.getByText("42%")).toBeTruthy();

  await view.rerender(<ProgressRing testID="ring" percent={100} />);
  expect(view.getByTestId("ring").props["aria-valuenow"]).toBe(100);
  expect(view.getByText("100%")).toBeTruthy();
});

test("clamps out-of-range values into 0-100", async () => {
  const view = await render(<ProgressRing testID="ring" percent={137} />);
  expect(view.getByTestId("ring").props["aria-valuenow"]).toBe(100);
});
