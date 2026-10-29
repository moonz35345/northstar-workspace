import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { Modal } from "./ui";
it("focuses the dialog, traps focus, and closes with Escape", () => {
  const close = vi.fn();
  render(
    <Modal title="Edit record" onClose={close}>
      <input aria-label="Name" />
      <button>Save</button>
    </Modal>,
  );
  expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
  expect(screen.getByRole("button", { name: "Close dialog" })).toHaveFocus();
  fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
  expect(screen.getByRole("button", { name: "Save" })).toHaveFocus();
  fireEvent.keyDown(document, { key: "Escape" });
  expect(close).toHaveBeenCalledOnce();
});
