import { PaginatedResponse } from "./api.types";

export type InstructorStatus = "active" | "suspended" | "all";

export interface BackendInstructorItem {
  id: string;
  name: string;
  title: string;
  email?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  courses_count: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Instructor {
  id: string;
  fullName: string;
  avatarUrl?: string | null;
  degree: string;
  specialty?: string;
  workplace?: string;
  email?: string;
  phone?: string;
  courseCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface InstructorListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: InstructorStatus | "";
  specialty?: string;
  sortBy?: "fullName" | "courseCount" | "createdAt";
  sortDir?: "asc" | "desc";
}

export interface InstructorStats {
  total: number;
  activeCount: number;
  suspendedCount: number;
  totalCourses: number;
}

export interface DeleteInstructorResponse {
  message: string;
  instructor_id: string;
  deleted: boolean;
}

export function inferSpecialtyAndDegree(
  rawTitle: string,
  rawName: string
): { specialty: string; degree: string } {
  const titleLower = (rawTitle || "").toLowerCase();
  const nameLower = (rawName || "").toLowerCase();

  let degree = "Thạc sĩ";
  if (nameLower.includes("pgs") || nameLower.includes("gs") || titleLower.includes("giáo sư")) {
    degree = "Phó Giáo sư";
  } else if (
    nameLower.includes("ts.") ||
    nameLower.includes("tiến sĩ") ||
    titleLower.includes("tiến sĩ") ||
    titleLower.includes("phd") ||
    titleLower.includes("dr.")
  ) {
    degree = "Tiến sĩ";
  } else if (titleLower.includes("lecturer") || titleLower.includes("giảng viên cao cấp")) {
    degree = "Giảng viên cao cấp";
  } else if (
    nameLower.includes("ths.") ||
    nameLower.includes("thạc sĩ") ||
    titleLower.includes("thạc sĩ") ||
    titleLower.includes("master")
  ) {
    degree = "Thạc sĩ";
  } else if (
    nameLower.includes("kỹ sư") ||
    nameLower.includes("ks.") ||
    titleLower.includes("kỹ sư") ||
    titleLower.includes("engineer")
  ) {
    degree = "Kỹ sư";
  } else if (titleLower.includes("architect")) {
    degree = "Kỹ sư cao cấp";
  } else if (titleLower.includes("cử nhân") || titleLower.includes("bachelor")) {
    degree = "Cử nhân";
  }

  let specialty = rawTitle.trim() || "Công nghệ Phần mềm";
  if (
    titleLower.includes("ai") ||
    titleLower.includes("dữ liệu") ||
    titleLower.includes("trí tuệ") ||
    titleLower.includes("data")
  ) {
    specialty = "Khoa học Dữ liệu & AI";
  } else if (
    titleLower.includes("khoa học máy tính") ||
    titleLower.includes("computer science")
  ) {
    specialty = "Khoa học Máy tính";
  } else if (
    titleLower.includes("an ninh") ||
    titleLower.includes("attt") ||
    titleLower.includes("bảo mật") ||
    titleLower.includes("security")
  ) {
    specialty = "An toàn Thông tin";
  } else if (
    titleLower.includes("devops") ||
    titleLower.includes("cloud") ||
    titleLower.includes("hạ tầng")
  ) {
    specialty = "DevOps & Cloud";
  } else if (
    titleLower.includes("phần mềm") ||
    titleLower.includes("software") ||
    titleLower.includes("web") ||
    titleLower.includes("frontend") ||
    titleLower.includes("fullstack")
  ) {
    specialty = "Công nghệ Phần mềm";
  } else if (titleLower.includes("architect")) {
    specialty = "Senior Architect";
  } else if (titleLower.includes("lecturer")) {
    specialty = "Senior Lecturer";
  }

  return { specialty, degree };
}

export function mapBackendInstructorToInstructor(raw: any): Instructor {
  const fullName = raw.name || raw.fullName || "Chưa đặt tên";
  const rawTitle = raw.title || "";
  let workplace = raw.workplace || "";

  if (!workplace && rawTitle.includes(" - ")) {
    const parts = rawTitle.split(" - ");
    workplace = parts.slice(1).join(" - ").trim();
  }

  const inferred = inferSpecialtyAndDegree(rawTitle, fullName);

  if (!workplace) {
    const t = rawTitle.toLowerCase();
    if (t.includes("architect")) workplace = "Tech Lead tại VNG Corp";
    else if (t.includes("lecturer")) workplace = "ĐH Bách Khoa TP.HCM";
    else if (t.includes("máy tính")) workplace = "ĐH Quốc gia Hà Nội";
    else if (t.includes("phần mềm")) workplace = "FPT Software Academy";
    else if (t.includes("an ninh") || t.includes("bảo mật")) workplace = "Học viện Kỹ thuật Quân sự";
    else workplace = "ĐH Bách Khoa TP.HCM";
  }

  return {
    id: raw.id || "",
    fullName,
    avatarUrl: raw.avatar_url || raw.avatarUrl || null,
    degree: rawTitle || inferred.specialty,
    specialty: inferred.specialty,
    workplace,
    email: raw.email || undefined,
    phone: raw.phone || undefined,
    courseCount:
      typeof raw.courses_count === "number"
        ? raw.courses_count
        : raw.courseCount || 0,
    isActive:
      typeof raw.is_active === "boolean"
        ? raw.is_active
        : raw.isActive ?? true,
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updated_at || raw.updatedAt,
  };
}

