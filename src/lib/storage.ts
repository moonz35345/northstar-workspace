import { type DemoData, seedData } from "./data";
export const STORAGE_KEY = "northstar-demo-v1";
export function loadData(): DemoData {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return seedData();
  const data = JSON.parse(raw);
  const records = (value: unknown, strings: string[], numbers: string[] = []) =>
    Array.isArray(value) &&
    value.every(
      (row) =>
        row &&
        strings.every((key) => typeof row[key] === "string") &&
        numbers.every(
          (key) => typeof row[key] === "number" && Number.isFinite(row[key]),
        ),
    );
  if (
    !data ||
    !records(data.customers, [
      "id",
      "name",
      "company",
      "email",
      "country",
      "status",
      "joined",
      "color",
    ]) ||
    !records(
      data.projects,
      ["id", "name", "clientId", "category", "due", "color", "status"],
      ["progress", "budget"],
    ) ||
    !records(data.tickets, [
      "id",
      "title",
      "clientId",
      "priority",
      "status",
      "date",
      "description",
    ]) ||
    !records(data.invoices, ["id", "clientId", "date"], ["amount"]) ||
    !data.invoices.every(
      (i: { paid: unknown }) => typeof i.paid === "boolean",
    ) ||
    !Array.isArray(data.readNotifications) ||
    !data.readNotifications.every((id: unknown) => typeof id === "string") ||
    !data.account ||
    !["name", "email", "company"].every(
      (key) => typeof data.account[key] === "string",
    ) ||
    typeof data.account.digest !== "boolean"
  )
    throw new Error(
      "Saved demo data could not be read. Reset the sample data to continue.",
    );
  return data as DemoData;
}
export function saveData(data: DemoData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
