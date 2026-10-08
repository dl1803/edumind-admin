import { getPageItems } from "../Pagination";

describe("Pagination logic", () => {
  it("trả về toàn bộ số trang nếu pageCount <= 7", () => {
    expect(getPageItems(1, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("trả về định dạng đầu danh sách khi page <= 4", () => {
    expect(getPageItems(1, 20)).toEqual([1, 2, 3, 4, 5, "…", 20]);
    expect(getPageItems(4, 20)).toEqual([1, 2, 3, 4, 5, "…", 20]);
  });

  it("trả về định dạng giữa danh sách", () => {
    expect(getPageItems(10, 20)).toEqual([1, "…", 9, 10, 11, "…", 20]);
  });

  it("trả về định dạng cuối danh sách khi page >= pageCount - 3", () => {
    expect(getPageItems(17, 20)).toEqual([1, "…", 16, 17, 18, 19, 20]);
    expect(getPageItems(20, 20)).toEqual([1, "…", 16, 17, 18, 19, 20]);
  });
});
