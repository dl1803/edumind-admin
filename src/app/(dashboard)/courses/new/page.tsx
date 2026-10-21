"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CourseForm, CourseFormRef } from "@/components/course/CourseForm";
import { useSaveCourse } from "@/hooks/useCourses";
import { CourseFormValues } from "@/types/course.types";
import { TopBarContent } from "@/context/TopBarContext";
import { ArrowLeft, CaretRight } from "@phosphor-icons/react";

export default function NewCoursePage() {
  const router = useRouter();
  const formRef = useRef<CourseFormRef>(null);
  const { save, isPending } = useSaveCourse();

  const handleCreate = async (values: CourseFormValues) => {
    try {
      await save(values);
      router.push("/courses");
    } catch {
      // Error is handled by mutation onError toast
    }
  };

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
            <h1 className="text-sm font-bold text-neutral-900">Tạo khóa học mới</h1>
          </div>
        }
        actions={
          <button
            type="button"
            onClick={() => formRef.current?.requestCancel()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white grad-nebula shadow-nebula hover:opacity-95 font-bold text-xs transition"
          >
            <ArrowLeft size={14} weight="bold" />
            <span>Về danh sách</span>
          </button>
        }
      />

      <CourseForm ref={formRef} onSubmit={handleCreate} isSubmitting={isPending} />
    </div>
  );
}
