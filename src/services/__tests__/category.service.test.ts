import { categoryService } from "../category.service";

describe("categoryService", () => {
  beforeEach(() => {
    categoryService.resetMockData();
  });

  it("lấy danh sách danh mục ban đầu thành công", async () => {
    const list = await categoryService.getCategories();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThanOrEqual(4);
    expect(list[0]).toHaveProperty("id");
    expect(list[0]).toHaveProperty("name");
    expect(list[0]).toHaveProperty("slug");
  });

  it("tạo danh mục mới thành công với courseCount = 0", async () => {
    const newCategory = await categoryService.createCategory({
      name: "An ninh mạng",
      slug: "an-ninh-mang",
      description: "Bảo mật hệ thống thông tin",
      status: "ACTIVE",
    });

    expect(newCategory.id).toBeDefined();
    expect(newCategory.name).toBe("An ninh mạng");
    expect(newCategory.courseCount).toBe(0);

    const all = await categoryService.getCategories();
    expect(all.some((c) => c.name === "An ninh mạng")).toBe(true);
  });

  it("cập nhật thông tin danh mục thành công", async () => {
    const updated = await categoryService.updateCategory("cat-4", {
      name: "Thiết kế UI/UX Chuyên sâu",
      slug: "thiet-ke-ui-ux-chuyen-sau",
      description: "Cập nhật mô tả mới",
      status: "ACTIVE",
    });

    expect(updated.name).toBe("Thiết kế UI/UX Chuyên sâu");
    expect(updated.slug).toBe("thiet-ke-ui-ux-chuyen-sau");
  });

  it("từ chối tạo danh mục có tên hoặc slug đã tồn tại", async () => {
    await expect(
      categoryService.createCategory({
        name: "Lập trình Python", // Đã có trong mock
        slug: "lap-trinh-python-moi",
        status: "ACTIVE",
      })
    ).rejects.toThrow("Tên danh mục đã tồn tại trong hệ thống");

    await expect(
      categoryService.createCategory({
        name: "Tên chưa có",
        slug: "lap-trinh-python", // Slug đã có trong mock
        status: "ACTIVE",
      })
    ).rejects.toThrow("Đường dẫn (slug) đã tồn tại trong hệ thống");
  });

  it("báo lỗi khi cập nhật danh mục không tồn tại", async () => {
    await expect(
      categoryService.updateCategory("non-existent-id", {
        name: "Test",
        slug: "test",
        status: "ACTIVE",
      })
    ).rejects.toThrow("Không tìm thấy danh mục để cập nhật");
  });

  it("cho phép xóa danh mục khi có 0 khóa học liên kết (courseCount === 0)", async () => {
    await categoryService.deleteCategory("cat-4");

    const all = await categoryService.getCategories();
    expect(all.some((c) => c.id === "cat-4")).toBe(false);
  });

  it("chặn xóa danh mục khi có khóa học liên kết (courseCount > 0)", async () => {
    await expect(categoryService.deleteCategory("cat-1")).rejects.toThrow(
      "Không thể xóa danh mục đang có 8 khóa học liên kết!"
    );

    const all = await categoryService.getCategories();
    expect(all.some((c) => c.id === "cat-1")).toBe(true);
  });
});
