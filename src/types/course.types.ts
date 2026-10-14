export type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface Category {
  id: string;
  name: string;
  slug?: string;
  courseCount?: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  categoryId: string;
  categoryName?: string;
  instructorId: string;
  instructorName: string;
  priceVnd: number;
  status: CourseStatus;
  studentCount: number;
  lessonCount: number;
  chapterCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CourseListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: CourseStatus | "";
  categoryId?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface CoursePayload {
  title: string;
  description: string;
  categoryId: string;
  instructorId: string;
  priceVnd: number;
  status: CourseStatus;
  thumbnailUrl?: string;
}
