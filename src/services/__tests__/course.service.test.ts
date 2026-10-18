import { courseService } from "../course.service";
import { resetMockCoursesData } from "../mock/course.mock";
import { courseFilterSchema } from "@/lib/validations/course.schema";

describe("CourseService (Mock Engine)", () => {
  const originalEnv = process.env.NEXT_PUBLIC_USE_MOCK;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_USE_MOCK = "true";
    resetMockCoursesData();
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_USE_MOCK = originalEnv;
  });

  it("phân trang danh sách khóa học mặc định 10 khóa / trang và tổng cộng 50 khóa", async () => {
    const res = await courseService.getCourses({ page: 1, pageSize: 10 });
    expect(res.items).toHaveLength(10);
    expect(res.total).toBe(50);
    expect(res.page).toBe(1);
    expect(res.totalPages).toBe(5);
  });

  it("lọc danh sách khóa học theo từ khóa tìm kiếm", async () => {
    const res = await courseService.getCourses({ search: "Python" });
    expect(res.items.length).toBeGreaterThan(0);
    expect(
      res.items.every(
        (c) =>
          c.title.toLowerCase().includes("python") ||
          c.instructorName.toLowerCase().includes("python")
      )
    ).toBe(true);
  });

  it("lọc danh sách khóa học theo trạng thái PUBLISHED hoặc DRAFT", async () => {
    const res = await courseService.getCourses({ status: "DRAFT" });
    expect(res.items.length).toBeGreaterThan(0);
    expect(res.items.every((c) => c.status === "DRAFT")).toBe(true);
  });

  it("xóa khóa học thành công và giảm số lượng tổng trong danh sách", async () => {
    const before = await courseService.getCourses();
    const courseToDelete = before.items[0];

    const delRes = await courseService.deleteCourse(courseToDelete.id);
    expect(delRes.success).toBe(true);

    const after = await courseService.getCourses();
    expect(after.total).toBe(before.total - 1);
    expect(after.items.find((c) => c.id === courseToDelete.id)).toBeUndefined();
  });

  it("ném ra lỗi khi xóa khóa học không tồn tại", async () => {
    await expect(courseService.deleteCourse("invalid-id-xyz")).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });
});

describe("courseFilterSchema", () => {
  it("validate thành công với tham số lọc hợp lệ", () => {
    const validParams = {
      page: 1,
      pageSize: 10,
      search: "React",
      status: "PUBLISHED" as const,
    };
    const parsed = courseFilterSchema.safeParse(validParams);
    expect(parsed.success).toBe(true);
  });

  it("tự động gán page = 1 và pageSize = 10 khi để trống", () => {
    const parsed = courseFilterSchema.safeParse({});
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.page).toBe(1);
      expect(parsed.data.pageSize).toBe(10);
    }
  });

  it("từ chối khi page nhỏ hơn 1", () => {
    const parsed = courseFilterSchema.safeParse({ page: 0 });
    expect(parsed.success).toBe(false);
  });
});
