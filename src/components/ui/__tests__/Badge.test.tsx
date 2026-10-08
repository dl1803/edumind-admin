import { render, screen } from "@testing-library/react";
import { Badge, BadgeTone } from "../Badge";

describe("Badge Zero-Pill Rule", () => {
  it("không chứa các class của pill (rounded, bg, border, padding)", () => {
    render(<Badge tone="success">Thành công</Badge>);
    const badge = screen.getByText("Thành công");
    const classList = badge.className;

    expect(classList).not.toMatch(/rounded/);
    expect(classList).not.toMatch(/bg-/);
    expect(classList).not.toMatch(/border/);
    expect(classList).not.toMatch(/px-/);
    expect(classList).not.toMatch(/py-/);
    expect(classList).toContain("text-emerald-700");
  });

  const toneCases: Array<{ tone: BadgeTone; expectedClass: string }> = [
    { tone: "warning", expectedClass: "text-amber-700" },
    { tone: "error", expectedClass: "text-rose-700" },
    { tone: "info", expectedClass: "text-blue-700" },
    { tone: "neutral", expectedClass: "text-neutral-700" },
  ];

  it.each(toneCases)(
    "hiển thị đúng class màu cho tone $tone",
    ({ tone, expectedClass }) => {
      render(<Badge tone={tone}>{tone}</Badge>);
      const badge = screen.getByText(tone);
      expect(badge.className).toContain(expectedClass);
      expect(badge.className).not.toMatch(/rounded|bg-|border|px-|py-/);
    }
  );

  it("sử dụng tone neutral khi không truyền tone", () => {
    render(<Badge>Mặc định</Badge>);
    const badge = screen.getByText("Mặc định");
    expect(badge.className).toContain("text-neutral-700");
  });
});
