import { describe, expect, it } from "vitest";
import { csvCustomers, deleteCustomer, metrics, seedData } from "./data";
describe("connected demo records", () => {
  it("calculates revenue from paid invoices in the selected period", () => {
    const data = seedData();
    const expected = data.invoices
      .filter((i) => i.paid && i.date >= "2026-09-30" && i.date <= "2026-10-29")
      .reduce((s, i) => s + i.amount, 0);
    expect(metrics(data, 30).revenue).toBe(expected);
    expect(metrics(data, 30).buckets.reduce((s, b) => s + b.revenue, 0)).toBe(
      expected,
    );
  });
  it("limits all client metrics to that client", () => {
    const data = seedData();
    const m = metrics(data, 30, "c1");
    expect(m.customers).toBe(1);
    expect(m.projects).toBe(1);
    expect(m.tickets).toBe(1);
    expect(m.revenue).toBeLessThan(metrics(data, 30).revenue);
  });
  it("removes related data and updates analytics when deleting a customer", () => {
    const data = seedData();
    const next = deleteCustomer(data, "c1");
    expect(next.customers.find((c) => c.id === "c1")).toBeUndefined();
    expect(next.projects.some((p) => p.clientId === "c1")).toBe(false);
    expect(next.tickets.some((p) => p.clientId === "c1")).toBe(false);
    expect(next.invoices.some((p) => p.clientId === "c1")).toBe(false);
    expect(metrics(next, 30).revenue).toBeLessThan(metrics(data, 30).revenue);
    expect(data.customers).toHaveLength(6);
  });
  it("escapes CSV fields and neutralises spreadsheet formula prefixes", () => {
    const customer = {
      ...seedData().customers[0],
      name: "=SUM(1,2)",
      company: 'A "quoted", company',
    };
    const csv = csvCustomers([customer]);
    expect(csv).toContain('"\'=SUM(1,2)"');
    expect(csv).toContain('"A ""quoted"", company"');
  });
  it("resets using independent seed instances", () => {
    const first = seedData();
    first.customers.pop();
    expect(seedData().customers).toHaveLength(6);
  });
});
