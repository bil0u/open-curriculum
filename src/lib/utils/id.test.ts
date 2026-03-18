import { generateId, generateISODateTime } from "./id";

describe("generateId", () => {
  it("returns a string", () => {
    expect(typeof generateId()).toBe("string");
  });

  it("returns a valid UUID v4 format", () => {
    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(generateId()).toMatch(uuidPattern);
  });

  it("returns a unique value on each call", () => {
    const a = generateId();
    const b = generateId();
    expect(a).not.toBe(b);
  });

  it("returns unique values across many calls", () => {
    const ids = Array.from({ length: 50 }, generateId);
    const unique = new Set(ids);
    expect(unique.size).toBe(50);
  });
});

describe("generateISODateTime", () => {
  it("returns a string", () => {
    expect(typeof generateISODateTime()).toBe("string");
  });

  it("returns a valid ISO 8601 date-time string", () => {
    const result = generateISODateTime();
    expect(() => new Date(result)).not.toThrow();
    expect(new Date(result).toISOString()).toBe(result);
  });

  it("ends with the UTC timezone designator Z", () => {
    expect(generateISODateTime()).toMatch(/Z$/);
  });

  it("reflects approximately the current time", () => {
    const before = Date.now();
    const result = generateISODateTime();
    const after = Date.now();
    const ts = new Date(result).getTime();
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
  });

  it("returns a different value when called at different times", () => {
    const first = generateISODateTime();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.now() + 5000));
    const second = generateISODateTime();
    vi.useRealTimers();
    expect(first).not.toBe(second);
  });
});
