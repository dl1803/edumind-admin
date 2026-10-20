export type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface Category {
  id: string;
  name: string;
  slug?: string;
  courseCount?: number;
}

export interface Lesson {
  id: string;
  title: string;
  durationSeconds?: number;
  videoUrl?: string;
  isPreview?: boolean;
  order: number;
}

export interface Chapter {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface InstructorOption {
  id: string;
  name: string;
  title: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
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
  chapters?: Chapter[];
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
  shortDescription?: string;
  categoryId: string;
  instructorId: string;
  priceVnd: number;
  status: CourseStatus;
  thumbnailUrl?: string;
  chapters?: Chapter[];
}

export interface CourseFormValues {
  title: string;
  shortDescription?: string;
  description: string;
  categoryId: string;
  instructorId: string;
  priceVnd: number;
  thumbnailUrl?: string;
  status: CourseStatus;
  chapters: Chapter[];
}
