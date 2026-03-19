import { formatRelativeTime } from "./format-relative-time";

function isoSecondsAgo(seconds: number, now: Date): string {
  return new Date(now.getTime() - seconds * 1000).toISOString();
}

describe("formatRelativeTime", () => {
  const now = new Date("2024-06-01T12:00:00Z");

  it("returns 'just now' when less than 60 seconds ago", () => {
    expect(formatRelativeTime(isoSecondsAgo(30, now), now)).toBe("just now");
  });

  it("returns 'just now' when exactly 0 seconds ago", () => {
    expect(formatRelativeTime(now.toISOString(), now)).toBe("just now");
  });

  it("returns '1 minute ago' for 60 seconds ago", () => {
    expect(formatRelativeTime(isoSecondsAgo(60, now), now)).toBe("1 minute ago");
  });

  it("returns '45 minutes ago' for 45 minutes ago", () => {
    expect(formatRelativeTime(isoSecondsAgo(45 * 60, now), now)).toBe("45 minutes ago");
  });

  it("returns '1 hour ago' for exactly 60 minutes ago", () => {
    expect(formatRelativeTime(isoSecondsAgo(60 * 60, now), now)).toBe("1 hour ago");
  });

  it("returns '3 hours ago' for 3 hours ago", () => {
    expect(formatRelativeTime(isoSecondsAgo(3 * 60 * 60, now), now)).toBe("3 hours ago");
  });

  it("returns '1 day ago' for exactly 24 hours ago", () => {
    expect(formatRelativeTime(isoSecondsAgo(24 * 60 * 60, now), now)).toBe("1 day ago");
  });

  it("returns '5 days ago' for 5 days ago", () => {
    expect(formatRelativeTime(isoSecondsAgo(5 * 24 * 60 * 60, now), now)).toBe("5 days ago");
  });
});
