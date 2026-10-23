import { Category, CategoryFormValues } from "@/types/category.types";

const INITIAL_CATEGORIES: Category[] = [
  {
    id: "cat-1",
    name: "Lập trình Python",
    slug: "lap-trinh-python",
    description: "Các khóa học lập trình Python từ căn bản đến nâng cao",
    courseCount: 8,
    status: "ACTIVE",
    createdAt: "2026-08-01T08:00:00.000Z",
  },
  {
    id: "cat-2",
    name: "Khoa học Dữ liệu & AI",
    slug: "khoa-hoc-du-lieu-ai",
    description: "Machine Learning, Deep Learning và Trí tuệ nhân tạo",
    courseCount: 5,
    status: "ACTIVE",
    createdAt: "2026-08-02T09:00:00.000Z",
  },
  {
    id: "cat-3",
    name: "Phát triển Web",
    slug: "phat-trien-web",
    description: "Frontend React, Next.js, Backend Node.js và Spring Boot",
    courseCount: 12,
    status: "ACTIVE",
    createdAt: "2026-08-05T10:00:00.000Z",
  },
  {
    id: "cat-4",
    name: "Thiết kế UI/UX",
    slug: "thiet-ke-ui-ux",
    description: "Figma, Design System và thiết kế trải nghiệm người dùng",
    courseCount: 0,
    status: "ACTIVE",
    createdAt: "2026-08-10T11:00:00.000Z",
  },
];

let mockCategories: Category[] = [...INITIAL_CATEGORIES];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    await delay(100);
    return JSON.parse(JSON.stringify(mockCategories));
  },

  async createCategory(values: CategoryFormValues): Promise<Category> {
    await delay(100);
    const trimmedName = values.name.trim().toLowerCase();
    const isDuplicate = mockCategories.some(
      (c) => c.name.trim().toLowerCase() === trimmedName
    );
    if (isDuplicate) {
      throw new Error("Tên danh mục đã tồn tại trong hệ thống");
    }

    const trimmedSlug = values.slug.trim().toLowerCase();
    const isSlugDuplicate = mockCategories.some(
      (c) => c.slug.trim().toLowerCase() === trimmedSlug
    );
    if (isSlugDuplicate) {
      throw new Error("Đường dẫn (slug) đã tồn tại trong hệ thống");
    }

    const newCat: Category = {
      ...values,
      id: `cat-${Date.now()}`,
      courseCount: 0,
      createdAt: new Date().toISOString(),
    };
    mockCategories.unshift(newCat);
    return newCat;
  },

  async updateCategory(id: string, values: CategoryFormValues): Promise<Category> {
    await delay(100);
    const index = mockCategories.findIndex((c) => c.id === id);
    if (index === -1) throw new Error("Không tìm thấy danh mục để cập nhật");

    const trimmedName = values.name.trim().toLowerCase();
    const isDuplicate = mockCategories.some(
      (c) => c.id !== id && c.name.trim().toLowerCase() === trimmedName
    );
    if (isDuplicate) {
      throw new Error("Tên danh mục đã tồn tại trong hệ thống");
    }

    const trimmedSlug = values.slug.trim().toLowerCase();
    const isSlugDuplicate = mockCategories.some(
      (c) => c.id !== id && c.slug.trim().toLowerCase() === trimmedSlug
    );
    if (isSlugDuplicate) {
      throw new Error("Đường dẫn (slug) đã tồn tại trong hệ thống");
    }

    const updated: Category = {
      ...mockCategories[index],
      ...values,
    };
    mockCategories[index] = updated;
    return updated;
  },

  async deleteCategory(id: string): Promise<void> {
    await delay(100);
    const found = mockCategories.find((c) => c.id === id);
    if (found && found.courseCount > 0) {
      throw new Error(`Không thể xóa danh mục đang có ${found.courseCount} khóa học liên kết!`);
    }
    mockCategories = mockCategories.filter((c) => c.id !== id);
  },

  resetMockData(): void {
    mockCategories = JSON.parse(JSON.stringify(INITIAL_CATEGORIES));
  },
};
