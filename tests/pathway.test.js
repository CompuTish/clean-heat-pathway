import { describe, expect, it } from "vitest";
import { createInitialPathway, stages, transitionPathway } from "../src/pathway.js";

function advanceSimple(state) {
  return transitionPathway(state, "primary");
}

describe("pathway state machine", () => {
  it("starts with a non-empty six-stage pathway", () => {
    const state = createInitialPathway();
    expect(stages).toHaveLength(6);
    expect(state.currentIndex).toBe(0);
    expect(stages[state.currentIndex].id).toBe("survey");
  });

  it("advances through the two ready stages", () => {
    let state = createInitialPathway();
    state = advanceSimple(state);
    state = advanceSimple(state);
    expect(state.currentIndex).toBe(2);
    expect(state.completed).toEqual(["survey", "planning"]);
  });

  it("prevents an unresolved grid override and then permits progress after resolution", () => {
    let state = createInitialPathway();
    state = advanceSimple(advanceSimple(state));
    const blocked = transitionPathway(state, "override");
    expect(blocked.currentIndex).toBe(2);
    expect(blocked.overridesPrevented).toBe(1);
    expect(blocked.feedbackKind).toBe("warning");

    const resolved = transitionPathway(blocked, "resolve");
    expect(resolved.resolved.grid).toBe(true);
    expect(resolved.blockersCaught).toBe(1);

    const progressed = transitionPathway(resolved, "continue");
    expect(progressed.currentIndex).toBe(3);
    expect(progressed.completed).toContain("grid");
  });

  it("counts each blocker only once", () => {
    let state = createInitialPathway();
    state = advanceSimple(advanceSimple(state));
    state = transitionPathway(state, "escalate");
    const repeated = transitionPathway(state, "escalate");
    expect(repeated.blockersCaught).toBe(1);
  });

  it("can complete all six stages with all three blockers caught", () => {
    let state = createInitialPathway();
    state = advanceSimple(state);
    state = advanceSimple(state);
    for (const action of ["resolve", "continue", "resolve", "continue", "primary", "resolve", "continue"]) {
      state = transitionPathway(state, action);
    }
    expect(state.currentIndex).toBe(stages.length);
    expect(state.completed).toHaveLength(stages.length);
    expect(state.blockersCaught).toBe(3);
  });
});
