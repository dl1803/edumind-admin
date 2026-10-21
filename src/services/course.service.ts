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

export const courseService = {
  async getCourses(params?: CourseListParams): Promise<PaginatedResponse<Course>> {
    if (isMockEnabled()) {
      return mockGetCourses(params);
    }
    const response = await apiClient.get<PaginatedResponse<Course>>("/courses", { params });
    return response.data;
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
    const response = await apiClient.post<Course>("/courses", payload);
    return response.data;
  },

  async updateCourse(id: string, payload: Partial<CoursePayload>): Promise<Course> {
    if (isMockEnabled()) {
      return mockUpdateCourse(id, payload);
    }
    const response = await apiClient.put<Course>(`/courses/${id}`, payload);
    return response.data;
  },

  async deleteCourse(id: string): Promise<{ success: boolean }> {
    if (isMockEnabled()) {
      return mockDeleteCourse(id);
    }
    const response = await apiClient.delete<{ success: boolean }>(`/courses/${id}`);
    return response.data;
  },

  async getCategories(): Promise<Category[]> {
    if (isMockEnabled()) {
      return MOCK_CATEGORIES;
    }
    const response = await apiClient.get<Category[]>("/categories");
    return response.data;
  },

  async getInstructors(): Promise<InstructorOption[]> {
    if (isMockEnabled()) {
      return MOCK_INSTRUCTORS;
    }
    const response = await apiClient.get<InstructorOption[]>("/instructors/options");
    return response.data;
  },
};
