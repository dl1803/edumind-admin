import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { EnrollmentStats } from "../EnrollmentStats";
import { CourseInfoCard } from "../CourseInfoCard";
import { CourseOutlineReadOnly } from "../CourseOutlineReadOnly";
import { CourseLessonDrawer } from "../CourseLessonDrawer";
import { CoursePublishChecklist } from "../CoursePublishChecklist";
import { AddChapterModal } from "../AddChapterModal";
import { CourseDetailExtended } from "@/hooks/useCourse";

describe("Course Detail UI Components (A-05)", () => {
  const sampleCourse: CourseDetailExtended = {
    id: "crs-01",
    title: "Lập trình Python với AI",
    description: "Khóa học đầy đủ từ cơ bản đến nâng cao.",
    priceVnd: 499000,
    studentCount: 1250,
    chapterCount: 4,
    lessonCount: 42,
    totalDurationHours: 18.5,
    accumulatedRevenueVnd: 623750000,
    status: "PUBLISHED",
    categoryId: "cat-1",
    categoryName: "Lập trình Python",
    instructorId: "inst-01",
    instructorName: "TS. Lê Hoàng Nam",
    createdAt: "2026-08-14T00:00:00Z",
    updatedAt: "2026-08-14T00:00:00Z",
    learningOutcomes: ["Học cú pháp cơ bản", "Xây dựng 3 dự án"],
    prerequisites: ["Máy tính có kết nối Internet"],
    chapters: [
      {
        id: "chap-01",
        title: "Chương 1: Thiết lập môi trường",
        order: 1,
        lessons: [
          {
            id: "les-01",
            title: "Bài 1.1: Giới thiệu hệ sinh thái Python",
            order: 1,
            durationSeconds: 750,
            fileSizeMb: 128,
            videoQuality: "HLS 1080p",
            videoFileName: "python_intro_final.mp4",
            pipelineStatus: "READY",
            transcriptWordCount: 1420,
            vectorChunkCount: 14,
            isFreeTrial: true,
            learningObjective: "Làm quen với Python",
            quizTitle: "Quiz 01: Nhận diện cú pháp",
          },
        ],
      },
    ],
  };

  describe("EnrollmentStats", () => {
    it("hiển thị đúng định dạng các số liệu thống kê", () => {
      render(
        <EnrollmentStats
          studentCount={1250}
          chapterCount={4}
          lessonCount={42}
          totalDurationHours={18.5}
        />
      );

      expect(screen.getByText("1.250")).toBeInTheDocument();
      expect(screen.getByText("4 chương")).toBeInTheDocument();
      expect(screen.getByText("42 bài")).toBeInTheDocument();
      expect(screen.getByText("18.5 giờ")).toBeInTheDocument();
    });

    it("hiển thị dấu gạch ngang — khi dữ liệu bị thiếu hoặc undefined", () => {
      render(<EnrollmentStats />);

      const dashes = screen.getAllByText("—");
      expect(dashes.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("CourseInfoCard", () => {
    it("hiển thị tiêu đề, giá bán, giảng viên, mô tả và ngày khởi tạo", () => {
      render(<CourseInfoCard course={sampleCourse} />);

      expect(
        screen.getByRole("heading", { level: 2, name: "Lập trình Python với AI" })
      ).toBeInTheDocument();
      expect(screen.getByText("499.000đ")).toBeInTheDocument();
      expect(screen.getByText("TS. Lê Hoàng Nam")).toBeInTheDocument();
      expect(
        screen.getByText("Khoa Công nghệ Thông tin, Đại học Quốc gia Hà Nội")
      ).toBeInTheDocument();
      expect(screen.getByText("Khóa học đầy đủ từ cơ bản đến nâng cao.")).toBeInTheDocument();
      expect(screen.getByText(/Khởi tạo ngày/i)).toBeInTheDocument();
    });
  });

  describe("CourseOutlineReadOnly", () => {
    it("hiển thị đề cương chương và bài học đúng cấu trúc", () => {
      render(<CourseOutlineReadOnly chapters={sampleCourse.chapters} />);

      expect(screen.getByText("Chương 1: Thiết lập môi trường")).toBeInTheDocument();
      expect(screen.getByText("Bài 1.1: Giới thiệu hệ sinh thái Python")).toBeInTheDocument();
      expect(screen.getByText("Vector Index Sẵn sàng")).toBeInTheDocument();
    });

    it("hỗ trợ đóng mở accordion khi click vào header của chương", () => {
      render(<CourseOutlineReadOnly chapters={sampleCourse.chapters} />);

      const lessonTitle = screen.getByText("Bài 1.1: Giới thiệu hệ sinh thái Python");
      expect(lessonTitle).toBeInTheDocument();

      // Click vào header chương để thu gọn
      const chapterHeader = screen.getByText("Chương 1: Thiết lập môi trường");
      fireEvent.click(chapterHeader);
      expect(screen.queryByText("Bài 1.1: Giới thiệu hệ sinh thái Python")).not.toBeInTheDocument();

      // Click lại để mở rộng
      fireEvent.click(chapterHeader);
      expect(screen.getByText("Bài 1.1: Giới thiệu hệ sinh thái Python")).toBeInTheDocument();
    });

    it("hiển thị hộp nét đứt khi chương chưa có bài học", () => {
      const chapterEmpty = [
        {
          id: "chap-empty",
          title: "Chương 2: Cú pháp cơ bản",
          order: 2,
          lessons: [],
        },
      ];
      render(<CourseOutlineReadOnly chapters={chapterEmpty} />);

      expect(
        screen.getByText("Chưa có bài học nào trong chương này")
      ).toBeInTheDocument();
    });

    it("hiển thị nút thêm chương và gọi onAddChapter khi nhấp", () => {
      const handleAddChapter = jest.fn();
      render(
        <CourseOutlineReadOnly
          chapters={sampleCourse.chapters}
          onAddChapter={handleAddChapter}
        />
      );

      const addBtn = screen.getByText("+ Thêm chương học mới");
      fireEvent.click(addBtn);
      expect(handleAddChapter).toHaveBeenCalledTimes(1);
    });

    it("hiển thị trạng thái rỗng khi danh sách chương rỗng", () => {
      render(<CourseOutlineReadOnly chapters={[]} />);
      expect(screen.getByText("Chưa có đề cương bài giảng")).toBeInTheDocument();
    });
  });

  describe("CourseLessonDrawer", () => {
    it("không render khi open = false", () => {
      render(
        <CourseLessonDrawer
          open={false}
          lesson={sampleCourse.chapters![0].lessons[0]}
          onClose={jest.fn()}
        />
      );

      expect(screen.queryByText("Chi tiết Bài học")).not.toBeInTheDocument();
    });

    it("hiển thị thông tin chi tiết bài học và nút đóng khi open = true", () => {
      const handleClose = jest.fn();
      render(
        <CourseLessonDrawer
          open={true}
          lesson={sampleCourse.chapters![0].lessons[0]}
          chapterTitle="Chương 1"
          chapterOrder={1}
          onClose={handleClose}
        />
      );

      expect(screen.getByText("Chi tiết Bài học")).toBeInTheDocument();
      expect(screen.getByText("Đã đồng bộ AI")).toBeInTheDocument();
      expect(screen.getByText("python_intro_final.mp4")).toBeInTheDocument();

      const closeBtn = screen.getByText("Đóng");
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("CoursePublishChecklist", () => {
    it("hiển thị 3 điều kiện xuất bản, cấu hình phân phối và nhật ký phát hành", () => {
      render(<CoursePublishChecklist course={sampleCourse} />);

      expect(screen.getByText("3/3 Điều kiện Đạt")).toBeInTheDocument();
      expect(
        screen.getByText("Đã tạo tối thiểu 01 chương và có nội dung bài học")
      ).toBeInTheDocument();
      expect(
        screen.getByText("100% video bài giảng đã tạo phụ đề và đồng bộ Trợ giảng AI")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Đã thiết lập giảng viên phụ trách và cấu hình giá bán")
      ).toBeInTheDocument();
      expect(screen.getByText("Học thử bài đầu tiên")).toBeInTheDocument();
      expect(screen.getByText("Nhật ký phát hành")).toBeInTheDocument();
    });

    it("hiển thị trạng thái điều kiện chưa đạt khi khóa học chưa có chương", () => {
      const courseNoChap: CourseDetailExtended = {
        ...sampleCourse,
        chapters: [],
        lessonCount: 0,
      };
      render(<CoursePublishChecklist course={courseNoChap} />);

      expect(screen.getByText("1/3 Điều kiện Đạt")).toBeInTheDocument();
      expect(screen.getByText("[!] Chưa có chương/bài")).toBeInTheDocument();
      expect(screen.getByText("[!] Chưa có video bài giảng")).toBeInTheDocument();
    });
  });

  describe("AddChapterModal", () => {
    it("không render khi open = false", () => {
      render(
        <AddChapterModal
          open={false}
          onClose={jest.fn()}
          onSubmit={jest.fn()}
        />
      );
      expect(screen.queryByText("Thêm chương học mới")).not.toBeInTheDocument();
    });

    it("hiển thị tiền tố chương và cho phép nhập form submit", () => {
      const handleSubmit = jest.fn();
      const handleClose = jest.fn();

      render(
        <AddChapterModal
          open={true}
          nextOrder={5}
          onClose={handleClose}
          onSubmit={handleSubmit}
        />
      );

      expect(screen.getByText("Thêm chương học mới")).toBeInTheDocument();
      expect(screen.getByText("Chương 05")).toBeInTheDocument();

      const titleInput = screen.getByPlaceholderText(/Lập trình Hướng đối tượng/i);
      const descInput = screen.getByPlaceholderText(/Nhập tóm tắt nội dung/i);

      fireEvent.change(titleInput, {
        target: { value: "Lập trình Hướng đối tượng OOP" },
      });
      fireEvent.change(descInput, {
        target: { value: "Mô tả chương OOP" },
      });

      const submitBtn = screen.getByRole("button", { name: "Thêm chương" });
      fireEvent.click(submitBtn);

      expect(handleSubmit).toHaveBeenCalledWith({
        title: "Lập trình Hướng đối tượng OOP",
        description: "Mô tả chương OOP",
        order: 5,
      });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it("hiển thị lỗi khi tiêu đề chương bị để trống", () => {
      const handleSubmit = jest.fn();

      render(
        <AddChapterModal
          open={true}
          nextOrder={1}
          onClose={jest.fn()}
          onSubmit={handleSubmit}
        />
      );

      const submitBtn = screen.getByRole("button", { name: "Thêm chương" });
      fireEvent.click(submitBtn);

      expect(screen.getByText("Vui lòng nhập tên chương học")).toBeInTheDocument();
      expect(handleSubmit).not.toHaveBeenCalled();
    });
  });
});
