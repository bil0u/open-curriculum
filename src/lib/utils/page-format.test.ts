import { getPageDimensions } from "./page-format";

describe("getPageDimensions", () => {
  it("returns correct dimensions for A4", () => {
    expect(getPageDimensions("A4")).toEqual({ widthMm: 210, heightMm: 297 });
  });

  it("returns correct dimensions for Letter", () => {
    expect(getPageDimensions("Letter")).toEqual({ widthMm: 215.9, heightMm: 279.4 });
  });

  it("returns the values from a custom page format object", () => {
    const custom = { type: "custom" as const, widthMm: 100, heightMm: 200 };
    expect(getPageDimensions(custom)).toEqual({ widthMm: 100, heightMm: 200 });
  });

  it("falls back to A4 dimensions for unknown string format", () => {
    // Cast to bypass TS, simulating an unrecognized string at runtime
    const result = getPageDimensions("Unknown" as "A4");
    expect(result).toEqual({ widthMm: 210, heightMm: 297 });
  });
});
