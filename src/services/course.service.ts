import { apiClient } from "./api-client";
import {
  Course,
  CourseListParams,
  CoursePayload,
  Category,
  InstructorOption,
} from "@/types/course.types";
import { PaginatedResponse } from "@/types/api.types";
import {
  mockGetCourses,
  mockGetCourseById,
  mockCreateCourse,
  mockDeleteCourse,
  mockUpdateCourse,
  MOCK_CATEGORIES,
  MOCK_INSTRUCTORS,
} from "./mock/course.mock";

function isMockEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK === "true";
}

interface BackendPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export const courseService = {
  async getCourses(params?: CourseListParams): Promise<PaginatedResponse<Course>> {
    if (isMockEnabled()) {
      return mockGetCourses(params);
    }

    const queryParams: Record<string, unknown> = {};
    if (params?.page) queryParams.page = params.page;
    if (params?.pageSize) queryParams.page_size = params.pageSize;
    if (params?.search) queryParams.search = params.search;
    if (params?.status) queryParams.status = params.status.toLowerCase();
    if (params?.categoryId) queryParams.category_id = params.categoryId;
    if (params?.sortBy) queryParams.sort_by = params.sortBy;

    const response = await apiClient.get<BackendPaginatedResponse<Course> | PaginatedResponse<Course>>(
      "/courses",
      { params: queryParams }
    );

    const resData = response.data;
    if ("data" in resData && Array.isArray(resData.data)) {
      return {
        items: resData.data,
        total: resData.total,
        page: resData.page,
        pageSize: resData.page_size,
        totalPages: resData.total_pages,
      };
    }
    return resData as PaginatedResponse<Course>;
  },

  async getCourseById(id: string): Promise<Course> {
    if (isMockEnabled()) {
      return mockGetCourseById(id);
    }
    const response = await apiClient.get<Course>(`/courses/${id}`);
    return response.data;
  },

  async createCourse(payload: CoursePayload): Promise<Course> {
    if (isMockEnabled()) {
      return mockCreateCourse(payload);
    }
    const response = await apiClient.post<Course>("/admin/courses", payload);
    return response.data;
  },

  async updateCourse(id: string, payload: Partial<CoursePayload>): Promise<Course> {
    if (isMockEnabled()) {
      return mockUpdateCourse(id, payload);
    }
    const response = await apiClient.put<Course>(`/admin/courses/${id}`, payload);
    return response.data;
  },

  async deleteCourse(id: string): Promise<{ success: boolean }> {
    if (isMockEnabled()) {
      return mockDeleteCourse(id);
    }
    const response = await apiClient.delete<{ success: boolean }>(`/admin/courses/${id}`);
    return response.data;
  },

  async getCategories(): Promise<Category[]> {
    if (isMockEnabled()) {
      return MOCK_CATEGORIES;
    }
    const response = await apiClient.get<{ data: Category[] } | Category[]>("/categories");
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.data;
  },

  async getInstructors(): Promise<InstructorOption[]> {
    if (isMockEnabled()) {
      return MOCK_INSTRUCTORS;
    }
    const response = await apiClient.get<{ data: InstructorOption[] } | InstructorOption[]>("/instructors/options");
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.data;
  },
};
