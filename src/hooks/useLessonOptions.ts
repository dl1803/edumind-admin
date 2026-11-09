import { useMemo } from "react";
import { useCourseDetail, useCourses } from "@/hooks/useCourses";
import { SelectOption } from "@/components/ui/SelectDropdown";

export function useLessonOptions(courseId: string) {
  const coursesQuery = useCourses({ pageSize: 100 });
  const detailQuery = useCourseDetail(courseId || undefined);

  const courseOptions = useMemo<SelectOption[]>(
    () => (coursesQuery.data?.items ?? []).map((course) => ({ label: course.title, value: course.id })),
    [coursesQuery.data]
  );

  const lessonOptions = useMemo<SelectOption[]>(
    () =>
      (detailQuery.data?.chapters ?? []).flatMap((chapter) =>
        chapter.lessons.map((lesson) => ({
          label: `${chapter.title} · ${lesson.title}`,
          value: lesson.id,
        }))
      ),
    [detailQuery.data]
  );

  return {
    courseOptions,
    lessonOptions,
    isLoadingCourses: coursesQuery.isLoading,
    isLoadingLessons: Boolean(courseId) && detailQuery.isLoading,
    isError: coursesQuery.isError || detailQuery.isError,
  };
}

