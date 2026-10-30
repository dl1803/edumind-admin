import { apiClient } from "./api-client";
import {
  Instructor,
  InstructorListParams,
  InstructorStats,
  DeleteInstructorResponse,
  mapBackendInstructorToInstructor,
} from "@/types/instructor.types";
import { PaginatedResponse } from "@/types/api.types";
import {
  mockGetInstructors,
  mockGetInstructorStats,
  mockDeleteInstructor,
  mockUpdateInstructorStatus,
} from "./mock/instructor.mock";

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

export const instructorService = {
  async getInstructors(params?: InstructorListParams): Promise<PaginatedResponse<Instructor>> {
    if (isMockEnabled()) {
      return mockGetInstructors(params);
    }

    try {
      const queryParams: Record<string, string | number> = {
        page: params?.page || 1,
        page_size: params?.pageSize || 10,
      };

      if (params?.search) {
        queryParams.search = params.search;
      }
      if (params?.status && params.status !== "all") {
        queryParams.status = params.status;
      }

      const response = await apiClient.get<BackendPaginatedResponse<any> | PaginatedResponse<any>>(
        "/admin/instructors",
        { params: queryParams }
      );

      const resData = response.data;
      const rawItems: any[] = Array.isArray(resData)
        ? resData
        : "data" in resData && Array.isArray(resData.data)
        ? resData.data
        : "items" in resData && Array.isArray((resData as any).items)
        ? (resData as any).items
        : [];

      const items = rawItems.map(mapBackendInstructorToInstructor);

      return {
        items,
        total: ("total" in resData ? resData.total : rawItems.length) || 0,
        page: ("page" in resData ? resData.page : params?.page) || 1,
        pageSize:
          ("page_size" in resData
            ? (resData as any).page_size
            : "pageSize" in resData
            ? (resData as any).pageSize
            : params?.pageSize) || 10,
        totalPages:
          ("total_pages" in resData
            ? (resData as any).total_pages
            : "totalPages" in resData
            ? (resData as any).totalPages
            : 1) || 1,
      };
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn("API instructors gặp sự cố, tự động fallback sang mock data:", error);
        return mockGetInstructors(params);
      }
      throw error;
    }
  },

  async getInstructorStats(): Promise<InstructorStats> {
    if (isMockEnabled()) {
      return mockGetInstructorStats();
    }

    try {
      const res = await this.getInstructors({ page: 1, pageSize: 100 });
      const items = res.items;

      return {
        total: res.total,
        activeCount: items.filter((i) => i.isActive).length,
        suspendedCount: items.filter((i) => !i.isActive).length,
        totalCourses: items.reduce((sum, i) => sum + i.courseCount, 0),
      };
    } catch {
      return mockGetInstructorStats();
    }
  },

  async deleteInstructor(id: string): Promise<DeleteInstructorResponse> {
    if (isMockEnabled()) {
      const res = await mockDeleteInstructor(id);
      return {
        message: res.message,
        instructor_id: id,
        deleted: res.success,
      };
    }

    try {
      const response = await apiClient.delete<DeleteInstructorResponse>(
        `/admin/instructors/${id}`
      );
      return response.data;
    } catch (error: any) {
      if (process.env.NODE_ENV === "development" && (!error.response || error.response.status === 404)) {
        const res = await mockDeleteInstructor(id);
        return {
          message: res.message,
          instructor_id: id,
          deleted: res.success,
        };
      }
      throw error;
    }
  },

  async updateInstructorStatus(id: string, isActive: boolean): Promise<Instructor> {
    if (isMockEnabled()) {
      return mockUpdateInstructorStatus(id, isActive);
    }

    try {
      const response = await apiClient.patch<any>(`/admin/instructors/${id}/status`, {
        is_active: isActive,
      });
      const raw = "data" in response.data ? response.data.data : response.data;
      return mapBackendInstructorToInstructor(raw);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        return mockUpdateInstructorStatus(id, isActive);
      }
      throw error;
    }
  },
};

