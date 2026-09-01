import { describe, expect, it } from "vitest";
import { parseGridResponse, regions } from "../src/grid.js";

const validPayload = {
  data: [{
    regionid: 13,
    shortname: "London",
    data: [{
      from: "2026-09-01T19:00Z",
      to: "2026-09-01T19:30Z",
      intensity: { forecast: 161, index: "moderate" },
      generationmix: [
        { fuel: "wind", perc: 31.4 },
        { fuel: "gas", perc: 37.9 },
        { fuel: "nuclear", perc: 19.3 },
      ],
    }],
  }],
};

describe("NESO response parsing", () => {
  it("has a non-empty region list with London as region 13", () => {
    expect(regions.length).toBeGreaterThan(0);
    expect(regions).toContainEqual({ id: 13, name: "London" });
  });

  it("normalises and orders a valid response", () => {
    const result = parseGridResponse(validPayload);
    expect(result.regionName).toBe("London");
    expect(result.forecast).toBe(161);
    expect(result.mix[0]).toEqual({ fuel: "gas", percent: 37.9 });
  });

  it.each([
    {},
    { data: [] },
    { data: [{ ...validPayload.data[0], data: [{ ...validPayload.data[0].data[0], intensity: { forecast: "161", index: "moderate" } }] }] },
    { data: [{ ...validPayload.data[0], data: [{ ...validPayload.data[0].data[0], generationmix: [] }] }] },
  ])("rejects malformed responses", (payload) => {
    expect(() => parseGridResponse(payload)).toThrow();
  });
});
