"use client";

import React, { useState, useMemo, useCallback, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Plus,
  PencilSimple,
  Trash,
  BookOpen,
  CaretRight,
  PauseCircle,
  PlayCircle,
  WarningCircle,
  ArrowClockwise,
  MagnifyingGlass,
  CaretDown,
  X,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTableColumn } from "@/components/data-table/types";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { TopBarContent } from "@/context/TopBarContext";
import { Instructor, InstructorListParams, InstructorStatus } from "@/types/instructor.types";
import {
  useInstructors,
  useInstructorStats,
  useDeleteInstructor,
  useUpdateInstructorStatus,
} from "@/hooks/useInstructors";
import { InstructorKPICards } from "@/components/instructor/InstructorKPICards";
import { DeleteInstructorModal } from "@/components/instructor/DeleteInstructorModal";
import { PauseInstructorModal } from "@/components/instructor/PauseInstructorModal";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate } from "@/lib/utils";

function InstructorsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlParams: InstructorListParams = useMemo(() => {
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
    const search = searchParams.get("search") || "";
    const status = (searchParams.get("status") as InstructorStatus | "") || "";
    const specialty = searchParams.get("specialty") || "";
    const sortBy = (searchParams.get("sortBy") as any) || "createdAt";
    const sortDir = (searchParams.get("sortDir") as "asc" | "desc") || "desc";

    return {
      page: isNaN(page) || page < 1 ? 1 : page,
      pageSize: isNaN(pageSize) || pageSize < 1 ? 10 : pageSize,
      search,
      status,
      specialty,
      sortBy,
      sortDir,
    };
  }, [searchParams]);

  const [params, setParams] = useState<InstructorListParams>(urlParams);
  const [instructorToDelete, setInstructorToDelete] = useState<Instructor | null>(null);
  const [instructorToPause, setInstructorToPause] = useState<Instructor | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState(urlParams.search || "");

  useEffect(() => {
    setParams(urlParams);
    setSearchInput(urlParams.search || "");
  }, [urlParams]);

  const updateParams = useCallback(
    (updater: (prev: InstructorListParams) => InstructorListParams) => {
      setParams((prev) => {
        const next = updater(prev);
        const sp = new URLSearchParams();
        if (next.page && next.page > 1) sp.set("page", String(next.page));
        if (next.pageSize && next.pageSize !== 10) sp.set("pageSize", String(next.pageSize));
        if (next.search) sp.set("search", next.search);
        if (next.status && next.status !== "all") sp.set("status", next.status);
        if (next.specialty) sp.set("specialty", next.specialty);
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

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== (params.search || "")) {
        updateParams((prev) => ({ ...prev, search: searchInput, page: 1 }));
      }
    }, 350);
    return () => clearTimeout(handler);
  }, [searchInput, params.search, updateParams]);

  const { data: instructorsData, isLoading, isError, refetch } = useInstructors(params);
  const { data: statsData } = useInstructorStats();
  const deleteMutation = useDeleteInstructor();
  const updateStatusMutation = useUpdateInstructorStatus();

  const currentItems = instructorsData?.items || [];
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

  const currentStats = useMemo(() => {
    if (statsData) return statsData;
    const items = instructorsData?.items || [];
    return {
      total: instructorsData?.total || 0,
      activeCount: items.filter((i) => i.isActive).length,
      suspendedCount: items.filter((i) => !i.isActive).length,
      totalCourses: items.reduce((sum, i) => sum + i.courseCount, 0),
    };
  }, [statsData, instructorsData]);

  const handleConfirmDelete = (instructor: Instructor) => {
    deleteMutation.mutate(instructor.id, {
      onSuccess: () => {
        setInstructorToDelete(null);
      },
    });
  };

  const handleConfirmPause = (instructor: Instructor) => {
    updateStatusMutation.mutate(
      { id: instructor.id, isActive: false },
      {
        onSuccess: () => {
          setInstructorToPause(null);
        },
      }
    );
  };

  const handleActivate = (instructor: Instructor) => {
    updateStatusMutation.mutate({ id: instructor.id, isActive: true });
  };

  const columns: DataTableColumn<Instructor>[] = [
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
            aria-label="Chọn tất cả giảng viên trên trang"
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
            aria-label={`Chọn giảng viên ${row.fullName}`}
          />
        </div>
      ),
    },
    {
      key: "fullName",
      header: "GIẢNG VIÊN",
      width: "18%",
      align: "left",
      headerAlign: "left",
      cell: (row) => (
        <div
          className="flex flex-col items-start justify-center py-1 text-left"
          title={`Mã định danh: ${row.id}`}
        >
          <span className="font-bold text-neutral-900 group-hover:text-purple-700 transition block truncate max-w-full">
            {row.fullName}
          </span>
        </div>
      ),
    },
    {
      key: "degree",
      header: "CHUYÊN NGÀNH / HỌC VỊ",
      width: "19%",
      align: "center",
      headerAlign: "center",
      cell: (row) => (
        <div className="space-y-0.5 text-center flex flex-col items-center justify-center">
          <p className="font-medium text-neutral-900 truncate max-w-full">{row.degree}</p>
          <p className="text-[11px] text-neutral-500 truncate max-w-full">
            {row.workplace || "Học viện EduMind"}
          </p>
        </div>
      ),
    },
    {
      key: "email",
      header: "EMAIL LIÊN HỆ",
      width: "18%",
      align: "center",
      headerAlign: "center",
      cell: (row) => (
        <span className="text-neutral-800 font-sans truncate block text-center max-w-full">
          {row.email || "—"}
        </span>
      ),
    },
    {
      key: "courseCount",
      header: "SỐ KHÓA DẠY",
      width: "10%",
      align: "center",
      headerAlign: "center",
      cell: (row) => (
        <span className="inline-flex items-center justify-center gap-1.5 text-neutral-700 font-bold font-mono tabular-nums text-xs">
          <BookOpen size={14} className="text-purple-600" weight="fill" />
          <span>{row.courseCount}</span>
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "NGÀY THÊM",
      width: "10%",
      align: "center",
      headerAlign: "center",
      cell: (row) => (
        <span className="font-mono text-[11px] text-neutral-500 tabular-nums">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      key: "isActive",
      header: "TRẠNG THÁI",
      width: "10%",
      align: "center",
      headerAlign: "center",
      cell: (row) => (
        <span
          className={`text-xs font-semibold whitespace-nowrap ${
            row.isActive ? "text-emerald-700" : "text-amber-700"
          }`}
        >
          {row.isActive ? "Đang cộng tác" : "Tạm ngưng"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "THAO TÁC",
      width: "11%",
      align: "center",
      headerAlign: "center",
      cell: (row) => {
        const canDelete = row.courseCount === 0;

        return (
          <div className="inline-flex items-center justify-center gap-1.5">
            <Link
              href={`/instructors/${row.id}/edit`}
              className="p-1.5 rounded-lg text-neutral-500 hover:text-purple-700 hover:bg-purple-50 transition cursor-pointer"
              title="Xem / Sửa hồ sơ"
            >
              <PencilSimple size={16} weight="bold" />
            </Link>

            {row.isActive ? (
              <button
                type="button"
                onClick={() => setInstructorToPause(row)}
                className="p-1.5 rounded-lg text-neutral-500 hover:text-amber-600 hover:bg-amber-50 transition cursor-pointer"
                title="Tạm dừng cộng tác"
              >
                <PauseCircle size={16} weight="bold" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleActivate(row)}
                className="p-1.5 rounded-lg text-neutral-500 hover:text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                title="Kích hoạt lại cộng tác"
              >
                <PlayCircle size={16} weight="bold" />
              </button>
            )}

            <button
              type="button"
              disabled={!canDelete}
              onClick={() => setInstructorToDelete(row)}
              className={`p-1.5 rounded-lg transition ${
                canDelete
                  ? "text-neutral-500 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                  : "text-neutral-300 opacity-40 cursor-not-allowed"
              }`}
              title={
                canDelete
                  ? "Xóa hồ sơ giảng viên"
                  : `Không thể xóa khi đang phụ trách ${row.courseCount} khóa học (BR-17)`
              }
            >
              <Trash size={16} weight="bold" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <TopBarContent
        breadcrumb={
          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-500 font-medium">Khóa học</span>
            <CaretRight size={10} className="text-neutral-400" />
            <h1 className="text-sm font-bold text-neutral-900">Danh sách Giảng viên</h1>
          </div>
        }
        actions={
          <div className="flex items-center gap-3">
            <Link
              href="/instructors/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white grad-nebula shadow-nebula hover:opacity-95 font-bold text-xs transition cursor-pointer"
            >
              <Plus size={16} weight="bold" />
              <span>Thêm giảng viên mới</span>
            </Link>
          </div>
        }
      />

      <InstructorKPICards
        stats={currentStats}
        currentStatusFilter={params.status}
        onSelectStatusFilter={(status) => {
          updateParams((prev) => ({
            ...prev,
            status,
            page: 1,
          }));
        }}
      />

      {isError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-800">
          <div className="flex items-center gap-2">
            <WarningCircle size={18} weight="fill" className="text-red-600" />
            <span>Không thể tải danh sách giảng viên. Vui lòng thử lại.</span>
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

      {/* FILTER BAR - EXACT PROTOTYPE A-14 & USER SPEC */}
      <div className="bg-white p-3.5 rounded-xl border border-purple-100 shadow-xs flex items-center gap-3">
        {/* Search Box */}
        <div className="relative flex-1">
          <MagnifyingGlass
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm kiếm theo họ tên, học vị, email giảng viên..."
            className="w-full pl-9 pr-8 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition text-neutral-800"
          />
          {Boolean(searchInput) && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                updateParams((prev) => ({ ...prev, search: "", page: 1 }));
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-0.5"
              title="Xóa tìm kiếm"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Filter: Chuyên môn / Khoa */}
        <div className="relative w-56 shrink-0">
          <select
            value={params.specialty || ""}
            onChange={(e) => {
              updateParams((prev) => ({ ...prev, specialty: e.target.value, page: 1 }));
            }}
            className="w-full appearance-none pl-3 pr-8 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-700 font-sans focus:bg-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition cursor-pointer"
          >
            <option value="">Tất cả chuyên môn</option>
            <option value="ai">Khoa học Dữ liệu & AI</option>
            <option value="se">Công nghệ Phần mềm</option>
            <option value="cs">Khoa học Máy tính</option>
            <option value="is">An toàn Thông tin</option>
          </select>
          <CaretDown
            size={14}
            weight="bold"
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-600"
          />
        </div>

        {/* Filter: Trạng thái (Đang cộng tác / Tạm ngưng) */}
        <div className="relative w-48 shrink-0">
          <select
            value={params.status || ""}
            onChange={(e) => {
              updateParams((prev) => ({ ...prev, status: e.target.value as any, page: 1 }));
            }}
            className="w-full appearance-none pl-3 pr-8 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-700 font-sans focus:bg-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition cursor-pointer"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang cộng tác</option>
            <option value="suspended">Tạm ngưng</option>
          </select>
          <CaretDown
            size={14}
            weight="bold"
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-600"
          />
        </div>
      </div>

      <DataTable<Instructor>
        data={instructorsData?.items || []}
        columns={columns}
        rowKey={(row) => row.id}
        mode="server"
        searchable={false}
        isLoading={isLoading}
        skeletonRows={5}
        entityName="giảng viên"
        page={params.page || 1}
        pageSize={params.pageSize || 10}
        pageSizeOptions={[5, 10, 20, 50]}
        total={instructorsData?.total || 0}
        onPageChange={(page) => {
          updateParams((prev) => ({ ...prev, page }));
        }}
        onPageSizeChange={(pageSize) => {
          updateParams((prev) => ({ ...prev, pageSize, page: 1 }));
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
            sortBy: (sort?.key as any) || undefined,
            sortDir: sort?.direction || undefined,
          }));
        }}
        emptyState={{
          title: "Chưa có hồ sơ giảng viên nào",
          description:
            "Hệ thống chưa ghi nhận thông tin giảng viên nào hoặc các tiêu chí tìm kiếm hiện tại không có kết quả phù hợp.",
          action: (
            <Link
              href="/instructors/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white grad-nebula font-bold text-xs shadow-nebula hover:opacity-95 transition"
            >
              <Plus size={16} weight="bold" />
              <span>Thêm giảng viên đầu tiên</span>
            </Link>
          ),
        }}
      />

      {/* FLOATING SELECTION BAR */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="bg-neutral-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-neutral-700/50 flex items-center gap-4 whitespace-nowrap">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-purple-600 text-white font-bold text-xs flex items-center justify-center tabular-nums font-mono">
                {selectedIds.length}
              </span>
              <span className="text-xs font-semibold text-neutral-200">
                Đã chọn {selectedIds.length} giảng viên
              </span>
            </div>
            <div className="h-4 w-px bg-neutral-700" />
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-xs text-neutral-400 hover:text-white transition cursor-pointer font-medium"
            >
              Bỏ chọn
            </button>
          </div>
        </div>
      )}

      <PauseInstructorModal
        instructor={instructorToPause}
        isOpen={Boolean(instructorToPause)}
        isPending={updateStatusMutation.isPending}
        onClose={() => setInstructorToPause(null)}
        onConfirm={handleConfirmPause}
      />

      <DeleteInstructorModal
        instructor={instructorToDelete}
        isOpen={Boolean(instructorToDelete)}
        isDeleting={deleteMutation.isPending}
        onClose={() => setInstructorToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

export default function InstructorsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-8 w-48 rounded-xl" />
          <div className="grid grid-cols-4 gap-4">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
          <Skeleton className="h-96 rounded-xl" />
        </div>
      }
    >
      <InstructorsContent />
    </Suspense>
  );
}
