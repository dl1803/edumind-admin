import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { courseService } from "@/services/course.service";
import { CourseListParams } from "@/types/course.types";
import { toast } from "@/hooks/useToast";

export function useCourses(params?: CourseListParams) {
  return useQuery({
    queryKey: ["courses", params],
    queryFn: () => courseService.getCourses(params),
    placeholderData: keepPreviousData,
  });
}

export function useCourseDetail(id: string) {
  return useQuery({
    queryKey: ["course", id],
    queryFn: () => courseService.getCourseById(id),
    enabled: Boolean(id),
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => courseService.deleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Xóa khóa học thành công.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Không thể xóa khóa học. Vui lòng thử lại.");
    },
  });
}
