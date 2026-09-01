import { describe, expect, it } from "vitest";
import { assignCrew, assignResource, assignVan, createPlan, evaluatePlan, routeMiles, scheduleSite } from "../src/planner.js";
import { getScenario } from "../src/scenarios.js";

function prepareSite(plan, siteId, equipmentId, approvalId, day, crewId, vanId) {
  let next = assignResource(plan, equipmentId, siteId);
  next = assignResource(next, approvalId, siteId);
  next = scheduleSite(next, siteId, day);
  next = assignCrew(next, crewId, day);
  return assignVan(next, vanId, day);
}

describe("delivery plan evaluation", () => {
  it("starts with every scenario requirement visible as unresolved", () => {
    const result = evaluatePlan(createPlan(), getScenario("tight-connections"));
    expect(result.objectiveMet).toBe(false);
    expect(result.completed).toEqual([]);
    expect(result.unresolved).toBe(12);
  });

  it("distinguishes an incomplete plan from a failed scheduled visit", () => {
    const plan = scheduleSite(createPlan(), "riverside", "Monday");
    const result = evaluatePlan(plan, getScenario("foundation"));
    expect(result.failed).toEqual(["riverside"]);
    expect(result.siteResults.find((item) => item.siteId === "riverside").blockers).toContain("Needs Solar pallet A");
  });

  it("meets the guided week objective with matching kit, records, people and vehicles", () => {
    let plan = createPlan();
    plan = prepareSite(plan, "riverside", "solar-a", "approval-riverside", "Monday", "northstar", "cargo");
    plan = prepareSite(plan, "north", "battery-a", "approval-north", "Tuesday", "oak", "cargo");
    plan = prepareSite(plan, "beacon", "inverter-a", "approval-beacon", "Wednesday", "circuit", "service");
    const result = evaluatePlan(plan, getScenario("foundation"));
    expect(result.objectiveMet).toBe(true);
    expect(result.completed).toHaveLength(3);
    expect(result.failed).toHaveLength(0);
    expect(result.routeMiles).toBeLessThanOrEqual(55);
  });

  it("keeps a resource unique when it is reassigned", () => {
    let plan = assignResource(createPlan(), "solar-a", "riverside");
    plan = assignResource(plan, "solar-a", "south");
    expect(plan.allocations.riverside).toEqual([]);
    expect(plan.allocations.south).toEqual(["solar-a"]);
  });

  it("uses the authored symmetric distance matrix for a depot round trip", () => {
    expect(routeMiles(["riverside", "meadow", "south"])).toBe(20);
  });

  it("can meet supplier squeeze by selecting three sites above 500 kW", () => {
    let plan = createPlan();
    plan = prepareSite(plan, "riverside", "solar-a", "approval-riverside", "Monday", "northstar", "cargo");
    plan = prepareSite(plan, "beacon", "inverter-a", "approval-beacon", "Tuesday", "circuit", "service");
    plan = prepareSite(plan, "meadow", "scaffold-a", "approval-meadow", "Wednesday", "skyline", "lift");
    const result = evaluatePlan(plan, getScenario("supplier-squeeze"));
    expect(result.capacity).toBe(590);
    expect(result.objectiveMet).toBe(true);
  });
});
