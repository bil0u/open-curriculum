import { debounce } from "./debounce";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("debounce", () => {
  describe("basic delay behavior", () => {
    it("does not call the function immediately", () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 300);
      debounced("arg");
      expect(fn).not.toHaveBeenCalled();
    });

    it("calls the function after the delay has elapsed", () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 300);
      debounced("arg");
      vi.advanceTimersByTime(300);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith("arg");
    });

    it("does not call the function if the delay has not fully elapsed", () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 300);
      debounced("arg");
      vi.advanceTimersByTime(299);
      expect(fn).not.toHaveBeenCalled();
    });

    it("passes the correct arguments to the underlying function", () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);
      debounced("a", "b", "c");
      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledWith("a", "b", "c");
    });
  });

  describe("coalescing multiple calls", () => {
    it("resets the timer when called again before the delay expires", () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 300);
      debounced("first");
      vi.advanceTimersByTime(200);
      debounced("second");
      vi.advanceTimersByTime(200);
      expect(fn).not.toHaveBeenCalled();
      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("uses the arguments from the most recent call", () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 300);
      debounced("first");
      debounced("second");
      debounced("third");
      vi.advanceTimersByTime(300);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith("third");
    });
  });

  describe("flush", () => {
    it("immediately invokes the function with the last arguments when there is a pending call", () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 300);
      debounced("flushed");
      debounced.flush();
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith("flushed");
    });

    it("does nothing when there is no pending call", () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 300);
      debounced.flush();
      expect(fn).not.toHaveBeenCalled();
    });

    it("prevents the original timer from firing after flush", () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 300);
      debounced("value");
      debounced.flush();
      vi.advanceTimersByTime(300);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("does nothing on a second flush call after the first already fired", () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 300);
      debounced("value");
      debounced.flush();
      debounced.flush();
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe("cancel", () => {
    it("prevents the function from being called after the delay", () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 300);
      debounced("arg");
      debounced.cancel();
      vi.advanceTimersByTime(300);
      expect(fn).not.toHaveBeenCalled();
    });

    it("does nothing when there is no pending call", () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 300);
      expect(() => debounced.cancel()).not.toThrow();
      expect(fn).not.toHaveBeenCalled();
    });

    it("allows new calls to be debounced normally after a cancel", () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 300);
      debounced("first");
      debounced.cancel();
      debounced("second");
      vi.advanceTimersByTime(300);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith("second");
    });
  });
});
