import { apiClient } from "./api-client";
import {
  Course,
  CourseListParams,
  CoursePayload,
  Category,
  InstructorOption,
  Chapter,
  Lesson,
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

function mapBackendCourseToCourse(item: any): Course {
  let status: Course["status"] = "DRAFT";
  const rawStatus = (item.status || "").toUpperCase();
  if (rawStatus === "PUBLISHED" || rawStatus === "DRAFT" || rawStatus === "ARCHIVED") {
    status = rawStatus as Course["status"];
  } else if (rawStatus === "HIDDEN") {
    status = "ARCHIVED";
  }

  // Chuẩn hóa giá VND từ BE Staging (loại bỏ sai số làm tròn tỷ giá USD -> VND do BE)
  let price = Number(item.price ?? item.price_vnd ?? item.priceVnd ?? 0);
  if (price > 1000 && Math.abs(price - Math.round(price / 1000) * 1000) < 100) {
    price = Math.round(price / 1000) * 1000;
  }

  const rawChapters = Array.isArray(item.chapters) ? item.chapters : [];
  const mappedChapters: Chapter[] | undefined =
    rawChapters.length > 0 || Array.isArray(item.chapters)
      ? rawChapters.map((ch: any, idx: number) => ({
          id: ch.id || `chap-${idx + 1}`,
          title: ch.title || `Chương ${idx + 1}`,
          order: ch.order ?? idx + 1,
          lessons: Array.isArray(ch.lessons)
            ? ch.lessons.map((les: any, lIdx: number) => ({
                id: les.id || `les-${lIdx + 1}`,
                title: les.title || `Bài ${lIdx + 1}`,
                order: les.order ?? lIdx + 1,
                durationSeconds: les.duration ?? les.durationSeconds ?? 0,
                videoUrl: les.hls_stream_url || les.videoUrl,
                isPreview: les.is_locked === false || les.isPreview === true,
              }))
            : [],
        }))
      : undefined;

  return {
    id: item.id,
    title: item.title || "",
    description: item.description || "",
    shortDescription:
      item.short_description ||
      item.shortDescription ||
      (typeof item.description === "string"
        ? item.description.replace(/<[^>]*>/g, "").slice(0, 200)
        : undefined),
    categoryId: item.category?.id || item.category_id || item.categoryId || "",
    categoryName: item.category?.name || item.category_name || item.categoryName,
    instructorId: item.instructor?.id || item.instructor_id || item.instructorId || "",
    instructorName:
      item.instructor?.name || item.instructor_name || item.instructorName || "Giảng viên EduMind",
    instructorTitle: item.instructor?.title || item.instructor_title || item.instructorTitle,
    priceVnd: price,
    status,
    studentCount: item.enrolled_count ?? item.student_count ?? item.studentCount ?? 0,
    lessonCount: item.lesson_count ?? item.total_lessons ?? item.lessonCount ?? 0,
    chapterCount: item.chapter_count ?? rawChapters.length ?? item.chapterCount ?? 0,
    thumbnailUrl: item.thumbnail_url || item.thumbnailUrl,
    createdAt: item.created_at || item.createdAt || new Date().toISOString(),
    updatedAt: item.updated_at || item.updatedAt || new Date().toISOString(),
    chapters: mappedChapters,
  };
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
    if (params?.status) {
      const s = params.status.toLowerCase();
      queryParams.status = s === "archived" ? "hidden" : s;
    }
    if (params?.categoryId) queryParams.category_id = params.categoryId;

    // Ánh xạ sortBy sang 4 giá trị enum hợp lệ của Backend Staging (08 §2.3)
    if (params?.sortBy === "priceVnd" || params?.sortBy === "price") {
      queryParams.sort_by = params.sortDir === "asc" ? "price_asc" : "price_desc";
    } else if (params?.sortBy === "studentCount" || params?.sortBy === "enrolledCount") {
      queryParams.sort_by = "recommended";
    } else {
      queryParams.sort_by = "newest";
    }

    const response = await apiClient.get<BackendPaginatedResponse<any> | PaginatedResponse<any>>(
      "/courses",
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

    const items = rawItems.map(mapBackendCourseToCourse);

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
  },

  async getCourseById(id: string): Promise<Course> {
    if (isMockEnabled()) {
      return mockGetCourseById(id);
    }
    const response = await apiClient.get<any>(`/courses/${id}`);
    const raw =
      "data" in response.data && !("id" in response.data)
        ? (response.data as any).data
        : response.data;
    return mapBackendCourseToCourse(raw);
  },

  async createCourse(payload: CoursePayload): Promise<Course> {
    if (isMockEnabled()) {
      return mockCreateCourse(payload);
    }

    const formData = new FormData();
    formData.append("title", payload.title);
    const desc = payload.description || payload.shortDescription || "";
    if (desc) {
      formData.append("description", desc);
    }
    formData.append("category_id", payload.categoryId);
    if (payload.instructorId) {
      formData.append("instructor_id", payload.instructorId);
    }
    formData.append("price", String(payload.priceVnd ?? 0));

    const rawStatus = (payload.status || "draft").toLowerCase();
    const status = rawStatus === "archived" ? "hidden" : rawStatus;
    formData.append("status", status);

    if (payload.thumbnailFile) {
      formData.append("thumbnail", payload.thumbnailFile);
    }

    const response = await apiClient.post<any>("/admin/courses", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const raw =
      "data" in response.data && !("id" in response.data)
        ? response.data.data
        : response.data;

    const courseId = raw?.id;
    if (courseId && payload.chapters && payload.chapters.length > 0) {
      await this.syncCourseChapters(courseId, payload.chapters);
    }

    return mapBackendCourseToCourse(raw);
  },

  async syncCourseChapters(courseId: string, chapters: Chapter[]): Promise<void> {
    if (isMockEnabled() || !chapters) return;

    try {
      // 1. Lấy thông tin chapters hiện tại từ BE để phân loại thêm mới / sửa / xóa
      let existingChapters: any[] = [];
      try {
        const currentCourseRes = await apiClient.get<any>(`/courses/${courseId}`);
        const currentRaw =
          "data" in currentCourseRes.data && !("id" in currentCourseRes.data)
            ? currentCourseRes.data.data
            : currentCourseRes.data;
        if (Array.isArray(currentRaw.chapters)) {
          existingChapters = currentRaw.chapters;
        }
      } catch (err) {
        console.warn("Could not fetch existing chapters for diffing:", err);
      }

      // Xóa chapters không còn tồn tại trên form UI
      const currentChapterIds = new Set(chapters.map((c) => c.id));
      for (const exChap of existingChapters) {
        if (!currentChapterIds.has(exChap.id)) {
          try {
            await apiClient.delete(`/admin/chapters/${exChap.id}`);
          } catch (e) {
            console.warn(`Failed to delete chapter ${exChap.id}:`, e);
          }
        }
      }

      // 2. Tạo mới hoặc cập nhật chapters
      for (let cIdx = 0; cIdx < chapters.length; cIdx++) {
        const chap = chapters[cIdx];
        const chapterOrder = chap.order ?? cIdx + 1;
        let realChapterId = chap.id;

        if (chap.id.startsWith("chap-")) {
          // Tạo mới chương trên BE
          const res = await apiClient.post<any>(`/admin/courses/${courseId}/chapters`, {
            title: chap.title.trim() || `Chương ${cIdx + 1}`,
            order: chapterOrder,
          });
          const createdChap = res.data?.data || res.data;
          realChapterId = createdChap?.id || createdChap?.chapter_id || chap.id;
        } else {
          // Cập nhật tên hoặc thứ tự chương
          try {
            await apiClient.put<any>(`/admin/chapters/${chap.id}`, {
              title: chap.title.trim() || `Chương ${cIdx + 1}`,
              order: chapterOrder,
            });
          } catch (e) {
            console.warn(`Failed to update chapter ${chap.id}:`, e);
          }
        }

        // 3. Xử lý các bài giảng trong chương
        if (Array.isArray(chap.lessons) && chap.lessons.length > 0) {
          const exChap = existingChapters.find((ec) => ec.id === chap.id);
          const exLessons: any[] = Array.isArray(exChap?.lessons) ? exChap.lessons : [];
          const currentLessonIds = new Set(chap.lessons.map((l) => l.id));

          // Xóa bài giảng đã bị remove
          for (const exLes of exLessons) {
            if (!currentLessonIds.has(exLes.id)) {
              try {
                await apiClient.delete(`/admin/lessons/${exLes.id}`);
              } catch (e) {
                console.warn(`Failed to delete lesson ${exLes.id}:`, e);
              }
            }
          }

          // Tạo mới hoặc cập nhật bài giảng
          for (let lIdx = 0; lIdx < chap.lessons.length; lIdx++) {
            const les = chap.lessons[lIdx];
            const lessonOrder = les.order ?? lIdx + 1;
            const lessonFormData = new FormData();
            let safeTitle = (les.title || "").trim();
            if (safeTitle.length < 5) {
              safeTitle = safeTitle ? `${safeTitle} (bài giảng)` : `Bài giảng ${lIdx + 1}`;
            }
            lessonFormData.append("title", safeTitle);
            lessonFormData.append("order", String(lessonOrder));

            try {
              if (les.id.startsWith("les-")) {
                // Tạo mới bài giảng
                await apiClient.post<any>(
                  `/admin/chapters/${realChapterId}/lessons`,
                  lessonFormData,
                  { headers: { "Content-Type": "multipart/form-data" } }
                );
              } else {
                // Cập nhật tiêu đề bài giảng
                await apiClient.put<any>(
                  `/admin/lessons/${les.id}`,
                  lessonFormData,
                  { headers: { "Content-Type": "multipart/form-data" } }
                );
              }
            } catch (err) {
              console.warn(`Failed to sync lesson ${les.title}:`, err);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error syncing course chapters:", error);
    }
  },

  async updateCourse(id: string, payload: Partial<CoursePayload>): Promise<Course> {
    if (isMockEnabled()) {
      return mockUpdateCourse(id, payload);
    }

    const formData = new FormData();
    if (payload.title !== undefined) formData.append("title", payload.title);
    const desc = payload.description || payload.shortDescription;
    if (desc !== undefined) formData.append("description", desc);
    if (payload.categoryId !== undefined) formData.append("category_id", payload.categoryId);
    if (payload.instructorId !== undefined) formData.append("instructor_id", payload.instructorId);
    if (payload.priceVnd !== undefined) formData.append("price", String(payload.priceVnd));
    if (payload.status !== undefined) {
      const s = payload.status.toLowerCase();
      formData.append("status", s === "archived" ? "hidden" : s);
    }
    if (payload.thumbnailFile) {
      formData.append("thumbnail", payload.thumbnailFile);
    }

    const response = await apiClient.put<any>(`/admin/courses/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (payload.chapters) {
      await this.syncCourseChapters(id, payload.chapters);
    }

    const raw =
      "data" in response.data && !("id" in response.data)
        ? response.data.data
        : response.data;
    return mapBackendCourseToCourse(raw);
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
    const response = await apiClient.get<{ data: InstructorOption[] } | InstructorOption[]>(
      "/instructors/options"
    );
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.data;
  },
};
