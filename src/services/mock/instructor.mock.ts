import { Instructor, InstructorListParams, InstructorStats } from "@/types/instructor.types";
import { PaginatedResponse } from "@/types/api.types";

export const INITIAL_MOCK_INSTRUCTORS: Instructor[] = [
  {
    id: "GV-2026-0001",
    fullName: "TS. Lê Hoàng Nam",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
    degree: "Kỹ thuật Dữ liệu & AI",
    workplace: "ĐH Bách Khoa TP.HCM",
    email: "nam.le@edumind.edu.vn",
    phone: "0901234561",
    courseCount: 3,
    isActive: true,
    createdAt: "2026-09-15T08:30:00.000Z",
  },
  {
    id: "GV-2026-0002",
    fullName: "PGS.TS. Trần Minh Đức",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    degree: "Trí tuệ Nhân tạo & LLM",
    workplace: "ĐH Quốc gia Hà Nội",
    email: "duc.tran@edumind.edu.vn",
    phone: "0901234562",
    courseCount: 4,
    isActive: true,
    createdAt: "2026-09-18T09:15:00.000Z",
  },
  {
    id: "GV-2026-0003",
    fullName: "ThS. Nguyễn Thị Mai",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80",
    degree: "Frontend & Fullstack JS",
    workplace: "FPT Software Academy",
    email: "mai.nguyen@edumind.edu.vn",
    phone: "0901234563",
    courseCount: 2,
    isActive: true,
    createdAt: "2026-09-20T14:00:00.000Z",
  },
  {
    id: "GV-2026-0004",
    fullName: "TS. Vũ Hoài An",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
    degree: "An ninh mạng & ATTT",
    workplace: "Học viện Kỹ thuật Quân sự",
    email: "an.vu@edumind.edu.vn",
    phone: "0901234564",
    courseCount: 1,
    isActive: false,
    createdAt: "2026-09-22T10:20:00.000Z",
  },
  {
    id: "GV-2026-0005",
    fullName: "Kỹ sư Phạm Quốc Huy",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80",
    degree: "DevOps, Docker & K8s",
    workplace: "Tech Lead tại VNG Corp",
    email: "huy.pham@edumind.edu.vn",
    phone: "0901234565",
    courseCount: 0,
    isActive: true,
    createdAt: "2026-09-24T16:45:00.000Z",
  },
];

let mockInstructorsDb: Instructor[] = [...INITIAL_MOCK_INSTRUCTORS];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function resetMockInstructorsDb() {
  mockInstructorsDb = [...INITIAL_MOCK_INSTRUCTORS];
}

export async function mockGetInstructors(
  params?: InstructorListParams
): Promise<PaginatedResponse<Instructor>> {
  await delay(200);

  let filtered = [...mockInstructorsDb];

  if (params?.search) {
    const q = params.search.trim().toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.fullName.toLowerCase().includes(q) ||
        item.degree.toLowerCase().includes(q) ||
        (item.workplace && item.workplace.toLowerCase().includes(q)) ||
        (item.email && item.email.toLowerCase().includes(q))
    );
  }

  if (params?.status && params.status !== "all") {
    if (params.status === "active") {
      filtered = filtered.filter((i) => i.isActive);
    } else if (params.status === "suspended") {
      filtered = filtered.filter((i) => !i.isActive);
    }
  }

  const sortBy = params?.sortBy || "createdAt";
  const sortDir = params?.sortDir || "desc";

  filtered.sort((a, b) => {
    let comparison = 0;
    if (sortBy === "fullName") {
      comparison = a.fullName.localeCompare(b.fullName, "vi");
    } else if (sortBy === "courseCount") {
      comparison = a.courseCount - b.courseCount;
    } else {
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return sortDir === "asc" ? comparison : -comparison;
  });

  const page = Math.max(1, params?.page || 1);
  const pageSize = Math.max(1, params?.pageSize || 10);
  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const startIndex = (page - 1) * pageSize;
  const paginatedItems = filtered.slice(startIndex, startIndex + pageSize);

  return {
    items: paginatedItems,
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function mockGetInstructorStats(): Promise<InstructorStats> {
  await delay(100);
  const total = mockInstructorsDb.length;
  const activeCount = mockInstructorsDb.filter((i) => i.isActive).length;
  const suspendedCount = mockInstructorsDb.filter((i) => !i.isActive).length;
  const totalCourses = mockInstructorsDb.reduce((sum, i) => sum + i.courseCount, 0);

  return {
    total,
    activeCount,
    suspendedCount,
    totalCourses,
  };
}

export async function mockDeleteInstructor(id: string): Promise<{ success: boolean; message: string }> {
  await delay(300);
  const target = mockInstructorsDb.find((i) => i.id === id);
  if (!target) {
    throw new Error("Không tìm thấy thông tin giảng viên");
  }

  if (target.courseCount > 0) {
    const error: any = new Error(
      "Không thể xóa giảng viên đang phụ trách khóa học đang phát hành. Vui lòng chuyển giao khóa học trước."
    );
    error.code = "INSTRUCTOR_HAS_ACTIVE_COURSES";
    error.response = {
      status: 400,
      data: {
        error: {
          code: "INSTRUCTOR_HAS_ACTIVE_COURSES",
          message: error.message,
        },
      },
    };
    throw error;
  }

  mockInstructorsDb = mockInstructorsDb.filter((i) => i.id !== id);
  return {
    success: true,
    message: `Đã xóa giảng viên ${target.fullName} thành công`,
  };
}

