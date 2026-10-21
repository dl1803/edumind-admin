import {
  lessonSchema,
  chapterSchema,
  courseFormSchema,
} from "../course.schema";

describe("Course Form Validation Schemas", () => {
  describe("lessonSchema", () => {
    it("cho phép bài giảng hợp lệ vượt qua validation", () => {
      const validLesson = {
        id: "les-1",
        title: "1.1 Giới thiệu tổng quan",
        durationSeconds: 300,
        videoUrl: "https://example.com/video.mp4",
        isPreview: true,
        order: 1,
      };

      const result = lessonSchema.safeParse(validLesson);
      expect(result.success).toBe(true);
    });

    it("từ chối bài giảng có tiêu đề rỗng hoặc chỉ toàn khoảng trắng", () => {
      const invalidLesson = {
        id: "les-1",
        title: "   ",
        order: 1,
      };

      const result = lessonSchema.safeParse(invalidLesson);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("không được để trống");
      }
    });

    it("tự động gán giá trị mặc định cho order khi không truyền", () => {
      const lessonWithoutOrder = {
        id: "les-1",
        title: "Bài giảng thử nghiệm",
      };

      const result = lessonSchema.safeParse(lessonWithoutOrder);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.order).toBe(0);
      }
    });
  });

  describe("chapterSchema", () => {
    it("cho phép chương hợp lệ với danh sách bài giảng vượt qua validation", () => {
      const validChapter = {
        id: "chap-1",
        title: "Chương 1: Khởi động",
        order: 1,
        lessons: [
          {
            id: "les-1",
            title: "1.1 Cài đặt môi trường",
            order: 1,
          },
        ],
      };

      const result = chapterSchema.safeParse(validChapter);
      expect(result.success).toBe(true);
    });

    it("từ chối chương có tiêu đề rỗng", () => {
      const invalidChapter = {
        id: "chap-1",
        title: "",
        order: 1,
        lessons: [],
      };

      const result = chapterSchema.safeParse(invalidChapter);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("không được để trống");
      }
    });

    it("tự động gán mảng rỗng cho lessons khi không truyền", () => {
      const chapterWithoutLessons = {
        id: "chap-1",
        title: "Chương chưa có bài",
      };

      const result = chapterSchema.safeParse(chapterWithoutLessons);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.lessons).toEqual([]);
      }
    });
  });

  describe("courseFormSchema", () => {
    const validCourse = {
      title: "Lập trình Python 3.12 từ căn bản đến nâng cao",
      shortDescription: "Khóa học nền tảng lập trình Python toàn diện",
      description: "Khóa học cung cấp đầy đủ kiến thức về cấu trúc dữ liệu và giải thuật trong Python.",
      categoryId: "cat-1",
      instructorId: "inst-01",
      priceVnd: 499000,
      thumbnailUrl: "https://example.com/thumb.jpg",
      status: "DRAFT" as const,
      chapters: [
        {
          id: "chap-1",
          title: "Chương 1: Cơ bản",
          order: 1,
          lessons: [
            { id: "les-1", title: "1.1 Bài mở đầu", order: 1 },
          ],
        },
      ],
    };

    it("cho phép toàn bộ dữ liệu form hợp lệ vượt qua validation", () => {
      const result = courseFormSchema.safeParse(validCourse);
      expect(result.success).toBe(true);
    });

    it("từ chối tên khóa học dưới 5 ký tự", () => {
      const invalid = { ...validCourse, title: "Py" };
      const result = courseFormSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("ít nhất 5 ký tự");
      }
    });

    it("từ chối tên khóa học vượt quá 200 ký tự", () => {
      const longTitle = "A".repeat(201);
      const invalid = { ...validCourse, title: longTitle };
      const result = courseFormSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("không vượt quá 200 ký tự");
      }
    });

    it("từ chối mô tả chi tiết dưới 10 ký tự", () => {
      const invalid = { ...validCourse, description: "Quá ngắn" };
      const result = courseFormSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("ít nhất 10 ký tự");
      }
    });

    it("bắt buộc phải có danh mục categoryId hợp lệ", () => {
      const invalid = { ...validCourse, categoryId: "" };
      const result = courseFormSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Vui lòng chọn danh mục khóa học");
      }
    });

    it("bắt buộc phải có giảng viên instructorId hợp lệ", () => {
      const invalid = { ...validCourse, instructorId: "" };
      const result = courseFormSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Vui lòng chọn giảng viên phụ trách");
      }
    });

    it("từ chối giá bán là số âm", () => {
      const invalid = { ...validCourse, priceVnd: -50000 };
      const result = courseFormSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("không được âm");
      }
    });

    it("chấp nhận giá bán bằng 0 cho khóa học miễn phí", () => {
      const freeCourse = { ...validCourse, priceVnd: 0 };
      const result = courseFormSchema.safeParse(freeCourse);
      expect(result.success).toBe(true);
    });

    it("tự động chuyển đổi chuỗi số thành dạng số cho priceVnd", () => {
      const stringPriceCourse = { ...validCourse, priceVnd: "299000" };
      const result = courseFormSchema.safeParse(stringPriceCourse);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.priceVnd).toBe(299000);
      }
    });

    it("tự động gán trạng thái DRAFT khi không truyền status", () => {
      const { status, ...courseWithoutStatus } = validCourse;
      const result = courseFormSchema.safeParse(courseWithoutStatus);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("DRAFT");
      }
    });

    it("chấp nhận các trạng thái hợp lệ PUBLISHED và ARCHIVED", () => {
      const published = { ...validCourse, status: "PUBLISHED" as const };
      const archived = { ...validCourse, status: "ARCHIVED" as const };

      expect(courseFormSchema.safeParse(published).success).toBe(true);
      expect(courseFormSchema.safeParse(archived).success).toBe(true);
    });
  });
});
