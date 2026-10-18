"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  BookOpen,
  CheckCircle,
  NotePencil,
  EyeSlash,
  Folder,
  Eye,
  PencilSimple,
  Trash,
  ArrowRight,
  Funnel,
  WarningCircle,
  ArrowClockwise,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { StatusText } from "@/components/ui/StatusText";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTableColumn } from "@/components/data-table/types";
import { Course, CourseListParams } from "@/types/course.types";
import { courseService } from "@/services/course.service";
import { useCourses, useDeleteCourse } from "@/hooks/useCourses";
import { cn } from "@/lib/utils";

export default function CoursesPage() {
  const [params, setParams] = useState<CourseListParams>({
    page: 1,
    pageSize: 10,
    search: "",
    status: "",
    categoryId: "",
    sortBy: "createdAt",
    sortDir: "desc",
  });

  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  const { data: coursesData, isLoading, isError, refetch } = useCourses(params);
  const deleteMutation = useDeleteCourse();

  const { data: allCoursesData } = useQuery({
    queryKey: ["courses-stats"],
    queryFn: () => courseService.getCourses({ pageSize: 100 }),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => courseService.getCategories(),
  });

  const stats = useMemo(() => {
    const list = allCoursesData?.items || [];
    return {
      total: allCoursesData?.total || 0,
      published: list.filter((c) => c.status === "PUBLISHED").length,
      draft: list.filter((c) => c.status === "DRAFT").length,
      archived: list.filter((c) => c.status === "ARCHIVED").length,
    };
  }, [allCoursesData]);

  const handleStatusFilterChange = (status: Course["status"] | "") => {
    setParams((prev) => ({
      ...prev,
      status: prev.status === status ? "" : status,
      page: 1,
    }));
  };

  const handleConfirmDelete = () => {
    if (!courseToDelete) return;
    deleteMutation.mutate(courseToDelete.id, {
      onSuccess: () => {
        setCourseToDelete(null);
      },
    });
  };

  const columns: DataTableColumn<Course>[] = [
    {
      key: "title",
      header: "Tên khóa học",
      sortable: true,
      width: "28%",
      cell: (row) => (
        <Link
          href={`/courses/${row.id}`}
          className="min-w-0 group block py-0.5"
          title="Bấm để xem chi tiết khóa học"
        >
          <span className="font-bold text-neutral-900 group-hover:text-purple-700 transition-colors truncate block">
            {row.title}
          </span>
          <p className="text-[10px] text-neutral-400 group-hover:text-purple-500 font-medium mt-0.5 truncate">
            {row.chapterCount || 4} chương | {row.lessonCount} bài học
          </p>
        </Link>
      ),
    },
    {
      key: "categoryName",
      header: "Danh mục",
      align: "center",
      width: "14%",
      cell: (row) => (
        <span className="text-xs font-medium text-neutral-700 truncate block">
          {row.categoryName || "Chưa phân loại"}
        </span>
      ),
    },
    {
      key: "priceVnd",
      header: "Giá bán",
      sortable: true,
      align: "center",
      width: "12%",
      cell: (row) => (
        <span className="font-semibold text-slate-900 tabular-nums whitespace-nowrap">
          {row.priceVnd.toLocaleString("vi-VN")}đ
        </span>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      align: "center",
      width: "12%",
      cell: (row) => <StatusText status={row.status} className="justify-center" />,
    },
    {
      key: "instructorName",
      header: "Giảng viên",
      align: "center",
      width: "14%",
      cell: (row) => (
        <span className="text-xs font-medium text-neutral-900 truncate block">
          {row.instructorName}
        </span>
      ),
    },
    {
      key: "studentCount",
      header: "Học viên",
      sortable: true,
      align: "center",
      width: "10%",
      cell: (row) => (
        <span className="font-medium text-slate-700 tabular-nums whitespace-nowrap">
          {row.studentCount.toLocaleString("vi-VN")}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Hành động",
      align: "center",
      width: "10%",
      cell: (row) => (
        <div className="flex items-center justify-center gap-1">
          <Link
            href={`/courses/${row.id}`}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-500 hover:text-purple-700 hover:bg-purple-50 transition"
            title="Chi tiết khóa học"
          >
            <Eye size={16} />
          </Link>
          <Link
            href={`/courses/${row.id}/edit`}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-500 hover:text-purple-700 hover:bg-purple-50 transition"
            title="Sửa khóa học"
          >
            <PencilSimple size={16} />
          </Link>
          <button
            type="button"
            onClick={() => setCourseToDelete(row)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
            title="Xóa khóa học"
          >
            <Trash size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
            <span>Khóa học</span>
            <span>/</span>
            <span className="font-semibold text-neutral-800">Danh sách khóa học</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Quản lý khóa học</h1>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/courses/categories">
            <Button variant="outlined" leftIcon={<Folder size={16} />}>
              Quản lý danh mục
            </Button>
          </Link>
          <Link href="/courses/new">
            <Button variant="primary" leftIcon={<Plus size={16} weight="bold" />}>
              Tạo khóa học
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => handleStatusFilterChange("")}
          className={cn(
            "bg-white rounded-xl border border-purple-100 p-4 flex flex-col justify-between cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border-l-4 border-l-purple-600",
            params.status === "" && "ring-2 ring-purple-600 shadow-sm"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase">Tổng khóa học</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center text-base">
              <BookOpen size={18} weight="fill" />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900 tabular-nums mt-2">{stats.total}</p>
          <div className="mt-2 text-[11px] text-purple-600 font-medium flex items-center justify-between">
            <span>Toàn hệ thống</span>
            <span className="text-[10px] text-purple-500 flex items-center gap-0.5 font-semibold">
              Tất cả <ArrowRight size={10} />
            </span>
          </div>
        </div>

        <div
          onClick={() => handleStatusFilterChange("PUBLISHED")}
          className={cn(
            "bg-white rounded-xl border border-purple-100 p-4 flex flex-col justify-between cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border-l-4 border-l-emerald-600",
            params.status === "PUBLISHED" && "ring-2 ring-emerald-600 shadow-sm"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase">Đã xuất bản</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-base">
              <CheckCircle size={18} weight="fill" />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900 tabular-nums mt-2">{stats.published}</p>
          <div className="mt-2 text-[11px] text-emerald-600 font-medium flex items-center justify-between">
            <span>Đang hoạt động</span>
            <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 font-semibold">
              Lọc nhanh <Funnel size={10} />
            </span>
          </div>
        </div>

        <div
          onClick={() => handleStatusFilterChange("DRAFT")}
          className={cn(
            "bg-white rounded-xl border border-purple-100 p-4 flex flex-col justify-between cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border-l-4 border-l-amber-500",
            params.status === "DRAFT" && "ring-2 ring-amber-500 shadow-sm"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase">Bản nháp</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center text-base">
              <NotePencil size={18} weight="fill" />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900 tabular-nums mt-2">{stats.draft}</p>
          <div className="mt-2 text-[11px] text-amber-600 font-medium flex items-center justify-between">
            <span>Đang biên soạn</span>
            <span className="text-[10px] text-amber-600 flex items-center gap-0.5 font-semibold">
              Lọc nhanh <Funnel size={10} />
            </span>
          </div>
        </div>

        <div
          onClick={() => handleStatusFilterChange("ARCHIVED")}
          className={cn(
            "bg-white rounded-xl border border-purple-100 p-4 flex flex-col justify-between cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border-l-4 border-l-neutral-400",
            params.status === "ARCHIVED" && "ring-2 ring-neutral-400 shadow-sm"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase">Đã lưu trữ</span>
            <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-600 flex items-center justify-center text-base">
              <EyeSlash size={18} weight="fill" />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900 tabular-nums mt-2">{stats.archived}</p>
          <div className="mt-2 text-[11px] text-neutral-400 flex items-center justify-between">
            <span>Đã ngưng lưu hành</span>
            <span className="text-[10px] text-neutral-500 flex items-center gap-0.5 font-semibold">
              Lọc nhanh <Funnel size={10} />
            </span>
          </div>
        </div>
      </div>

      {isError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-800">
          <div className="flex items-center gap-2">
            <WarningCircle size={18} weight="fill" className="text-red-600" />
            <span>Không thể tải danh sách khóa học. Vui lòng thử lại.</span>
          </div>
          <Button
            variant="outlined"
            size="sm"
            onClick={() => refetch()}
            leftIcon={<ArrowClockwise size={14} />}
            className="text-xs"
          >
            Thử lại
          </Button>
        </div>
      )}

      <DataTable<Course>
        data={coursesData?.items || []}
        columns={columns}
        rowKey={(row) => row.id}
        mode="server"
        isLoading={isLoading}
        skeletonRows={6}
        searchable={true}
        searchPlaceholder="Tìm tên khóa học hoặc giảng viên..."
        onSearchChange={(query) => {
          setParams((prev) => ({ ...prev, search: query, page: 1 }));
        }}
        filters={[
          {
            key: "categoryId",
            label: "Danh mục",
            options: [
              { label: "Tất cả danh mục", value: "" },
              ...categories.map((cat) => ({ label: cat.name, value: cat.id })),
            ],
          },
          {
            key: "status",
            label: "Trạng thái",
            options: [
              { label: "Tất cả trạng thái", value: "" },
              { label: "Đã xuất bản", value: "PUBLISHED" },
              { label: "Bản nháp", value: "DRAFT" },
              { label: "Đã lưu trữ", value: "ARCHIVED" },
            ],
          },
        ]}
        onFilterChange={(key, value) => {
          setParams((prev) => ({
            ...prev,
            [key]: value,
            page: 1,
          }));
        }}
        page={params.page || 1}
        pageSize={params.pageSize || 10}
        total={coursesData?.total || 0}
        onPageChange={(newPage) => {
          setParams((prev) => ({ ...prev, page: newPage }));
        }}
        onPageSizeChange={(newSize) => {
          setParams((prev) => ({ ...prev, pageSize: newSize, page: 1 }));
        }}
        sort={
          params.sortBy
            ? {
                key: params.sortBy,
                direction: params.sortDir || "asc",
              }
            : null
        }
        onSortChange={(sort) => {
          setParams((prev) => ({
            ...prev,
            sortBy: sort?.key,
            sortDir: sort?.direction,
          }));
        }}
      />

      <Modal
        open={Boolean(courseToDelete)}
        onClose={() => {
          if (!deleteMutation.isPending) {
            setCourseToDelete(null);
          }
        }}
        title="Xác nhận xóa khóa học"
        size="md"
        footer={
          <>
            <Button
              type="button"
              variant="outlined"
              size="sm"
              disabled={deleteMutation.isPending}
              onClick={() => setCourseToDelete(null)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              loading={deleteMutation.isPending}
              onClick={handleConfirmDelete}
            >
              Xóa khóa học
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-red-50 text-red-800 rounded-xl text-xs">
            <WarningCircle size={20} className="shrink-0 text-red-600" weight="fill" />
            <span>Hành động này sẽ xóa khóa học khỏi hệ thống và không thể hoàn tác.</span>
          </div>
          <p className="text-sm text-neutral-700">
            Bạn có chắc chắn muốn xóa khóa học{" "}
            <strong className="text-neutral-900">{courseToDelete?.title}</strong> không?
          </p>
        </div>
      </Modal>
    </div>
  );
}
