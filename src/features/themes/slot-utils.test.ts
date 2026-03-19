import { hasSlotConflict } from "./slot-utils";

describe("hasSlotConflict", () => {
  it("returns false when mapping is undefined", () => {
    expect(hasSlotConflict(undefined, new Set(["main", "sidebar"]))).toBe(false);
  });

  it("returns false when all mapped slots are in the available set", () => {
    const mapping = { "sec-1": "main", "sec-2": "sidebar" };
    const available = new Set(["main", "sidebar"]);
    expect(hasSlotConflict(mapping, available)).toBe(false);
  });

  it("returns true when one slot is not in the available set", () => {
    const mapping = { "sec-1": "main", "sec-2": "removed-slot" };
    const available = new Set(["main"]);
    expect(hasSlotConflict(mapping, available)).toBe(true);
  });

  it("returns true when all slots are invalid", () => {
    const mapping = { "sec-1": "ghost-a", "sec-2": "ghost-b" };
    const available = new Set(["main", "sidebar"]);
    expect(hasSlotConflict(mapping, available)).toBe(true);
  });

  it("returns false when mapping is empty", () => {
    expect(hasSlotConflict({}, new Set(["main"]))).toBe(false);
  });

  it("returns false when available set is empty but mapping is also empty", () => {
    expect(hasSlotConflict({}, new Set())).toBe(false);
  });

  it("returns true when available set is empty but mapping has entries", () => {
    const mapping = { "sec-1": "main" };
    expect(hasSlotConflict(mapping, new Set())).toBe(true);
  });
});
