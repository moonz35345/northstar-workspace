import React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import Workspace from "./workspace";
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AreaChart: () => <div>Revenue chart</div>,
  Area: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  XAxis: () => null,
  YAxis: () => null,
}));
beforeEach(() => localStorage.clear());
afterEach(cleanup);
it("creates, edits, searches, deletes and resets demo customers", async () => {
  render(<Workspace />);
  fireEvent.click(screen.getByRole("button", { name: "Customers" }));
  fireEvent.click(screen.getByRole("button", { name: "Add customer" }));
  const dialog = screen.getByRole("dialog");
  fireEvent.change(within(dialog).getByLabelText("Full name"), {
    target: { value: "Emma Demo" },
  });
  fireEvent.change(within(dialog).getByLabelText("Company"), {
    target: { value: "Sample Studio" },
  });
  fireEvent.change(within(dialog).getByLabelText("Country"), {
    target: { value: "Belgium" },
  });
  fireEvent.change(within(dialog).getByLabelText("Email address"), {
    target: { value: "emma@sample.example" },
  });
  fireEvent.click(within(dialog).getByRole("button", { name: "Add customer" }));
  expect(await screen.findByText("Emma Demo")).toBeInTheDocument();
  fireEvent.click(screen.getByLabelText("Edit Emma Demo"));
  fireEvent.change(screen.getByLabelText("Full name"), {
    target: { value: "Emma Updated" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
  expect(screen.getByText("Emma Updated")).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("Search customers"), {
    target: { value: "Emma Updated" },
  });
  expect(screen.queryByText("Lucas Weber")).not.toBeInTheDocument();
  fireEvent.click(screen.getByLabelText("Delete Emma Updated"));
  fireEvent.click(
    within(screen.getByRole("dialog")).getByRole("button", {
      name: "Delete customer",
    }),
  );
  expect(screen.queryByText("Emma Updated")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Settings" }));
  fireEvent.click(screen.getByRole("button", { name: "Reset sample data" }));
  fireEvent.click(
    within(screen.getByRole("dialog")).getByRole("button", {
      name: "Reset demo",
    }),
  );
  await waitFor(() =>
    expect(
      JSON.parse(localStorage.getItem("northstar-demo-v1")!).customers,
    ).toHaveLength(6),
  );
});
it("switches to the simulated client role and creates a support ticket", async () => {
  render(<Workspace />);
  fireEvent.click(screen.getByRole("button", { name: "Switch demo identity" }));
  fireEvent.click(screen.getByRole("button", { name: /Olivia Martin Client/ }));
  fireEvent.click(screen.getByRole("button", { name: /Support tickets/ }));
  fireEvent.click(screen.getByRole("button", { name: "New ticket" }));
  fireEvent.change(screen.getByLabelText("Subject"), {
    target: { value: "Demo request" },
  });
  fireEvent.change(screen.getByLabelText("Details"), {
    target: { value: "Please review this sample." },
  });
  fireEvent.click(screen.getByRole("button", { name: "Create ticket" }));
  expect(await screen.findByText("Demo request")).toBeInTheDocument();
  expect(
    screen.queryByText("Product import assistance"),
  ).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("Status for Demo request"), {
    target: { value: "Resolved" },
  });
  expect(screen.getByLabelText("Status for Demo request")).toHaveValue(
    "Resolved",
  );
});
