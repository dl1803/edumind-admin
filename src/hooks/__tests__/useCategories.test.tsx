import { renderHook, waitFor, act } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCategoriesList, useSaveCategory, useDeleteCategory } from "../useCategories";
import { categoryService } from "@/services/category.service";
import { toast } from "@/hooks/useToast";

jest.mock("@/services/category.service", () => ({
  categoryService: {
    getCategories: jest.fn(),
    createCategory: jest.fn(),
    updateCategory: jest.fn(),
    deleteCategory: jest.fn(),
  },
}));

jest.mock("@/hooks/useToast", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useCategories hooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("useCategoriesList", () => {
    it("lấy danh sách categories từ categoryService", async () => {
      const mockList = [
        { id: "cat-1", name: "Python", slug: "python", courseCount: 5, status: "ACTIVE" },
      ];
      (categoryService.getCategories as jest.Mock).mockResolvedValueOnce(mockList);

      const { result } = renderHook(() => useCategoriesList(), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockList);
      expect(categoryService.getCategories).toHaveBeenCalledTimes(1);
    });
  });

  describe("useSaveCategory", () => {
    it("gọi createCategory khi không có id (tạo mới)", async () => {
      const newCategory = {
        name: "Lập trình Go",
        slug: "lap-trinh-go",
        status: "ACTIVE" as const,
      };
      (categoryService.createCategory as jest.Mock).mockResolvedValueOnce({
        id: "cat-new",
        ...newCategory,
        courseCount: 0,
        createdAt: "2026-10-23T00:00:00Z",
      });

      const { result } = renderHook(() => useSaveCategory(), { wrapper: createWrapper() });

      await act(async () => {
        await result.current.mutateAsync({ id: undefined, values: newCategory });
      });

      expect(categoryService.createCategory).toHaveBeenCalledWith(newCategory);
      expect(categoryService.updateCategory).not.toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("Đã tạo danh mục mới thành công!");
    });

    it("gọi updateCategory khi có id (chỉnh sửa)", async () => {
      const editValues = {
        name: "Thiết kế UI/UX Đã Đổi",
        slug: "thiet-ke-ui-ux-da-doi",
        status: "ACTIVE" as const,
      };
      (categoryService.updateCategory as jest.Mock).mockResolvedValueOnce({
        id: "cat-4",
        ...editValues,
        courseCount: 0,
        createdAt: "2026-08-10T11:00:00.000Z",
      });

      const { result } = renderHook(() => useSaveCategory(), { wrapper: createWrapper() });

      await act(async () => {
        await result.current.mutateAsync({ id: "cat-4", values: editValues });
      });

      expect(categoryService.updateCategory).toHaveBeenCalledWith("cat-4", editValues);
      expect(categoryService.createCategory).not.toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("Đã cập nhật danh mục thành công!");
    });
  });

  describe("useDeleteCategory", () => {
    it("gọi deleteCategory khi xóa danh mục", async () => {
      (categoryService.deleteCategory as jest.Mock).mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useDeleteCategory(), { wrapper: createWrapper() });

      await act(async () => {
        await result.current.mutateAsync("cat-4");
      });

      expect(categoryService.deleteCategory).toHaveBeenCalledWith("cat-4");
      expect(toast.success).toHaveBeenCalledWith("Đã xóa danh mục thành công!");
    });
  });
});
