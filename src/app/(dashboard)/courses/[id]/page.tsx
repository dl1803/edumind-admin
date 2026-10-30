"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCourse, CourseDetailExtended, ExtendedChapter } from "@/hooks/useCourse";
import { CourseInfoCard } from "@/components/course/CourseInfoCard";
import { CourseOutlineReadOnly } from "@/components/course/CourseOutlineReadOnly";
import { CoursePublishChecklist } from "@/components/course/CoursePublishChecklist";
import { TopBarContent } from "@/context/TopBarContext";
import { toast } from "@/hooks/useToast";
import { CourseStatus } from "@/types/course.types";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  CaretRight,
  PencilSimple,
  Info,
  TreeStructure,
  RocketLaunch,
  WarningCircle,
  ArrowClockwise,
} from "@phosphor-icons/react";

type TabKey = "tab1" | "tab2" | "tab3";

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params?.id as string;

  const { data: course, isLoading, isError, refetch } = useCourse(courseId);

  const [activeTab, setActiveTab] = useState<TabKey>("tab1");
  const [localStatus, setLocalStatus] = useState<CourseStatus | null>(null);
  const [localChapters, setLocalChapters] = useState<ExtendedChapter[] | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <TopBarContent
          breadcrumb={
            <div className="flex items-center gap-2 text-xs">
              <Link
                href="/courses"
                className="text-neutral-500 hover:text-purple-700 font-medium transition"
              >
                Khóa học
              </Link>
              <CaretRight size={10} className="text-neutral-400" />
              <Link
                href="/courses"
                className="text-neutral-500 hover:text-purple-700 font-medium transition"
              >
                Danh sách khóa học
              </Link>
              <CaretRight size={10} className="text-neutral-400" />
              <Skeleton className="h-4 w-32" />
            </div>
          }
          actions={<Skeleton className="h-9 w-36 rounded-xl" />}
        />

        {/* Tab Header Skeleton */}
        <div className="flex items-center gap-6 border-b border-neutral-200 pb-1">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-36 rounded-lg" />
          <Skeleton className="h-9 w-44 rounded-lg" />
        </div>

        {/* 2 Cột Skeleton đồng bộ cấu trúc CourseInfoCard */}
        <div className="grid grid-cols-12 gap-6">
          {/* Cột trái (5 cols) */}
          <div className="col-span-12 lg:col-span-5 space-y-5">
            <div className="bg-white p-3 rounded-2xl shadow-xs">
              <Skeleton className="aspect-video w-full rounded-xl" />
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-xs space-y-3">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-xs grid grid-cols-2 gap-3">
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          </div>

          {/* Cột phải (7 cols) */}
          <div className="col-span-12 lg:col-span-7">
            <div className="bg-white p-6 rounded-2xl shadow-xs space-y-5">
              <Skeleton className="h-6 w-24 rounded-md" />
              <Skeleton className="h-8 w-4/5" />
              <div className="py-3 border-y border-neutral-100 flex justify-between items-center">
                <Skeleton className="h-12 w-32" />
                <Skeleton className="h-12 w-36" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-20 w-full rounded-xl" />
              </div>
              <div className="space-y-2 pt-3 border-t border-neutral-100">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-neutral-100">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
        </div>
        <span className="sr-only">Đang tải thông tin khóa học...</span>
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="min-h-[calc(100vh-220px)] flex flex-col items-center justify-center p-6">
        <TopBarContent
          breadcrumb={
            <div className="flex items-center gap-2 text-xs">
              <Link
                href="/courses"
                className="text-neutral-500 hover:text-purple-700 font-medium transition"
              >
                Khóa học
              </Link>
              <CaretRight size={10} className="text-neutral-400" />
              <span className="text-neutral-400">Không tìm thấy</span>
            </div>
          }
        />

        <div className="max-w-md w-full text-center space-y-4 bg-white p-8 rounded-2xl shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto text-2xl font-bold">
            <WarningCircle size={32} weight="fill" />
          </div>
          <h2 className="text-base font-bold text-neutral-800">
            Không tìm thấy thông tin khóa học
          </h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Mã định danh khóa học không tồn tại hoặc đã bị xóa khỏi hệ thống.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-purple-200 text-purple-700 hover:bg-purple-50 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              <ArrowClockwise size={14} weight="bold" />
              <span>Thử lại</span>
            </button>
            <Link
              href="/courses"
              className="inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-bold text-white grad-nebula rounded-xl hover:opacity-95 transition shadow-nebula"
            >
              Về danh sách
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentStatus: CourseStatus = localStatus ?? course.status;
  const currentChapters: ExtendedChapter[] = localChapters ?? course.chapters ?? [];

  const effectiveCourse: CourseDetailExtended = {
    ...course,
    status: currentStatus,
    chapters: currentChapters,
    chapterCount: currentChapters.length,
    lessonCount: currentChapters.reduce((acc, c) => acc + (c.lessons?.length || 0), 0),
  };

  const handleTogglePublish = () => {
    const nextStatus: CourseStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    setLocalStatus(nextStatus);
    toast.success(
      nextStatus === "PUBLISHED"
        ? "Đã xuất bản khóa học công khai thành công"
        : "Đã tạm ẩn khóa học vào chế độ bản nháp"
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <TopBarContent
        breadcrumb={
          <div className="flex items-center gap-2 text-xs">
            <Link
              href="/courses"
              className="text-neutral-500 hover:text-purple-700 font-medium transition"
            >
              Khóa học
            </Link>
            <CaretRight size={10} className="text-neutral-400" />
            <Link
              href="/courses"
              className="text-neutral-500 hover:text-purple-700 font-medium transition"
            >
              Danh sách khóa học
            </Link>
            <CaretRight size={10} className="text-neutral-400" />
            <span className="font-bold text-neutral-900 truncate max-w-xs">
              {course.title}
            </span>
          </div>
        }
        actions={
          <div className="flex items-center gap-3">
            <Link
              href={`/courses/${courseId}/edit`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white grad-nebula shadow-nebula hover:opacity-95 font-bold text-xs transition"
            >
              <PencilSimple size={14} weight="bold" />
              <span>Chỉnh sửa thông tin</span>
            </Link>
          </div>
        }
      />

      {/* 3 Tabs chính */}
      <div className="bg-white rounded-2xl shadow-xs grid grid-cols-3 overflow-hidden">
        <button
          type="button"
          onClick={() => setActiveTab("tab1")}
          className={`py-3.5 text-xs text-center transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "tab1"
              ? "font-bold text-purple-700 border-b-2 border-purple-600 bg-purple-50/20"
              : "font-semibold text-neutral-500 hover:text-purple-700 border-b-2 border-transparent"
          }`}
        >
          <Info size={16} weight={activeTab === "tab1" ? "fill" : "regular"} />
          <span>Tổng quan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tab2")}
          className={`py-3.5 text-xs text-center transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "tab2"
              ? "font-bold text-purple-700 border-b-2 border-purple-600 bg-purple-50/20"
              : "font-semibold text-neutral-500 hover:text-purple-700 border-b-2 border-transparent"
          }`}
        >
          <TreeStructure size={16} weight={activeTab === "tab2" ? "fill" : "regular"} />
          <span>Cấu trúc bài giảng</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tab3")}
          className={`py-3.5 text-xs text-center transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "tab3"
              ? "font-bold text-purple-700 border-b-2 border-purple-600 bg-purple-50/20"
              : "font-semibold text-neutral-500 hover:text-purple-700 border-b-2 border-transparent"
          }`}
        >
          <RocketLaunch size={16} weight={activeTab === "tab3" ? "fill" : "regular"} />
          <span>Xuất bản &amp; Điều kiện</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "tab1" && (
        <CourseInfoCard course={effectiveCourse} />
      )}

      {activeTab === "tab2" && (
        <CourseOutlineReadOnly
          chapters={effectiveCourse.chapters}
        />
      )}

      {activeTab === "tab3" && (
        <CoursePublishChecklist
          course={effectiveCourse}
        />
      )}
    </div>
  );
}
