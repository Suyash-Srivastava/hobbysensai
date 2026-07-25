import { render } from "@testing-library/react-native";
import { ProgressBar } from "./progress-bar";

test("renders 0%, a partial value, and 100% with the correct accessibility value", async () => {
  const view = await render(<ProgressBar testID="bar" percent={0} />);
  expect(view.getByTestId("bar").props["aria-valuenow"]).toBe(0);

  await view.rerender(<ProgressBar testID="bar" percent={42} />);
  expect(view.getByTestId("bar").props["aria-valuenow"]).toBe(42);

  await view.rerender(<ProgressBar testID="bar" percent={100} />);
  expect(view.getByTestId("bar").props["aria-valuenow"]).toBe(100);
});

test("clamps out-of-range values into 0-100", async () => {
  const view = await render(<ProgressBar testID="bar" percent={137} />);
  expect(view.getByTestId("bar").props["aria-valuenow"]).toBe(100);

  const negative = await render(<ProgressBar testID="bar-negative" percent={-20} />);
  expect(negative.getByTestId("bar-negative").props["aria-valuenow"]).toBe(0);
});

test("shows a percentage label when showLabel is set", async () => {
  const view = await render(<ProgressBar testID="bar" percent={65} showLabel />);
  expect(view.getByText("65%")).toBeTruthy();
});
