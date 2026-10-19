import { getPageItems } from "../Pagination";

describe("Pagination logic (1 2 3 ... x)", () => {
  it("trả về [1] khi chỉ có 1 trang", () => {
    expect(getPageItems(1, 1)).toEqual([1]);
  });

  it("trả về toàn bộ số trang nếu pageCount <= 4", () => {
    expect(getPageItems(1, 4)).toEqual([1, 2, 3, 4]);
    expect(getPageItems(2, 3)).toEqual([1, 2, 3]);
    expect(getPageItems(1, 2)).toEqual([1, 2]);
  });

  it("luôn trả về định dạng 1 2 3 ... x khi pageCount > 4", () => {
    expect(getPageItems(1, 5)).toEqual([1, 2, 3, "...", 5]);
    expect(getPageItems(3, 5)).toEqual([1, 2, 3, "...", 5]);
    expect(getPageItems(4, 5)).toEqual([1, 2, 3, "...", 5]);
    expect(getPageItems(5, 5)).toEqual([1, 2, 3, "...", 5]);
    expect(getPageItems(1, 20)).toEqual([1, 2, 3, "...", 20]);
    expect(getPageItems(10, 20)).toEqual([1, 2, 3, "...", 20]);
    expect(getPageItems(20, 20)).toEqual([1, 2, 3, "...", 20]);
  });
});
