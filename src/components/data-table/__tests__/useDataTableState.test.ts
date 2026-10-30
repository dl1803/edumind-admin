import { renderHook, act } from "@testing-library/react";
import { useDataTableState } from "../useDataTableState";
import { DataTableColumn } from "../types";

interface TestItem {
  id: string;
  name: string;
  score: number;
  category: string;
}

const mockData: TestItem[] = [
  { id: "1", name: "Lập trình TypeScript", score: 85, category: "frontend" },
  { id: "2", name: "Khoa học Dữ liệu", score: 92, category: "ai" },
  { id: "3", name: "Thiết kế Giao diện", score: 78, category: "design" },
  { id: "4", name: "An toàn Thông tin", score: 88, category: "security" },
  { id: "5", name: "Học máy nâng cao", score: 95, category: "ai" },
];

const mockColumns: DataTableColumn<TestItem>[] = [
  { key: "name", header: "Tên", accessor: "name", sortable: true },
  { key: "score", header: "Điểm", accessor: "score", sortable: true },
  { key: "category", header: "Danh mục", accessor: "category" },
];

describe("useDataTableState", () => {
  it("khởi tạo state mặc định chính xác", () => {
    const { result } = renderHook(() =>
      useDataTableState({
        data: mockData,
        columns: mockColumns,
        pageSizeDefault: 2,
      })
    );

    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(2);
    expect(result.current.totalItems).toBe(5);
    expect(result.current.pageCount).toBe(3);
    expect(result.current.paginatedData).toHaveLength(2);
    expect(result.current.isFiltered).toBe(false);
  });

  it("thay đổi trang và số lượng hiển thị trên trang", () => {
    const onPageChange = jest.fn();
    const onPageSizeChange = jest.fn();

    const { result } = renderHook(() =>
      useDataTableState({
        data: mockData,
        columns: mockColumns,
        pageSizeDefault: 2,
        onPageChangeExternal: onPageChange,
        onPageSizeChangeExternal: onPageSizeChange,
      })
    );

    act(() => {
      result.current.handlePageChange(2);
    });

    expect(result.current.page).toBe(2);
    expect(onPageChange).toHaveBeenCalledWith(2);
    expect(result.current.paginatedData[0].id).toBe("3");

    act(() => {
      result.current.handlePageSizeChange(5);
    });

    expect(result.current.pageSize).toBe(5);
    expect(result.current.page).toBe(1);
    expect(onPageSizeChange).toHaveBeenCalledWith(5);
    expect(result.current.paginatedData).toHaveLength(5);
  });

  it("sắp xếp theo chuỗi trạng thái: asc -> desc -> null", () => {
    const onSortChange = jest.fn();

    const { result } = renderHook(() =>
      useDataTableState({
        data: mockData,
        columns: mockColumns,
        onSortChangeExternal: onSortChange,
      })
    );

    act(() => {
      result.current.handleSort("score");
    });
    expect(result.current.sortState).toEqual({ key: "score", direction: "asc" });
    expect(result.current.paginatedData[0].score).toBe(78);
    expect(onSortChange).toHaveBeenCalledWith({ key: "score", direction: "asc" });

    act(() => {
      result.current.handleSort("score");
    });
    expect(result.current.sortState).toEqual({ key: "score", direction: "desc" });
    expect(result.current.paginatedData[0].score).toBe(95);

    act(() => {
      result.current.handleSort("score");
    });
    expect(result.current.sortState).toBeNull();
    expect(onSortChange).toHaveBeenCalledWith(null);
  });

  it("lọc theo danh mục và reset bộ lọc", () => {
    const onFilterChange = jest.fn();

    const { result } = renderHook(() =>
      useDataTableState({
        data: mockData,
        columns: mockColumns,
        onFilterChangeExternal: onFilterChange,
      })
    );

    act(() => {
      result.current.handleFilterChange("category", "ai");
    });

    expect(result.current.filterValues).toEqual({ category: "ai" });
    expect(result.current.isFiltered).toBe(true);
    expect(result.current.totalItems).toBe(2);
    expect(result.current.paginatedData.every((item) => item.category === "ai")).toBe(true);
    expect(onFilterChange).toHaveBeenCalledWith("category", "ai");

    act(() => {
      result.current.resetFilters();
    });

    expect(result.current.filterValues).toEqual({});
    expect(result.current.isFiltered).toBe(false);
    expect(result.current.totalItems).toBe(5);
  });
});
