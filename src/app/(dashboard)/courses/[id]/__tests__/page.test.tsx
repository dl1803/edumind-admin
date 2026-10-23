import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import CourseDetailPage from "../page";
import { useCourse, CourseDetailExtended } from "@/hooks/useCourse";
import { toast } from "@/hooks/useToast";

jest.mock("next/navigation", () => ({
  useParams: () => ({ id: "crs-01" }),
}));

jest.mock("@/hooks/useCourse", () => ({
  useCourse: jest.fn(),
}));

jest.mock("@/hooks/useToast", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock("@/context/TopBarContext", () => ({
  TopBarContent: ({ breadcrumb, actions }: { breadcrumb?: React.ReactNode; actions?: React.ReactNode }) => (
    <div data-testid="mock-topbar">
      <div data-testid="mock-breadcrumb">{breadcrumb}</div>
      <div data-testid="mock-actions">{actions}</div>
    </div>
  ),
}));

const mockUseCourse = useCourse as jest.Mock;

describe("CourseDetailPage (A-05 Page Assembly)", () => {
  const mockCourseData: CourseDetailExtended = {
    id: "crs-01",
    title: "Lập trình Python với AI",
    description: "Khóa học thực chiến với AI",
    priceVnd: 499000,
    studentCount: 1250,
    chapterCount: 2,
    lessonCount: 10,
    totalDurationHours: 12.5,
    accumulatedRevenueVnd: 623750000,
    status: "PUBLISHED",
    categoryId: "cat-1",
    categoryName: "Lập trình Python",
    instructorId: "inst-01",
    instructorName: "TS. Lê Hoàng Nam",
    createdAt: "2026-08-14T00:00:00Z",
    updatedAt: "2026-08-14T00:00:00Z",
    learningOutcomes: ["Học cú pháp cơ bản"],
    prerequisites: ["Máy tính có Internet"],
    chapters: [
      {
        id: "chap-01",
        title: "Chương 1: Mở đầu",
        order: 1,
        lessons: [
          {
            id: "les-01",
            title: "Bài 1.1: Giới thiệu khóa học",
            order: 1,
            durationSeconds: 600,
            fileSizeMb: 120,
            videoQuality: "HLS 1080p",
            videoFileName: "intro.mp4",
            pipelineStatus: "READY",
            transcriptWordCount: 1200,
            vectorChunkCount: 12,
            isFreeTrial: true,
            learningObjective: "Làm quen môi trường",
            quizTitle: "Quiz 01",
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("hiển thị trạng thái đang tải dữ liệu (isLoading = true)", () => {
    mockUseCourse.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: jest.fn(),
    });

    render(<CourseDetailPage />);

    expect(screen.getByText("Đang tải thông tin khóa học...")).toBeInTheDocument();
  });

  it("hiển thị giao diện thông báo lỗi khi không tìm thấy khóa học (isError = true)", () => {
    const mockRefetch = jest.fn();
    mockUseCourse.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    });

    render(<CourseDetailPage />);

    expect(
      screen.getByText("Không tìm thấy thông tin khóa học")
    ).toBeInTheDocument();

    const retryBtn = screen.getByText("Thử lại");
    fireEvent.click(retryBtn);
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it("hiển thị Tab 1 Tổng quan mặc định và liên kết Sửa thông tin", () => {
    mockUseCourse.mockReturnValue({
      data: mockCourseData,
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });

    render(<CourseDetailPage />);

    // Kiểm tra nút Sửa thông tin dẫn tới /courses/crs-01/edit
    const editLink = screen.getByRole("link", { name: /Chỉnh sửa thông tin/i });
    expect(editLink).toHaveAttribute("href", "/courses/crs-01/edit");

    // Tab 1 là active -> hiển thị giá bán và giảng viên
    expect(screen.getByText("499.000đ")).toBeInTheDocument();
    expect(screen.getByText("TS. Lê Hoàng Nam")).toBeInTheDocument();
  });

  it("chuyển sang Tab 2 Cấu trúc bài giảng và hiển thị nút Thêm chương mới", () => {
    mockUseCourse.mockReturnValue({
      data: mockCourseData,
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });

    render(<CourseDetailPage />);

    const tab2Btn = screen.getByRole("button", { name: /Cấu trúc bài giảng/i });
    fireEvent.click(tab2Btn);

    // Ở Tab 2, nút Thêm chương mới xuất hiện trong TopBar actions
    expect(
      screen.getByRole("button", { name: /Thêm chương mới/i })
    ).toBeInTheDocument();

    // Hiển thị nội dung đề cương
    expect(screen.getByText("Chương 1: Mở đầu")).toBeInTheDocument();
    expect(screen.getByText("Bài 1.1: Giới thiệu khóa học")).toBeInTheDocument();
  });

  it("chuyển sang Tab 3 Xuất bản & Điều kiện", () => {
    mockUseCourse.mockReturnValue({
      data: mockCourseData,
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });

    render(<CourseDetailPage />);

    const tab3Btn = screen.getByRole("button", { name: /Xuất bản & Điều kiện/i });
    fireEvent.click(tab3Btn);

    // Kiểm tra tiêu đề checklist điều kiện xuất bản
    expect(screen.getByText("Điều kiện xuất bản khóa học")).toBeInTheDocument();
    expect(screen.getByText("Học thử bài đầu tiên")).toBeInTheDocument();
  });

  it("hiển thị chi tiết 3 điều kiện và cấu hình phân phối ở Tab 3", () => {
    mockUseCourse.mockReturnValue({
      data: mockCourseData,
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });

    render(<CourseDetailPage />);

    const tab3Btn = screen.getByRole("button", { name: /Xuất bản & Điều kiện/i });
    fireEvent.click(tab3Btn);

    expect(screen.getByText("Điều kiện xuất bản khóa học")).toBeInTheDocument();
    expect(
      screen.getByText("100% video bài giảng đã bóc băng Whisper STT và nhúng Vector pgvector")
    ).toBeInTheDocument();
  });
});
