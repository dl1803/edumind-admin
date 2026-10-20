"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CourseForm } from "@/components/course/CourseForm";
import { useCourseDetail, useSaveCourse } from "@/hooks/useCourses";
import { CourseFormValues } from "@/types/course.types";
import { Skeleton } from "@/components/ui/Skeleton";
import { TopBarContent } from "@/context/TopBarContext";
import { ArrowLeft, CaretRight, WarningCircle } from "@phosphor-icons/react";

export default function EditCoursePage() {
  const params = useParams();
  const courseId = params?.id as string;
  const router = useRouter();

  const { data: course, isLoading, isError } = useCourseDetail(courseId);
  const { save, isPending } = useSaveCourse(courseId);

  const handleUpdate = async (values: CourseFormValues) => {
    try {
      await save(values);
      router.push("/courses");
    } catch {
      // Error is handled by mutation onError toast
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-8 w-80" />
        </div>
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8 space-y-6">
            <Skeleton className="h-96 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
          <div className="col-span-4 space-y-6">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="text-center py-20 space-y-4 max-w-md mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto text-2xl font-bold border border-red-100">
          <WarningCircle size={32} />
        </div>
        <h2 className="text-base font-bold text-neutral-800">Không tìm thấy khóa học</h2>
        <p className="text-xs text-neutral-500">
          Mã định danh khóa học không tồn tại hoặc đã bị xóa khỏi hệ thống.
        </p>
        <Link
          href="/courses"
          className="inline-block px-5 py-2 text-xs font-bold text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition"
        >
          Quay lại danh sách khóa học
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <TopBarContent
        breadcrumb={
          <div className="flex items-center gap-2 text-xs">
            <Link href="/courses" className="text-neutral-500 hover:text-purple-700 font-medium transition">
              Khóa học
            </Link>
            <CaretRight size={10} className="text-neutral-400" />
            <Link href="/courses" className="text-neutral-500 hover:text-purple-700 font-medium transition">
              Danh sách khóa học
            </Link>
            <CaretRight size={10} className="text-neutral-400" />
            <h1 className="text-sm font-bold text-neutral-900 truncate max-w-md">
              {course.title}
            </h1>
          </div>
        }
        actions={
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white grad-nebula shadow-nebula hover:opacity-95 font-bold text-xs transition"
          >
            <ArrowLeft size={14} weight="bold" />
            <span>Về danh sách</span>
          </Link>
        }
      />

      <CourseForm
        initialValues={course}
        onSubmit={handleUpdate}
        isSubmitting={isPending}
        isEditMode={true}
      />
    </div>
  );
}
