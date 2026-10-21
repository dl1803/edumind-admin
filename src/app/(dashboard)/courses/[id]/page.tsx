"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCourse, CourseDetailExtended, ExtendedChapter } from "@/hooks/useCourse";
import { CourseInfoCard } from "@/components/course/CourseInfoCard";
import { CourseOutlineReadOnly } from "@/components/course/CourseOutlineReadOnly";
import { CoursePublishChecklist } from "@/components/course/CoursePublishChecklist";
import { AddChapterModal } from "@/components/course/AddChapterModal";
import { TopBarContent } from "@/context/TopBarContext";
import { Skeleton } from "@/components/ui/Skeleton";
import { toast } from "@/hooks/useToast";
import { CourseStatus } from "@/types/course.types";
import {
  CaretRight,
  PencilSimple,
  Plus,
  Info,
  TreeStructure,
  RocketLaunch,
  WarningCircle,
  ArrowLeft,
  ArrowClockwise,
} from "@phosphor-icons/react";

type TabKey = "tab1" | "tab2" | "tab3";

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params?.id as string;

  const { data: course, isLoading, isError, refetch } = useCourse(courseId);

  const [activeTab, setActiveTab] = useState<TabKey>("tab1");
  const [isAddChapterOpen, setIsAddChapterOpen] = useState(false);
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
              <Skeleton className="h-4 w-40" />
            </div>
          }
          actions={
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white grad-nebula shadow-nebula font-bold text-xs"
            >
              <ArrowLeft size={14} weight="bold" />
              <span>Về danh sách</span>
            </Link>
          }
        />

        <div className="grid grid-cols-3 gap-3 bg-white p-2 rounded-2xl border border-purple-100 shadow-xs">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-5 space-y-5">
            <Skeleton className="aspect-video w-full rounded-2xl" />
            <Skeleton className="h-44 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
          <div className="col-span-12 lg:col-span-7 space-y-5">
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
        </div>
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

        <div className="max-w-md w-full text-center space-y-4 bg-white p-8 rounded-2xl border border-purple-100 shadow-xs">
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

  const handleAddChapter = (newChapterData: {
    title: string;
    description?: string;
    order: number;
  }) => {
    const newChapter: ExtendedChapter = {
      id: `chap-${Date.now()}`,
      title: `Chương ${newChapterData.order}: ${newChapterData.title}`,
      order: newChapterData.order,
      description: newChapterData.description,
      lessons: [],
    };
    setLocalChapters([...currentChapters, newChapter]);
    toast.success(`Đã thêm mới Chương ${newChapterData.order} vào khóa học!`);
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
            {activeTab === "tab2" && (
              <button
                type="button"
                onClick={() => setIsAddChapterOpen(true)}
                className="px-3.5 py-1.5 rounded-xl border border-purple-200 text-purple-700 hover:bg-purple-50 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Plus size={14} weight="bold" />
                <span>Thêm chương mới</span>
              </button>
            )}
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
      <div className="bg-white border border-purple-100 rounded-2xl shadow-xs grid grid-cols-3 overflow-hidden">
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
        <CourseInfoCard course={effectiveCourse} onTogglePublish={handleTogglePublish} />
      )}

      {activeTab === "tab2" && (
        <CourseOutlineReadOnly
          chapters={effectiveCourse.chapters}
          onAddChapter={() => setIsAddChapterOpen(true)}
        />
      )}

      {activeTab === "tab3" && (
        <CoursePublishChecklist
          course={effectiveCourse}
          onTogglePublish={handleTogglePublish}
        />
      )}

      {/* Modal Thêm chương học mới */}
      <AddChapterModal
        open={isAddChapterOpen}
        nextOrder={currentChapters.length + 1}
        onClose={() => setIsAddChapterOpen(false)}
        onSubmit={handleAddChapter}
      />
    </div>
  );
}
