import { beforeEach, expect, it } from "vitest";
import { loadData, saveData, STORAGE_KEY } from "./storage";
import { seedData } from "./data";
beforeEach(() => localStorage.clear());
it("provides seed data without saved state", () =>
  expect(loadData().customers).toHaveLength(6));
it("persists demo edits across reloads", () => {
  const data = seedData();
  data.customers[0].name = "Edited Demo";
  saveData(data);
  expect(loadData().customers[0].name).toBe("Edited Demo");
});
it("rejects broken or obsolete saved data", () => {
  localStorage.setItem(STORAGE_KEY, "{}");
  expect(() => loadData()).toThrow("Saved demo data");
  localStorage.setItem(STORAGE_KEY, "not json");
  expect(() => loadData()).toThrow();
});
