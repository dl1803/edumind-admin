import { categoryFormSchema } from "../category.schema";

describe("categoryFormSchema", () => {
  it("chấp nhận dữ liệu hợp lệ đầy đủ", () => {
    const validData = {
      name: "Khoa học Dữ liệu",
      slug: "khoa-hoc-du-lieu",
      description: "Chương trình chuyên sâu AI & Data Science",
      status: "ACTIVE",
    };

    const result = categoryFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Khoa học Dữ liệu");
      expect(result.data.slug).toBe("khoa-hoc-du-lieu");
      expect(result.data.status).toBe("ACTIVE");
    }
  });

  it("chấp nhận dữ liệu không có mô tả (optional) và gán status mặc định là ACTIVE", () => {
    const dataWithoutDesc = {
      name: "Lập trình Web",
      slug: "lap-trinh-web",
    };

    const result = categoryFormSchema.safeParse(dataWithoutDesc);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("ACTIVE");
      expect(result.data.description).toBeUndefined();
    }
  });

  it("từ chối khi tên quá ngắn (< 2 ký tự)", () => {
    const result = categoryFormSchema.safeParse({
      name: "A",
      slug: "valid-slug",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("ít nhất 2 ký tự");
    }
  });

  it("từ chối khi tên quá dài (> 50 ký tự)", () => {
    const result = categoryFormSchema.safeParse({
      name: "A".repeat(51),
      slug: "valid-slug",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("không vượt quá 50 ký tự");
    }
  });

  it("từ chối slug có chứa chữ in hoa hoặc ký tự đặc biệt không hợp lệ", () => {
    const invalidSlugUpper = categoryFormSchema.safeParse({
      name: "Lập trình",
      slug: "Lap-Trinh",
    });
    expect(invalidSlugUpper.success).toBe(false);

    const invalidSlugSpecial = categoryFormSchema.safeParse({
      name: "Lập trình",
      slug: "lap_trinh!",
    });
    expect(invalidSlugSpecial.success).toBe(false);
  });

  it("từ chối mô tả vượt quá 200 ký tự", () => {
    const result = categoryFormSchema.safeParse({
      name: "Thiết kế đồ họa",
      slug: "thiet-ke-do-hoa",
      description: "X".repeat(201),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("tối đa 200 ký tự");
    }
  });
});
