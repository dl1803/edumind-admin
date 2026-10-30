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

export function mapBackendInstructorToInstructor(raw: any): Instructor {
  const rawTitle = raw.title || "";
  let degree = rawTitle;
  let workplace = raw.workplace || "";

  if (!workplace && rawTitle.includes(" - ")) {
    const parts = rawTitle.split(" - ");
    degree = parts[0].trim();
    workplace = parts.slice(1).join(" - ").trim();
  }

  return {
    id: raw.id || "",
    fullName: raw.name || raw.fullName || "Chưa đặt tên",
    avatarUrl: raw.avatar_url || raw.avatarUrl || null,
    degree: degree || "Giảng viên",
    workplace: workplace || undefined,
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

