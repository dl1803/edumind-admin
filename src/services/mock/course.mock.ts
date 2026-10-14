import { Course, Category, CourseListParams } from "@/types/course.types";
import { PaginatedResponse, ApiError } from "@/types/api.types";

export const MOCK_CATEGORIES: Category[] = [
  { id: "cat-1", name: "Lập trình Python", slug: "python" },
  { id: "cat-2", name: "Khoa học Dữ liệu & AI", slug: "ai" },
  { id: "cat-3", name: "Phát triển Web", slug: "web" },
  { id: "cat-4", name: "Thiết kế UI/UX", slug: "uiux" },
];

export const MOCK_COURSES: Course[] = [
  {
    id: "crs-01",
    title: "Nhập môn Lập trình Python với AI",
    description: "Khóa học nền tảng lập trình Python ứng dụng trí tuệ nhân tạo.",
    thumbnailUrl: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400",
    categoryId: "cat-1",
    categoryName: "Lập trình Python",
    instructorId: "inst-01",
    instructorName: "TS. Lê Hoàng Nam",
    priceVnd: 499000,
    status: "PUBLISHED",
    studentCount: 1250,
    lessonCount: 42,
    chapterCount: 4,
    createdAt: "2026-08-14T08:00:00Z",
    updatedAt: "2026-10-10T09:30:00Z",
  },
  {
    id: "crs-02",
    title: "Xây dựng Ứng dụng RAG với LangChain",
    description: "Kỹ thuật nâng cao xây dựng chatbot thông minh truy xuất dữ liệu doanh nghiệp.",
    thumbnailUrl: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=400",
    categoryId: "cat-2",
    categoryName: "Khoa học Dữ liệu & AI",
    instructorId: "inst-02",
    instructorName: "ThS. Trần Trung",
    priceVnd: 799000,
    status: "PUBLISHED",
    studentCount: 840,
    lessonCount: 32,
    chapterCount: 5,
    createdAt: "2026-08-20T10:00:00Z",
    updatedAt: "2026-10-12T14:15:00Z",
  },
  {
    id: "crs-03",
    title: "Next.js 14 Toàn tập từ Cơ bản đến Nâng cao",
    description: "Xây dựng ứng dụng Fullstack hiện đại với App Router và Server Actions.",
    thumbnailUrl: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=400",
    categoryId: "cat-3",
    categoryName: "Phát triển Web",
    instructorId: "inst-03",
    instructorName: "Kỹ sư Phạm Quốc Bảo",
    priceVnd: 599000,
    status: "DRAFT",
    studentCount: 0,
    lessonCount: 28,
    chapterCount: 3,
    createdAt: "2026-09-01T11:00:00Z",
    updatedAt: "2026-10-11T16:00:00Z",
  },
  {
    id: "crs-04",
    title: "Thiết kế Giao diện UI/UX với Figma Chuyên nghiệp",
    description: "Quy chuẩn thiết kế Design System cho sản phẩm thực tế.",
    thumbnailUrl: "https://images.unsplash.com/photo-1581291518655-9523c932deb8?w=400",
    categoryId: "cat-4",
    categoryName: "Thiết kế UI/UX",
    instructorId: "inst-04",
    instructorName: "ThS. Nguyễn Thị Mai",
    priceVnd: 450000,
    status: "ARCHIVED",
    studentCount: 320,
    lessonCount: 25,
    chapterCount: 4,
    createdAt: "2026-07-15T09:00:00Z",
    updatedAt: "2026-09-20T10:00:00Z",
  },
  {
    id: "crs-05",
    title: "Deep Learning và Thị giác Máy tính (Computer Vision)",
    description: "Huấn luyện mô hình nhận diện khuôn mặt và vật thể thực tế.",
    thumbnailUrl: undefined,
    categoryId: "cat-2",
    categoryName: "Khoa học Dữ liệu & AI",
    instructorId: "inst-02",
    instructorName: "ThS. Trần Trung",
    priceVnd: 990000,
    status: "PUBLISHED",
    studentCount: 650,
    lessonCount: 48,
    chapterCount: 6,
    createdAt: "2026-08-25T14:00:00Z",
    updatedAt: "2026-10-09T08:00:00Z",
  },
  ...Array.from({ length: 20 }, (_, idx) => {
    const num = idx + 6;
    const cat = MOCK_CATEGORIES[idx % MOCK_CATEGORIES.length];
    const status: Course["status"] = idx % 5 === 0 ? "DRAFT" : idx % 7 === 0 ? "ARCHIVED" : "PUBLISHED";
    return {
      id: `crs-${num < 10 ? `0${num}` : num}`,
      title: `Khóa học Chuyên đề EduMind số ${num} - ${cat.name}`,
      description: `Mô tả tóm tắt nội dung khóa học thực hành ${cat.name} số ${num}.`,
      thumbnailUrl: `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400`,
      categoryId: cat.id,
      categoryName: cat.name,
      instructorId: `inst-0${(idx % 4) + 1}`,
      instructorName: ["TS. Lê Hoàng Nam", "ThS. Trần Trung", "Kỹ sư Phạm Quốc Bảo", "ThS. Nguyễn Thị Mai"][idx % 4],
      priceVnd: (300 + (idx % 8) * 100) * 1000,
      status,
      studentCount: status === "DRAFT" ? 0 : 50 + idx * 45,
      lessonCount: 15 + (idx % 25),
      chapterCount: 3 + (idx % 4),
      createdAt: `2026-09-${(idx % 25) + 1 < 10 ? `0${(idx % 25) + 1}` : (idx % 25) + 1}T10:00:00Z`,
      updatedAt: "2026-10-12T10:00:00Z",
    };
  }),
];

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function mockGetCourses(params?: CourseListParams): Promise<PaginatedResponse<Course>> {
  await delay(600);

  let result = [...MOCK_COURSES];

  if (params?.search) {
    const q = params.search.toLowerCase();
    result = result.filter(
      (c) => c.title.toLowerCase().includes(q) || c.instructorName.toLowerCase().includes(q)
    );
  }

  if (params?.status) {
    result = result.filter((c) => c.status === params.status);
  }

  if (params?.categoryId) {
    result = result.filter((c) => c.categoryId === params.categoryId);
  }

  if (params?.sortBy) {
    result.sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[params.sortBy!];
      const bVal = (b as unknown as Record<string, unknown>)[params.sortBy!];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return params.sortDir === "desc" ? bVal - aVal : aVal - bVal;
      }
      return params.sortDir === "desc"
        ? String(bVal).localeCompare(String(aVal), "vi")
        : String(aVal).localeCompare(String(bVal), "vi");
    });
  }

  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const total = result.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const start = (page - 1) * pageSize;
  const items = result.slice(start, start + pageSize);

  return { items, total, page, pageSize, totalPages };
}

export async function mockGetCourseById(id: string): Promise<Course> {
  await delay(400);
  const found = MOCK_COURSES.find((c) => c.id === id);
  if (!found) {
    const error: ApiError = {
      code: "NOT_FOUND",
      message: `Khóa học với mã ${id} không tồn tại trong hệ thống.`,
    };
    throw error;
  }
  return found;
}
