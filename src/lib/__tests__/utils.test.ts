import { cn } from "../utils";

describe("cn utility helper", () => {
  it("merges tailwind classes cleanly without duplicates", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("handles conditional class values correctly", () => {
    expect(cn("base-class", false && "ignored", "active-class")).toBe("base-class active-class");
  });
});
