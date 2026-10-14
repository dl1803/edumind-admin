import { apiClient } from "./api-client";
import { Course, CourseListParams, CoursePayload, Category } from "@/types/course.types";
import { PaginatedResponse } from "@/types/api.types";
import { mockGetCourses, mockGetCourseById, MOCK_CATEGORIES } from "./mock/course.mock";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export const courseService = {
  async getCourses(params?: CourseListParams): Promise<PaginatedResponse<Course>> {
    if (USE_MOCK) {
      return mockGetCourses(params);
    }
    const response = await apiClient.get<PaginatedResponse<Course>>("/courses", { params });
    return response.data;
  },

  async getCourseById(id: string): Promise<Course> {
    if (USE_MOCK) {
      return mockGetCourseById(id);
    }
    const response = await apiClient.get<Course>(`/courses/${id}`);
    return response.data;
  },

  async createCourse(payload: CoursePayload): Promise<Course> {
    if (USE_MOCK) {
      return {
        id: `crs-${Date.now()}`,
        ...payload,
        instructorName: "Giảng viên EduMind",
        studentCount: 0,
        lessonCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    const response = await apiClient.post<Course>("/courses", payload);
    return response.data;
  },

  async updateCourse(id: string, payload: Partial<CoursePayload>): Promise<Course> {
    if (USE_MOCK) {
      const existing = await mockGetCourseById(id);
      return { ...existing, ...payload, updatedAt: new Date().toISOString() };
    }
    const response = await apiClient.put<Course>(`/courses/${id}`, payload);
    return response.data;
  },

  async deleteCourse(id: string): Promise<{ success: boolean }> {
    if (USE_MOCK) {
      return { success: true };
    }
    const response = await apiClient.delete<{ success: boolean }>(`/courses/${id}`);
    return response.data;
  },

  async getCategories(): Promise<Category[]> {
    if (USE_MOCK) {
      return MOCK_CATEGORIES;
    }
    const response = await apiClient.get<Category[]>("/categories");
    return response.data;
  },
};
