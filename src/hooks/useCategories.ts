import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryService } from "@/services/category.service";
import { CategoryFormValues } from "@/types/category.types";
import { toast } from "@/hooks/useToast";

export function useCategoriesList() {
  return useQuery({
    queryKey: ["categories-list"],
    queryFn: () => categoryService.getCategories(),
    staleTime: 60 * 1000,
  });
}

export type SaveCategoryPayload =
  | CategoryFormValues
  | { id?: string; values: CategoryFormValues };

export function useSaveCategory(defaultCategoryId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SaveCategoryPayload) => {
      const isObjectPayload = "values" in payload;
      const targetId = isObjectPayload ? payload.id : defaultCategoryId;
      const values = isObjectPayload ? payload.values : payload;

      if (targetId) {
        return await categoryService.updateCategory(targetId, values);
      }
      return await categoryService.createCategory(values);
    },
    onSuccess: (_, variables) => {
      const isObjectPayload =
        typeof variables === "object" && variables !== null && "values" in variables;
      const targetId = isObjectPayload
        ? (variables as { id?: string }).id
        : defaultCategoryId;

      queryClient.invalidateQueries({ queryKey: ["categories-list"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success(
        targetId
          ? "Đã cập nhật danh mục thành công!"
          : "Đã tạo danh mục mới thành công!"
      );
    },
    onError: (err: Error) => {
      toast.error(err.message || "Không thể lưu danh mục!");
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await categoryService.deleteCategory(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories-list"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Đã xóa danh mục thành công!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Không thể xóa danh mục!");
    },
  });
}
