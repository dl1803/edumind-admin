import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { instructorService } from "@/services/instructor.service";
import { InstructorListParams } from "@/types/instructor.types";
import { toast } from "@/hooks/useToast";

export function useInstructors(params?: InstructorListParams) {
  return useQuery({
    queryKey: ["instructors", params],
    queryFn: () => instructorService.getInstructors(params),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}

export function useInstructorStats() {
  return useQuery({
    queryKey: ["instructors-stats"],
    queryFn: () => instructorService.getInstructorStats(),
    staleTime: 60 * 1000,
  });
}

export function useDeleteInstructor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => instructorService.deleteInstructor(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["instructors"] });
      queryClient.invalidateQueries({ queryKey: ["instructors-stats"] });
      toast.success(data.message || "Đã xóa hồ sơ giảng viên thành công!");
    },
    onError: (error: any) => {
      const beError = error.response?.data?.error;
      const errorCode = beError?.code || error.code;

      if (errorCode === "INSTRUCTOR_HAS_ACTIVE_COURSES") {
        toast.error(
          "Không thể xóa giảng viên đang phụ trách khóa học đang phát hành. Vui lòng chuyển giao khóa học trước."
        );
        return;
      }

      const msg =
        beError?.message ||
        error.response?.data?.message ||
        error.message ||
        "Không thể xóa giảng viên. Vui lòng thử lại sau.";
      toast.error(msg);
    },
  });
}

