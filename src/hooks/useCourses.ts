import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { courseService } from "@/services/course.service";
import { CourseListParams, CoursePayload } from "@/types/course.types";
import { toast } from "@/hooks/useToast";

export function useCourses(params?: CourseListParams) {
  return useQuery({
    queryKey: ["courses", params],
    queryFn: () => courseService.getCourses(params),
    placeholderData: keepPreviousData,
  });
}

export function useCourseDetail(id?: string) {
  return useQuery({
    queryKey: ["course", id],
    queryFn: () => courseService.getCourseById(id!),
    enabled: Boolean(id),
  });
}

export function useCourseCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => courseService.getCategories(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCourseInstructors() {
  return useQuery({
    queryKey: ["instructors"],
    queryFn: () => courseService.getInstructors(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CoursePayload) => courseService.createCourse(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["courses-stats"] });
      toast.success("Đã tạo khóa học mới thành công!");
    },
    onError: (error: any) => {
      const beError = error.response?.data?.error;
      const details = beError?.details ? JSON.stringify(beError.details) : "";
      const msg =
        beError?.message ||
        error.response?.data?.message ||
        error.message ||
        "Không thể tạo khóa học. Vui lòng thử lại.";
      toast.error(details ? `${msg} (${details})` : msg);
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => courseService.deleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["courses-stats"] });
      toast.success("Đã xóa khóa học thành công!");
    },
    onError: (error: any) => {
      const beError = error.response?.data?.error;
      if (beError?.code === "COURSE_HAS_ENROLLMENTS" || error.response?.status === 409) {
        toast.error("Không thể xóa khóa học đã có học viên đăng ký. Vui lòng chọn Ẩn khóa học.");
        return;
      }
      const msg =
        beError?.message ||
        error.response?.data?.message ||
        error.message ||
        "Không thể xóa khóa học. Vui lòng thử lại.";
      toast.error(msg);
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CoursePayload> }) =>
      courseService.updateCourse(id, payload),
    onSuccess: (updated, variables) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["courses-stats"] });
      if (updated?.id) {
        queryClient.invalidateQueries({ queryKey: ["course", updated.id] });
      }
      if (variables?.payload?.status === "ARCHIVED") {
        toast.info("Đã chuyển khóa học sang trạng thái Ẩn thành công!");
      } else {
        toast.success("Đã cập nhật thông tin khóa học thành công!");
      }
    },
    onError: (error: any) => {
      const beError = error.response?.data?.error;
      const details = beError?.details ? JSON.stringify(beError.details) : "";
      if (
        beError?.code === "COURSE_NOT_READY_TO_PUBLISH" ||
        error.response?.status === 409
      ) {
        toast.error(
          "Khóa học chưa đủ điều kiện xuất bản: Cần tối thiểu 01 chương, bài giảng video hoàn tất và giảng viên phụ trách."
        );
        return;
      }
      const msg =
        beError?.message ||
        error.response?.data?.message ||
        error.message ||
        "Không thể cập nhật khóa học. Vui lòng thử lại.";
      toast.error(details ? `${msg} (${details})` : msg);
    },
  });
}

export function useSaveCourse(courseId?: string) {
  const createMutation = useCreateCourse();
  const updateMutation = useUpdateCourse();

  return {
    isPending: createMutation.isPending || updateMutation.isPending,
    save: async (values: CoursePayload) => {
      if (courseId) {
        return await updateMutation.mutateAsync({ id: courseId, payload: values });
      }
      return await createMutation.mutateAsync(values);
    },
  };
}
