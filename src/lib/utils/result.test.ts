import {
  ok,
  err,
  isOk,
  isErr,
  unwrap,
  unwrapOr,
  map,
  type Result,
} from "./result";

describe("Result utilities", () => {
  describe("ok", () => {
    it("creates a success result", () => {
      const result = ok(42);
      expect(result).toEqual({ ok: true, value: 42 });
    });
  });

  describe("err", () => {
    it("creates an error result", () => {
      const result = err("something went wrong");
      expect(result).toEqual({ ok: false, error: "something went wrong" });
    });
  });

  describe("isOk / isErr", () => {
    it("identifies success results", () => {
      expect(isOk(ok(1))).toBe(true);
      expect(isOk(err("fail"))).toBe(false);
    });

    it("identifies error results", () => {
      expect(isErr(err("fail"))).toBe(true);
      expect(isErr(ok(1))).toBe(false);
    });
  });

  describe("unwrap", () => {
    it("returns the value on success", () => {
      expect(unwrap(ok("hello"))).toBe("hello");
    });

    it("throws the error on failure", () => {
      const error = new Error("boom");
      expect(() => unwrap(err(error))).toThrow("boom");
    });
  });

  describe("unwrapOr", () => {
    it("returns the value on success", () => {
      expect(unwrapOr(ok(10), 0)).toBe(10);
    });

    it("returns the fallback on failure", () => {
      expect(unwrapOr(err("fail"), 0)).toBe(0);
    });

    it("handles falsy success values correctly", () => {
      expect(unwrapOr(ok(0), 99)).toBe(0);
      expect(unwrapOr(ok(""), "fallback")).toBe("");
      expect(unwrapOr(ok(false), true)).toBe(false);
    });
  });

  describe("map", () => {
    it("transforms the value on success", () => {
      const result = map(ok(5), (n) => n * 2);
      expect(result).toEqual({ ok: true, value: 10 });
    });

    it("passes through errors unchanged", () => {
      const original = err("fail") as Result<number, string>;
      const result = map(original, (n) => n * 2);
      expect(result).toEqual({ ok: false, error: "fail" });
      expect(result).toBe(original);
    });
  });
});
