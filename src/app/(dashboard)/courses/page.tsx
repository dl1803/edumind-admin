"use client";

import React, { useState, useMemo, useCallback, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  WarningCircle,
  Warning,
  Lightbulb,
  ArrowClockwise,
  CaretRight,
  X,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { StatusText } from "@/components/ui/StatusText";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTableColumn } from "@/components/data-table/types";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { Course, CourseListParams } from "@/types/course.types";
import { courseService } from "@/services/course.service";
import { useCourses, useDeleteCourse, useUpdateCourse } from "@/hooks/useCourses";
import { toast } from "@/hooks/useToast";
import { TopBarContent } from "@/context/TopBarContext";
import { cn } from "@/lib/utils";

function CoursesContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlParams: CourseListParams = useMemo(() => {
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
    const search = searchParams.get("search") || "";
    const status = (searchParams.get("status") as Course["status"] | "") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortDir = (searchParams.get("sortDir") as "asc" | "desc") || "desc";

    return {
      page: isNaN(page) || page < 1 ? 1 : page,
      pageSize: isNaN(pageSize) || pageSize < 1 ? 10 : pageSize,
      search,
      status,
      categoryId,
      sortBy,
      sortDir,
    };
  }, [searchParams]);

  const [params, setParams] = useState<CourseListParams>(urlParams);

  useEffect(() => {
    setParams(urlParams);
  }, [urlParams]);

  const updateParams = useCallback(
    (updater: (prev: CourseListParams) => CourseListParams) => {
      setParams((prev) => {
        const next = updater(prev);
        const sp = new URLSearchParams();
        if (next.page && next.page > 1) sp.set("page", String(next.page));
        if (next.pageSize && next.pageSize !== 10) sp.set("pageSize", String(next.pageSize));
        if (next.search) sp.set("search", next.search);
        if (next.status) sp.set("status", next.status);
        if (next.categoryId) sp.set("categoryId", next.categoryId);
        if (next.sortBy && next.sortBy !== "createdAt") sp.set("sortBy", next.sortBy);
        if (next.sortDir && next.sortDir !== "desc") sp.set("sortDir", next.sortDir);

        const qs = sp.toString();
        const targetUrl = qs ? `${pathname}?${qs}` : pathname;
        router.replace(targetUrl, { scroll: false });
        return next;
      });
    },
    [pathname, router]
  );

  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchAction, setBatchAction] = useState<"delete" | "hide" | "publish" | null>(null);

  const { data: coursesData, isLoading, isError, refetch } = useCourses(params);
  const deleteMutation = useDeleteCourse();
  const updateMutation = useUpdateCourse();
  const queryClient = useQueryClient();

  const currentItems = useMemo(() => coursesData?.items || [], [coursesData?.items]);
  const selectedCourses = useMemo(
    () => currentItems.filter((c) => selectedIds.includes(c.id)),
    [currentItems, selectedIds]
  );
  const batchTotalEnrolled = useMemo(
    () => selectedCourses.reduce((sum, c) => sum + (c.studentCount || 0), 0),
    [selectedCourses]
  );

  const isAllSelected =
    currentItems.length > 0 && currentItems.every((item) => selectedIds.includes(item.id));
  const isSomeSelected =
    currentItems.some((item) => selectedIds.includes(item.id)) && !isAllSelected;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      const currentItemIds = currentItems.map((c) => c.id);
      setSelectedIds((prev) => prev.filter((id) => !currentItemIds.includes(id)));
    } else {
      const currentItemIds = currentItems.map((c) => c.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentItemIds])));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

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
    updateParams((prev) => ({
      ...prev,
      status: prev.status === status ? "" : status,
      page: 1,
    }));
  };

  const handleConfirmHide = () => {
    if (!courseToDelete) return;
    updateMutation.mutate(
      { id: courseToDelete.id, payload: { status: "ARCHIVED" } },
      {
        onSuccess: () => {

          setCourseToDelete(null);
        },
      }
    );
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
      key: "select",
      header: (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={isAllSelected}
            ref={(input) => {
              if (input) input.indeterminate = isSomeSelected;
            }}
            onChange={handleToggleSelectAll}
            className="w-4 h-4 rounded accent-purple-600 cursor-pointer"
            aria-label="Chọn tất cả khóa học trên trang"
          />
        </div>
      ),
      align: "center",
      headerAlign: "center",
      width: "4%",
      cell: (row) => (
        <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={selectedIds.includes(row.id)}
            onChange={() => handleToggleSelect(row.id)}
            className="w-4 h-4 rounded accent-purple-600 cursor-pointer"
            aria-label={`Chọn khóa học ${row.title}`}
          />
        </div>
      ),
    },
    {
      key: "title",
      header: "Tên khóa học",
      width: "23%",
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
      width: "13%",
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
      width: "10%",
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
      width: "11%",
      cell: (row) => <StatusText status={row.status} className="justify-center" />,
    },
    {
      key: "instructorName",
      header: "Giảng viên",
      align: "center",
      width: "13%",
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
      width: "8%",
      cell: (row) => (
        <span className="font-medium text-slate-700 tabular-nums whitespace-nowrap">
          {row.studentCount.toLocaleString("vi-VN")}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Ngày tạo",
      align: "center",
      width: "9%",
      cell: (row) => {
        const d = new Date(row.createdAt);
        const dateFormatted = !isNaN(d.getTime())
          ? `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
          : row.createdAt;
        return (
          <span className="text-xs font-medium text-slate-700 tabular-nums whitespace-nowrap">
            {dateFormatted}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Hành động",
      align: "center",
      width: "9%",
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
      <TopBarContent
        breadcrumb={
          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-500 font-medium">Khóa học</span>
            <CaretRight size={10} className="text-neutral-400" />
            <h1 className="text-sm font-bold text-neutral-900">Danh sách khóa học</h1>
          </div>
        }
        actions={
          <div className="flex items-center gap-3">
            <Link
              href="/categories"
              className="px-3.5 py-2 border border-purple-200 text-purple-700 hover:bg-purple-50 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs"
            >
              <Folder size={14} weight="bold" />
              <span>Quản lý danh mục</span>
            </Link>
            <Link
              href="/courses/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white grad-nebula shadow-nebula hover:opacity-95 font-bold text-xs transition"
            >
              <Plus size={16} weight="bold" />
              <span>Tạo khóa học</span>
            </Link>
          </div>
        }
      />

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
          <div className="mt-2 text-[11px] text-purple-600 font-medium">
            <span>Toàn hệ thống</span>
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
          <div className="mt-2 text-[11px] text-emerald-600 font-medium">
            <span>Đang mở tuyển sinh</span>
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
          <div className="mt-2 text-[11px] text-amber-600 font-medium">
            <span>Đang biên soạn nội dung</span>
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
            <span className="text-xs font-semibold text-neutral-500 uppercase">Đã ẩn / Lưu trữ</span>
            <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-600 flex items-center justify-center text-base">
              <EyeSlash size={18} weight="fill" />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900 tabular-nums mt-2">{stats.archived}</p>
          <div className="mt-2 text-[11px] text-neutral-400 font-medium">
            <span>Ngừng tuyển sinh</span>
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
        searchPlaceholder="Tìm tên khóa học..."
        searchQuery={params.search || ""}
        onSearchChange={(query) => {
          updateParams((prev) => ({ ...prev, search: query, page: 1 }));
        }}
        filters={[
          {
            key: "categoryId",
            label: "Tất cả danh mục",
            options: categories.map((cat) => ({ label: cat.name, value: cat.id })),
          },
          {
            key: "status",
            label: "Tất cả trạng thái",
            options: [
              { label: "Đã xuất bản", value: "PUBLISHED" },
              { label: "Bản nháp", value: "DRAFT" },
              { label: "Đã ẩn", value: "ARCHIVED" },
            ],
          },
        ]}
        filterValues={{
          categoryId: params.categoryId || "",
          status: params.status || "",
        }}
        onResetFilters={() => {
          updateParams((prev) => ({
            ...prev,
            search: "",
            categoryId: "",
            status: "",
            page: 1,
          }));
        }}
        onFilterChange={(key, value) => {
          updateParams((prev) => ({
            ...prev,
            [key]: value,
            page: 1,
          }));
        }}
        toolbar={
          <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
            <span>Sắp xếp:</span>
            <SelectDropdown
              value={`${params.sortBy || "createdAt"}_${params.sortDir || "desc"}`}
              options={[
                { label: "Mới tạo nhất", value: "createdAt_desc" },
                { label: "Học viên đông nhất", value: "studentCount_desc" },
                { label: "Giá cao đến thấp", value: "priceVnd_desc" },
                { label: "Giá thấp đến cao", value: "priceVnd_asc" },
              ]}
              onChange={(val) => {
                const [field, dir] = val.split("_");
                updateParams((prev) => ({
                  ...prev,
                  sortBy: field,
                  sortDir: dir as "asc" | "desc",
                }));
              }}
            />
          </div>
        }
        pageSizeOptions={[5, 10, 20, 50]}
        entityName="khóa học"
        page={params.page || 1}
        pageSize={params.pageSize || 10}
        total={coursesData?.total || 0}
        onPageChange={(newPage) => {
          updateParams((prev) => ({ ...prev, page: newPage }));
        }}
        onPageSizeChange={(newSize) => {
          updateParams((prev) => ({ ...prev, pageSize: newSize, page: 1 }));
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
          updateParams((prev) => ({
            ...prev,
            sortBy: sort?.key,
            sortDir: sort?.direction,
          }));
        }}
      />

      {/* FLOATING BATCH ACTION BAR (A-03 Prototype State 4) */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="grad-nebula text-white px-6 py-3.5 rounded-2xl shadow-2xl shadow-purple-600/30 border border-white/25 flex items-center gap-5 whitespace-nowrap">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-white/20 text-white font-bold text-xs flex items-center justify-center shadow-xs tabular-nums font-mono">
                {selectedIds.length}
              </span>
              <span className="text-xs font-semibold text-white">
                Đã chọn {selectedIds.length} khóa học
              </span>
            </div>

            <div className="h-4 w-px bg-white/30" />

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setBatchAction("publish")}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition shadow-sm whitespace-nowrap cursor-pointer"
              >
                <CheckCircle size={14} weight="bold" />
                <span>Xuất bản hàng loạt</span>
              </button>
              <button
                type="button"
                onClick={() => setBatchAction("hide")}
                className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white border border-white/25 text-xs font-semibold flex items-center gap-2 transition whitespace-nowrap shadow-xs cursor-pointer"
              >
                <EyeSlash size={14} weight="bold" />
                <span>Ẩn hàng loạt</span>
              </button>
              <button
                type="button"
                onClick={() => setBatchAction("delete")}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 transition shadow-sm whitespace-nowrap cursor-pointer"
              >
                <Trash size={14} weight="bold" />
                <span>Xóa hàng loạt</span>
              </button>
            </div>

            <div className="h-4 w-px bg-white/30" />

            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-3.5 py-1.5 rounded-xl text-white/90 hover:text-white hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer"
            >
              <X size={14} weight="bold" />
              <span>Bỏ chọn</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA / ẨN KHÓA HỌC (A-03 Prototype State 3) */}
      <Modal
        open={Boolean(courseToDelete)}
        onClose={() => {
          if (!deleteMutation.isPending && !updateMutation.isPending) {
            setCourseToDelete(null);
          }
        }}
        hideHeader
        size="md"
      >
        {courseToDelete && (
          <div className="space-y-4">
            {/* Header with Warning Icon */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 text-2xl border border-amber-200">
                <Warning size={26} weight="bold" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  {courseToDelete.studentCount > 0
                    ? "Cảnh báo: Khóa học đã có học viên!"
                    : "Xác nhận xóa khóa học"}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Xác nhận xóa khóa học khỏi hệ thống quản trị
                </p>
              </div>
            </div>

            {/* Body with Course & Student Alert */}
            {courseToDelete.studentCount > 0 ? (
              <>
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-neutral-900">{courseToDelete.title}</span>
                    <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded tabular-nums">
                      {courseToDelete.studentCount.toLocaleString("vi-VN")} học viên
                    </span>
                  </div>
                  <p className="text-xs text-amber-900/90 leading-relaxed">
                    Khóa học này hiện có{" "}
                    <strong className="tabular-nums font-bold">
                      {courseToDelete.studentCount.toLocaleString("vi-VN")} học viên
                    </strong>{" "}
                    đang theo học. Nếu xóa vĩnh viễn, toàn bộ lịch sử học tập, ghi chú, tiến độ và
                    chứng chỉ của học viên sẽ bị mất!
                  </p>
                </div>

                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-600 space-y-1.5">
                  <p className="font-bold text-neutral-800 flex items-center gap-1.5">
                    <Lightbulb size={16} weight="bold" className="text-purple-600 shrink-0" />
                    <span>Hướng dẫn từ hệ thống EduMind:</span>
                  </p>
                  <p className="text-neutral-500 leading-relaxed">
                    Bạn nên chọn <strong>&ldquo;Ẩn khóa học&rdquo;</strong> để khóa không còn xuất hiện
                    trên trang tìm kiếm và học viên mới không thể mua, trong khi các học viên cũ vẫn có
                    thể tiếp tục học nội dung.
                  </p>
                </div>
              </>
            ) : (
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2 text-xs">
                <p className="font-bold text-neutral-900">{courseToDelete.title}</p>
                <p className="text-neutral-600 leading-relaxed">
                  Khóa học này chưa có học viên nào theo học. Hành động này sẽ xóa vĩnh viễn khóa học
                  khỏi hệ thống và không thể hoàn tác.
                </p>
              </div>
            )}

            {/* Actions Bar */}
            <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
              <button
                type="button"
                disabled={deleteMutation.isPending || updateMutation.isPending}
                onClick={() => setCourseToDelete(null)}
                className="px-4 py-2 rounded-xl border border-neutral-200 text-neutral-600 text-xs font-semibold hover:bg-neutral-50 transition cursor-pointer"
              >
                Hủy bỏ
              </button>

              <div className="flex items-center gap-2">
                {courseToDelete.studentCount > 0 ? (
                  <button
                    type="button"
                    disabled={deleteMutation.isPending || updateMutation.isPending}
                    onClick={handleConfirmHide}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <EyeSlash size={16} weight="bold" />
                    <span>Ẩn khóa học</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={deleteMutation.isPending || updateMutation.isPending}
                    onClick={handleConfirmDelete}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition shadow-sm cursor-pointer"
                    title="Xóa vĩnh viễn"
                  >
                    Xóa vĩnh viễn
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL XÁC NHẬN THAO TÁC HÀNG LOẠT (A-03 Batch Confirmation) */}
      <Modal
        open={Boolean(batchAction)}
        onClose={() => {
          if (!deleteMutation.isPending && !updateMutation.isPending) {
            setBatchAction(null);
          }
        }}
        hideHeader
        size="md"
      >
        {batchAction === "delete" && (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 text-2xl border border-amber-200">
                <Warning size={26} weight="bold" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  {batchTotalEnrolled > 0
                    ? `Cảnh báo: Các khóa học đã chọn có học viên!`
                    : `Xác nhận xóa ${selectedIds.length} khóa học`}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Xác nhận xóa các khóa học đã chọn khỏi hệ thống quản trị
                </p>
              </div>
            </div>

            {batchTotalEnrolled > 0 ? (
              <>
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-neutral-900">
                      Đã chọn {selectedIds.length} khóa học
                    </span>
                    <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded tabular-nums">
                      {batchTotalEnrolled.toLocaleString("vi-VN")} học viên
                    </span>
                  </div>
                  <p className="text-xs text-amber-900/90 leading-relaxed">
                    Các khóa học này hiện có tổng cộng{" "}
                    <strong className="tabular-nums font-bold">
                      {batchTotalEnrolled.toLocaleString("vi-VN")} học viên
                    </strong>{" "}
                    đang theo học. Nếu xóa vĩnh viễn, toàn bộ lịch sử học tập, ghi chú, tiến độ và
                    chứng chỉ của học viên sẽ bị mất!
                  </p>
                </div>

                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-600 space-y-1.5">
                  <p className="font-bold text-neutral-800 flex items-center gap-1.5">
                    <Lightbulb size={16} weight="bold" className="text-purple-600 shrink-0" />
                    <span>Hướng dẫn từ hệ thống EduMind:</span>
                  </p>
                  <p className="text-neutral-500 leading-relaxed">
                    Bạn nên chọn <strong>&ldquo;Ẩn hàng loạt&rdquo;</strong> để các khóa không còn xuất hiện
                    trên trang tìm kiếm và học viên mới không thể mua, trong khi các học viên cũ vẫn có
                    thể tiếp tục học nội dung.
                  </p>
                </div>
              </>
            ) : (
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2 text-xs">
                <p className="font-bold text-neutral-900">
                  Danh sách {selectedIds.length} khóa học đã chọn
                </p>
                <p className="text-neutral-600 leading-relaxed">
                  Các khóa học này chưa có học viên nào theo học. Hành động này sẽ xóa vĩnh viễn khỏi
                  hệ thống và không thể hoàn tác.
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
              <button
                type="button"
                disabled={deleteMutation.isPending || updateMutation.isPending}
                onClick={() => setBatchAction(null)}
                className="px-4 py-2 rounded-xl border border-neutral-200 text-neutral-600 text-xs font-semibold hover:bg-neutral-50 transition cursor-pointer"
              >
                Hủy bỏ
              </button>

              <div className="flex items-center gap-2">
                {batchTotalEnrolled > 0 ? (
                  <button
                    type="button"
                    disabled={deleteMutation.isPending || updateMutation.isPending}
                    onClick={async () => {
                      await Promise.all(
                        selectedIds.map((id) =>
                          courseService.updateCourse(id, { status: "ARCHIVED" })
                        )
                      );
                      queryClient.invalidateQueries({ queryKey: ["courses"] });
                      queryClient.invalidateQueries({ queryKey: ["courses-stats"] });
                      toast.info(`Đã chuyển ${selectedIds.length} khóa học sang trạng thái Ẩn thành công!`);
                      setSelectedIds([]);
                      setBatchAction(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <EyeSlash size={16} weight="bold" />
                    <span>Ẩn hàng loạt</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={deleteMutation.isPending || updateMutation.isPending}
                    onClick={async () => {
                      await Promise.all(selectedIds.map((id) => courseService.deleteCourse(id)));
                      queryClient.invalidateQueries({ queryKey: ["courses"] });
                      queryClient.invalidateQueries({ queryKey: ["courses-stats"] });
                      toast.success(`Đã xóa vĩnh viễn ${selectedIds.length} khóa học khỏi danh sách!`);
                      setSelectedIds([]);
                      setBatchAction(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition shadow-sm cursor-pointer"
                    title="Xóa vĩnh viễn"
                  >
                    Xóa vĩnh viễn
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {batchAction === "hide" && (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 text-2xl border border-purple-200">
                <EyeSlash size={26} weight="bold" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  Xác nhận ẩn {selectedIds.length} khóa học đã chọn
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Chuyển trạng thái sang Đã ẩn / Lưu trữ
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200/80 space-y-2 text-xs">
              <p className="text-purple-900 leading-relaxed">
                Các khóa học đã chọn sẽ không còn xuất hiện trên trang tìm kiếm và học viên mới không
                thể mua. Các học viên cũ đã đăng ký vẫn tiếp tục học nội dung bình thường.
              </p>
            </div>

            <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
              <button
                type="button"
                disabled={updateMutation.isPending}
                onClick={() => setBatchAction(null)}
                className="px-4 py-2 rounded-xl border border-neutral-200 text-neutral-600 text-xs font-semibold hover:bg-neutral-50 transition cursor-pointer"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                disabled={updateMutation.isPending}
                onClick={async () => {
                  await Promise.all(
                    selectedIds.map((id) =>
                      courseService.updateCourse(id, { status: "ARCHIVED" })
                    )
                  );
                  queryClient.invalidateQueries({ queryKey: ["courses"] });
                  queryClient.invalidateQueries({ queryKey: ["courses-stats"] });
                  toast.info(`Đã chuyển ${selectedIds.length} khóa học sang trạng thái Ẩn thành công!`);
                  setSelectedIds([]);
                  setBatchAction(null);
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <EyeSlash size={16} weight="bold" />
                <span>Xác nhận ẩn ({selectedIds.length})</span>
              </button>
            </div>
          </div>
        )}

        {batchAction === "publish" && (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-2xl border border-emerald-200">
                <CheckCircle size={26} weight="bold" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  Xác nhận xuất bản {selectedIds.length} khóa học đã chọn
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Mở tuyển sinh công khai trên hệ thống EduMind
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-2 text-xs">
              <p className="text-emerald-900 leading-relaxed">
                Các khóa học đã chọn sẽ chuyển sang trạng thái <strong>Đã xuất bản</strong> và hiển thị
                công khai trên ứng dụng để học viên có thể tìm kiếm và đăng ký học ngay.
              </p>
            </div>

            <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
              <button
                type="button"
                disabled={updateMutation.isPending}
                onClick={() => setBatchAction(null)}
                className="px-4 py-2 rounded-xl border border-neutral-200 text-neutral-600 text-xs font-semibold hover:bg-neutral-50 transition cursor-pointer"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                disabled={updateMutation.isPending}
                onClick={async () => {
                  await Promise.all(
                    selectedIds.map((id) =>
                      courseService.updateCourse(id, { status: "PUBLISHED" })
                    )
                  );
                  queryClient.invalidateQueries({ queryKey: ["courses"] });
                  queryClient.invalidateQueries({ queryKey: ["courses-stats"] });
                  toast.success(`Đã xuất bản ${selectedIds.length} khóa học thành công!`);
                  setSelectedIds([]);
                  setBatchAction(null);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <CheckCircle size={16} weight="bold" />
                <span>Xác nhận xuất bản ({selectedIds.length})</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function CoursesLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-purple-100/50 rounded-lg w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-white rounded-xl border border-purple-100" />
        ))}
      </div>
      <div className="h-96 bg-white rounded-xl border border-purple-100" />
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<CoursesLoadingSkeleton />}>
      <CoursesContent />
    </Suspense>
  );
}
