import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCourse } from "../useCourse";
import { courseService } from "@/services/course.service";

jest.mock("@/services/course.service", () => ({
    courseService: {
        getCourseById: jest.fn(),
    },
}));

function createWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    return function Wrapper({ children }: { children: React.ReactNode }) {
        return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    };
}

describe("useCourse", () => {
    const mockBaseCourse = {
        id: "crs-01",
        title: "Nhập môn Lập trình Python với AI",
        description: "Khóa học nền tảng lập trình Python.",
        priceVnd: 500000,
        studentCount: 10,
        lessonCount: 2,
        status: "PUBLISHED" as const,
        instructorId: "inst-01",
        instructorName: "TS. Lê Hoàng Nam",
        categoryId: "cat-1",
        categoryName: "Lập trình Python",
        createdAt: "2026-10-01T00:00:00Z",
        updatedAt: "2026-10-01T00:00:00Z",
        chapters: [
            {
                id: "chap-01",
                title: "Chương 1",
                order: 1,
                lessons: [
                    { id: "les-01", title: "Bài 1.1 Cài đặt Python", order: 1, durationSeconds: 1800 },
                    { id: "les-02", title: "Bài 1.2 Cú pháp cơ bản", order: 2, durationSeconds: 1800 },
                ],
            },
        ],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("gọi courseService.getCourseById và làm giàu dữ liệu chi tiết cho đề cương", async () => {
        (courseService.getCourseById as jest.Mock).mockResolvedValueOnce(mockBaseCourse);

        const { result } = renderHook(() => useCourse("crs-01"), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(courseService.getCourseById).toHaveBeenCalledWith("crs-01");
        expect(result.current.data?.id).toBe("crs-01");
        expect(result.current.data?.accumulatedRevenueVnd).toBe(5000000);
        expect(result.current.data?.totalDurationHours).toBe(1);
        expect(result.current.data?.chapters?.[0].lessons[0].pipelineStatus).toBe("READY");
        expect(result.current.data?.chapters?.[0].lessons[0].videoQuality).toBe("HLS 1080p");
        expect(result.current.data?.chapters?.[0].lessons[0].videoFileName).toContain("bai_1_1");
        expect(result.current.data?.chapters?.[0].lessons[0].isFreeTrial).toBe(true);
    });

    it("không thực hiện fetch khi id không được truyền", () => {
        const { result } = renderHook(() => useCourse(undefined), {
            wrapper: createWrapper(),
        });

        expect(result.current.isLoading).toBe(false);
        expect(result.current.fetchStatus).toBe("idle");
        expect(courseService.getCourseById).not.toHaveBeenCalled();
    });

    it("xử lý an toàn khi khóa học không có chương (chapters rỗng)", async () => {
        (courseService.getCourseById as jest.Mock).mockResolvedValueOnce({
            ...mockBaseCourse,
            chapters: [],
            chapterCount: undefined,
            lessonCount: undefined,
        });

        const { result } = renderHook(() => useCourse("crs-empty"), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data?.chapters).toEqual([]);
        expect(result.current.data?.chapterCount).toBe(0);
        expect(result.current.data?.lessonCount).toBe(0);
    });

    it("trả về accumulatedRevenueVnd là undefined khi thiếu studentCount hoặc priceVnd", async () => {
        (courseService.getCourseById as jest.Mock).mockResolvedValueOnce({
            ...mockBaseCourse,
            studentCount: undefined,
        });

        const { result } = renderHook(() => useCourse("crs-no-student"), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data?.accumulatedRevenueVnd).toBeUndefined();
    });

    it("chuyển sang trạng thái isError khi courseService ném lỗi", async () => {
        (courseService.getCourseById as jest.Mock).mockRejectedValueOnce(
            new Error("Khóa học không tồn tại")
        );

        const { result } = renderHook(() => useCourse("crs-not-found"), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isError).toBe(true));

        expect(result.current.error?.message).toBe("Khóa học không tồn tại");
    });
});
