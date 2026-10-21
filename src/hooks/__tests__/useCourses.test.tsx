import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useCourses,
  useCourseDetail,
  useDeleteCourse,
  useUpdateCourse,
  useCourseCategories,
  useCourseInstructors,
  useCreateCourse,
  useSaveCourse,
} from "../useCourses";
import { courseService } from "@/services/course.service";

jest.mock("@/services/course.service", () => ({
  courseService: {
    getCourses: jest.fn(),
    getCourseById: jest.fn(),
    deleteCourse: jest.fn(),
    updateCourse: jest.fn(),
    createCourse: jest.fn(),
    getCategories: jest.fn(),
    getInstructors: jest.fn(),
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
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  TestWrapper.displayName = "TestWrapper";

  return TestWrapper;
}

describe("Course Hooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("useCourses", () => {
    it("gọi courseService.getCourses với params truyền vào và trả về dữ liệu", async () => {
      const mockResult = {
        items: [{ id: "crs-1", title: "React Test" }],
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      };
      (courseService.getCourses as jest.Mock).mockResolvedValueOnce(mockResult);

      const params = { page: 1, pageSize: 10, search: "React" };
      const { result } = renderHook(() => useCourses(params), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(courseService.getCourses).toHaveBeenCalledWith(params);
      expect(result.current.data).toEqual(mockResult);
    });
  });

  describe("useCourseDetail", () => {
    it("gọi courseService.getCourseById khi có ID hợp lệ", async () => {
      const mockCourse = { id: "crs-1", title: "Khóa học thử nghiệm" };
      (courseService.getCourseById as jest.Mock).mockResolvedValueOnce(mockCourse);

      const { result } = renderHook(() => useCourseDetail("crs-1"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(courseService.getCourseById).toHaveBeenCalledWith("crs-1");
      expect(result.current.data).toEqual(mockCourse);
    });

    it("không thực hiện fetch khi id rỗng", () => {
      renderHook(() => useCourseDetail(""), {
        wrapper: createWrapper(),
      });

      expect(courseService.getCourseById).not.toHaveBeenCalled();
    });
  });

  describe("useDeleteCourse", () => {
    it("gọi courseService.deleteCourse thành công khi mutate", async () => {
      (courseService.deleteCourse as jest.Mock).mockResolvedValueOnce({ success: true });

      const { result } = renderHook(() => useDeleteCourse(), {
        wrapper: createWrapper(),
      });

      result.current.mutate("crs-1");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(courseService.deleteCourse).toHaveBeenCalledWith("crs-1");
    });
  });

  describe("useUpdateCourse", () => {
    it("gọi courseService.updateCourse với payload cập nhật", async () => {
      const updatedCourse = { id: "crs-1", title: "Tên mới", status: "ARCHIVED" };
      (courseService.updateCourse as jest.Mock).mockResolvedValueOnce(updatedCourse);

      const { result } = renderHook(() => useUpdateCourse(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        id: "crs-1",
        payload: { title: "Tên mới", status: "ARCHIVED" },
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(courseService.updateCourse).toHaveBeenCalledWith("crs-1", {
        title: "Tên mới",
        status: "ARCHIVED",
      });
    });
  });

  describe("useCourseCategories", () => {
    it("gọi courseService.getCategories và trả về danh sách danh mục", async () => {
      const mockCategories = [{ id: "cat-1", name: "Lập trình Python" }];
      (courseService.getCategories as jest.Mock).mockResolvedValueOnce(mockCategories);

      const { result } = renderHook(() => useCourseCategories(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(courseService.getCategories).toHaveBeenCalled();
      expect(result.current.data).toEqual(mockCategories);
    });
  });

  describe("useCourseInstructors", () => {
    it("gọi courseService.getInstructors và trả về danh sách giảng viên", async () => {
      const mockInstructors = [{ id: "inst-1", name: "TS. Lê Hoàng Nam", title: "Khoa CNTT" }];
      (courseService.getInstructors as jest.Mock).mockResolvedValueOnce(mockInstructors);

      const { result } = renderHook(() => useCourseInstructors(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(courseService.getInstructors).toHaveBeenCalled();
      expect(result.current.data).toEqual(mockInstructors);
    });
  });

  describe("useCreateCourse", () => {
    it("gọi courseService.createCourse khi tạo khóa học mới", async () => {
      const newCoursePayload = {
        title: "Khóa học mới",
        description: "Mô tả khóa học mới",
        categoryId: "cat-1",
        instructorId: "inst-1",
        priceVnd: 500000,
        status: "DRAFT" as const,
      };
      (courseService.createCourse as jest.Mock).mockResolvedValueOnce({
        id: "crs-new",
        ...newCoursePayload,
      });

      const { result } = renderHook(() => useCreateCourse(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(newCoursePayload);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(courseService.createCourse).toHaveBeenCalledWith(newCoursePayload);
    });
  });

  describe("useSaveCourse", () => {
    it("gọi createCourse khi không truyền courseId", async () => {
      const payload = {
        title: "Tạo mới",
        description: "Mô tả",
        categoryId: "cat-1",
        instructorId: "inst-1",
        priceVnd: 0,
        status: "DRAFT" as const,
      };
      (courseService.createCourse as jest.Mock).mockResolvedValueOnce({ id: "crs-created", ...payload });

      const { result } = renderHook(() => useSaveCourse(), {
        wrapper: createWrapper(),
      });

      await result.current.save(payload);

      expect(courseService.createCourse).toHaveBeenCalledWith(payload);
      expect(courseService.updateCourse).not.toHaveBeenCalled();
    });

    it("gọi updateCourse khi có truyền courseId", async () => {
      const payload = {
        title: "Cập nhật",
        description: "Mô tả cập nhật",
        categoryId: "cat-1",
        instructorId: "inst-1",
        priceVnd: 200000,
        status: "PUBLISHED" as const,
      };
      (courseService.updateCourse as jest.Mock).mockResolvedValueOnce({ id: "crs-edit", ...payload });

      const { result } = renderHook(() => useSaveCourse("crs-edit"), {
        wrapper: createWrapper(),
      });

      await result.current.save(payload);

      expect(courseService.updateCourse).toHaveBeenCalledWith("crs-edit", payload);
      expect(courseService.createCourse).not.toHaveBeenCalled();
    });
  });
});
