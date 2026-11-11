import { cn, formatDateTime, formatDuration } from "../utils";

describe("cn utility helper", () => {
  it("merges tailwind classes cleanly without duplicates", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("handles conditional class values correctly", () => {
    expect(cn("base-class", false && "ignored", "active-class")).toBe("base-class active-class");
  });

  it("formats dates into DD/MM/YYYY string", () => {
    const { formatDate } = require("../utils");
    expect(formatDate("2026-08-01T08:00:00.000Z")).toMatch(/01\/08\/2026/);
    expect(formatDate(undefined)).toBe("—");
  });
});

describe("video formatting helpers", () => {
  it("formats duration seconds to mm:ss or fallback", () => {
    expect(formatDuration(0)).toBe("00:00");
    expect(formatDuration(750)).toBe("12:30");
    expect(formatDuration(4530)).toBe("75:30");
    expect(formatDuration(null)).toBe("—");
    expect(formatDuration(undefined)).toBe("—");
    expect(formatDuration(-5)).toBe("—");
    expect(formatDuration(Number.NaN)).toBe("—");
  });

  it("formats date time to dd/MM/yyyy HH:mm or fallback", () => {
    expect(formatDateTime("2026-11-07T16:10:00")).toBe("07/11/2026 16:10");
    expect(formatDateTime(undefined)).toBe("—");
    expect(formatDateTime("invalid-date")).toBe("invalid-date");
  });
});

