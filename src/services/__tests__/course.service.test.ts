import { courseService } from "../course.service";
import { resetMockCoursesData } from "../mock/course.mock";
import { courseFilterSchema, courseStatusSchema } from "@/lib/validations/course.schema";

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

  it("lọc danh sách khóa học theo danh mục categoryId", async () => {
    const res = await courseService.getCourses({ categoryId: "cat-1" });
    expect(res.items.length).toBeGreaterThan(0);
    expect(res.items.every((c) => c.categoryId === "cat-1")).toBe(true);
  });

  it("sắp xếp danh sách khóa học theo học phí tăng dần và giảm dần", async () => {
    const resAsc = await courseService.getCourses({ sortBy: "priceVnd", sortDir: "asc" });
    for (let i = 0; i < resAsc.items.length - 1; i++) {
      expect(resAsc.items[i].priceVnd).toBeLessThanOrEqual(resAsc.items[i + 1].priceVnd);
    }

    const resDesc = await courseService.getCourses({ sortBy: "priceVnd", sortDir: "desc" });
    for (let i = 0; i < resDesc.items.length - 1; i++) {
      expect(resDesc.items[i].priceVnd).toBeGreaterThanOrEqual(resDesc.items[i + 1].priceVnd);
    }
  });

  it("lấy chi tiết khóa học theo mã định danh thành công", async () => {
    const course = await courseService.getCourseById("crs-01");
    expect(course).toBeDefined();
    expect(course.id).toBe("crs-01");
    expect(course.title).toContain("Python");
  });

  it("ném ra lỗi NOT_FOUND khi tìm kiếm khóa học không tồn tại", async () => {
    await expect(courseService.getCourseById("crs-non-existent")).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("cập nhật thông tin khóa học thành công", async () => {
    const updated = await courseService.updateCourse("crs-01", {
      status: "ARCHIVED",
      title: "Khóa học đã cập nhật",
    });

    expect(updated.status).toBe("ARCHIVED");
    expect(updated.title).toBe("Khóa học đã cập nhật");

    const fetched = await courseService.getCourseById("crs-01");
    expect(fetched.status).toBe("ARCHIVED");
    expect(fetched.title).toBe("Khóa học đã cập nhật");
  });

  it("ném ra lỗi khi cập nhật khóa học không tồn tại", async () => {
    await expect(
      courseService.updateCourse("crs-unknown", { status: "DRAFT" })
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
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

  it("lấy danh sách tất cả các danh mục khóa học", async () => {
    const categories = await courseService.getCategories();
    expect(categories.length).toBeGreaterThan(0);
    expect(categories[0]).toHaveProperty("id");
    expect(categories[0]).toHaveProperty("name");
  });
});

describe("courseFilterSchema & courseStatusSchema", () => {
  it("validate thành công với tham số lọc hợp lệ đầy đủ", () => {
    const validParams = {
      page: 2,
      pageSize: 20,
      search: "React",
      status: "PUBLISHED" as const,
      categoryId: "cat-1",
      sortBy: "createdAt",
      sortDir: "desc" as const,
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

  it("từ chối khi pageSize vượt quá giới hạn 50", () => {
    const parsed = courseFilterSchema.safeParse({ pageSize: 100 });
    expect(parsed.success).toBe(false);
  });

  it("chấp nhận các trạng thái khóa học hợp lệ", () => {
    expect(courseStatusSchema.safeParse("PUBLISHED").success).toBe(true);
    expect(courseStatusSchema.safeParse("DRAFT").success).toBe(true);
    expect(courseStatusSchema.safeParse("ARCHIVED").success).toBe(true);
    expect(courseStatusSchema.safeParse("DELETED").success).toBe(false);
  });
});
